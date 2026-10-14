package contract

import (
	"bytes"
	"testing"

	"google.golang.org/protobuf/proto"
)

const (
	uCNPY       = uint64(1_000_000)
	price2      = uint64(2_000_000) // $2.00 per CNPY
	userCNPY    = 1000 * uCNPY
	testFee     = uint64(10)
	startHeight = uint64(100)
)

// cusdEnv wires a contract with an admin, funded users, params and a posted price
type cusdEnv struct {
	t     *testing.T
	c     *Contract
	st    *memState
	total uint64 // total CNPY in the system (accounts + pools) at setup
}

func (e *cusdEnv) ok(r *PluginDeliverResponse) {
	e.t.Helper()
	if r.Error != nil {
		e.t.Fatalf("unexpected error: %v", r.Error)
	}
	e.invariants()
}

func (e *cusdEnv) fails(r *PluginDeliverResponse, want *PluginError) {
	e.t.Helper()
	if r.Error == nil || r.Error.Code != want.Code {
		e.t.Fatalf("want error code %d (%s), got %+v", want.Code, want.Msg, r.Error)
	}
	e.invariants()
}

func okParams() *CUSDParams {
	return &CUSDParams{SupplyCap: 1000 * uCNPY, MinCollateralBps: 15000, LiquidationBps: 13000,
		LiquidationPenaltyBps: 500, MaxPriceAge: 100, MaxPriceMoveBps: 1000}
}

// sums CNPY across all accounts and pools, and cUSD across balances / vault debts / supply
func (e *cusdEnv) invariants() {
	e.t.Helper()
	var cnpy, bal, debt uint64
	for k, v := range e.st.m {
		bz := []byte(k)
		switch {
		case bytes.HasPrefix(bz, []byte{1, 1}): // account
			a := new(Account)
			if err := Unmarshal(v, a); err != nil {
				e.t.Fatal(err)
			}
			cnpy += a.Amount
		case bytes.HasPrefix(bz, []byte{1, 2}): // pool
			p := new(Pool)
			if err := Unmarshal(v, p); err != nil {
				e.t.Fatal(err)
			}
			cnpy += p.Amount
		case bytes.HasPrefix(bz, []byte{1, 104}):
			a := new(CUSDAccount)
			_ = Unmarshal(v, a)
			bal += a.Amount
		case bytes.HasPrefix(bz, []byte{1, 105}):
			vl := new(Vault)
			_ = Unmarshal(v, vl)
			debt += vl.Debt
		}
	}
	sup := new(CUSDSupply)
	_ = Unmarshal(e.st.m[string(KeyForCUSDSupply())], sup)
	if cnpy != e.total {
		e.t.Fatalf("CNPY not conserved: have %d want %d", cnpy, e.total)
	}
	if bal != debt || debt != sup.TotalDebt {
		e.t.Fatalf("cUSD invariant broken: balances=%d vault debt=%d supply=%d", bal, debt, sup.TotalDebt)
	}
}

func (e *cusdEnv) vault(a []byte) *Vault {
	v := new(Vault)
	if err := Unmarshal(e.st.m[string(KeyForVault(a))], v); err != nil {
		e.t.Fatal(err)
	}
	return v
}

func (e *cusdEnv) cusd(a []byte) uint64 {
	b := new(CUSDAccount)
	if err := Unmarshal(e.st.m[string(KeyForCUSD(a))], b); err != nil {
		e.t.Fatal(err)
	}
	return b.Amount
}

func (e *cusdEnv) cnpy(a []byte) uint64 { return account(e.t, e.st, a).Amount }

// newCUSD builds the standard environment: admin addr(1); users addr(10), addr(11), addr(12) each
// funded with 1000 CNPY and allowlisted for cUSD; params set; price $2.00 posted at startHeight
func newCUSD(t *testing.T) *cusdEnv {
	c, st := fixture(t, 1_000_000, 0)
	e := &cusdEnv{t: t, c: c, st: st}
	for _, u := range []byte{10, 11, 12} {
		st.m[string(KeyForAccount(addr(u)))] = mustMarshal(t, &Account{Amount: userCNPY})
	}
	// totals are measured after funding; every later operation must conserve them
	e.total = 0
	for k, v := range st.m {
		bz := []byte(k)
		if bytes.HasPrefix(bz, []byte{1, 1}) {
			a := new(Account)
			_ = Unmarshal(v, a)
			e.total += a.Amount
		} else if bytes.HasPrefix(bz, []byte{1, 2}) {
			p := new(Pool)
			_ = Unmarshal(v, p)
			e.total += p.Amount
		}
	}
	for _, u := range []byte{10, 11, 12} {
		e.ok(c.DeliverSetGate(&MessageSetGate{AssetId: CUSDGateID, Address: addr(u), Allowed: true}, testFee, ""))
	}
	e.ok(c.DeliverSetCUSDParams(&MessageSetCUSDParams{Params: okParams()}, testFee, ""))
	e.ok(c.DeliverPostPrice(&MessagePostPrice{Price: price2}, testFee, "", startHeight))
	return e
}

func (e *cusdEnv) deposit(u byte, amt uint64) *PluginDeliverResponse {
	return e.c.DeliverVaultDeposit(&MessageVaultDeposit{FromAddress: addr(u), Amount: amt}, testFee, "")
}
func (e *cusdEnv) mint(u byte, amt, h uint64) *PluginDeliverResponse {
	return e.c.DeliverCUSDMint(&MessageCUSDMint{FromAddress: addr(u), Amount: amt}, testFee, "", h)
}
func (e *cusdEnv) burn(u byte, amt uint64) *PluginDeliverResponse {
	return e.c.DeliverCUSDBurn(&MessageCUSDBurn{FromAddress: addr(u), Amount: amt}, testFee, "")
}
func (e *cusdEnv) withdraw(u byte, amt, h uint64) *PluginDeliverResponse {
	return e.c.DeliverVaultWithdraw(&MessageVaultWithdraw{FromAddress: addr(u), Amount: amt}, testFee, "", h)
}
func (e *cusdEnv) post(p, h uint64) *PluginDeliverResponse {
	return e.c.DeliverPostPrice(&MessagePostPrice{Price: p}, testFee, "", h)
}

func TestCUSDParamsValidation(t *testing.T) {
	if err := ValidateCUSDParams(okParams()); err != nil {
		t.Fatal(err)
	}
	bad := map[string]func(p *CUSDParams){
		"mint ratio below 150% floor": func(p *CUSDParams) { p.MinCollateralBps = 14999 },
		"mint ratio above cap":        func(p *CUSDParams) { p.MinCollateralBps = 100001 },
		"penalty above cap":           func(p *CUSDParams) { p.LiquidationPenaltyBps = 2001 },
		"liq not below mint ratio":    func(p *CUSDParams) { p.LiquidationBps = 15000 },
		"liq below 100% + penalty":    func(p *CUSDParams) { p.LiquidationBps = 10499 },
		"zero max age":                func(p *CUSDParams) { p.MaxPriceAge = 0 },
		"zero max move":               func(p *CUSDParams) { p.MaxPriceMoveBps = 0 },
		"max move above cap":          func(p *CUSDParams) { p.MaxPriceMoveBps = 5001 },
	}
	for name, mut := range bad {
		p := okParams()
		mut(p)
		if ValidateCUSDParams(p) == nil {
			t.Errorf("%s: expected rejection", name)
		}
	}
	if ValidateCUSDParams(nil) == nil {
		t.Error("nil params must be rejected")
	}
}

func TestPriceRules(t *testing.T) {
	c, st := fixture(t, 1_000_000, 0)
	e := &cusdEnv{t: t, c: c, st: st, total: 1_000_000}
	// params are required before any price
	e.fails(e.post(price2, 1), ErrParamsNotSet())
	e.ok(c.DeliverSetCUSDParams(&MessageSetCUSDParams{Params: okParams()}, testFee, ""))
	for _, bad := range []uint64{0, maxPrice + 1} {
		e.fails(e.post(bad, 1), ErrInvalidPrice())
	}
	e.ok(e.post(price2, 5)) // the first post is unconstrained
	e.fails(e.post(2_200_001, 6), ErrPriceMoveTooLarge())
	e.fails(e.post(1_799_999, 6), ErrPriceMoveTooLarge())
	e.ok(e.post(2_200_000, 6)) // exactly +10% is allowed
	e.ok(e.post(1_980_000, 7)) // exactly -10% is allowed
	rec := new(PriceRecord)
	if err := Unmarshal(st.m[string(KeyForPrice())], rec); err != nil || rec.Price != 1_980_000 || rec.Height != 7 {
		t.Fatalf("unexpected price record %+v %v", rec, err)
	}
}

func TestMintLimitsAndRatio(t *testing.T) {
	e := newCUSD(t)
	u := byte(10)
	// no collateral: nothing can be minted
	e.fails(e.mint(u, 1, startHeight), ErrUndercollateralized())
	e.ok(e.deposit(u, 100*uCNPY)) // value $200 -> max debt at 150% = 133.333333 cUSD
	e.fails(e.mint(u, 133_333_334, startHeight), ErrUndercollateralized())
	e.ok(e.mint(u, 133_333_333, startHeight))
	if e.cusd(addr(u)) != 133_333_333 || e.vault(addr(u)).Debt != 133_333_333 {
		t.Fatal("mint did not credit cUSD and debt")
	}
	e.fails(e.mint(u, 1, startHeight), ErrUndercollateralized())
	// the deposit moved CNPY out of the account into the collateral pool
	pool := new(Pool)
	_ = Unmarshal(e.st.m[string(KeyForPool(CollateralPoolID))], pool)
	if pool.Amount != 100*uCNPY {
		t.Fatalf("collateral pool = %d", pool.Amount)
	}
	// an ungated address cannot deposit or mint
	e.st.m[string(KeyForAccount(addr(20)))] = mustMarshal(t, &Account{Amount: uCNPY})
	e.total += uCNPY
	e.fails(e.deposit(20, 1), ErrNotAllowed())
	e.fails(e.mint(20, 1, startHeight), ErrNotAllowed())
}

func TestSupplyCap(t *testing.T) {
	e := newCUSD(t)
	p := okParams()
	p.SupplyCap = 100 * uCNPY
	e.ok(e.c.DeliverSetCUSDParams(&MessageSetCUSDParams{Params: p}, testFee, ""))
	e.ok(e.deposit(10, 500*uCNPY)) // plenty of collateral
	e.ok(e.mint(10, 100*uCNPY, startHeight))
	e.fails(e.mint(10, 1, startHeight), ErrSupplyCapExceeded())
	e.ok(e.deposit(11, 500*uCNPY))
	e.fails(e.mint(11, 1, startHeight), ErrSupplyCapExceeded()) // the cap is global
	e.ok(e.burn(10, 40*uCNPY))
	e.ok(e.mint(11, 40*uCNPY, startHeight)) // freed room is usable by anyone
	// a zero cap pauses minting
	p.SupplyCap = 0
	e.ok(e.c.DeliverSetCUSDParams(&MessageSetCUSDParams{Params: p}, testFee, ""))
	e.fails(e.mint(11, 1, startHeight), ErrSupplyCapExceeded())
}

func TestWithdrawBurnAndExitRights(t *testing.T) {
	e := newCUSD(t)
	u := byte(10)
	e.ok(e.deposit(u, 100*uCNPY))
	e.ok(e.mint(u, 100*uCNPY, startHeight)) // $100 debt against $200 collateral (200%)
	// withdrawing down to exactly 150% is allowed, one more uCNPY is not
	// need collateral value >= 150: 150 / 2 = 75 CNPY must remain
	e.fails(e.withdraw(u, 25*uCNPY+1, startHeight), ErrUndercollateralized())
	e.ok(e.withdraw(u, 25*uCNPY, startHeight))
	e.fails(e.withdraw(u, 1, startHeight), ErrUndercollateralized())
	e.fails(e.withdraw(u, 1000*uCNPY, startHeight), ErrInsufficientCollateral())
	// burning more than the debt or the balance is rejected
	e.fails(e.burn(u, 100*uCNPY+1), ErrInsufficientDebt())
	// revoke the user: exit rights stay (burn + withdraw), entry does not
	e.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: CUSDGateID, Address: addr(u), Allowed: false}, testFee, ""))
	e.fails(e.deposit(u, 1), ErrNotAllowed())
	e.fails(e.mint(u, 1, startHeight), ErrNotAllowed())
	e.ok(e.burn(u, 100*uCNPY))
	e.ok(e.withdraw(u, 75*uCNPY, startHeight+1_000_000)) // no debt: no price needed, even a stale one
	if v := e.vault(addr(u)); v.Collateral != 0 || v.Debt != 0 {
		t.Fatalf("vault should be empty: %+v", v)
	}
	if _, ok := e.st.m[string(KeyForVault(addr(u)))]; ok {
		t.Fatal("an empty vault must be deleted")
	}
	if _, ok := e.st.m[string(KeyForCUSD(addr(u)))]; ok {
		t.Fatal("a zero cUSD balance must be deleted")
	}
}

func TestStalePrice(t *testing.T) {
	e := newCUSD(t)
	e.ok(e.deposit(10, 100*uCNPY))
	e.ok(e.mint(10, 10*uCNPY, startHeight+100)) // age == max_price_age is still fresh
	e.fails(e.mint(10, 1, startHeight+101), ErrPriceStale())
	e.fails(e.withdraw(10, 1, startHeight+101), ErrPriceStale()) // withdraw with debt needs a fresh price
	e.fails(e.c.DeliverLiquidate(&MessageLiquidate{FromAddress: addr(11), VaultOwner: addr(10), RepayAmount: 1}, testFee, "", startHeight+101), ErrPriceStale())
	e.ok(e.post(price2, startHeight+101)) // refreshing works
	e.ok(e.mint(10, 1, startHeight+101))
}

func TestTransferGating(t *testing.T) {
	e := newCUSD(t)
	e.ok(e.deposit(10, 100*uCNPY))
	e.ok(e.mint(10, 50*uCNPY, startHeight))
	tr := func(from, to byte, amt uint64) *PluginDeliverResponse {
		return e.c.DeliverCUSDTransfer(&MessageCUSDTransfer{FromAddress: addr(from), ToAddress: addr(to), Amount: amt}, testFee, "")
	}
	e.ok(tr(10, 11, 20*uCNPY))
	if e.cusd(addr(10)) != 30*uCNPY || e.cusd(addr(11)) != 20*uCNPY {
		t.Fatal("transfer balances wrong")
	}
	e.fails(tr(10, 11, 30*uCNPY+1), ErrInsufficientCUSD())
	e.fails(tr(10, 99, 1), ErrNotAllowed()) // recipient not allowlisted
	e.fails(tr(10, 10, 1), ErrSelfTransfer())
	e.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: CUSDGateID, Address: addr(10), Allowed: false}, testFee, ""))
	e.fails(tr(10, 11, 1), ErrNotAllowed()) // sender revoked
	// receiving cUSD does not create debt for the receiver: user 11 holds cUSD but owes nothing
	if e.vault(addr(11)).Debt != 0 {
		t.Fatal("recipient must not inherit debt")
	}
}

func TestLiquidation(t *testing.T) {
	e := newCUSD(t)
	owner, liq := byte(10), byte(11)
	e.ok(e.deposit(owner, 100*uCNPY))
	e.ok(e.mint(owner, 133_333_333, startHeight)) // 150% at $2.00
	// give the liquidator cUSD through its own healthy vault
	e.ok(e.deposit(liq, 400*uCNPY))
	e.ok(e.mint(liq, 200*uCNPY, startHeight))
	lq := func(repay, h uint64) *PluginDeliverResponse {
		return e.c.DeliverLiquidate(&MessageLiquidate{FromAddress: addr(liq), VaultOwner: addr(owner), RepayAmount: repay}, testFee, "", h)
	}
	e.fails(lq(1, startHeight), ErrVaultHealthy())
	e.ok(e.post(1_800_000, startHeight)) // -10%: ratio ~135%, still above 130%
	e.fails(lq(1, startHeight), ErrVaultHealthy())
	e.ok(e.post(1_620_000, startHeight)) // -10% again: ratio ~121.5% < 130%
	// a non-allowlisted caller cannot liquidate
	e.st.m[string(KeyForAccount(addr(30)))] = mustMarshal(t, &Account{Amount: userCNPY})
	e.total += userCNPY
	e.fails(e.c.DeliverLiquidate(&MessageLiquidate{FromAddress: addr(30), VaultOwner: addr(owner), RepayAmount: 1}, testFee, "", startHeight), ErrNotAllowed())
	e.fails(lq(133_333_334, startHeight), ErrInsufficientDebt())
	// repay 50 cUSD: seize floor(52.5 cUSD x 1e6 / 1.62e6) uCNPY
	before := e.cnpy(addr(liq))
	e.ok(lq(50*uCNPY, startHeight))
	wantSeize := uint64(32_407_407)
	if got := e.cnpy(addr(liq)) - before + testFee; got != wantSeize {
		t.Fatalf("seized %d, want %d", got, wantSeize)
	}
	v := e.vault(addr(owner))
	if v.Debt != 133_333_333-50*uCNPY || v.Collateral != 100*uCNPY-wantSeize {
		t.Fatalf("unexpected vault after liquidation: %+v", v)
	}
	if e.cusd(addr(liq)) != 150*uCNPY {
		t.Fatalf("liquidator cUSD = %d", e.cusd(addr(liq)))
	}
	// liquidator cannot be the owner; seizing more than the vault holds is rejected
	e.fails(e.c.DeliverLiquidate(&MessageLiquidate{FromAddress: addr(owner), VaultOwner: addr(owner), RepayAmount: 1}, testFee, "", startHeight), ErrSelfTransfer())
	// crash the price so collateral cannot cover a large repay
	for _, p := range []uint64{1_458_000, 1_312_200, 1_180_980, 1_062_882, 956_594, 860_935} {
		e.ok(e.post(p, startHeight))
	}
	e.fails(lq(83_333_333, startHeight), ErrLiquidationTooLarge())
}

func TestCUSDCheckTx(t *testing.T) {
	e := newCUSD(t)
	from := addr(10)
	cases := map[string]*PluginCheckResponse{
		"deposit":   e.c.CheckVaultDeposit(&MessageVaultDeposit{FromAddress: from, Amount: 1}),
		"withdraw":  e.c.CheckVaultWithdraw(&MessageVaultWithdraw{FromAddress: from, Amount: 1}),
		"mint":      e.c.CheckCUSDMint(&MessageCUSDMint{FromAddress: from, Amount: 1}),
		"burn":      e.c.CheckCUSDBurn(&MessageCUSDBurn{FromAddress: from, Amount: 1}),
		"transfer":  e.c.CheckCUSDTransfer(&MessageCUSDTransfer{FromAddress: from, ToAddress: addr(11), Amount: 1}),
		"liquidate": e.c.CheckLiquidate(&MessageLiquidate{FromAddress: from, VaultOwner: addr(11), RepayAmount: 1}),
	}
	for name, r := range cases {
		if r.Error != nil || len(r.AuthorizedSigners) != 1 || !bytes.Equal(r.AuthorizedSigners[0], from) {
			t.Errorf("%s: signer must be the sender, got %+v", name, r)
		}
	}
	if r := e.c.CheckCUSDTransfer(&MessageCUSDTransfer{FromAddress: from, ToAddress: addr(11), Amount: 1}); !bytes.Equal(r.Recipient, addr(11)) {
		t.Error("transfer recipient not reported")
	}
	if r := e.c.CheckCUSDMint(&MessageCUSDMint{FromAddress: from, Amount: 0}); r.Error == nil {
		t.Error("zero amount must be rejected")
	}
	if r := e.c.CheckCUSDMint(&MessageCUSDMint{FromAddress: []byte{1}, Amount: 1}); r.Error == nil {
		t.Error("short address must be rejected")
	}
	// admin transactions are signed by the admin from state, not by the message
	if r := e.c.CheckPostPrice(&MessagePostPrice{Price: 1}); r.Error != nil || !bytes.Equal(r.AuthorizedSigners[0], addr(1)) {
		t.Errorf("post_price signer: %+v", r)
	}
	if r := e.c.CheckSetCUSDParams(&MessageSetCUSDParams{Params: okParams()}); r.Error != nil || !bytes.Equal(r.AuthorizedSigners[0], addr(1)) {
		t.Errorf("set params signer: %+v", r)
	}
	if r := e.c.CheckSetCUSDParams(&MessageSetCUSDParams{Params: &CUSDParams{}}); r.Error == nil {
		t.Error("invalid params must be rejected at check time")
	}
}

func TestCUSDRouting(t *testing.T) {
	e := newCUSD(t)
	steps := []proto.Message{
		&MessageVaultDeposit{FromAddress: addr(10), Amount: 100 * uCNPY},
		&MessageCUSDMint{FromAddress: addr(10), Amount: 10 * uCNPY},
		&MessageCUSDTransfer{FromAddress: addr(10), ToAddress: addr(11), Amount: uCNPY},
		&MessageCUSDBurn{FromAddress: addr(10), Amount: uCNPY},
		&MessageVaultWithdraw{FromAddress: addr(10), Amount: uCNPY},
		&MessagePostPrice{Price: price2},
		&MessageSetCUSDParams{Params: okParams()},
	}
	for _, m := range steps {
		if r := e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, m), Height: startHeight}); r.Error != nil {
			t.Fatalf("%T check: %v", m, r.Error)
		}
		e.ok(e.c.DeliverTx(&PluginDeliverRequest{Tx: anyTx(t, testFee, m), Height: startHeight}))
	}
	// liquidate is routed too: a healthy vault proves the request reached DeliverLiquidate
	liq := &MessageLiquidate{FromAddress: addr(11), VaultOwner: addr(10), RepayAmount: 1}
	if r := e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, liq), Height: startHeight}); r.Error != nil {
		t.Fatal(r.Error)
	}
	e.fails(e.c.DeliverTx(&PluginDeliverRequest{Tx: anyTx(t, testFee, liq), Height: startHeight}), ErrVaultHealthy())
}

func TestCollateralPoolIDIsOutsideCoreRange(t *testing.T) {
	const coreMax = 2*65535 + 1 // lib.DAOPoolID, core's highest derived pool id
	if CollateralPoolID <= coreMax {
		t.Fatalf("collateral pool id %d collides with core's derived range", CollateralPoolID)
	}
}
