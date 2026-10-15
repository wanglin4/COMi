package contract

import (
	"bytes"
	"crypto/sha256"
	"encoding/binary"
	"math"
	"math/big"
)

/* Asset holdings and the on-chain order book.

   Holdings: the issuer of a registered asset mints units to gated holders (IssueUnits); holders move
   them with TransferUnits. Both ends of every movement pass the asset's gate.

   Order book: limit orders priced in cUSD (micro-cUSD per 1 unit). Placing an order first moves its
   funds into escrow (cUSD for buys, units for sells), then matches against the opposite side in
   price-time priority, then rests any remainder. The book index (see KeyForBook) is ordered so a
   prefix read returns the best order first, which is what keeps matching cheap and deterministic.

   Rules:
   - trades execute at the resting order's price; a buyer who crossed deeper is refunded the difference
   - matching is capped at maxMatchesPerOrder fills; if the cap is hit while the book may still cross,
     the unfilled remainder is refunded instead of resting (so the book never stays crossed)
   - an order that would match its owner's own resting order is rejected (self-trade prevention)
   - a resting order whose owner lost gate access is cancelled and refunded when a taker reaches it
   - cancel is never gated, so revoking an address can't trap its escrowed funds
   - escrow is a protocol address nobody holds a key for; cUSD and units in escrow stay counted in
     their normal ledgers, so the cUSD and unit supply invariants hold */

const maxMatchesPerOrder = 8

// escrowAddr holds all order funds. It is a hash of a fixed label, so no private key exists for it.
var escrowAddr = func() []byte {
	h := sha256.Sum256([]byte("comi/orderbook/escrow/v1"))
	return h[:20]
}()

// orderCost() returns price x amount and whether it fits in a uint64
func orderCost(price, amount uint64) (uint64, bool) {
	v := new(big.Int).Mul(bigU(price), bigU(amount))
	if !v.IsUint64() {
		return 0, false
	}
	return v.Uint64(), true
}

// ledger is a read-through-the-batch view over state: every read sees the writes staged so far, and
// nothing reaches the FSM until flush(). A transaction that fails part way therefore changes nothing.
type ledger struct {
	s stateIO
	b *batch
}

func newLedger(s stateIO) *ledger { return &ledger{s: s, b: newBatch()} }

// get() reads a key, preferring the staged batch
func (l *ledger) get(key []byte) ([]byte, *PluginError) {
	k := string(key)
	if l.b.dels[k] {
		return nil, nil
	}
	if v, ok := l.b.sets[k]; ok {
		return v, nil
	}
	vals, err := l.s.Read(key)
	if err != nil {
		return nil, err
	}
	return vals[0], nil
}

func (l *ledger) cusd(addr []byte) (uint64, *PluginError) {
	bz, err := l.get(KeyForCUSD(addr))
	if err != nil {
		return 0, err
	}
	acc := new(CUSDAccount)
	if err = Unmarshal(bz, acc); err != nil {
		return 0, err
	}
	return acc.Amount, nil
}

func (l *ledger) setCUSD(addr []byte, amt uint64) *PluginError {
	if amt == 0 {
		l.b.del(KeyForCUSD(addr))
		return nil
	}
	return putMsg(l.b, KeyForCUSD(addr), &CUSDAccount{Amount: amt})
}

func (l *ledger) units(assetId uint64, addr []byte) (uint64, *PluginError) {
	bz, err := l.get(KeyForHolding(assetId, addr))
	if err != nil {
		return 0, err
	}
	h := new(Holding)
	if err = Unmarshal(bz, h); err != nil {
		return 0, err
	}
	return h.Amount, nil
}

func (l *ledger) setUnits(assetId uint64, addr []byte, amt uint64) *PluginError {
	if amt == 0 {
		l.b.del(KeyForHolding(assetId, addr))
		return nil
	}
	return putMsg(l.b, KeyForHolding(assetId, addr), &Holding{Amount: amt})
}

// moveCUSD() moves cUSD between two ledger balances
func (l *ledger) moveCUSD(from, to []byte, amt uint64) *PluginError {
	fb, err := l.cusd(from)
	if err != nil {
		return err
	}
	if fb < amt {
		return ErrInsufficientCUSD()
	}
	if err = l.setCUSD(from, fb-amt); err != nil {
		return err
	}
	tb, err := l.cusd(to)
	if err != nil {
		return err
	}
	if tb > math.MaxUint64-amt {
		return ErrInvalidAmount()
	}
	return l.setCUSD(to, tb+amt)
}

// moveUnits() moves asset units between two ledger balances
func (l *ledger) moveUnits(assetId uint64, from, to []byte, amt uint64) *PluginError {
	fb, err := l.units(assetId, from)
	if err != nil {
		return err
	}
	if fb < amt {
		return ErrInsufficientUnits()
	}
	if err = l.setUnits(assetId, from, fb-amt); err != nil {
		return err
	}
	tb, err := l.units(assetId, to)
	if err != nil {
		return err
	}
	if tb > math.MaxUint64-amt {
		return ErrInvalidAmount()
	}
	return l.setUnits(assetId, to, tb+amt)
}

// payFee() debits the CNPY fee from the payer into the fee pool (staged, like every other write)
func (l *ledger) payFee(c *Contract, payer []byte, fee uint64, memo string) *PluginError {
	poolKey := KeyForFeePool(c.Config.ChainId)
	vals, err := l.s.Read(KeyForAccount(payer), poolKey)
	if err != nil {
		return err
	}
	acc, pool := new(Account), new(Pool)
	if err = Unmarshal(vals[0], acc); err != nil {
		return err
	}
	if err = Unmarshal(vals[1], pool); err != nil {
		return err
	}
	if err = chargeFee(acc, pool, fee); err != nil {
		return err
	}
	if err = putAccount(l.b, payer, acc, memo); err != nil {
		return err
	}
	return putMsg(l.b, poolKey, pool)
}

// nextOrderID() assigns the next sequential order id
func (l *ledger) nextOrderID() (uint64, *PluginError) {
	bz, err := l.get(KeyForOrderMeta())
	if err != nil {
		return 0, err
	}
	meta := new(OrderMeta)
	if err = Unmarshal(bz, meta); err != nil {
		return 0, err
	}
	if meta.OrderCount == math.MaxUint64 {
		return 0, ErrRegistryFull()
	}
	meta.OrderCount++
	return meta.OrderCount, putMsg(l.b, KeyForOrderMeta(), meta)
}

// putOrder() stages a new resting order with its book and owner index entries
func (l *ledger) putOrder(o *Order) *PluginError {
	if err := putMsg(l.b, KeyForOrder(o.Id), o); err != nil {
		return err
	}
	l.b.set(KeyForBook(o.AssetId, o.Side, o.Price, o.Id), formatUint64(o.Id))
	l.b.set(KeyForOwnerOrder(o.Owner, o.Id), []byte{1})
	return nil
}

// removeOrder() stages the deletion of an order and both of its index entries
func (l *ledger) removeOrder(o *Order) {
	l.b.del(KeyForOrder(o.Id))
	l.b.del(KeyForBook(o.AssetId, o.Side, o.Price, o.Id))
	l.b.del(KeyForOwnerOrder(o.Owner, o.Id))
}

// refund() returns an order's remaining escrow to its owner
func (l *ledger) refund(o *Order) *PluginError {
	if o.Remaining == 0 {
		return nil
	}
	if o.Side == Side_SIDE_BUY {
		cost, ok := orderCost(o.Price, o.Remaining)
		if !ok {
			return ErrCorruptState()
		}
		return l.moveCUSD(escrowAddr, o.Owner, cost)
	}
	return l.moveUnits(o.AssetId, escrowAddr, o.Owner, o.Remaining)
}

// gateOK() reports whether addr passes the gate; only a genuine gate rejection yields (false, nil)
func gateOK(s stateIO, assetId uint64, addr []byte) (bool, *PluginError) {
	err := RequireAllowed(s, assetId, addr)
	if err == nil {
		return true, nil
	}
	if err.Code == ErrNotAllowed().Code {
		return false, nil
	}
	return false, err
}

// readAsset() loads an asset record
func readAsset(s stateIO, id uint64) (*Asset, *PluginError) {
	vals, err := s.Read(KeyForAsset(id))
	if err != nil {
		return nil, err
	}
	if len(vals[0]) == 0 {
		return nil, ErrAssetNotFound()
	}
	a := new(Asset)
	if err = Unmarshal(vals[0], a); err != nil {
		return nil, err
	}
	return a, nil
}

// ---- stateless validation + authorization (CheckTx) ----

func validHolder(addr []byte) *PluginError {
	if len(addr) != 20 {
		return ErrInvalidAddress()
	}
	if bytes.Equal(addr, escrowAddr) {
		return ErrReservedAddress()
	}
	return nil
}

// ValidateIssueUnits() performs the stateless validation of an IssueUnits message
func ValidateIssueUnits(m *MessageIssueUnits) *PluginError {
	if m.AssetId == 0 {
		return ErrAssetNotFound()
	}
	if err := validHolder(m.To); err != nil {
		return err
	}
	if m.Amount == 0 {
		return ErrInvalidAmount()
	}
	return nil
}

// ValidateTransferUnits() performs the stateless validation of a TransferUnits message
func ValidateTransferUnits(m *MessageTransferUnits) *PluginError {
	if m.AssetId == 0 {
		return ErrAssetNotFound()
	}
	if err := validHolder(m.FromAddress); err != nil {
		return err
	}
	if err := validHolder(m.ToAddress); err != nil {
		return err
	}
	if bytes.Equal(m.FromAddress, m.ToAddress) {
		return ErrSelfTransfer()
	}
	if m.Amount == 0 {
		return ErrInvalidAmount()
	}
	return nil
}

// ValidatePlaceOrder() performs the stateless validation of a PlaceOrder message
func ValidatePlaceOrder(m *MessagePlaceOrder) *PluginError {
	if m.AssetId == 0 {
		return ErrAssetNotFound()
	}
	if err := validHolder(m.Owner); err != nil {
		return err
	}
	if m.Side != Side_SIDE_BUY && m.Side != Side_SIDE_SELL {
		return ErrInvalidSide()
	}
	if m.Price == 0 || m.Amount == 0 {
		return ErrInvalidAmount()
	}
	if _, ok := orderCost(m.Price, m.Amount); !ok {
		return ErrInvalidAmount()
	}
	return nil
}

// ValidateCancelOrder() performs the stateless validation of a CancelOrder message
func ValidateCancelOrder(m *MessageCancelOrder) *PluginError {
	if err := validHolder(m.Owner); err != nil {
		return err
	}
	if m.OrderId == 0 {
		return ErrOrderNotFound()
	}
	return nil
}

// CheckIssueUnits() validates the message and names the asset's issuer as the only authorized signer
func (c *Contract) CheckIssueUnits(m *MessageIssueUnits) *PluginCheckResponse {
	if err := ValidateIssueUnits(m); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	asset, err := readAsset(c.io(), m.AssetId)
	if err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{asset.Issuer}, Recipient: m.To}
}

// CheckTransferUnits() validates the message and names the sender as the only authorized signer
func (c *Contract) CheckTransferUnits(m *MessageTransferUnits) *PluginCheckResponse {
	if err := ValidateTransferUnits(m); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{m.FromAddress}, Recipient: m.ToAddress}
}

// CheckPlaceOrder() validates the message and names the owner as the only authorized signer
func (c *Contract) CheckPlaceOrder(m *MessagePlaceOrder) *PluginCheckResponse {
	if err := ValidatePlaceOrder(m); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{m.Owner}}
}

// CheckCancelOrder() validates the message and names the owner as the only authorized signer
func (c *Contract) CheckCancelOrder(m *MessageCancelOrder) *PluginCheckResponse {
	if err := ValidateCancelOrder(m); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{m.Owner}}
}

// ---- holdings ----

// DeliverIssueUnits() mints units of an asset to a gated holder; the issuer pays the fee
func (c *Contract) DeliverIssueUnits(m *MessageIssueUnits, fee uint64, memo string) *PluginDeliverResponse {
	if err := ValidateIssueUnits(m); err != nil {
		return fail(err)
	}
	s := c.io()
	asset, err := readAsset(s, m.AssetId)
	if err != nil {
		return fail(err)
	}
	if err = RequireAllowed(s, m.AssetId, m.To); err != nil {
		return fail(err)
	}
	l := newLedger(s)
	if err = l.payFee(c, asset.Issuer, fee, memo); err != nil {
		return fail(err)
	}
	bz, err := l.get(KeyForUnitSupply(m.AssetId))
	if err != nil {
		return fail(err)
	}
	us := new(UnitSupply)
	if err = Unmarshal(bz, us); err != nil {
		return fail(err)
	}
	if us.Issued > math.MaxUint64-m.Amount {
		return fail(ErrInvalidAmount())
	}
	us.Issued += m.Amount
	if err = putMsg(l.b, KeyForUnitSupply(m.AssetId), us); err != nil {
		return fail(err)
	}
	bal, err := l.units(m.AssetId, m.To)
	if err != nil {
		return fail(err)
	}
	// a holder's balance can never exceed the issued total, so this cannot overflow
	if err = l.setUnits(m.AssetId, m.To, bal+m.Amount); err != nil {
		return fail(err)
	}
	ev, err := newEvent("units_issued", &EventUnitsIssued{AssetId: m.AssetId, To: m.To, Amount: m.Amount, Issued: us.Issued}, m.To)
	if err != nil {
		return fail(err)
	}
	if err = l.b.flush(s); err != nil {
		return fail(err)
	}
	return &PluginDeliverResponse{Events: []*Event{ev}}
}

// DeliverTransferUnits() moves units between two gated holders; the sender pays the fee
func (c *Contract) DeliverTransferUnits(m *MessageTransferUnits, fee uint64, memo string) *PluginDeliverResponse {
	if err := ValidateTransferUnits(m); err != nil {
		return fail(err)
	}
	s := c.io()
	if err := RequireAllowed(s, m.AssetId, m.FromAddress); err != nil {
		return fail(err)
	}
	if err := RequireAllowed(s, m.AssetId, m.ToAddress); err != nil {
		return fail(err)
	}
	l := newLedger(s)
	if err := l.payFee(c, m.FromAddress, fee, memo); err != nil {
		return fail(err)
	}
	if err := l.moveUnits(m.AssetId, m.FromAddress, m.ToAddress, m.Amount); err != nil {
		return fail(err)
	}
	ev, err := newEvent("units_transferred", &EventUnitsTransferred{
		AssetId: m.AssetId, FromAddress: m.FromAddress, ToAddress: m.ToAddress, Amount: m.Amount}, m.ToAddress)
	if err != nil {
		return fail(err)
	}
	if err = l.b.flush(s); err != nil {
		return fail(err)
	}
	return &PluginDeliverResponse{Events: []*Event{ev}}
}

// ---- order book ----

// tradeAcc sums the fills of one order so the oracle records them once
type tradeAcc struct {
	units, notional, last uint64
	overflow              bool
}

func (a *tradeAcc) add(price, units, value uint64) {
	a.last = price
	if a.units > math.MaxUint64-units || a.notional > math.MaxUint64-value {
		a.overflow = true
		return
	}
	a.units += units
	a.notional += value
}

// crosses() reports whether the taker's limit price accepts the maker's price
func crosses(taker, maker *Order) bool {
	if taker.Side == Side_SIDE_BUY {
		return maker.Price <= taker.Price
	}
	return maker.Price >= taker.Price
}

// matchOrder() fills the taker against the opposite side of the book. It returns the trade events and
// whether the unfilled remainder may rest (false = the match cap was hit and the book may still cross).
func (c *Contract) matchOrder(l *ledger, t *Order, acc *tradeAcc) ([]*Event, bool, *PluginError) {
	opp := Side_SIDE_SELL
	if t.Side == Side_SIDE_SELL {
		opp = Side_SIDE_BUY
	}
	entries, err := l.s.Range(bookSidePrefix(t.AssetId, opp), maxMatchesPerOrder)
	if err != nil {
		return nil, false, err
	}
	canRest := len(entries) < maxMatchesPerOrder
	var events []*Event
	for _, e := range entries {
		if t.Remaining == 0 {
			break
		}
		if len(e.Value) != 8 {
			return nil, false, ErrCorruptState()
		}
		bz, err := l.get(KeyForOrder(binary.BigEndian.Uint64(e.Value)))
		if err != nil {
			return nil, false, err
		}
		if len(bz) == 0 {
			return nil, false, ErrCorruptState()
		}
		maker := new(Order)
		if err = Unmarshal(bz, maker); err != nil {
			return nil, false, err
		}
		if !crosses(t, maker) {
			canRest = true
			break
		}
		if bytes.Equal(maker.Owner, t.Owner) {
			return nil, false, ErrSelfTrade()
		}
		// a maker that lost gate access is cancelled and refunded rather than traded with
		okAsset, err := gateOK(l.s, maker.AssetId, maker.Owner)
		if err != nil {
			return nil, false, err
		}
		okCUSD, err := gateOK(l.s, CUSDGateID, maker.Owner)
		if err != nil {
			return nil, false, err
		}
		if !okAsset || !okCUSD {
			if err = l.refund(maker); err != nil {
				return nil, false, err
			}
			l.removeOrder(maker)
			ev, err := newEvent("order_cancelled", &EventOrderCancelled{OrderId: maker.Id, AssetId: maker.AssetId,
				Owner: maker.Owner, Remaining: maker.Remaining, Reason: "gate_revoked"}, maker.Owner)
			if err != nil {
				return nil, false, err
			}
			events = append(events, ev)
			continue
		}
		fill := t.Remaining
		if maker.Remaining < fill {
			fill = maker.Remaining
		}
		buyer, seller, buyId, sellId := t.Owner, maker.Owner, t.Id, maker.Id
		if t.Side == Side_SIDE_SELL {
			buyer, seller, buyId, sellId = maker.Owner, t.Owner, maker.Id, t.Id
		}
		value, ok := orderCost(maker.Price, fill)
		if !ok {
			return nil, false, ErrCorruptState()
		}
		if err = l.moveUnits(t.AssetId, escrowAddr, buyer, fill); err != nil {
			return nil, false, err
		}
		if err = l.moveCUSD(escrowAddr, seller, value); err != nil {
			return nil, false, err
		}
		// a taker buyer escrowed at its own limit; hand back the difference to the (better) maker price
		if t.Side == Side_SIDE_BUY && t.Price > maker.Price {
			improvement, ok := orderCost(t.Price-maker.Price, fill)
			if !ok {
				return nil, false, ErrCorruptState()
			}
			if err = l.moveCUSD(escrowAddr, t.Owner, improvement); err != nil {
				return nil, false, err
			}
		}
		acc.add(maker.Price, fill, value)
		maker.Remaining -= fill
		t.Remaining -= fill
		if maker.Remaining == 0 {
			l.removeOrder(maker)
		} else if err = putMsg(l.b, KeyForOrder(maker.Id), maker); err != nil {
			return nil, false, err
		}
		ev, err := newEvent("trade", &EventTrade{AssetId: t.AssetId, BuyOrderId: buyId, SellOrderId: sellId,
			TakerOrderId: t.Id, Buyer: buyer, Seller: seller, Price: maker.Price, Amount: fill}, buyer)
		if err != nil {
			return nil, false, err
		}
		events = append(events, ev)
	}
	return events, canRest, nil
}

// DeliverPlaceOrder() escrows the order's funds, matches it, then rests or refunds the remainder
func (c *Contract) DeliverPlaceOrder(m *MessagePlaceOrder, fee uint64, memo string, height uint64) *PluginDeliverResponse {
	if err := ValidatePlaceOrder(m); err != nil {
		return fail(err)
	}
	s := c.io()
	if err := RequireAllowed(s, m.AssetId, m.Owner); err != nil {
		return fail(err)
	}
	if err := RequireAllowed(s, CUSDGateID, m.Owner); err != nil {
		return fail(err)
	}
	l := newLedger(s)
	if err := l.payFee(c, m.Owner, fee, memo); err != nil {
		return fail(err)
	}
	id, err := l.nextOrderID()
	if err != nil {
		return fail(err)
	}
	t := &Order{Id: id, AssetId: m.AssetId, Owner: m.Owner, Side: m.Side, Price: m.Price, Remaining: m.Amount}
	if m.Side == Side_SIDE_BUY {
		cost, _ := orderCost(m.Price, m.Amount) // validated above
		err = l.moveCUSD(m.Owner, escrowAddr, cost)
	} else {
		err = l.moveUnits(m.AssetId, m.Owner, escrowAddr, m.Amount)
	}
	if err != nil {
		return fail(err)
	}
	acc := new(tradeAcc)
	trades, canRest, err := c.matchOrder(l, t, acc)
	if err != nil {
		return fail(err)
	}
	if acc.units > 0 && !acc.overflow {
		if err = recordTrades(l, m.AssetId, acc, height); err != nil {
			return fail(err)
		}
	}
	filled := m.Amount - t.Remaining
	resting := false
	var tail []*Event
	if t.Remaining > 0 {
		if canRest {
			if err = l.putOrder(t); err != nil {
				return fail(err)
			}
			resting = true
		} else {
			if err = l.refund(t); err != nil {
				return fail(err)
			}
			ev, err := newEvent("order_cancelled", &EventOrderCancelled{OrderId: t.Id, AssetId: t.AssetId,
				Owner: t.Owner, Remaining: t.Remaining, Reason: "match_cap"}, t.Owner)
			if err != nil {
				return fail(err)
			}
			tail = append(tail, ev)
		}
	}
	placed, err := newEvent("order_placed", &EventOrderPlaced{OrderId: id, AssetId: m.AssetId, Owner: m.Owner,
		Side: m.Side, Price: m.Price, Amount: m.Amount, Filled: filled, Resting: resting}, m.Owner)
	if err != nil {
		return fail(err)
	}
	if err = l.b.flush(s); err != nil {
		return fail(err)
	}
	events := append([]*Event{placed}, trades...)
	return &PluginDeliverResponse{Events: append(events, tail...)}
}

// DeliverCancelOrder() cancels the owner's resting order and refunds its escrow. Never gated.
func (c *Contract) DeliverCancelOrder(m *MessageCancelOrder, fee uint64, memo string) *PluginDeliverResponse {
	if err := ValidateCancelOrder(m); err != nil {
		return fail(err)
	}
	s := c.io()
	l := newLedger(s)
	bz, err := l.get(KeyForOrder(m.OrderId))
	if err != nil {
		return fail(err)
	}
	if len(bz) == 0 {
		return fail(ErrOrderNotFound())
	}
	o := new(Order)
	if err = Unmarshal(bz, o); err != nil {
		return fail(err)
	}
	if !bytes.Equal(o.Owner, m.Owner) {
		return fail(ErrNotOrderOwner())
	}
	if err = l.payFee(c, m.Owner, fee, memo); err != nil {
		return fail(err)
	}
	if err = l.refund(o); err != nil {
		return fail(err)
	}
	l.removeOrder(o)
	ev, err := newEvent("order_cancelled", &EventOrderCancelled{OrderId: o.Id, AssetId: o.AssetId,
		Owner: o.Owner, Remaining: o.Remaining, Reason: "cancelled"}, o.Owner)
	if err != nil {
		return fail(err)
	}
	if err = l.b.flush(s); err != nil {
		return fail(err)
	}
	return &PluginDeliverResponse{Events: []*Event{ev}}
}
