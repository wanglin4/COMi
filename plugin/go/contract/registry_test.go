package contract

import (
	"bytes"
	"encoding/hex"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"
	"google.golang.org/protobuf/types/known/anypb"
)

// memState is an in-memory stateIO
type memState struct {
	m      map[string][]byte
	writes int
}

func newMem() *memState { return &memState{m: map[string][]byte{}} }

func (s *memState) Read(keys ...[]byte) ([][]byte, *PluginError) {
	out := make([][]byte, len(keys))
	for i, k := range keys {
		if v, ok := s.m[string(k)]; ok {
			out[i] = bytes.Clone(v)
		}
	}
	return out, nil
}

func (s *memState) Write(sets []*PluginSetOp, deletes []*PluginDeleteOp) *PluginError {
	s.writes++
	for _, d := range deletes {
		delete(s.m, string(d.Key))
	}
	for _, o := range sets {
		s.m[string(o.Key)] = bytes.Clone(o.Value)
	}
	return nil
}

func addr(b byte) []byte { return bytes.Repeat([]byte{b}, 20) }

func mustMarshal(t *testing.T, m proto.Message) []byte {
	t.Helper()
	bz, err := Marshal(m)
	if err != nil {
		t.Fatal(err)
	}
	return bz
}

// fixture: admin = addr(1) holding `bal` with nonce `nonce`; fee params send_fee = 10
func fixture(t *testing.T, bal, nonce uint64) (*Contract, *memState) {
	t.Helper()
	st := newMem()
	c := &Contract{Config: Config{ChainId: 1}, st: st}
	st.m[string(KeyForAdmin())] = mustMarshal(t, &AdminConfig{Admin: addr(1)})
	st.m[string(KeyForAccount(addr(1)))] = mustMarshal(t, &Account{Address: addr(1), Amount: bal, Nonce: nonce})
	st.m[string(KeyForFeeParams())] = mustMarshal(t, &FeeParams{SendFee: 10})
	return c, st
}

func account(t *testing.T, st *memState, a []byte) *Account {
	t.Helper()
	acc := new(Account)
	if err := Unmarshal(st.m[string(KeyForAccount(a))], acc); err != nil {
		t.Fatal(err)
	}
	return acc
}

func poolAmt(t *testing.T, st *memState) uint64 {
	t.Helper()
	p := new(Pool)
	if err := Unmarshal(st.m[string(KeyForFeePool(1))], p); err != nil {
		t.Fatal(err)
	}
	return p.Amount
}

func bond(symbol string) *MessageRegisterAsset {
	return &MessageRegisterAsset{Symbol: symbol, Class: AssetClass_ASSET_CLASS_BOND, Issuer: addr(9),
		GatePolicy: GatePolicy_GATE_POLICY_ALLOWLIST, Tier: 1}
}

func TestValidSymbol(t *testing.T) {
	good := []string{"BOND1", "AB", "TBILL26", "ABCDEFGHIJKL"}
	bad := []string{"", "A", "1ABC", "abc", "AB-C", "ABCDEFGHIJKLM", "CUSD", "CNPY", "A B"}
	for _, s := range good {
		if !validSymbol(s) {
			t.Errorf("%q should be valid", s)
		}
	}
	for _, s := range bad {
		if validSymbol(s) {
			t.Errorf("%q should be invalid", s)
		}
	}
}

func TestRegisterAssetHappyPath(t *testing.T) {
	c, st := fixture(t, 1000, 0)
	resp := c.DeliverRegisterAsset(bond("BOND1"), 10, "")
	if resp.Error != nil {
		t.Fatal(resp.Error)
	}
	asset := new(Asset)
	if err := Unmarshal(st.m[string(KeyForAsset(1))], asset); err != nil {
		t.Fatal(err)
	}
	if asset.Id != 1 || asset.Symbol != "BOND1" || asset.Tier != 1 || !bytes.Equal(asset.Issuer, addr(9)) {
		t.Fatalf("unexpected asset: %+v", asset)
	}
	if !bytes.Equal(st.m[string(KeyForSymbol("BOND1"))], formatUint64(1)) {
		t.Fatal("symbol index not written")
	}
	if got := account(t, st, addr(1)).Amount; got != 990 {
		t.Fatalf("admin balance = %d, want 990", got)
	}
	if got := poolAmt(t, st); got != 10 {
		t.Fatalf("fee pool = %d, want 10", got)
	}
	if len(resp.Events) != 1 || resp.Events[0].EventType != "asset_registered" {
		t.Fatalf("unexpected events: %+v", resp.Events)
	}
	// ids increment, and the same symbol cannot be reused
	if r := c.DeliverRegisterAsset(bond("BOND2"), 10, ""); r.Error != nil {
		t.Fatal(r.Error)
	}
	if err := Unmarshal(st.m[string(KeyForAsset(2))], asset); err != nil || asset.Id != 2 {
		t.Fatalf("second asset id wrong: %+v %v", asset, err)
	}
	before := len(st.m)
	if r := c.DeliverRegisterAsset(bond("BOND1"), 10, ""); r.Error == nil || r.Error.Code != ErrSymbolTaken().Code {
		t.Fatalf("expected symbol taken, got %+v", r.Error)
	}
	if len(st.m) != before || account(t, st, addr(1)).Amount != 980 {
		t.Fatal("a rejected registration must not change state or charge a fee")
	}
}

func TestRegisterAssetRejections(t *testing.T) {
	c, _ := fixture(t, 1000, 0)
	cases := map[string]func(m *MessageRegisterAsset){
		"synth disabled":     func(m *MessageRegisterAsset) { m.Class = AssetClass_ASSET_CLASS_SYNTH },
		"unspecified class":  func(m *MessageRegisterAsset) { m.Class = AssetClass_ASSET_CLASS_UNSPECIFIED },
		"attester disabled":  func(m *MessageRegisterAsset) { m.GatePolicy = GatePolicy_GATE_POLICY_ATTESTER },
		"unspecified policy": func(m *MessageRegisterAsset) { m.GatePolicy = GatePolicy_GATE_POLICY_UNSPECIFIED },
		"tier zero":          func(m *MessageRegisterAsset) { m.Tier = 0 },
		"tier three":         func(m *MessageRegisterAsset) { m.Tier = 3 },
		"tier1 open gate":    func(m *MessageRegisterAsset) { m.GatePolicy = GatePolicy_GATE_POLICY_OPEN },
		"short issuer":       func(m *MessageRegisterAsset) { m.Issuer = []byte{1, 2, 3} },
		"reserved symbol":    func(m *MessageRegisterAsset) { m.Symbol = "CUSD" },
		"lowercase symbol":   func(m *MessageRegisterAsset) { m.Symbol = "bond" },
	}
	for name, mutate := range cases {
		m := bond("BOND1")
		mutate(m)
		if r := c.DeliverRegisterAsset(m, 10, ""); r.Error == nil {
			t.Errorf("%s: expected rejection", name)
		}
	}
	// a tier two asset may use an open gate
	m := bond("OPENAST")
	m.Tier, m.GatePolicy = 2, GatePolicy_GATE_POLICY_OPEN
	if r := c.DeliverRegisterAsset(m, 10, ""); r.Error != nil {
		t.Fatalf("tier2 open asset should register: %v", r.Error)
	}
}

func TestSetGateAndRequireAllowed(t *testing.T) {
	c, st := fixture(t, 1000, 0)
	if r := c.DeliverRegisterAsset(bond("BOND1"), 10, ""); r.Error != nil {
		t.Fatal(r.Error)
	}
	user := addr(5)
	if err := RequireAllowed(st, 1, user); err == nil || err.Code != ErrNotAllowed().Code {
		t.Fatalf("unlisted address must be rejected, got %v", err)
	}
	if r := c.DeliverSetGate(&MessageSetGate{AssetId: 1, Address: user, Allowed: true}, 10, ""); r.Error != nil {
		t.Fatal(r.Error)
	}
	if err := RequireAllowed(st, 1, user); err != nil {
		t.Fatalf("allowed address rejected: %v", err)
	}
	if err := RequireAllowed(st, 1, addr(6)); err == nil {
		t.Fatal("a different address must stay blocked")
	}
	if r := c.DeliverSetGate(&MessageSetGate{AssetId: 1, Address: user, Allowed: false}, 10, ""); r.Error != nil {
		t.Fatal(r.Error)
	}
	if err := RequireAllowed(st, 1, user); err == nil {
		t.Fatal("revoked address must be rejected")
	}
	// revoking an address that was never allowed is a harmless no-op that still pays the fee
	if r := c.DeliverSetGate(&MessageSetGate{AssetId: 1, Address: addr(7), Allowed: false}, 10, ""); r.Error != nil {
		t.Fatal(r.Error)
	}
	// unknown asset / open asset / bad inputs
	if r := c.DeliverSetGate(&MessageSetGate{AssetId: 99, Address: user, Allowed: true}, 10, ""); r.Error == nil || r.Error.Code != ErrAssetNotFound().Code {
		t.Fatalf("expected asset not found, got %+v", r.Error)
	}
	open := bond("OPENAST")
	open.Tier, open.GatePolicy = 2, GatePolicy_GATE_POLICY_OPEN
	if r := c.DeliverRegisterAsset(open, 10, ""); r.Error != nil {
		t.Fatal(r.Error)
	}
	if r := c.DeliverSetGate(&MessageSetGate{AssetId: 2, Address: user, Allowed: true}, 10, ""); r.Error == nil || r.Error.Code != ErrGateNotAllowlist().Code {
		t.Fatalf("expected not-allowlist error, got %+v", r.Error)
	}
	if err := RequireAllowed(st, 2, addr(8)); err != nil {
		t.Fatalf("open gate must admit any valid address: %v", err)
	}
	if err := RequireAllowed(st, 2, []byte{1}); err == nil {
		t.Fatal("open gate must still reject malformed addresses")
	}
	// asset id 0 is the cUSD allowlist, which has no registry record
	if r := c.DeliverSetGate(&MessageSetGate{AssetId: CUSDGateID, Address: user, Allowed: true}, 10, ""); r.Error != nil {
		t.Fatalf("cUSD gate id must be accepted: %v", r.Error)
	}
	if err := RequireAllowed(st, CUSDGateID, user); err != nil {
		t.Fatalf("cUSD allowlisted address rejected: %v", err)
	}
	if err := RequireAllowed(st, CUSDGateID, addr(6)); err == nil {
		t.Fatal("non-listed address must not pass the cUSD gate")
	}
	if r := c.DeliverSetGate(&MessageSetGate{AssetId: 1, Address: []byte{1}, Allowed: true}, 10, ""); r.Error == nil {
		t.Fatal("short address must be rejected")
	}
}

func TestFeeHandling(t *testing.T) {
	// insufficient funds: nothing is written
	c, st := fixture(t, 5, 0)
	if r := c.DeliverRegisterAsset(bond("BOND1"), 10, ""); r.Error == nil || r.Error.Code != ErrInsufficientFunds().Code {
		t.Fatalf("expected insufficient funds, got %+v", r.Error)
	}
	if st.writes != 0 {
		t.Fatal("no write may happen when the fee cannot be paid")
	}
	// drained, no nonce, plain memo: account is deleted
	c, st = fixture(t, 10, 0)
	if r := c.DeliverRegisterAsset(bond("BOND1"), 10, ""); r.Error != nil {
		t.Fatal(r.Error)
	}
	if _, ok := st.m[string(KeyForAccount(addr(1)))]; ok {
		t.Fatal("drained account without nonce state should be deleted")
	}
	// drained but RLP.V2 memo: account retained so core can advance the nonce
	c, st = fixture(t, 10, 0)
	if r := c.DeliverRegisterAsset(bond("BOND1"), 10, rlpV2Memo); r.Error != nil {
		t.Fatal(r.Error)
	}
	if account(t, st, addr(1)).Amount != 0 {
		t.Fatal("drained account must be retained under RLP.V2")
	}
	// drained with an existing nonce: retained, nonce preserved through the round trip
	c, st = fixture(t, 10, 7)
	if r := c.DeliverRegisterAsset(bond("BOND1"), 10, ""); r.Error != nil {
		t.Fatal(r.Error)
	}
	if acc := account(t, st, addr(1)); acc.Nonce != 7 || acc.Amount != 0 {
		t.Fatalf("nonce must be preserved, got %+v", acc)
	}
}

func anyTx(t *testing.T, fee uint64, msg proto.Message) *Transaction {
	t.Helper()
	a, err := anypb.New(msg)
	if err != nil {
		t.Fatal(err)
	}
	return &Transaction{Msg: a, Fee: fee}
}

func TestCheckTxRouting(t *testing.T) {
	c, st := fixture(t, 1000, 0)
	// authorized signer is the admin from state
	resp := c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, 10, bond("BOND1"))})
	if resp.Error != nil || len(resp.AuthorizedSigners) != 1 || !bytes.Equal(resp.AuthorizedSigners[0], addr(1)) {
		t.Fatalf("unexpected check response: %+v", resp)
	}
	resp = c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, 10, &MessageSetGate{AssetId: 1, Address: addr(5), Allowed: true})})
	if resp.Error != nil || !bytes.Equal(resp.AuthorizedSigners[0], addr(1)) {
		t.Fatalf("unexpected set_gate check response: %+v", resp)
	}
	// fee below the governance minimum
	if resp = c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, 9, bond("BOND1"))}); resp.Error == nil || resp.Error.Code != ErrTxFeeBelowStateLimit().Code {
		t.Fatalf("expected fee error, got %+v", resp.Error)
	}
	// missing fee params must not panic (upstream indexes Results[0].Entries[0] unguarded)
	delete(st.m, string(KeyForFeeParams()))
	if resp = c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, 0, bond("BOND1"))}); resp.Error != nil {
		t.Fatalf("zero minimum fee with absent params should pass: %+v", resp.Error)
	}
	// admin missing
	delete(st.m, string(KeyForAdmin()))
	if resp = c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, 10, bond("BOND1"))}); resp.Error == nil || resp.Error.Code != ErrAdminNotSet().Code {
		t.Fatalf("expected admin-not-set, got %+v", resp.Error)
	}
	// malformed requests
	if resp = c.CheckTx(&PluginCheckRequest{}); resp.Error == nil {
		t.Fatal("nil tx must be rejected")
	}
	if r := c.DeliverTx(&PluginDeliverRequest{}); r.Error == nil {
		t.Fatal("nil tx must be rejected")
	}
}

func TestDeliverTxRouting(t *testing.T) {
	c, st := fixture(t, 1000, 0)
	if r := c.DeliverTx(&PluginDeliverRequest{Tx: anyTx(t, 10, bond("BOND1"))}); r.Error != nil {
		t.Fatal(r.Error)
	}
	if r := c.DeliverTx(&PluginDeliverRequest{Tx: anyTx(t, 10, &MessageSetGate{AssetId: 1, Address: addr(5), Allowed: true})}); r.Error != nil {
		t.Fatal(r.Error)
	}
	if _, ok := st.m[string(KeyForGate(1, addr(5)))]; !ok {
		t.Fatal("gate entry missing after set_gate delivery")
	}
}

func TestGenesis(t *testing.T) {
	dir := t.TempDir()
	st := newMem()
	c := &Contract{Config: Config{DataDirPath: dir}, st: st}
	if r := c.Genesis(&PluginGenesisRequest{}); r.Error == nil {
		t.Fatal("missing genesis file must fail")
	}
	write := func(s string) { _ = os.WriteFile(filepath.Join(dir, GenesisFileName), []byte(s), 0o600) }
	for name, body := range map[string]string{
		"bad json":    "{",
		"short admin": `{"admin":"abcd"}`,
		"not hex":     `{"admin":"` + strings.Repeat("zz", 20) + `"}`,
		"zero admin":  `{"admin":"` + strings.Repeat("00", 20) + `"}`,
	} {
		write(body)
		if r := c.Genesis(&PluginGenesisRequest{}); r.Error == nil {
			t.Errorf("%s: expected genesis failure", name)
		}
	}
	if st.writes != 0 {
		t.Fatal("failed genesis must not write state")
	}
	write(`{"admin":"0x` + hex.EncodeToString(addr(3)) + `"}`)
	if r := c.Genesis(&PluginGenesisRequest{}); r.Error != nil {
		t.Fatal(r.Error)
	}
	got, err := readAdmin(st)
	if err != nil || !bytes.Equal(got, addr(3)) {
		t.Fatalf("admin not stored: %x %v", got, err)
	}
}

// TestConfigMatchesCoreHandshake replays the validation core performs on the config at handshake
func TestConfigMatchesCoreHandshake(t *testing.T) {
	cfg := ContractConfig
	if len(cfg.SupportedTransactions) != len(cfg.TransactionTypeUrls) {
		t.Fatal("supported transactions and type urls must align by index")
	}
	// reserved prefix guard (mirrors lib.assertNoReservedPrefixCollision)
	for _, p := range cfg.CustomStatePrefixes {
		if len(p) == 1 && p[0] >= 1 && p[0] <= 15 {
			t.Fatalf("prefix %d is core-reserved", p[0])
		}
	}
	// every COMi key must start with a declared prefix segment
	declared := map[string]bool{}
	for _, p := range cfg.CustomStatePrefixes {
		declared[string(p)] = true
	}
	for _, k := range [][]byte{KeyForAsset(1), KeyForSymbol("AB"), KeyForGate(1, addr(1)), KeyForAdmin(), KeyForRegistryMeta()} {
		n := int(k[0])
		if !declared[string(k[1:1+n])] {
			t.Fatalf("key %x does not start with a declared prefix", k)
		}
	}
	// descriptors must load and every type url must resolve (mirrors PluginSchemaRegistry.Register)
	set := new(descriptorpb.FileDescriptorSet)
	for _, bz := range cfg.FileDescriptorProtos {
		fd := new(descriptorpb.FileDescriptorProto)
		if err := proto.Unmarshal(bz, fd); err != nil {
			t.Fatal(err)
		}
		set.File = append(set.File, fd)
	}
	files, err := protodesc.NewFiles(set)
	if err != nil {
		t.Fatal(err)
	}
	for _, u := range append(append([]string{}, cfg.TransactionTypeUrls...), cfg.EventTypeUrls...) {
		name := u[strings.LastIndex(u, "/")+1:]
		d, err := files.FindDescriptorByName(protoreflect.FullName(name))
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		if _, ok := d.(protoreflect.MessageDescriptor); !ok {
			t.Fatalf("%s is not a message", name)
		}
	}
}
