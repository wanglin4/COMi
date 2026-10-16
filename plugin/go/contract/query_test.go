package contract

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// roState hands the query layer the test state but fails the test if anything tries to write through it
type roState struct {
	t *testing.T
	s *memState
}

func (r roState) Read(keys ...[]byte) ([][]byte, *PluginError) { return r.s.Read(keys...) }

func (r roState) Range(prefix []byte, limit uint64) ([]*PluginStateEntry, *PluginError) {
	return r.s.Range(prefix, limit)
}

func (r roState) Write([]*PluginSetOp, []*PluginDeleteOp) *PluginError {
	r.t.Helper()
	r.t.Fatal("a query tried to write state")
	return nil
}

// qEnv is the bond environment served through the real query handlers; q.h is the "latest block height"
type qEnv struct {
	*bondEnv
	mux *http.ServeMux
	h   uint64
}

func newQ(t *testing.T) *qEnv {
	q := &qEnv{bondEnv: newBond(t), mux: http.NewServeMux()}
	newQueryMux(q.mux, roState{t, q.st}, func() uint64 { return q.h }, "test-build")
	return q
}

func (q *qEnv) do(method, path string) (*httptest.ResponseRecorder, map[string]any) {
	q.t.Helper()
	rec := httptest.NewRecorder()
	q.mux.ServeHTTP(rec, httptest.NewRequest(method, path, nil))
	var out map[string]any
	if rec.Body.Len() > 0 {
		if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
			q.t.Fatalf("%s %s: not JSON: %q", method, path, rec.Body.String())
		}
	}
	return rec, out
}

// get() expects a 200 and returns the JSON object
func (q *qEnv) get(path string) map[string]any {
	q.t.Helper()
	rec, out := q.do("GET", path)
	if rec.Code != 200 {
		q.t.Fatalf("GET %s: status %d: %s", path, rec.Code, rec.Body.String())
	}
	return out
}

// fails() expects the given error status and an error message
func (q *qEnv) fails(path string, status int) map[string]any {
	q.t.Helper()
	rec, out := q.do("GET", path)
	if rec.Code != status || out["error"] == nil {
		q.t.Fatalf("GET %s: want status %d with an error, got %d: %s", path, status, rec.Code, rec.Body.String())
	}
	return out
}

// at() walks nested JSON objects and array indexes (ints) to a value
func at(v any, path ...any) any {
	for _, p := range path {
		switch k := p.(type) {
		case string:
			m, ok := v.(map[string]any)
			if !ok {
				return nil
			}
			v = m[k]
		case int:
			a, ok := v.([]any)
			if !ok || k >= len(a) {
				return nil
			}
			v = a[k]
		}
	}
	return v
}

func (q *qEnv) want(v any, want any, path ...any) {
	q.t.Helper()
	if got := at(v, path...); got != want {
		q.t.Fatalf("at %v: got %#v, want %#v", path, got, want)
	}
}

func (q *qEnv) length(v any, want int, path ...any) {
	q.t.Helper()
	a, ok := at(v, path...).([]any)
	if !ok || len(a) != want {
		q.t.Fatalf("at %v: want a list of %d, got %#v", path, want, at(v, path...))
	}
}

func hx(u byte) string { return hexb(addr(u)) }

func TestQueryStatusAndIndex(t *testing.T) {
	q := newQ(t)
	out := q.get("/v1/query/status")
	q.want(out, "test-build", "build")
	q.want(out, "1", "assetCount")
	q.want(out, "0", "orderCount")
	q.want(out, hx(1), "admin")
	q.want(out, false, "heightKnown")
	q.want(out, "0", "height")
	q.h = 120
	out = q.get("/v1/query/status")
	q.want(out, true, "heightKnown")
	q.want(out, "120", "height")

	idx := q.get("/v1/query")
	q.length(idx, len(queryRoutes), "routes")
	for i := range queryRoutes {
		if p, _ := at(idx, "routes", i, "path").(string); !strings.HasPrefix(p, "/v1/query/") {
			t.Fatalf("bad route entry %d: %v", i, at(idx, "routes", i))
		}
	}
}

func TestQueryAssets(t *testing.T) {
	q := newQ(t)
	q.cusdEnv.ok(q.c.DeliverRegisterAsset(&MessageRegisterAsset{Symbol: "ZED", Class: AssetClass_ASSET_CLASS_RWA,
		Issuer: addr(9), GatePolicy: GatePolicy_GATE_POLICY_OPEN, Tier: 2}, testFee, ""))
	q.issue(10, 7)

	out := q.get("/v1/query/assets")
	q.want(out, "2", "assetCount")
	q.length(out, 2, "assets")
	q.want(out, "BOND1", "assets", 0, "asset", "symbol")
	q.want(out, "7", "assets", 0, "issued")
	q.want(out, "ZED", "assets", 1, "asset", "symbol")
	q.want(out, nil, "next")
	// paging
	out = q.get("/v1/query/assets?limit=1")
	q.length(out, 1, "assets")
	q.want(out, "2", "next")
	out = q.get("/v1/query/assets?from=2&limit=5")
	q.want(out, "ZED", "assets", 0, "asset", "symbol")

	// one asset, by id and by symbol (any case)
	for _, path := range []string{"/v1/query/asset?id=1", "/v1/query/asset?symbol=bond1"} {
		a := q.get(path)
		q.want(a, "1", "asset", "id")
		q.want(a, "ASSET_CLASS_BOND", "asset", "class")
		q.want(a, "GATE_POLICY_ALLOWLIST", "asset", "gatePolicy")
		q.want(a, hx(9), "asset", "issuer")
		q.want(a, float64(1), "asset", "tier")
		q.want(a, "7", "issued")
		q.want(a, "0", "escrowed")
		q.want(a, nil, "nav")
		q.want(a, nil, "price")
		q.want(a, nil, "yield")
	}
	q.fails("/v1/query/asset?id=9", 404)
	q.fails("/v1/query/asset?symbol=NOPE", 404)
	q.fails("/v1/query/asset", 400)
	q.fails("/v1/query/asset?id=abc", 400)
	q.fails("/v1/query/assets?limit=0", 400)
	q.fails("/v1/query/assets?limit=201", 400)

	// NAV and a funded round show up on the asset
	q.ok(q.c.DeliverPostNav(&MessagePostNav{AssetId: 1, Nav: 100 * uCNPY}, testFee, "", startHeight))
	q.ok(q.fund(7_000_000))
	a := q.get("/v1/query/asset?id=1")
	q.want(a, "100000000", "nav", "nav")
	q.want(a, "100", "nav", "height")
	q.want(a, "7000000", "yield", "funded")
	q.want(a, "7000000", "yield", "unclaimed")
	// a non-bond asset never shows a yield pool
	q.want(q.get("/v1/query/asset?id=2"), nil, "yield")
}

func TestQueryGates(t *testing.T) {
	q := newQ(t)
	g := q.get("/v1/query/gate?asset_id=1&address=" + hx(10))
	q.want(g, true, "allowed")
	q.want(g, "GATE_POLICY_ALLOWLIST", "policy")
	q.want(q.get("/v1/query/gate?asset_id=1&address="+hx(77)), false, "allowed")
	// gate id 0 is the cUSD allowlist
	q.want(q.get("/v1/query/gate?asset_id=0&address=0x"+hx(10)), true, "allowed")
	q.want(q.get("/v1/query/gate?asset_id=0&address="+hx(77)), false, "allowed")
	q.fails("/v1/query/gate?asset_id=9&address="+hx(10), 404)
	q.fails("/v1/query/gate?asset_id=1&address=zz", 400)
	q.fails("/v1/query/gate?asset_id=1&address="+hx(10)[:38], 400)
	q.fails("/v1/query/gate?address="+hx(10), 400)

	l := q.get("/v1/query/gates?asset_id=1")
	q.length(l, 3, "addresses")
	q.want(l, hx(10), "addresses", 0)
	q.want(l, hx(12), "addresses", 2)
	q.want(l, false, "truncated")
	l = q.get("/v1/query/gates?asset_id=1&limit=2")
	q.length(l, 2, "addresses")
	q.want(l, true, "truncated")
	// cUSD allowlist: the three users and the issuer
	q.length(q.get("/v1/query/gates?asset_id=0"), 4, "addresses")
	q.fails("/v1/query/gates?asset_id=9", 404)
}

func TestQueryCUSDAndAccount(t *testing.T) {
	q := newQ(t)
	q.h = startHeight + 5
	c := q.get("/v1/query/cusd")
	q.want(c, "1000000000", "totalDebt") // 3 users x 300 + the issuer's 100
	q.want(c, float64(15000), "params", "minCollateralBps")
	q.want(c, "1000000000", "params", "supplyCap")
	q.want(c, "2000000", "price", "price")
	q.want(c, "5", "price", "age")
	q.want(c, true, "price", "fresh")
	// stale, and unknowable before the first block
	q.h = startHeight + 1000
	q.want(q.get("/v1/query/cusd"), false, "price", "fresh")
	q.h = 0
	c = q.get("/v1/query/cusd")
	q.want(c, nil, "price", "fresh")
	q.want(c, nil, "price", "age")

	q.h = startHeight
	a := q.get("/v1/query/account?address=" + hx(10))
	q.want(a, u64s(q.cnpy(addr(10))), "cnpy")
	q.want(a, "300000000", "cusd")
	q.want(a, true, "cusdAllowed")
	q.want(a, "500000000", "vault", "collateral")
	q.want(a, "300000000", "vault", "debt")
	q.want(a, "33333", "vault", "collateralRatioBps") // $1000 of collateral against $300 of debt
	q.want(a, true, "vault", "priceFresh")
	q.want(a, false, "vault", "liquidatable")

	// a price crash makes the vault liquidatable, but only while the price is fresh
	q.st.m[string(KeyForPrice())] = mustMarshal(t, &PriceRecord{Price: 700_000, Height: startHeight})
	a = q.get("/v1/query/account?address=" + hx(10))
	q.want(a, "11666", "vault", "collateralRatioBps")
	q.want(a, true, "vault", "liquidatable")
	q.h = startHeight + 1000
	a = q.get("/v1/query/account?address=" + hx(10))
	q.want(a, false, "vault", "priceFresh")
	q.want(a, nil, "vault", "liquidatable")

	// an address the plugin has never seen
	a = q.get("/v1/query/account?address=" + hx(77))
	q.want(a, "0", "cnpy")
	q.want(a, "0", "cusd")
	q.want(a, false, "cusdAllowed")
	q.want(a, nil, "vault", "collateralRatioBps")
	q.fails("/v1/query/account", 400)
	q.fails("/v1/query/account?address=zz", 400)
}

func TestQueryHoldingsOrdersAndBook(t *testing.T) {
	q := newQ(t)
	q.issue(10, 100)
	q.issue(11, 100)
	q.ok(q.place(10, Side_SIDE_SELL, p10, 30)) // order 1
	q.ok(q.place(10, Side_SIDE_SELL, p10, 20)) // order 2
	q.ok(q.place(11, Side_SIDE_SELL, p11, 10)) // order 3
	q.ok(q.place(12, Side_SIDE_BUY, p9, 5))    // order 4
	q.ok(q.place(12, Side_SIDE_BUY, p9, 5))    // order 5

	b := q.get("/v1/query/book?asset_id=1")
	q.want(b, "BOND1", "symbol")
	q.length(b, 3, "asks")
	q.want(b, "1", "asks", 0, "id") // best price first, then the earlier order
	q.want(b, "2", "asks", 1, "id")
	q.want(b, "3", "asks", 2, "id")
	q.length(b, 2, "askLevels")
	q.want(b, u64s(p10), "askLevels", 0, "price")
	q.want(b, "50", "askLevels", 0, "remaining")
	q.want(b, float64(2), "askLevels", 0, "orders")
	q.want(b, u64s(p11), "askLevels", 1, "price")
	q.length(b, 2, "bids")
	q.length(b, 1, "bidLevels")
	q.want(b, u64s(p9), "bidLevels", 0, "price")
	q.want(b, "10", "bidLevels", 0, "remaining")
	q.want(b, false, "asksTruncated")
	b = q.get("/v1/query/book?asset_id=1&limit=1")
	q.length(b, 1, "asks")
	q.want(b, true, "asksTruncated")
	q.fails("/v1/query/book?asset_id=9", 404)
	q.fails("/v1/query/book?asset_id=1&limit=101", 400)

	o := q.get("/v1/query/orders?owner=" + hx(10))
	q.length(o, 2, "orders")
	q.want(o, "30", "orders", 0, "remaining")
	q.want(o, "SIDE_SELL", "orders", 0, "side")
	q.length(q.get("/v1/query/orders?owner="+hx(77)), 0, "orders")
	one := q.get("/v1/query/order?id=3")
	q.want(one, hx(11), "owner")
	q.want(one, u64s(p11), "price")
	q.fails("/v1/query/order?id=999", 404)
	q.ok(q.cancel(10, 1))
	q.fails("/v1/query/order?id=1", 404)

	// balances: escrowed units are not in the owner's balance but in the order escrow's
	h := q.get("/v1/query/holding?asset_id=1&address=" + hx(10))
	q.want(h, u64s(q.held(addr(10))), "amount")
	q.want(h, "BOND1", "symbol")
	q.want(h, true, "allowed")
	q.want(q.get("/v1/query/holding?asset_id=1&address="+hx(77)), false, "allowed")
	hs := q.get("/v1/query/holdings?address=" + hx(11))
	q.length(hs, 1, "holdings")
	q.want(hs, u64s(q.held(addr(11))), "holdings", 0, "amount")
	q.length(q.get("/v1/query/holdings?address="+hx(77)), 0, "holdings")

	hl := q.get("/v1/query/holders?asset_id=1")
	q.length(hl, 3, "holders") // addr(10), addr(11) and the order escrow
	var escrow any
	for i := 0; i < 3; i++ {
		if at(hl, "holders", i, "orderEscrow") == true {
			escrow = at(hl, "holders", i, "amount")
			q.want(hl, hexb(escrowAddr), "holders", i, "address")
		}
	}
	if escrow != u64s(q.held(escrowAddr)) {
		t.Fatalf("order escrow shows %v, state has %d", escrow, q.held(escrowAddr))
	}
	q.fails("/v1/query/holders?asset_id=9", 404)
}

func TestQueryOracle(t *testing.T) {
	q := newQ(t)
	o := q.get("/v1/query/oracle")
	q.want(o, false, "managed")
	q.want(o, "2000000", "cnpyPrice", "price")
	q.length(o, 0, "reports")

	q.cusdEnv.ok(q.setOracle(&OracleConfig{Reporters: reporters(10, 11), Params: okOracleParams()}))
	q.cusdEnv.ok(q.report(10, 2_100_000, startHeight+1))
	o = q.get("/v1/query/oracle")
	q.want(o, true, "managed")
	q.length(o, 2, "reports")
	q.want(o, hx(10), "reports", 0, "reporter")
	q.want(o, "2100000", "reports", 0, "report", "price")
	q.want(o, nil, "reports", 1, "report") // reporter 11 has not reported
	q.want(o, "10", "config", "params", "bucketBlocks")

	// two trades in two different buckets give the asset a trade based price
	q.issue(10, 10)
	for _, h := range []uint64{100, 110} {
		q.h = h
		q.ordEnv.h = h
		q.ok(q.place(10, Side_SIDE_SELL, p10, 5))
		q.ok(q.place(11, Side_SIDE_BUY, p10, 5))
	}
	q.h = 115
	o = q.get("/v1/query/oracle?asset_id=1")
	q.want(o, "10000000", "asset", "price")
	q.length(o, 2, "asset", "history", "buckets")
	q.want(q.get("/v1/query/asset?id=1"), "10000000", "price")
	q.h = 0 // the window cannot be evaluated without a height
	q.want(q.get("/v1/query/oracle?asset_id=1"), nil, "asset", "price")
	q.fails("/v1/query/oracle?asset_id=9", 404)
	q.fails("/v1/query/oracle?asset_id=x", 400)
}

func TestQueryNav(t *testing.T) {
	q := newQ(t)
	n := q.get("/v1/query/nav?asset_id=1")
	q.want(n, nil, "nav")
	q.want(n, float64(1), "tier")
	q.ok(q.c.DeliverPostNav(&MessagePostNav{AssetId: 1, Nav: 5 * uCNPY}, testFee, "", 150))
	n = q.get("/v1/query/nav?asset_id=1")
	q.want(n, "5000000", "nav", "nav")
	q.want(n, "150", "nav", "height")
	q.fails("/v1/query/nav?asset_id=9", 404)
	q.fails("/v1/query/nav", 400)
}

// TestQueryYieldMatchesClaims checks the query's claimable amount against what claim_yield really pays
func TestQueryYieldMatchesClaims(t *testing.T) {
	q := newQ(t)
	q.cusdEnv.ok(q.c.DeliverRegisterAsset(&MessageRegisterAsset{Symbol: "RWA1", Class: AssetClass_ASSET_CLASS_RWA,
		Issuer: addr(9), GatePolicy: GatePolicy_GATE_POLICY_ALLOWLIST, Tier: 1}, testFee, ""))
	q.fails("/v1/query/yield?asset_id=2", 400) // not a bond
	q.fails("/v1/query/yield?asset_id=9", 404)
	y := q.get("/v1/query/yield?asset_id=1")
	q.want(y, "0", "pool", "funded")
	q.want(y, nil, "position")

	q.issue(10, 100)
	q.issue(11, 300)
	q.ok(q.place(10, Side_SIDE_SELL, p10, 30)) // 30 units rest in escrow: 370 of 400 are eligible
	q.ok(q.fund(37_000_000))
	y = q.get("/v1/query/yield?asset_id=1")
	q.want(y, "37000000", "pool", "funded")
	q.want(y, "0", "pool", "claimed")
	q.want(y, "37000000", "pool", "unclaimed")
	q.want(y, "370", "eligibleUnits")
	q.want(y, "37000000", "yieldEscrowTotal")
	q.want(y, nil, "position") // no address asked for

	claimable := map[byte]string{}
	for _, u := range []byte{10, 11} {
		p := q.get("/v1/query/yield?asset_id=1&address=" + hx(u))
		claimable[u] = at(p, "position", "claimable").(string)
	}
	if claimable[10] != "7000000" || claimable[11] != "30000000" {
		t.Fatalf("claimable: %v", claimable)
	}
	q.want(q.get("/v1/query/yield?asset_id=1&address="+hx(10)), "70", "position", "balance")
	q.want(q.get("/v1/query/yield?asset_id=1&address="+hexb(escrowAddr)), "0", "position", "claimable")
	q.want(q.get("/v1/query/yield?asset_id=1&address="+hx(77)), "0", "position", "claimable")
	q.fails("/v1/query/yield?asset_id=1&address=zz", 400)

	for _, u := range []byte{10, 11} {
		before := q.cusd(addr(u))
		q.ok(q.claim(u))
		if got := u64s(q.cusd(addr(u)) - before); got != claimable[u] {
			t.Fatalf("addr(%d): the query said %s but the claim paid %s", u, claimable[u], got)
		}
		q.want(q.get("/v1/query/yield?asset_id=1&address="+hx(u)), "0", "position", "claimable")
	}
	y = q.get("/v1/query/yield?asset_id=1")
	q.want(y, "37000000", "pool", "claimed")
	q.want(y, "0", "pool", "unclaimed")
	q.want(y, "0", "yieldEscrowTotal")
}

func TestQueryIsReadOnlyAndCORS(t *testing.T) {
	q := newQ(t)
	rec, out := q.do("POST", "/v1/query/status")
	if rec.Code != 405 || out["error"] == nil {
		t.Fatalf("POST must be refused, got %d", rec.Code)
	}
	rec, _ = q.do("OPTIONS", "/v1/query/status")
	if rec.Code != 204 || rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Fatalf("OPTIONS must succeed with CORS, got %d %v", rec.Code, rec.Header())
	}
	rec, _ = q.do("GET", "/v1/query/status")
	if rec.Header().Get("Access-Control-Allow-Origin") != "*" || rec.Header().Get("Content-Type") != "application/json" {
		t.Fatalf("missing headers: %v", rec.Header())
	}
	// the production state adapter refuses writes outright
	if err := (&chainReader{}).Write(nil, nil); err == nil || err.Code != ErrQueryReadOnly().Code {
		t.Fatalf("chainReader must refuse writes, got %v", err)
	}
	// every route answers a bare request without writing (roState fails the test on any write)
	for _, rt := range queryRoutes {
		q.do("GET", "/v1/query/"+rt.path)
	}
}

func TestQueryJSONConventions(t *testing.T) {
	a := pj(&Asset{Id: 1<<53 + 1, Symbol: "X", Class: AssetClass_ASSET_CLASS_BOND, Issuer: []byte{1, 2},
		GatePolicy: GatePolicy_GATE_POLICY_ALLOWLIST, Tier: 1}).(map[string]any)
	if a["id"] != "9007199254740993" || a["issuer"] != "0102" || a["class"] != "ASSET_CLASS_BOND" || a["tier"] != uint64(1) {
		t.Fatalf("unexpected conventions: %#v", a)
	}
	cfg := pj(&OracleConfig{Reporters: [][]byte{{1}, {2}}}).(map[string]any)
	if r, _ := cfg["reporters"].([]any); len(r) != 2 || r[0] != "01" || r[1] != "02" || cfg["params"] != nil {
		t.Fatalf("unexpected list/nil handling: %#v", cfg)
	}
	if pj(nil) != nil {
		t.Fatal("nil must stay nil")
	}
	if _, err := json.Marshal(a); err != nil {
		t.Fatal(err)
	}
}

func TestTailSegmentAndHeight(t *testing.T) {
	k := KeyForGate(3, addr(5))
	if got := tailSegment(k, 20); string(got) != string(addr(5)) {
		t.Fatalf("tail of a gate key: %x", got)
	}
	if tailSegment(k, 8) != nil || tailSegment([]byte{1}, 20) != nil {
		t.Fatal("a mismatched segment must not be returned")
	}
	if got := tailSegment(KeyForOwnerOrder(addr(5), 258), 8); string(got) != string(formatUint64(258)) {
		t.Fatalf("tail of an owner order key: %x", got)
	}
	before := LatestHeight()
	noteHeight(before + 10)
	noteHeight(before + 5) // never moves backwards
	if LatestHeight() != before+10 {
		t.Fatalf("height went to %d", LatestHeight())
	}
}
