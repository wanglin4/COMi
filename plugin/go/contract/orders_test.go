package contract

import (
	"bytes"
	"sort"
	"strings"
	"testing"
)

// Range makes memState satisfy stateIO: ascending key order, bounded by limit (mirrors the FSM iterator)
func (s *memState) Range(prefix []byte, limit uint64) ([]*PluginStateEntry, *PluginError) {
	var keys []string
	for k := range s.m {
		if strings.HasPrefix(k, string(prefix)) {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)
	var out []*PluginStateEntry
	for i, k := range keys {
		if uint64(i) >= limit {
			break
		}
		out = append(out, &PluginStateEntry{Key: []byte(k), Value: bytes.Clone(s.m[k])})
	}
	return out, nil
}

const (
	p10 = 10 * uCNPY // $10.00 per unit, in micro-cUSD
	p11 = 11 * uCNPY
	p12 = 12 * uCNPY
	p9  = 9 * uCNPY
	p8  = 8 * uCNPY
)

// ordEnv extends the cUSD environment with asset 1 (issuer addr(9)), gated users addr(10..12), each
// holding 300 cUSD. Units are issued per test.
// h is the block height used for orders placed through the helpers
type ordEnv struct {
	*cusdEnv
	h uint64
}

func (e *ordEnv) ok(r *PluginDeliverResponse) {
	e.t.Helper()
	e.cusdEnv.ok(r)
	e.checkBook()
}

func (e *ordEnv) fails(r *PluginDeliverResponse, want *PluginError) {
	e.t.Helper()
	e.cusdEnv.fails(r, want)
	e.checkBook()
}

func newOrders(t *testing.T) *ordEnv {
	e := &ordEnv{cusdEnv: newCUSD(t), h: startHeight}
	e.st.m[string(KeyForAccount(addr(9)))] = mustMarshal(t, &Account{Amount: userCNPY})
	e.total += userCNPY
	e.cusdEnv.ok(e.c.DeliverRegisterAsset(bond("BOND1"), testFee, ""))
	for _, u := range []byte{10, 11, 12} {
		e.cusdEnv.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: 1, Address: addr(u), Allowed: true}, testFee, ""))
		e.cusdEnv.ok(e.deposit(u, 500*uCNPY))
		e.cusdEnv.ok(e.mint(u, 300*uCNPY, startHeight))
	}
	return e
}

func (e *ordEnv) issue(u byte, amt uint64) {
	e.t.Helper()
	e.ok(e.c.DeliverIssueUnits(&MessageIssueUnits{AssetId: 1, To: addr(u), Amount: amt}, testFee, ""))
}

func (e *ordEnv) place(u byte, side Side, price, amt uint64) *PluginDeliverResponse {
	return e.c.DeliverPlaceOrder(&MessagePlaceOrder{AssetId: 1, Owner: addr(u), Side: side, Price: price, Amount: amt}, testFee, "", e.h)
}

func (e *ordEnv) cancel(u byte, id uint64) *PluginDeliverResponse {
	return e.c.DeliverCancelOrder(&MessageCancelOrder{Owner: addr(u), OrderId: id}, testFee, "")
}

func (e *ordEnv) held(a []byte) uint64 {
	h := new(Holding)
	if err := Unmarshal(e.st.m[string(KeyForHolding(1, a))], h); err != nil {
		e.t.Fatal(err)
	}
	return h.Amount
}

func (e *ordEnv) order(id uint64) *Order {
	bz, ok := e.st.m[string(KeyForOrder(id))]
	if !ok {
		return nil
	}
	o := new(Order)
	if err := Unmarshal(bz, o); err != nil {
		e.t.Fatal(err)
	}
	return o
}

func count(r *PluginDeliverResponse, eventType string) int {
	n := 0
	for _, ev := range r.Events {
		if ev.EventType == eventType {
			n++
		}
	}
	return n
}

// checkBook asserts the order book invariants: every resting order has its index entries, escrow equals
// the sum of what resting orders locked, and all units are accounted for.
func (e *ordEnv) checkBook() {
	e.t.Helper()
	var held, wantEscUnits, wantEscCUSD uint64
	var orders, books, owners int
	for k, v := range e.st.m {
		bz := []byte(k)
		switch {
		case bytes.HasPrefix(bz, []byte{1, 106}):
			h := new(Holding)
			_ = Unmarshal(v, h)
			held += h.Amount
		case bytes.HasPrefix(bz, []byte{1, 107}):
			o := new(Order)
			if err := Unmarshal(v, o); err != nil {
				e.t.Fatal(err)
			}
			orders++
			if o.Remaining == 0 {
				e.t.Fatalf("order %d rests with nothing remaining", o.Id)
			}
			if _, ok := e.st.m[string(KeyForBook(o.AssetId, o.Side, o.Price, o.Id))]; !ok {
				e.t.Fatalf("order %d has no book entry", o.Id)
			}
			if _, ok := e.st.m[string(KeyForOwnerOrder(o.Owner, o.Id))]; !ok {
				e.t.Fatalf("order %d has no owner index entry", o.Id)
			}
			if o.Side == Side_SIDE_BUY {
				cost, _ := orderCost(o.Price, o.Remaining)
				wantEscCUSD += cost
			} else {
				wantEscUnits += o.Remaining
			}
		case bytes.HasPrefix(bz, []byte{1, 108}):
			books++
		case bytes.HasPrefix(bz, []byte{1, 109}):
			owners++
		}
	}
	us := new(UnitSupply)
	_ = Unmarshal(e.st.m[string(KeyForUnitSupply(1))], us)
	if held != us.Issued {
		e.t.Fatalf("units not conserved: held=%d issued=%d", held, us.Issued)
	}
	if orders != books || orders != owners {
		e.t.Fatalf("index mismatch: orders=%d book=%d owner=%d", orders, books, owners)
	}
	if got := e.held(escrowAddr); got != wantEscUnits {
		e.t.Fatalf("escrowed units %d != resting sells %d", got, wantEscUnits)
	}
	if got := e.cusd(escrowAddr); got != wantEscCUSD {
		e.t.Fatalf("escrowed cUSD %d != resting buys %d", got, wantEscCUSD)
	}
}

func TestIssueAndTransferUnits(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	if e.held(addr(10)) != 100 {
		t.Fatal("issue did not credit the holder")
	}
	// ungated recipient, reserved recipient, zero amount, unknown asset
	e.fails(e.c.DeliverIssueUnits(&MessageIssueUnits{AssetId: 1, To: addr(13), Amount: 1}, testFee, ""), ErrNotAllowed())
	e.fails(e.c.DeliverIssueUnits(&MessageIssueUnits{AssetId: 1, To: escrowAddr, Amount: 1}, testFee, ""), ErrReservedAddress())
	e.fails(e.c.DeliverIssueUnits(&MessageIssueUnits{AssetId: 1, To: addr(10), Amount: 0}, testFee, ""), ErrInvalidAmount())
	e.fails(e.c.DeliverIssueUnits(&MessageIssueUnits{AssetId: 7, To: addr(10), Amount: 1}, testFee, ""), ErrAssetNotFound())
	// transfers
	tr := func(from, to byte, amt uint64) *PluginDeliverResponse {
		return e.c.DeliverTransferUnits(&MessageTransferUnits{AssetId: 1, FromAddress: addr(from), ToAddress: addr(to), Amount: amt}, testFee, "")
	}
	e.ok(tr(10, 11, 40))
	if e.held(addr(10)) != 60 || e.held(addr(11)) != 40 {
		t.Fatal("transfer balances wrong")
	}
	e.fails(tr(10, 11, 61), ErrInsufficientUnits())
	e.fails(tr(10, 10, 1), ErrSelfTransfer())
	e.fails(tr(10, 13, 1), ErrNotAllowed())
	e.fails(tr(13, 10, 1), ErrNotAllowed())
	e.fails(e.c.DeliverTransferUnits(&MessageTransferUnits{AssetId: 1, FromAddress: addr(10), ToAddress: escrowAddr, Amount: 1}, testFee, ""), ErrReservedAddress())
}

func TestRestAndCancel(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	r := e.place(10, Side_SIDE_SELL, p10, 10)
	e.ok(r)
	if count(r, "order_placed") != 1 || count(r, "trade") != 0 {
		t.Fatalf("unexpected events %+v", r.Events)
	}
	if o := e.order(1); o == nil || o.Remaining != 10 || o.Price != p10 {
		t.Fatalf("resting order wrong: %+v", o)
	}
	if e.held(addr(10)) != 90 || e.held(escrowAddr) != 10 {
		t.Fatal("sell must escrow its units")
	}
	e.fails(e.cancel(11, 1), ErrNotOrderOwner())
	e.fails(e.cancel(10, 99), ErrOrderNotFound())
	e.ok(e.cancel(10, 1))
	if e.order(1) != nil || e.held(addr(10)) != 100 || e.held(escrowAddr) != 0 {
		t.Fatal("cancel must refund escrow and remove the order")
	}
	// a resting buy escrows cUSD and refunds it on cancel
	before := e.cusd(addr(11))
	e.ok(e.place(11, Side_SIDE_BUY, p9, 10))
	if e.cusd(addr(11)) != before-90*uCNPY || e.cusd(escrowAddr) != 90*uCNPY {
		t.Fatal("buy must escrow price x amount")
	}
	e.ok(e.cancel(11, 2))
	if e.cusd(addr(11)) != before {
		t.Fatal("cancel must refund cUSD")
	}
}

func TestFullMatchAndPriceImprovement(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	e.ok(e.place(10, Side_SIDE_SELL, p10, 10))
	r := e.place(11, Side_SIDE_BUY, p12, 10) // willing to pay $12, trades at the maker's $10
	e.ok(r)
	if count(r, "trade") != 1 {
		t.Fatalf("want one trade, got %+v", r.Events)
	}
	if e.cusd(addr(11)) != 200*uCNPY || e.cusd(addr(10)) != 400*uCNPY {
		t.Fatalf("settlement wrong: buyer %d seller %d", e.cusd(addr(11)), e.cusd(addr(10)))
	}
	if e.held(addr(11)) != 10 || e.held(addr(10)) != 90 {
		t.Fatal("units not delivered")
	}
	if e.order(1) != nil || e.order(2) != nil {
		t.Fatal("fully matched orders must not rest")
	}
}

func TestPriceTimePriority(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	e.issue(12, 100)
	// same price: the earlier order fills first
	e.ok(e.place(10, Side_SIDE_SELL, p10, 5)) // id 1
	e.ok(e.place(12, Side_SIDE_SELL, p10, 5)) // id 2
	e.ok(e.place(11, Side_SIDE_BUY, p10, 7))  // id 3
	if e.order(1) != nil {
		t.Fatal("earlier order should be fully filled")
	}
	if o := e.order(2); o == nil || o.Remaining != 3 {
		t.Fatalf("later order should have 3 left, got %+v", o)
	}
	if e.cusd(addr(10)) != 350*uCNPY || e.cusd(addr(12)) != 320*uCNPY {
		t.Fatal("maker proceeds wrong")
	}
	// better price beats earlier time
	e = newOrders(t)
	e.issue(10, 100)
	e.issue(12, 100)
	e.ok(e.place(10, Side_SIDE_SELL, p11, 5)) // id 1, worse price, earlier
	e.ok(e.place(12, Side_SIDE_SELL, p10, 5)) // id 2, better price, later
	e.ok(e.place(11, Side_SIDE_BUY, p11, 5))  // id 3
	if e.order(2) != nil || e.order(1) == nil {
		t.Fatal("the cheaper ask must fill first")
	}
	if e.cusd(addr(11)) != 250*uCNPY { // paid $10 x 5, the $1 x 5 improvement is refunded
		t.Fatalf("buyer paid %d", 300*uCNPY-e.cusd(addr(11)))
	}
}

func TestBidsSortHighestFirst(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	e.ok(e.place(11, Side_SIDE_BUY, p9, 5))  // id 1
	e.ok(e.place(12, Side_SIDE_BUY, p10, 5)) // id 2, higher bid
	r := e.place(10, Side_SIDE_SELL, p8, 5)  // id 3
	e.ok(r)
	if e.order(2) != nil || e.order(1) == nil {
		t.Fatal("the highest bid must fill first")
	}
	if e.held(addr(12)) != 5 || e.cusd(addr(10)) != 350*uCNPY {
		t.Fatal("trade must execute at the resting bid's price ($10)")
	}
}

func TestSelfTradeRejected(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	e.ok(e.place(10, Side_SIDE_SELL, p10, 5))
	w := e.st.writes
	e.fails(e.place(10, Side_SIDE_BUY, p10, 5), ErrSelfTrade())
	if e.st.writes != w {
		t.Fatal("a rejected order must not write state")
	}
	// a non-crossing opposite order is fine
	e.ok(e.place(10, Side_SIDE_BUY, p9, 5))
}

func TestMatchCapRefundsRemainder(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	for i := 0; i < 10; i++ {
		e.ok(e.place(10, Side_SIDE_SELL, p10, 1))
	}
	r := e.place(11, Side_SIDE_BUY, p10, 10) // id 11
	e.ok(r)
	if count(r, "trade") != maxMatchesPerOrder {
		t.Fatalf("want %d trades, got %d", maxMatchesPerOrder, count(r, "trade"))
	}
	if count(r, "order_cancelled") != 1 || e.order(11) != nil {
		t.Fatal("the unfilled remainder must be refunded, not rested")
	}
	if e.held(addr(11)) != uint64(maxMatchesPerOrder) || e.cusd(addr(11)) != 300*uCNPY-8*p10 {
		t.Fatal("only the matched part may be charged")
	}
	if e.order(9) == nil || e.order(10) == nil {
		t.Fatal("unmatched asks must stay on the book")
	}
}

func TestGateRevokedMakerIsCancelled(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	e.ok(e.place(10, Side_SIDE_SELL, p10, 10)) // id 1
	e.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: 1, Address: addr(10), Allowed: false}, testFee, ""))
	r := e.place(11, Side_SIDE_BUY, p10, 5) // id 2
	e.ok(r)
	if count(r, "order_cancelled") != 1 || count(r, "trade") != 0 {
		t.Fatalf("revoked maker must be cancelled, not traded with: %+v", r.Events)
	}
	if e.order(1) != nil || e.held(addr(10)) != 100 {
		t.Fatal("revoked maker's escrow must be refunded")
	}
	if o := e.order(2); o == nil || o.Remaining != 5 {
		t.Fatal("the taker should rest after the book empties")
	}
	// the revoked address can still cancel its own funds out (never gated)
	e.issue(12, 10)
	e.ok(e.place(12, Side_SIDE_SELL, p12, 10)) // id 3
	e.ok(e.c.DeliverSetGate(&MessageSetGate{AssetId: 1, Address: addr(12), Allowed: false}, testFee, ""))
	e.ok(e.cancel(12, 3))
}

func TestOrderRejections(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	w := e.st.writes
	e.fails(e.place(13, Side_SIDE_BUY, p10, 1), ErrNotAllowed())
	e.fails(e.place(12, Side_SIDE_SELL, p10, 1), ErrInsufficientUnits())
	e.fails(e.place(11, Side_SIDE_BUY, p10, 1000), ErrInsufficientCUSD())
	e.fails(e.place(10, Side_SIDE_SELL, p10, 0), ErrInvalidAmount())
	e.fails(e.place(10, Side_SIDE_SELL, 0, 1), ErrInvalidAmount())
	e.fails(e.place(10, Side_SIDE_SELL, 1<<62, 8), ErrInvalidAmount())
	e.fails(e.place(10, Side_SIDE_UNSPECIFIED, p10, 1), ErrInvalidSide())
	e.fails(e.c.DeliverPlaceOrder(&MessagePlaceOrder{AssetId: 0, Owner: addr(10), Side: Side_SIDE_SELL, Price: p10, Amount: 1}, testFee, "", e.h), ErrAssetNotFound())
	e.fails(e.c.DeliverPlaceOrder(&MessagePlaceOrder{AssetId: 1, Owner: escrowAddr, Side: Side_SIDE_SELL, Price: p10, Amount: 1}, testFee, "", e.h), ErrReservedAddress())
	if e.st.writes != w {
		t.Fatal("rejected orders must not write state or charge fees")
	}
	// a failed order must not burn an order id
	e.ok(e.place(10, Side_SIDE_SELL, p10, 1))
	if e.order(1) == nil {
		t.Fatal("first successful order should have id 1")
	}
}

func TestBookKeyOrdering(t *testing.T) {
	asks := [][]byte{
		KeyForBook(1, Side_SIDE_SELL, p10, 1), KeyForBook(1, Side_SIDE_SELL, p10, 2), KeyForBook(1, Side_SIDE_SELL, p11, 1),
	}
	bids := [][]byte{
		KeyForBook(1, Side_SIDE_BUY, p12, 5), KeyForBook(1, Side_SIDE_BUY, p12, 6), KeyForBook(1, Side_SIDE_BUY, p10, 1),
	}
	for name, keys := range map[string][][]byte{"asks": asks, "bids": bids} {
		for i := 1; i < len(keys); i++ {
			if bytes.Compare(keys[i-1], keys[i]) >= 0 {
				t.Errorf("%s: key %d must sort before key %d (best first)", name, i-1, i)
			}
		}
	}
	if !bytes.HasPrefix(asks[0], bookSidePrefix(1, Side_SIDE_SELL)) || bytes.HasPrefix(asks[0], bookSidePrefix(1, Side_SIDE_BUY)) {
		t.Error("side prefix must separate asks and bids")
	}
	if bytes.HasPrefix(asks[0], bookSidePrefix(2, Side_SIDE_SELL)) {
		t.Error("asset prefix must separate assets")
	}
}

func TestOrdersCheckTxAndRouting(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	resp := e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, &MessageIssueUnits{AssetId: 1, To: addr(10), Amount: 1})})
	if resp.Error != nil || len(resp.AuthorizedSigners) != 1 || !bytes.Equal(resp.AuthorizedSigners[0], addr(9)) {
		t.Fatalf("issue_units must be signed by the asset issuer: %+v", resp)
	}
	resp = e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, &MessagePlaceOrder{AssetId: 1, Owner: addr(10), Side: Side_SIDE_SELL, Price: p10, Amount: 1})})
	if resp.Error != nil || !bytes.Equal(resp.AuthorizedSigners[0], addr(10)) {
		t.Fatalf("place_order must be signed by the owner: %+v", resp)
	}
	resp = e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, &MessageTransferUnits{AssetId: 1, FromAddress: addr(10), ToAddress: addr(11), Amount: 1})})
	if resp.Error != nil || !bytes.Equal(resp.AuthorizedSigners[0], addr(10)) || !bytes.Equal(resp.Recipient, addr(11)) {
		t.Fatalf("transfer_units must be signed by the sender: %+v", resp)
	}
	if resp = e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, &MessagePlaceOrder{AssetId: 1, Owner: addr(10), Side: Side_SIDE_SELL, Price: 0, Amount: 1})}); resp.Error == nil {
		t.Fatal("a zero price must fail CheckTx")
	}
	r := e.c.DeliverTx(&PluginDeliverRequest{Tx: anyTx(t, testFee, &MessagePlaceOrder{AssetId: 1, Owner: addr(10), Side: Side_SIDE_SELL, Price: p10, Amount: 5})})
	e.ok(r)
	if e.order(1) == nil {
		t.Fatal("place_order not routed by DeliverTx")
	}
	r = e.c.DeliverTx(&PluginDeliverRequest{Tx: anyTx(t, testFee, &MessageCancelOrder{Owner: addr(10), OrderId: 1})})
	e.ok(r)
	if e.order(1) != nil {
		t.Fatal("cancel_order not routed by DeliverTx")
	}
}

func TestOrderStateKeysUseDeclaredPrefixes(t *testing.T) {
	declared := map[string]bool{}
	for _, p := range ContractConfig.CustomStatePrefixes {
		declared[string(p)] = true
	}
	for _, k := range [][]byte{KeyForHolding(1, addr(1)), KeyForUnitSupply(1), KeyForOrderMeta(), KeyForOrder(1),
		KeyForBook(1, Side_SIDE_BUY, 5, 1), KeyForOwnerOrder(addr(1), 1)} {
		n := int(k[0])
		if !declared[string(k[1:1+n])] {
			t.Fatalf("key %x does not start with a declared prefix", k)
		}
	}
}
