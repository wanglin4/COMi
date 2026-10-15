package contract

import (
	"bytes"
	"math/big"
	"math/rand"
	"testing"
)

// bondEnv is the order book environment plus a funded issuer: asset 1 is a tier one bond issued by
// addr(9), who holds 100 cUSD. Users addr(10..12) are gated for the bond and for cUSD with 300 cUSD each.
type bondEnv struct {
	*ordEnv
}

func newBond(t *testing.T) *bondEnv {
	e := &bondEnv{ordEnv: newOrders(t)}
	e.cusdEnv.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: CUSDGateID, Address: addr(9), Allowed: true}, testFee, ""))
	e.cusdEnv.ok(e.deposit(9, 500*uCNPY))
	e.cusdEnv.ok(e.mint(9, 100*uCNPY, startHeight))
	return e
}

func (e *bondEnv) ok(r *PluginDeliverResponse) {
	e.t.Helper()
	e.ordEnv.ok(r)
	e.checkYield()
}

func (e *bondEnv) fails(r *PluginDeliverResponse, want *PluginError) {
	e.t.Helper()
	e.ordEnv.fails(r, want)
	e.checkYield()
}

func (e *bondEnv) fund(amount uint64) *PluginDeliverResponse {
	return e.c.DeliverFundYield(&MessageFundYield{AssetId: 1, Amount: amount}, testFee, "")
}

func (e *bondEnv) claim(u byte) *PluginDeliverResponse {
	return e.c.DeliverClaimYield(&MessageClaimYield{AssetId: 1, Holder: addr(u)}, testFee, "")
}

func (e *bondEnv) transfer(from, to byte, amt uint64) *PluginDeliverResponse {
	return e.c.DeliverTransferUnits(&MessageTransferUnits{AssetId: 1, FromAddress: addr(from), ToAddress: addr(to), Amount: amt}, testFee, "")
}

func (e *bondEnv) pool() *YieldPool {
	p := new(YieldPool)
	if err := Unmarshal(e.st.m[string(KeyForYieldPool(1))], p); err != nil {
		e.t.Fatal(err)
	}
	return p
}

// pending() returns what a holder could claim right now, computed straight from state
func (e *bondEnv) pending(a []byte) uint64 {
	idx := new(big.Int).SetBytes(e.pool().Index)
	acct := new(YieldAccount)
	if err := Unmarshal(e.st.m[string(KeyForYieldAccount(1, a))], acct); err != nil {
		e.t.Fatal(err)
	}
	last := new(big.Int).SetBytes(acct.LastIndex)
	p := new(big.Int).Sub(idx, last)
	p.Mul(p, bigU(e.held(a))).Div(p, yieldScale)
	return acct.Accrued + p.Uint64()
}

// checkYield asserts the bond's solvency: the yield escrow holds exactly what was funded and not yet
// claimed, and everything holders could still claim fits inside it
func (e *bondEnv) checkYield() {
	e.t.Helper()
	p := e.pool()
	if p.Claimed > p.Funded {
		e.t.Fatalf("claimed %d exceeds funded %d", p.Claimed, p.Funded)
	}
	if got := e.cusd(yieldEscrowAddr); got != p.Funded-p.Claimed {
		e.t.Fatalf("yield escrow holds %d, want funded-claimed = %d", got, p.Funded-p.Claimed)
	}
	var owed uint64
	for _, u := range []byte{9, 10, 11, 12} {
		owed += e.pending(addr(u))
	}
	if owed > p.Funded-p.Claimed {
		e.t.Fatalf("holders are owed %d but only %d is escrowed", owed, p.Funded-p.Claimed)
	}
	// the order escrow and yield escrow never earn or hold yield positions
	for _, a := range [][]byte{escrowAddr, yieldEscrowAddr} {
		if _, ok := e.st.m[string(KeyForYieldAccount(1, a))]; ok {
			e.t.Fatalf("protocol address %x has a yield position", a)
		}
	}
}

func TestYieldFundAndClaim(t *testing.T) {
	e := newBond(t)
	e.issue(10, 100)
	e.issue(11, 300)
	issuerBefore := e.cusd(addr(9))
	r := e.fund(40_000_000)
	e.ok(r)
	if count(r, "yield_funded") != 1 {
		t.Fatal("missing yield_funded event")
	}
	if got := issuerBefore - e.cusd(addr(9)); got != 40_000_000 {
		t.Fatalf("issuer charged %d, want 40000000", got)
	}
	if e.cusd(yieldEscrowAddr) != 40_000_000 {
		t.Fatal("funded cUSD is not in yield escrow")
	}
	c10, c11 := e.cusd(addr(10)), e.cusd(addr(11))
	r = e.claim(10)
	e.ok(r)
	if count(r, "yield_claimed") != 1 {
		t.Fatal("missing yield_claimed event")
	}
	e.ok(e.claim(11))
	if e.cusd(addr(10))-c10 != 10_000_000 || e.cusd(addr(11))-c11 != 30_000_000 {
		t.Fatalf("pro rata payout wrong: %d / %d", e.cusd(addr(10))-c10, e.cusd(addr(11))-c11)
	}
	if p := e.pool(); p.Funded != 40_000_000 || p.Claimed != 40_000_000 || e.cusd(yieldEscrowAddr) != 0 {
		t.Fatalf("pool not drained: %+v", p)
	}
	// nothing is claimable twice
	e.fails(e.claim(10), ErrNothingToClaim())
}

func TestYieldFollowsBalance(t *testing.T) {
	e := newBond(t)
	e.issue(10, 100)
	e.ok(e.fund(10_000_000))
	e.ok(e.transfer(10, 11, 50))
	e.ok(e.fund(10_000_000))
	c10, c11 := e.cusd(addr(10)), e.cusd(addr(11))
	e.ok(e.claim(10))
	e.ok(e.claim(11))
	// addr(10) held 100 units in round one and 50 in round two; addr(11) held 50 in round two only
	if got := e.cusd(addr(10)) - c10; got != 15_000_000 {
		t.Fatalf("addr(10) earned %d, want 15000000", got)
	}
	if got := e.cusd(addr(11)) - c11; got != 5_000_000 {
		t.Fatalf("addr(11) earned %d, want 5000000", got)
	}
}

func TestYieldIsNotRetroactiveAndSurvivesSellingOut(t *testing.T) {
	e := newBond(t)
	e.issue(10, 100)
	e.ok(e.fund(10_000_000))
	// the whole position moves away after the round: the new holder earns nothing from it...
	e.ok(e.transfer(10, 11, 100))
	e.fails(e.claim(11), ErrNothingToClaim())
	// ...and the seller keeps what it earned while holding, even with a zero balance
	c10 := e.cusd(addr(10))
	e.ok(e.claim(10))
	if got := e.cusd(addr(10)) - c10; got != 10_000_000 {
		t.Fatalf("seller earned %d, want 10000000", got)
	}
	if _, ok := e.st.m[string(KeyForYieldAccount(1, addr(10)))]; ok {
		t.Fatal("an empty yield position was left in state")
	}
	// the next round belongs to the new holder
	e.ok(e.fund(10_000_000))
	c11 := e.cusd(addr(11))
	e.ok(e.claim(11))
	if got := e.cusd(addr(11)) - c11; got != 10_000_000 {
		t.Fatalf("new holder earned %d, want 10000000", got)
	}
}

func TestYieldEscrowedUnitsEarnNothing(t *testing.T) {
	e := newBond(t)
	e.issue(10, 100)
	e.issue(11, 100)
	// 30 of addr(10)'s units rest on the book, so 170 of 200 units are eligible
	e.ok(e.place(10, Side_SIDE_SELL, p10, 30))
	r := e.fund(17_000_000)
	e.ok(r)
	c10, c11 := e.cusd(addr(10)), e.cusd(addr(11))
	e.ok(e.claim(10))
	e.ok(e.claim(11))
	if got := e.cusd(addr(10)) - c10; got != 7_000_000 {
		t.Fatalf("seller earned %d on 70 free units, want 7000000", got)
	}
	if got := e.cusd(addr(11)) - c11; got != 10_000_000 {
		t.Fatalf("holder earned %d, want 10000000", got)
	}
	// the buyer takes the 30 escrowed units: it earns nothing from the earlier round, but does from the next
	e.ok(e.place(12, Side_SIDE_BUY, p10, 30))
	e.fails(e.claim(12), ErrNothingToClaim())
	e.ok(e.fund(10_000_000)) // all 200 units are eligible again: 50000 per unit
	c12 := e.cusd(addr(12))
	e.ok(e.claim(12))
	if got := e.cusd(addr(12)) - c12; got != 1_500_000 {
		t.Fatalf("buyer earned %d on 30 units, want 1500000", got)
	}
}

func TestYieldRoundingNeverOverpays(t *testing.T) {
	e := newBond(t)
	for _, u := range []byte{10, 11, 12} {
		e.issue(u, 1)
	}
	before := e.cusd(addr(9))
	e.ok(e.fund(10)) // 10 micro-cUSD over 3 units: 3 each, and the charge rounds up to cover it
	if got := before - e.cusd(addr(9)); got != 10 {
		t.Fatalf("issuer charged %d, want 10", got)
	}
	for _, u := range []byte{10, 11, 12} {
		c := e.cusd(addr(u))
		e.ok(e.claim(u))
		if got := e.cusd(addr(u)) - c; got != 3 {
			t.Fatalf("addr(%d) earned %d, want 3", u, got)
		}
	}
	// the one micro-cUSD of rounding dust stays in escrow and is fully accounted for
	if p := e.pool(); e.cusd(yieldEscrowAddr) != 1 || p.Funded-p.Claimed != 1 {
		t.Fatalf("expected exactly 1 micro-cUSD of dust, got escrow %d", e.cusd(yieldEscrowAddr))
	}
	// an amount too small to give every unit anything is rejected instead of silently vanishing
	e.fails(e.fund(1), ErrInvalidAmount())
}

func TestYieldFundAndClaimRejections(t *testing.T) {
	e := newBond(t)
	// a second asset that is tier one but not a bond
	e.cusdEnv.ok(e.c.DeliverRegisterAsset(&MessageRegisterAsset{Symbol: "RWA1", Class: AssetClass_ASSET_CLASS_RWA,
		Issuer: addr(9), GatePolicy: GatePolicy_GATE_POLICY_ALLOWLIST, Tier: 1}, testFee, ""))

	// no units yet
	e.fails(e.fund(1_000_000), ErrNoEligibleUnits())
	e.issue(10, 100)
	// not a bond, unknown asset, id 0, zero amount
	e.fails(e.c.DeliverFundYield(&MessageFundYield{AssetId: 2, Amount: 1}, testFee, ""), ErrNotYieldAsset())
	e.fails(e.c.DeliverClaimYield(&MessageClaimYield{AssetId: 2, Holder: addr(10)}, testFee, ""), ErrNotYieldAsset())
	e.fails(e.c.DeliverFundYield(&MessageFundYield{AssetId: 7, Amount: 1}, testFee, ""), ErrAssetNotFound())
	e.fails(e.c.DeliverFundYield(&MessageFundYield{AssetId: 0, Amount: 1}, testFee, ""), ErrAssetNotFound())
	e.fails(e.fund(0), ErrInvalidAmount())
	// the issuer only holds 100 cUSD
	e.fails(e.fund(200*uCNPY), ErrInsufficientCUSD())
	// never funded
	e.fails(e.claim(10), ErrNothingToClaim())

	e.ok(e.fund(10_000_000))
	// gates: a holder revoked on the bond, or on cUSD, cannot claim
	e.cusdEnv.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: 1, Address: addr(10), Allowed: false}, testFee, ""))
	e.fails(e.claim(10), ErrNotAllowed())
	e.cusdEnv.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: 1, Address: addr(10), Allowed: true}, testFee, ""))
	e.cusdEnv.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: CUSDGateID, Address: addr(10), Allowed: false}, testFee, ""))
	e.fails(e.claim(10), ErrNotAllowed())
	e.cusdEnv.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: CUSDGateID, Address: addr(10), Allowed: true}, testFee, ""))
	// protocol addresses cannot hold, receive or claim
	for _, a := range [][]byte{escrowAddr, yieldEscrowAddr} {
		e.fails(e.c.DeliverClaimYield(&MessageClaimYield{AssetId: 1, Holder: a}, testFee, ""), ErrReservedAddress())
		e.fails(e.c.DeliverIssueUnits(&MessageIssueUnits{AssetId: 1, To: a, Amount: 1}, testFee, ""), ErrReservedAddress())
		e.fails(e.c.DeliverTransferUnits(&MessageTransferUnits{AssetId: 1, FromAddress: addr(10), ToAddress: a, Amount: 1}, testFee, ""), ErrReservedAddress())
	}
	// a rejected claim left the position intact
	e.ok(e.claim(10))
}

func TestBondCheckTxSigners(t *testing.T) {
	e := newBond(t)
	e.cusdEnv.ok(e.c.DeliverRegisterAsset(&MessageRegisterAsset{Symbol: "RWA1", Class: AssetClass_ASSET_CLASS_RWA,
		Issuer: addr(9), GatePolicy: GatePolicy_GATE_POLICY_ALLOWLIST, Tier: 1}, testFee, ""))
	signer := func(r *PluginCheckResponse, want []byte) {
		t.Helper()
		if r.Error != nil || len(r.AuthorizedSigners) != 1 || !bytes.Equal(r.AuthorizedSigners[0], want) {
			t.Fatalf("unexpected check response: %+v", r)
		}
	}
	rejects := func(r *PluginCheckResponse, want *PluginError) {
		t.Helper()
		if r.Error == nil || r.Error.Code != want.Code {
			t.Fatalf("want error %d, got %+v", want.Code, r.Error)
		}
	}
	signer(e.c.CheckPostNav(&MessagePostNav{AssetId: 1, Nav: p10}), addr(1))
	signer(e.c.CheckFundYield(&MessageFundYield{AssetId: 1, Amount: 5}), addr(9))
	signer(e.c.CheckClaimYield(&MessageClaimYield{AssetId: 1, Holder: addr(10)}), addr(10))
	rejects(e.c.CheckPostNav(&MessagePostNav{AssetId: 1, Nav: 0}), ErrInvalidNav())
	rejects(e.c.CheckPostNav(&MessagePostNav{AssetId: 1, Nav: maxPrice + 1}), ErrInvalidNav())
	rejects(e.c.CheckPostNav(&MessagePostNav{AssetId: 0, Nav: 5}), ErrAssetNotFound())
	rejects(e.c.CheckFundYield(&MessageFundYield{AssetId: 1, Amount: 0}), ErrInvalidAmount())
	rejects(e.c.CheckFundYield(&MessageFundYield{AssetId: 2, Amount: 5}), ErrNotYieldAsset())
	rejects(e.c.CheckFundYield(&MessageFundYield{AssetId: 9, Amount: 5}), ErrAssetNotFound())
	rejects(e.c.CheckClaimYield(&MessageClaimYield{AssetId: 1, Holder: addr(10)[:19]}), ErrInvalidAddress())
	rejects(e.c.CheckClaimYield(&MessageClaimYield{AssetId: 1, Holder: yieldEscrowAddr}), ErrReservedAddress())
}

func TestPostNav(t *testing.T) {
	e := newBond(t)
	// asset 2: a tier two asset, which carries no NAV
	e.cusdEnv.ok(e.c.DeliverRegisterAsset(&MessageRegisterAsset{Symbol: "TWO", Class: AssetClass_ASSET_CLASS_RWA,
		Issuer: addr(9), GatePolicy: GatePolicy_GATE_POLICY_OPEN, Tier: 2}, testFee, ""))
	post := func(id, nav, h uint64) *PluginDeliverResponse {
		return e.c.DeliverPostNav(&MessagePostNav{AssetId: id, Nav: nav}, testFee, "", h)
	}
	adminBefore := e.cnpy(addr(1))
	r := post(1, 100*uCNPY, 200)
	e.ok(r)
	if count(r, "nav_posted") != 1 {
		t.Fatal("missing nav_posted event")
	}
	if got := adminBefore - e.cnpy(addr(1)); got != testFee {
		t.Fatalf("admin charged %d, want %d", got, testFee)
	}
	rec := new(NavRecord)
	if err := Unmarshal(e.st.m[string(KeyForNav(1))], rec); err != nil || rec.Nav != 100*uCNPY || rec.Height != 200 {
		t.Fatalf("stored NAV wrong: %+v %v", rec, err)
	}
	// the hard ceiling is 50% per update: 50% is fine, more is not
	e.ok(post(1, 150*uCNPY, 201))
	e.fails(post(1, 226*uCNPY, 202), ErrNavMoveTooLarge()) // > +50% of 150
	e.ok(post(1, 75*uCNPY, 203))                           // exactly -50%
	e.fails(post(1, 37*uCNPY, 204), ErrNavMoveTooLarge())
	e.fails(post(1, 0, 205), ErrInvalidNav())
	e.fails(post(1, maxPrice+1, 205), ErrInvalidNav())
	e.fails(post(2, 5*uCNPY, 205), ErrNotTierOne())
	e.fails(post(9, 5*uCNPY, 205), ErrAssetNotFound())
	if err := Unmarshal(e.st.m[string(KeyForNav(1))], rec); err != nil || rec.Nav != 75*uCNPY {
		t.Fatalf("rejected updates changed the stored NAV: %+v", rec)
	}
}

func TestBondStateKeysUseDeclaredPrefixes(t *testing.T) {
	declared := map[string]bool{}
	for _, p := range ContractConfig.CustomStatePrefixes {
		declared[string(p)] = true
	}
	for _, k := range [][]byte{KeyForNav(1), KeyForYieldPool(1), KeyForYieldAccount(1, addr(1))} {
		n := int(k[0])
		if !declared[string(k[1:1+n])] {
			t.Fatalf("key %x does not start with a declared prefix", k)
		}
	}
}

// TestYieldRandomized drives random issues, transfers, trades, funding rounds and claims. After every
// step the bond must stay solvent; at the end every holder claims, and nobody may have been paid more
// than its exact pro rata share (computed independently from balance snapshots), nor much less.
func TestYieldRandomized(t *testing.T) {
	for seed := int64(1); seed <= 20; seed++ {
		runYieldRandom(t, seed)
	}
}

func runYieldRandom(t *testing.T, seed int64) {
	rng := rand.New(rand.NewSource(seed))
	e := newBond(t)
	users := []byte{10, 11, 12}
	ideal := map[byte]*big.Int{}
	for _, u := range users {
		ideal[u] = new(big.Int)
	}
	// only cUSD that left yield escrow through a claim counts; trading cUSD is ignored
	claimed := map[byte]uint64{}
	issued := uint64(0)
	steps := 150
	check := func() {
		e.cusdEnv.invariants()
		e.checkBook()
		e.checkYield()
	}
	for i := 0; i < steps; i++ {
		u := users[rng.Intn(len(users))]
		v := users[rng.Intn(len(users))]
		switch rng.Intn(7) {
		case 0:
			if amt := uint64(rng.Intn(40) + 1); issued+amt <= 400 {
				if r := e.c.DeliverIssueUnits(&MessageIssueUnits{AssetId: 1, To: addr(u), Amount: amt}, testFee, ""); r.Error == nil {
					issued += amt
				}
			}
		case 1:
			e.transfer(u, v, uint64(rng.Intn(30)+1))
		case 2:
			e.place(u, Side_SIDE_SELL, uint64(rng.Intn(3)+1)*uCNPY, uint64(rng.Intn(20)+1))
		case 3:
			e.place(u, Side_SIDE_BUY, uint64(rng.Intn(3)+1)*uCNPY, uint64(rng.Intn(20)+1))
		case 4:
			for id := uint64(1); id <= 40; id++ {
				if o := e.order(id); o != nil && bytes.Equal(o.Owner, addr(u)) {
					e.cancel(u, id)
					break
				}
			}
		case 5:
			// snapshot the free (non-escrowed) balances, fund, and book each holder's ideal share
			before := new(big.Int).SetBytes(e.pool().Index)
			snap := map[byte]uint64{}
			for _, w := range users {
				snap[w] = e.held(addr(w))
			}
			if r := e.fund(uint64(rng.Intn(5_000_000) + 1)); r.Error == nil {
				incr := new(big.Int).Sub(new(big.Int).SetBytes(e.pool().Index), before)
				for _, w := range users {
					ideal[w].Add(ideal[w], new(big.Int).Mul(bigU(snap[w]), incr))
				}
			}
		case 6:
			// only yield claims move cUSD out of yield escrow, so the balance delta is exactly the payout
			before := e.cusd(addr(u))
			if r := e.claim(u); r.Error == nil {
				claimed[u] += e.cusd(addr(u)) - before
			}
		}
		check()
	}
	for _, u := range users {
		before := e.cusd(addr(u))
		if r := e.claim(u); r.Error == nil {
			claimed[u] += e.cusd(addr(u)) - before
		}
		check()
	}
	for _, u := range users {
		want := new(big.Int).Div(ideal[u], yieldScale)
		got := bigU(claimed[u])
		if got.Cmp(want) > 0 {
			t.Fatalf("seed %d: addr(%d) was paid %s, more than its exact share %s", seed, u, got, want)
		}
		if new(big.Int).Sub(want, got).Cmp(big.NewInt(int64(steps))) > 0 {
			t.Fatalf("seed %d: addr(%d) was paid %s, far below its share %s", seed, u, got, want)
		}
	}
}
