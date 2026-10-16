package contract

import (
	"bytes"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"math/big"
	"net/http"
	"strconv"
	"strings"
	"sync/atomic"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"
)

/* The plugin's read-only query API. Every route is a GET under /v1/query and is backed by Canopy's
   detached QueryState (latest committed state), so nothing here can change state.

   JSON conventions, the same for every route:
   - uint64 values are decimal STRINGS (JSON numbers lose precision above 2^53 in browsers);
     uint32 values (bps, tier, counts of reporters) are numbers
   - addresses and other bytes are lowercase hex without a 0x prefix (a 0x prefix is accepted in requests)
   - enums are their names, e.g. "ASSET_CLASS_BOND"
   - a record that does not exist is null; a missing asset, order or admin is a 404
   - errors are {"error": "...", "code": N} with an HTTP status of 400 (bad parameter), 404 (not found)
     or 502 (the node failed the state read)

   Block height: Canopy's query API does not return one, so the plugin remembers the latest block it was
   asked to begin (see noteHeight). Until the first block after startup, height is "0" and heightKnown is
   false: values that depend on the current height (price freshness, asset oracle price, liquidatable)
   are then null instead of guessed. */

// latestHeight is the most recent block height the plugin was told about
var latestHeight atomic.Uint64

// noteHeight() records a block height; it only ever moves forward
func noteHeight(h uint64) {
	for {
		cur := latestHeight.Load()
		if h <= cur || latestHeight.CompareAndSwap(cur, h) {
			return
		}
	}
}

// LatestHeight() returns the most recent block height seen, or 0 before the first block
func LatestHeight() uint64 { return latestHeight.Load() }

const (
	defaultQueryLimit = 50
	maxQueryLimit     = 200
	maxBookDepth      = 100
	readChunk         = 100
)

// ErrQueryReadOnly is returned if anything tries to write through the query state
func ErrQueryReadOnly() *PluginError {
	return NewError(55, DefaultModule, "the query state is read-only")
}

// chainReader implements stateIO (read side only) over Canopy's detached QueryState
type chainReader struct{ p *Plugin }

// Read() implements stateIO
func (r *chainReader) Read(keys ...[]byte) ([][]byte, *PluginError) {
	out := make([][]byte, len(keys))
	for start := 0; start < len(keys); start += readChunk {
		end := min(start+readChunk, len(keys))
		reads := make([]*PluginKeyRead, 0, end-start)
		for i := start; i < end; i++ {
			// query ids only need to be unique within one request
			reads = append(reads, &PluginKeyRead{QueryId: uint64(i-start) + 1, Key: keys[i]})
		}
		resp, err := r.p.QueryState(0, &PluginStateReadRequest{Keys: reads})
		if err != nil {
			return nil, err
		}
		if resp == nil {
			continue
		}
		if resp.Error != nil {
			return nil, resp.Error
		}
		for _, res := range resp.Results {
			if res.QueryId == 0 || res.QueryId > uint64(end-start) || len(res.Entries) == 0 {
				continue
			}
			out[start+int(res.QueryId)-1] = res.Entries[0].Value
		}
	}
	return out, nil
}

// Range() implements stateIO
func (r *chainReader) Range(prefix []byte, limit uint64) ([]*PluginStateEntry, *PluginError) {
	resp, err := r.p.QueryState(0, &PluginStateReadRequest{Ranges: []*PluginRangeRead{{QueryId: 1, Prefix: prefix, Limit: limit}}})
	if err != nil {
		return nil, err
	}
	if resp == nil {
		return nil, nil
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	for _, res := range resp.Results {
		if res.QueryId == 1 {
			return res.Entries, nil
		}
	}
	return nil, nil
}

// Write() implements stateIO; queries never write
func (r *chainReader) Write([]*PluginSetOp, []*PluginDeleteOp) *PluginError {
	return ErrQueryReadOnly()
}

// ---- JSON conversion ----

func u64s(u uint64) string { return strconv.FormatUint(u, 10) }

func hexb(b []byte) string { return hex.EncodeToString(b) }

// pj() converts a protobuf message to its JSON form (see the conventions above); nil for a nil message
func pj(m proto.Message) any {
	if m == nil || !m.ProtoReflect().IsValid() {
		return nil
	}
	return msgJSON(m.ProtoReflect())
}

func msgJSON(m protoreflect.Message) map[string]any {
	out := map[string]any{}
	fields := m.Descriptor().Fields()
	for i := 0; i < fields.Len(); i++ {
		fd := fields.Get(i)
		v := m.Get(fd)
		if fd.IsList() {
			l := v.List()
			items := make([]any, l.Len())
			for j := range items {
				items[j] = scalarJSON(fd, l.Get(j))
			}
			out[fd.JSONName()] = items
			continue
		}
		out[fd.JSONName()] = scalarJSON(fd, v)
	}
	return out
}

func scalarJSON(fd protoreflect.FieldDescriptor, v protoreflect.Value) any {
	switch fd.Kind() {
	case protoreflect.Uint64Kind, protoreflect.Fixed64Kind:
		return u64s(v.Uint())
	case protoreflect.Int64Kind, protoreflect.Sint64Kind, protoreflect.Sfixed64Kind:
		return strconv.FormatInt(v.Int(), 10)
	case protoreflect.Uint32Kind, protoreflect.Fixed32Kind:
		return v.Uint()
	case protoreflect.Int32Kind, protoreflect.Sint32Kind, protoreflect.Sfixed32Kind:
		return v.Int()
	case protoreflect.BoolKind:
		return v.Bool()
	case protoreflect.StringKind:
		return v.String()
	case protoreflect.BytesKind:
		return hexb(v.Bytes())
	case protoreflect.EnumKind:
		if ev := fd.Enum().Values().ByNumber(v.Enum()); ev != nil {
			return string(ev.Name())
		}
		return int32(v.Enum())
	case protoreflect.MessageKind, protoreflect.GroupKind:
		if !v.Message().IsValid() {
			return nil
		}
		return msgJSON(v.Message())
	}
	return nil
}

// ---- request helpers ----

// qerr is a failed query: the HTTP status, the plugin error code (0 when not applicable) and a message
type qerr struct {
	status int
	code   uint64
	msg    string
}

func badParam(msg string) *qerr { return &qerr{status: http.StatusBadRequest, msg: msg} }

func notFound(msg string) *qerr { return &qerr{status: http.StatusNotFound, msg: msg} }

// fromPlugin() maps a plugin error: "does not exist" errors are 404s, everything else a failed state read
func fromPlugin(e *PluginError) *qerr {
	if e == nil {
		return nil
	}
	status := http.StatusBadGateway
	switch e.Code {
	case ErrAssetNotFound().Code, ErrAdminNotSet().Code, ErrOrderNotFound().Code:
		status = http.StatusNotFound
	case ErrInvalidAddress().Code, ErrNotYieldAsset().Code, ErrNotTierOne().Code:
		status = http.StatusBadRequest
	}
	return &qerr{status: status, code: e.Code, msg: e.Msg}
}

func qUint(r *http.Request, name string) (uint64, *qerr) {
	s := r.URL.Query().Get(name)
	if s == "" {
		return 0, badParam("missing parameter " + name)
	}
	v, err := strconv.ParseUint(s, 10, 64)
	if err != nil {
		return 0, badParam("parameter " + name + " must be an unsigned integer")
	}
	return v, nil
}

func qOptUint(r *http.Request, name string, def uint64) (uint64, *qerr) {
	if r.URL.Query().Get(name) == "" {
		return def, nil
	}
	return qUint(r, name)
}

func qAddr(r *http.Request, name string) ([]byte, *qerr) {
	s := strings.TrimPrefix(strings.TrimPrefix(r.URL.Query().Get(name), "0x"), "0X")
	if s == "" {
		return nil, badParam("missing parameter " + name)
	}
	b, err := hex.DecodeString(s)
	if err != nil || len(b) != 20 {
		return nil, badParam("parameter " + name + " must be a 20 byte hex address")
	}
	return b, nil
}

func qLimit(r *http.Request, def, max uint64) (uint64, *qerr) {
	l, e := qOptUint(r, "limit", def)
	if e != nil {
		return 0, e
	}
	if l == 0 || l > max {
		return 0, badParam("parameter limit must be between 1 and " + u64s(max))
	}
	return l, nil
}

// ---- the query handlers ----

// querier answers queries from any stateIO; in production that is a chainReader
type querier struct {
	s      stateIO
	height func() uint64
	build  string
}

// get() reads and decodes one record; a missing record leaves m empty and returns false
func (q *querier) get(key []byte, m proto.Message) (bool, *qerr) {
	vals, err := q.s.Read(key)
	if err != nil {
		return false, fromPlugin(err)
	}
	if len(vals[0]) == 0 {
		return false, nil
	}
	return true, fromPlugin(Unmarshal(vals[0], m))
}

// getOr() is get() returning the record, or nil when it does not exist
func (q *querier) getOr(key []byte, m proto.Message) (any, *qerr) {
	ok, e := q.get(key, m)
	if e != nil || !ok {
		return nil, e
	}
	return pj(m), nil
}

func (q *querier) asset(id uint64) (*Asset, *qerr) {
	a, err := readAsset(q.s, id)
	return a, fromPlugin(err)
}

func (q *querier) assetCount() (uint64, *qerr) {
	rm := new(RegistryMeta)
	_, e := q.get(KeyForRegistryMeta(), rm)
	return rm.AssetCount, e
}

// units() returns an address's balance of an asset
func (q *querier) units(assetId uint64, addr []byte) (uint64, *qerr) {
	h := new(Holding)
	_, e := q.get(KeyForHolding(assetId, addr), h)
	return h.Amount, e
}

// params() returns the cUSD params, or nil when the admin has not set them
func (q *querier) params() (*CUSDParams, *qerr) {
	p := new(CUSDParams)
	ok, e := q.get(KeyForCUSDParams(), p)
	if e != nil || !ok {
		return nil, e
	}
	return p, nil
}

// priceView() returns the stored CNPY price record and its JSON form, with age and freshness when they can
// be known; both are nil when no price was ever posted
func (q *querier) priceView(p *CUSDParams) (*PriceRecord, map[string]any, *qerr) {
	rec := new(PriceRecord)
	ok, e := q.get(KeyForPrice(), rec)
	if e != nil || !ok {
		return nil, nil, e
	}
	out := pj(rec).(map[string]any)
	out["age"], out["fresh"] = nil, nil
	if h := q.height(); h > 0 && p != nil && rec.Price > 0 {
		var age uint64
		if h > rec.Height {
			age = h - rec.Height
		}
		out["age"], out["fresh"] = u64s(age), age <= p.MaxPriceAge
	}
	return rec, out, nil
}

// status: chain-level facts
func (q *querier) status(_ *http.Request) (any, *qerr) {
	vals, err := q.s.Read(KeyForAdmin(), KeyForRegistryMeta(), KeyForOrderMeta())
	if err != nil {
		return nil, fromPlugin(err)
	}
	admin, rm, om := new(AdminConfig), new(RegistryMeta), new(OrderMeta)
	for i, m := range []proto.Message{admin, rm, om} {
		if e := fromPlugin(Unmarshal(vals[i], m)); e != nil {
			return nil, e
		}
	}
	var adminOut any
	if len(admin.Admin) > 0 {
		adminOut = hexb(admin.Admin)
	}
	h := q.height()
	return map[string]any{
		"build": q.build, "height": u64s(h), "heightKnown": h > 0, "admin": adminOut,
		"assetCount": u64s(rm.AssetCount), "orderCount": u64s(om.OrderCount),
	}, nil
}

// assets: a page of the asset registry, in id order
func (q *querier) assets(r *http.Request) (any, *qerr) {
	count, e := q.assetCount()
	if e != nil {
		return nil, e
	}
	from, e := qOptUint(r, "from", 1)
	if e != nil {
		return nil, e
	}
	limit, e := qLimit(r, defaultQueryLimit, maxQueryLimit)
	if e != nil {
		return nil, e
	}
	if from == 0 {
		from = 1
	}
	var keys [][]byte
	var ids []uint64
	for id := from; id <= count && uint64(len(ids)) < limit; id++ {
		ids = append(ids, id)
		keys = append(keys, KeyForAsset(id), KeyForUnitSupply(id))
	}
	vals, err := q.s.Read(keys...)
	if err != nil {
		return nil, fromPlugin(err)
	}
	items := []any{}
	for i := range ids {
		a, us := new(Asset), new(UnitSupply)
		if e := fromPlugin(Unmarshal(vals[2*i], a)); e != nil {
			return nil, e
		}
		if e := fromPlugin(Unmarshal(vals[2*i+1], us)); e != nil {
			return nil, e
		}
		if len(vals[2*i]) == 0 {
			continue
		}
		items = append(items, map[string]any{"asset": pj(a), "issued": u64s(us.Issued)})
	}
	next := any(nil)
	if n := from + uint64(len(ids)); n <= count {
		next = u64s(n)
	}
	return map[string]any{"assetCount": u64s(count), "assets": items, "next": next}, nil
}

// resolveAsset() finds an asset by ?id= or ?symbol=
func (q *querier) resolveAsset(r *http.Request) (*Asset, *qerr) {
	if sym := r.URL.Query().Get("symbol"); sym != "" {
		vals, err := q.s.Read(KeyForSymbol(strings.ToUpper(sym)))
		if err != nil {
			return nil, fromPlugin(err)
		}
		if len(vals[0]) != 8 {
			return nil, notFound("no asset has symbol " + sym)
		}
		return q.asset(binary.BigEndian.Uint64(vals[0]))
	}
	id, e := qUint(r, "id")
	if e != nil {
		return nil, badParam("give either id or symbol")
	}
	return q.asset(id)
}

// asset: one asset with its supply, NAV, oracle price and (for bonds) yield pool
func (q *querier) assetDetail(r *http.Request) (any, *qerr) {
	a, e := q.resolveAsset(r)
	if e != nil {
		return nil, e
	}
	vals, err := q.s.Read(KeyForUnitSupply(a.Id), KeyForHolding(a.Id, escrowAddr), KeyForNav(a.Id), KeyForYieldPool(a.Id))
	if err != nil {
		return nil, fromPlugin(err)
	}
	us, esc, nav, pool := new(UnitSupply), new(Holding), new(NavRecord), new(YieldPool)
	for i, m := range []proto.Message{us, esc, nav, pool} {
		if e := fromPlugin(Unmarshal(vals[i], m)); e != nil {
			return nil, e
		}
	}
	out := map[string]any{"asset": pj(a), "issued": u64s(us.Issued), "escrowed": u64s(esc.Amount), "nav": nil, "price": nil, "yield": nil}
	if len(vals[2]) > 0 {
		out["nav"] = pj(nav)
	}
	if h := q.height(); h > 0 {
		price, perr := AssetPrice(q.s, a.Id, h)
		switch {
		case perr == nil:
			out["price"] = u64s(price)
		case perr.Code != ErrPriceNotSet().Code:
			return nil, fromPlugin(perr)
		}
	}
	if a.Class == AssetClass_ASSET_CLASS_BOND && len(vals[3]) > 0 {
		out["yield"] = yieldPoolJSON(pool)
	}
	return out, nil
}

func yieldPoolJSON(p *YieldPool) map[string]any {
	return map[string]any{
		"index":  new(big.Int).SetBytes(p.Index).String(), // cumulative yield per unit, scaled by 1e18
		"funded": u64s(p.Funded), "claimed": u64s(p.Claimed), "unclaimed": u64s(p.Funded - p.Claimed),
	}
}

// gate: whether an address passes an asset's gate (id 0 is the cUSD allowlist)
func (q *querier) gate(r *http.Request) (any, *qerr) {
	id, e := qUint(r, "asset_id")
	if e != nil {
		return nil, e
	}
	addr, e := qAddr(r, "address")
	if e != nil {
		return nil, e
	}
	policy := GatePolicy_GATE_POLICY_ALLOWLIST
	if id != CUSDGateID {
		a, e := q.asset(id)
		if e != nil {
			return nil, e
		}
		policy = a.GatePolicy
	}
	perr := RequireAllowed(q.s, id, addr)
	if perr != nil && perr.Code != ErrNotAllowed().Code {
		return nil, fromPlugin(perr)
	}
	return map[string]any{"assetId": u64s(id), "address": hexb(addr), "allowed": perr == nil, "policy": policy.String()}, nil
}

// gates: the allowlisted addresses of an asset, in address order (only allowlist assets have entries)
func (q *querier) gates(r *http.Request) (any, *qerr) {
	id, e := qUint(r, "asset_id")
	if e != nil {
		return nil, e
	}
	limit, e := qLimit(r, defaultQueryLimit, maxQueryLimit)
	if e != nil {
		return nil, e
	}
	policy := GatePolicy_GATE_POLICY_ALLOWLIST
	if id != CUSDGateID {
		a, e := q.asset(id)
		if e != nil {
			return nil, e
		}
		policy = a.GatePolicy
	}
	entries, perr := q.s.Range(JoinLenPrefix(gatePrefix, formatUint64(id)), limit)
	if perr != nil {
		return nil, fromPlugin(perr)
	}
	addrs := []any{}
	for _, en := range entries {
		if a := tailSegment(en.Key, 20); a != nil {
			addrs = append(addrs, hexb(a))
		}
	}
	return map[string]any{"assetId": u64s(id), "policy": policy.String(), "addresses": addrs, "truncated": uint64(len(entries)) == limit}, nil
}

// tailSegment() returns the last length-prefixed segment of a key when it is exactly n bytes long
func tailSegment(key []byte, n int) []byte {
	if len(key) < n+1 || int(key[len(key)-n-1]) != n {
		return nil
	}
	return key[len(key)-n:]
}

// cusd: the stablecoin's parameters, price and total supply
func (q *querier) cusd(_ *http.Request) (any, *qerr) {
	params, e := q.params()
	if e != nil {
		return nil, e
	}
	_, price, e := q.priceView(params)
	if e != nil {
		return nil, e
	}
	supply := new(CUSDSupply)
	if _, e = q.get(KeyForCUSDSupply(), supply); e != nil {
		return nil, e
	}
	out := map[string]any{"params": nil, "price": nil, "totalDebt": u64s(supply.TotalDebt), "collateralPoolId": u64s(CollateralPoolID)}
	if params != nil {
		out["params"] = pj(params)
	}
	if price != nil {
		out["price"] = price
	}
	return out, nil
}

// account: everything one address holds on the plugin's side: CNPY, cUSD, vault and gate status
func (q *querier) account(r *http.Request) (any, *qerr) {
	addr, e := qAddr(r, "address")
	if e != nil {
		return nil, e
	}
	vals, err := q.s.Read(KeyForAccount(addr), KeyForCUSD(addr), KeyForVault(addr), KeyForGate(CUSDGateID, addr))
	if err != nil {
		return nil, fromPlugin(err)
	}
	acc, cu, v := new(Account), new(CUSDAccount), new(Vault)
	for i, m := range []proto.Message{acc, cu, v} {
		if e := fromPlugin(Unmarshal(vals[i], m)); e != nil {
			return nil, e
		}
	}
	params, e := q.params()
	if e != nil {
		return nil, e
	}
	rec, price, e := q.priceView(params)
	if e != nil {
		return nil, e
	}
	vault := map[string]any{"collateral": u64s(v.Collateral), "debt": u64s(v.Debt),
		"collateralRatioBps": nil, "priceFresh": nil, "liquidatable": nil}
	if price != nil {
		vault["priceFresh"] = price["fresh"]
	}
	if rec != nil && rec.Price > 0 && v.Debt > 0 {
		ratio := collateralValue(v.Collateral, rec.Price)
		ratio.Mul(ratio, bigU(bpsDenom)).Div(ratio, bigU(v.Debt))
		if ratio.IsUint64() {
			vault["collateralRatioBps"] = u64s(ratio.Uint64())
		}
		// the contract only liquidates against a fresh price, so only a fresh price can say so
		if fresh, _ := price["fresh"].(bool); fresh && params != nil {
			vault["liquidatable"] = !atLeastRatio(v.Collateral, v.Debt, rec.Price, params.LiquidationBps)
		}
	}
	return map[string]any{
		"address": hexb(addr), "cnpy": u64s(acc.Amount), "nonce": u64s(acc.Nonce),
		"cusd": u64s(cu.Amount), "cusdAllowed": len(vals[3]) > 0, "vault": vault,
	}, nil
}

// holding: one address's balance of one asset, and whether it passes the asset's gate
func (q *querier) holding(r *http.Request) (any, *qerr) {
	id, e := qUint(r, "asset_id")
	if e != nil {
		return nil, e
	}
	addr, e := qAddr(r, "address")
	if e != nil {
		return nil, e
	}
	a, e := q.asset(id)
	if e != nil {
		return nil, e
	}
	amt, e := q.units(id, addr)
	if e != nil {
		return nil, e
	}
	perr := RequireAllowed(q.s, id, addr)
	if perr != nil && perr.Code != ErrNotAllowed().Code {
		return nil, fromPlugin(perr)
	}
	return map[string]any{"assetId": u64s(id), "symbol": a.Symbol, "address": hexb(addr), "amount": u64s(amt), "allowed": perr == nil}, nil
}

// holdings: an address's non-zero balances across a page of the asset registry
func (q *querier) holdings(r *http.Request) (any, *qerr) {
	addr, e := qAddr(r, "address")
	if e != nil {
		return nil, e
	}
	count, e := q.assetCount()
	if e != nil {
		return nil, e
	}
	from, e := qOptUint(r, "from", 1)
	if e != nil {
		return nil, e
	}
	limit, e := qLimit(r, defaultQueryLimit, maxQueryLimit)
	if e != nil {
		return nil, e
	}
	if from == 0 {
		from = 1
	}
	var ids []uint64
	var keys [][]byte
	for id := from; id <= count && uint64(len(ids)) < limit; id++ {
		ids = append(ids, id)
		keys = append(keys, KeyForHolding(id, addr), KeyForAsset(id))
	}
	vals, err := q.s.Read(keys...)
	if err != nil {
		return nil, fromPlugin(err)
	}
	items := []any{}
	for i, id := range ids {
		h, a := new(Holding), new(Asset)
		if e := fromPlugin(Unmarshal(vals[2*i], h)); e != nil {
			return nil, e
		}
		if e := fromPlugin(Unmarshal(vals[2*i+1], a)); e != nil {
			return nil, e
		}
		if h.Amount > 0 {
			items = append(items, map[string]any{"assetId": u64s(id), "symbol": a.Symbol, "amount": u64s(h.Amount)})
		}
	}
	next := any(nil)
	if n := from + uint64(len(ids)); n <= count {
		next = u64s(n)
	}
	return map[string]any{"address": hexb(addr), "holdings": items, "next": next}, nil
}

// holders: the addresses holding an asset, in address order (the order escrow shows as its own entry)
func (q *querier) holders(r *http.Request) (any, *qerr) {
	id, e := qUint(r, "asset_id")
	if e != nil {
		return nil, e
	}
	limit, e := qLimit(r, defaultQueryLimit, maxQueryLimit)
	if e != nil {
		return nil, e
	}
	if _, e = q.asset(id); e != nil {
		return nil, e
	}
	entries, perr := q.s.Range(JoinLenPrefix(holdingPrefix, formatUint64(id)), limit)
	if perr != nil {
		return nil, fromPlugin(perr)
	}
	items := []any{}
	for _, en := range entries {
		a := tailSegment(en.Key, 20)
		h := new(Holding)
		if a == nil || fromPlugin(Unmarshal(en.Value, h)) != nil {
			continue
		}
		items = append(items, map[string]any{"address": hexb(a), "amount": u64s(h.Amount), "orderEscrow": bytes.Equal(a, escrowAddr)})
	}
	return map[string]any{"assetId": u64s(id), "holders": items, "truncated": uint64(len(entries)) == limit}, nil
}

// readOrders() loads orders by id, skipping any that no longer exist
func (q *querier) readOrders(ids []uint64) ([]*Order, *qerr) {
	keys := make([][]byte, len(ids))
	for i, id := range ids {
		keys[i] = KeyForOrder(id)
	}
	vals, err := q.s.Read(keys...)
	if err != nil {
		return nil, fromPlugin(err)
	}
	var out []*Order
	for _, v := range vals {
		if len(v) == 0 {
			continue
		}
		o := new(Order)
		if e := fromPlugin(Unmarshal(v, o)); e != nil {
			return nil, e
		}
		out = append(out, o)
	}
	return out, nil
}

// order: one resting order
func (q *querier) order(r *http.Request) (any, *qerr) {
	id, e := qUint(r, "id")
	if e != nil {
		return nil, e
	}
	ords, e := q.readOrders([]uint64{id})
	if e != nil {
		return nil, e
	}
	if len(ords) == 0 {
		return nil, notFound("order " + u64s(id) + " is not resting (never placed, filled or cancelled)")
	}
	return pj(ords[0]), nil
}

// orders: an owner's resting orders, oldest first
func (q *querier) orders(r *http.Request) (any, *qerr) {
	owner, e := qAddr(r, "owner")
	if e != nil {
		return nil, e
	}
	limit, e := qLimit(r, defaultQueryLimit, maxQueryLimit)
	if e != nil {
		return nil, e
	}
	entries, perr := q.s.Range(JoinLenPrefix(ownerOrderPrefix, owner), limit)
	if perr != nil {
		return nil, fromPlugin(perr)
	}
	var ids []uint64
	for _, en := range entries {
		if t := tailSegment(en.Key, 8); t != nil {
			ids = append(ids, binary.BigEndian.Uint64(t))
		}
	}
	ords, e := q.readOrders(ids)
	if e != nil {
		return nil, e
	}
	items := make([]any, len(ords))
	for i, o := range ords {
		items[i] = pj(o)
	}
	return map[string]any{"owner": hexb(owner), "orders": items, "truncated": uint64(len(entries)) == limit}, nil
}

// side() loads the best `depth` resting orders of one side of an asset's book, best first, and their price levels
func (q *querier) side(assetId uint64, side Side, depth uint64) ([]any, []any, bool, *qerr) {
	entries, perr := q.s.Range(bookSidePrefix(assetId, side), depth)
	if perr != nil {
		return nil, nil, false, fromPlugin(perr)
	}
	var ids []uint64
	for _, en := range entries {
		if len(en.Value) == 8 {
			ids = append(ids, binary.BigEndian.Uint64(en.Value))
		}
	}
	ords, e := q.readOrders(ids)
	if e != nil {
		return nil, nil, false, e
	}
	orders, levels := []any{}, []any{}
	var curPrice, curTotal, curCount uint64
	flush := func() {
		if curCount > 0 {
			levels = append(levels, map[string]any{"price": u64s(curPrice), "remaining": u64s(curTotal), "orders": curCount})
		}
	}
	for _, o := range ords {
		orders = append(orders, pj(o))
		if curCount > 0 && o.Price != curPrice {
			flush()
			curTotal, curCount = 0, 0
		}
		curPrice, curTotal, curCount = o.Price, curTotal+o.Remaining, curCount+1
	}
	flush()
	return orders, levels, uint64(len(entries)) == depth, nil
}

// book: the best resting orders on both sides of an asset's book, with aggregated price levels
func (q *querier) book(r *http.Request) (any, *qerr) {
	id, e := qUint(r, "asset_id")
	if e != nil {
		return nil, e
	}
	depth, e := qLimit(r, 20, maxBookDepth)
	if e != nil {
		return nil, e
	}
	a, e := q.asset(id)
	if e != nil {
		return nil, e
	}
	bids, bidLevels, bidMore, e := q.side(id, Side_SIDE_BUY, depth)
	if e != nil {
		return nil, e
	}
	asks, askLevels, askMore, e := q.side(id, Side_SIDE_SELL, depth)
	if e != nil {
		return nil, e
	}
	return map[string]any{
		"assetId": u64s(id), "symbol": a.Symbol,
		"bids": bids, "bidLevels": bidLevels, "bidsTruncated": bidMore,
		"asks": asks, "askLevels": askLevels, "asksTruncated": askMore,
	}, nil
}

// oracle: the CNPY price reporters and their reports; with ?asset_id= also that asset's trade-based price
func (q *querier) oracle(r *http.Request) (any, *qerr) {
	vals, err := q.s.Read(KeyForOracleConfig(), KeyForPrice())
	if err != nil {
		return nil, fromPlugin(err)
	}
	cfg, perr := decodeOracleConfig(vals[0])
	if perr != nil {
		return nil, fromPlugin(perr)
	}
	price := new(PriceRecord)
	if e := fromPlugin(Unmarshal(vals[1], price)); e != nil {
		return nil, e
	}
	keys := make([][]byte, len(cfg.Reporters))
	for i, rep := range cfg.Reporters {
		keys[i] = KeyForReport(rep)
	}
	rv, err := q.s.Read(keys...)
	if err != nil {
		return nil, fromPlugin(err)
	}
	reports := []any{}
	for i, rep := range cfg.Reporters {
		item := map[string]any{"reporter": hexb(rep), "report": nil}
		if len(rv[i]) > 0 {
			rp := new(Report)
			if e := fromPlugin(Unmarshal(rv[i], rp)); e != nil {
				return nil, e
			}
			item["report"] = pj(rp)
		}
		reports = append(reports, item)
	}
	out := map[string]any{"managed": len(cfg.Reporters) > 0, "config": pj(cfg), "reports": reports, "cnpyPrice": nil, "asset": nil}
	if len(vals[1]) > 0 {
		out["cnpyPrice"] = pj(price)
	}
	if r.URL.Query().Get("asset_id") != "" {
		id, e := qUint(r, "asset_id")
		if e != nil {
			return nil, e
		}
		if _, e = q.asset(id); e != nil {
			return nil, e
		}
		ao := new(AssetOracle)
		if _, e = q.get(KeyForAssetOracle(id), ao); e != nil {
			return nil, e
		}
		item := map[string]any{"assetId": u64s(id), "history": pj(ao), "price": nil}
		if h := q.height(); h > 0 {
			p, perr := AssetPrice(q.s, id, h)
			switch {
			case perr == nil:
				item["price"] = u64s(p)
			case perr.Code != ErrPriceNotSet().Code:
				return nil, fromPlugin(perr)
			}
		}
		out["asset"] = item
	}
	return out, nil
}

// nav: the admin-posted NAV of a tier one asset
func (q *querier) nav(r *http.Request) (any, *qerr) {
	id, e := qUint(r, "asset_id")
	if e != nil {
		return nil, e
	}
	a, e := q.asset(id)
	if e != nil {
		return nil, e
	}
	nav, e := q.getOr(KeyForNav(id), new(NavRecord))
	if e != nil {
		return nil, e
	}
	return map[string]any{"assetId": u64s(id), "symbol": a.Symbol, "tier": a.Tier, "nav": nav}, nil
}

// yield: a bond's yield pool and, with ?address=, what that address can claim right now
func (q *querier) yield(r *http.Request) (any, *qerr) {
	id, e := qUint(r, "asset_id")
	if e != nil {
		return nil, e
	}
	a, e := q.asset(id)
	if e != nil {
		return nil, e
	}
	if a.Class != AssetClass_ASSET_CLASS_BOND {
		return nil, fromPlugin(ErrNotYieldAsset())
	}
	vals, err := q.s.Read(KeyForYieldPool(id), KeyForUnitSupply(id), KeyForHolding(id, escrowAddr), KeyForCUSD(yieldEscrowAddr))
	if err != nil {
		return nil, fromPlugin(err)
	}
	pool, us, esc, ycash := new(YieldPool), new(UnitSupply), new(Holding), new(CUSDAccount)
	for i, m := range []proto.Message{pool, us, esc, ycash} {
		if e := fromPlugin(Unmarshal(vals[i], m)); e != nil {
			return nil, e
		}
	}
	out := map[string]any{
		"assetId": u64s(id), "symbol": a.Symbol, "pool": yieldPoolJSON(pool),
		"eligibleUnits":    u64s(us.Issued - min(esc.Amount, us.Issued)), // issued units not resting in order escrow
		"yieldEscrowTotal": u64s(ycash.Amount),                           // the escrow's cUSD, shared by all bonds
		"position":         nil,
	}
	if r.URL.Query().Get("address") == "" {
		return out, nil
	}
	addr, e := qAddr(r, "address")
	if e != nil {
		return nil, e
	}
	bal, e := q.units(id, addr)
	if e != nil {
		return nil, e
	}
	acct := new(YieldAccount)
	if _, e = q.get(KeyForYieldAccount(id, addr), acct); e != nil {
		return nil, e
	}
	pending := new(big.Int)
	idx, last := new(big.Int).SetBytes(pool.Index), new(big.Int).SetBytes(acct.LastIndex)
	if !bytes.Equal(addr, escrowAddr) && idx.Cmp(last) > 0 {
		pending.Sub(idx, last).Mul(pending, bigU(bal)).Div(pending, yieldScale)
	}
	claimable := new(big.Int).Add(bigU(acct.Accrued), pending)
	out["position"] = map[string]any{
		"address": hexb(addr), "balance": u64s(bal),
		"accrued": u64s(acct.Accrued), "pending": pending.String(), "claimable": claimable.String(),
	}
	return out, nil
}

// ---- routing ----

type route struct {
	path string
	help string
	h    func(*querier, *http.Request) (any, *qerr)
}

var queryRoutes = []route{
	{"status", "build, latest block height, admin, asset and order counts", (*querier).status},
	{"assets", "page of the asset registry: from, limit", (*querier).assets},
	{"asset", "one asset with supply, NAV, price and bond yield pool: id or symbol", (*querier).assetDetail},
	{"gate", "does an address pass an asset's gate (asset_id 0 = cUSD): asset_id, address", (*querier).gate},
	{"gates", "allowlisted addresses of an asset: asset_id, limit", (*querier).gates},
	{"cusd", "cUSD params, CNPY price record and total supply", (*querier).cusd},
	{"account", "CNPY, cUSD, vault with collateral ratio, cUSD gate status: address", (*querier).account},
	{"holding", "an address's balance of one asset: asset_id, address", (*querier).holding},
	{"holdings", "an address's non-zero asset balances: address, from, limit", (*querier).holdings},
	{"holders", "addresses holding an asset: asset_id, limit", (*querier).holders},
	{"order", "one resting order: id", (*querier).order},
	{"orders", "an owner's resting orders: owner, limit", (*querier).orders},
	{"book", "best resting orders and price levels of an asset: asset_id, limit (depth)", (*querier).book},
	{"oracle", "CNPY price reporters and reports; add asset_id for that asset's trade price", (*querier).oracle},
	{"nav", "NAV of a tier one asset: asset_id", (*querier).nav},
	{"yield", "bond yield pool and, with address, its claimable yield: asset_id, address", (*querier).yield},
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	bz, err := json.Marshal(v)
	if err != nil {
		status, bz = http.StatusInternalServerError, []byte(`{"error":"encoding failed"}`)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, _ = w.Write(bz)
}

// serve() wraps a handler: read-only methods, CORS for browsers (the data is public chain state), JSON out
func (q *querier) serve(h func(*querier, *http.Request) (any, *qerr)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
		switch r.Method {
		case http.MethodOptions:
			w.WriteHeader(http.StatusNoContent)
			return
		case http.MethodGet, http.MethodHead:
		default:
			writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "queries are read-only: use GET"})
			return
		}
		res, e := h(q, r)
		if e != nil {
			writeJSON(w, e.status, map[string]any{"error": e.msg, "code": e.code})
			return
		}
		writeJSON(w, http.StatusOK, res)
	}
}

// newQueryMux() registers every query route
func newQueryMux(mux *http.ServeMux, s stateIO, height func() uint64, build string) {
	q := &querier{s: s, height: height, build: build}
	index := make([]any, len(queryRoutes))
	for i, rt := range queryRoutes {
		mux.HandleFunc("/v1/query/"+rt.path, q.serve(rt.h))
		index[i] = map[string]any{"path": "/v1/query/" + rt.path, "about": rt.help}
	}
	mux.HandleFunc("/v1/query", q.serve(func(*querier, *http.Request) (any, *qerr) {
		return map[string]any{"build": build, "routes": index}, nil
	}))
}
