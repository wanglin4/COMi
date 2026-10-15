package contract

import (
	"bytes"
	"testing"
)

func okOracleParams() *OracleParams {
	return &OracleParams{BucketBlocks: 10, WindowBuckets: 3, MinBuckets: 2, MinNotional: 50 * uCNPY}
}

func reporters(us ...byte) [][]byte {
	var out [][]byte
	for _, u := range us {
		out = append(out, addr(u))
	}
	return out
}

func (e *cusdEnv) setOracle(cfg *OracleConfig) *PluginDeliverResponse {
	return e.c.DeliverSetOracle(&MessageSetOracle{Config: cfg}, testFee, "")
}

func (e *cusdEnv) report(u byte, price, h uint64) *PluginDeliverResponse {
	return e.c.DeliverReportPrice(&MessageReportPrice{Reporter: addr(u), Price: price}, testFee, "", h)
}

func (e *cusdEnv) cnpyPrice() uint64 {
	rec := new(PriceRecord)
	if err := Unmarshal(e.st.m[string(KeyForPrice())], rec); err != nil {
		e.t.Fatal(err)
	}
	return rec.Price
}

func TestOracleConfigValidation(t *testing.T) {
	good := func() *OracleConfig {
		return &OracleConfig{Reporters: reporters(10, 11, 12), Params: okOracleParams()}
	}
	if err := ValidateOracleConfig(good()); err != nil {
		t.Fatalf("good config rejected: %v", err)
	}
	if err := ValidateOracleConfig(&OracleConfig{Params: okOracleParams()}); err != nil {
		t.Fatalf("a config without reporters must be valid (admin-managed price): %v", err)
	}
	bad := map[string]func(c *OracleConfig){
		"no params":          func(c *OracleConfig) { c.Params = nil },
		"zero bucket":        func(c *OracleConfig) { c.Params.BucketBlocks = 0 },
		"zero window":        func(c *OracleConfig) { c.Params.WindowBuckets = 0 },
		"window too large":   func(c *OracleConfig) { c.Params.WindowBuckets = maxWindowBuckets + 1 },
		"zero min buckets":   func(c *OracleConfig) { c.Params.MinBuckets = 0 },
		"min above window":   func(c *OracleConfig) { c.Params.MinBuckets = c.Params.WindowBuckets + 1 },
		"zero min notional":  func(c *OracleConfig) { c.Params.MinNotional = 0 },
		"too many reporters": func(c *OracleConfig) { c.Reporters = reporters(1, 2, 3, 4, 5, 6, 7, 8, 9, 10) },
		"duplicate reporter": func(c *OracleConfig) { c.Reporters = reporters(10, 10) },
		"short reporter":     func(c *OracleConfig) { c.Reporters = [][]byte{{1, 2, 3}} },
	}
	for name, mutate := range bad {
		c := good()
		mutate(c)
		if ValidateOracleConfig(c) == nil {
			t.Errorf("%s: should be rejected", name)
		}
	}
	if ValidateOracleConfig(nil) == nil {
		t.Error("nil config must be rejected")
	}
}

func TestReporterMedian(t *testing.T) {
	e := newCUSD(t)
	e.ok(e.setOracle(&OracleConfig{Reporters: reporters(10, 11, 12), Params: okOracleParams()}))
	// the admin can no longer post the price directly
	e.fails(e.c.DeliverPostPrice(&MessagePostPrice{Price: price2}, testFee, "", startHeight+1), ErrOracleManaged())
	e.fails(e.report(13, price2, startHeight+1), ErrNotReporter())

	h := startHeight + 1
	r := e.report(10, 2_100_000, h) // 1 of 3 fresh: below the quorum of 2
	e.ok(r)
	if count(r, "price_posted") != 0 || e.cnpyPrice() != price2 {
		t.Fatal("one report must not move the price")
	}
	r = e.report(11, 2_200_000, h) // 2 of 3: lower median of {2.10, 2.20}
	e.ok(r)
	if count(r, "price_posted") != 1 || e.cnpyPrice() != 2_100_000 {
		t.Fatalf("price should be 2.10, got %d", e.cnpyPrice())
	}
	// a wild outlier from the third reporter is ignored by the median
	e.ok(e.report(12, 50_000_000, h))
	if e.cnpyPrice() != 2_200_000 {
		t.Fatalf("median must ignore the outlier, got %d", e.cnpyPrice())
	}
}

func TestReporterMoveIsClamped(t *testing.T) {
	e := newCUSD(t)
	e.ok(e.setOracle(&OracleConfig{Reporters: reporters(10, 11, 12), Params: okOracleParams()}))
	h := startHeight + 1
	e.ok(e.report(10, 3_000_000, h))
	e.ok(e.report(11, 3_000_000, h)) // majority wants $3.00, but one update moves at most 10%
	if e.cnpyPrice() != 2_200_000 {
		t.Fatalf("first step should clamp to 2.20, got %d", e.cnpyPrice())
	}
	e.ok(e.report(12, 3_000_000, h))
	if e.cnpyPrice() != 2_420_000 {
		t.Fatalf("second step should clamp to 2.42, got %d", e.cnpyPrice())
	}
}

func TestStaleReportsDoNotCount(t *testing.T) {
	e := newCUSD(t)
	e.ok(e.setOracle(&OracleConfig{Reporters: reporters(10, 11, 12), Params: okOracleParams()}))
	e.ok(e.report(10, 2_100_000, startHeight+1))
	// max_price_age is 100: by startHeight+200 the first report is stale, so one fresh report is not a quorum
	r := e.report(11, 2_100_000, startHeight+200)
	e.ok(r)
	if count(r, "price_posted") != 0 || e.cnpyPrice() != price2 {
		t.Fatal("a stale report must not count toward the quorum")
	}
}

func TestOracleReconfiguration(t *testing.T) {
	e := newCUSD(t)
	e.ok(e.setOracle(&OracleConfig{Reporters: reporters(10, 11, 12), Params: okOracleParams()}))
	e.ok(e.report(10, 2_100_000, startHeight+1))
	if _, ok := e.st.m[string(KeyForReport(addr(10)))]; !ok {
		t.Fatal("report should be stored")
	}
	// removing a reporter deletes its report
	e.ok(e.setOracle(&OracleConfig{Reporters: reporters(11, 12), Params: okOracleParams()}))
	if _, ok := e.st.m[string(KeyForReport(addr(10)))]; ok {
		t.Fatal("a removed reporter's report must be deleted")
	}
	e.fails(e.report(10, 2_100_000, startHeight+2), ErrNotReporter())
	// clearing the reporters hands price posting back to the admin
	e.ok(e.setOracle(&OracleConfig{Params: okOracleParams()}))
	e.ok(e.c.DeliverPostPrice(&MessagePostPrice{Price: 2_050_000}, testFee, "", startHeight+3))
}

func TestAssetPriceFromTrades(t *testing.T) {
	e := newOrders(t)
	e.issue(10, 100)
	// before the oracle is configured trades record nothing
	e.ok(e.place(10, Side_SIDE_SELL, p10, 1))
	e.ok(e.place(11, Side_SIDE_BUY, p10, 1))
	if _, ok := e.st.m[string(KeyForAssetOracle(1))]; ok {
		t.Fatal("no trade history before the oracle is configured")
	}
	e.cusdEnv.ok(e.setOracle(&OracleConfig{Params: okOracleParams()}))

	e.h = 100 // bucket 10
	e.ok(e.place(10, Side_SIDE_SELL, p10, 10))
	e.ok(e.place(11, Side_SIDE_BUY, p10, 10)) // 10 units at $10 = $100
	if _, err := AssetPrice(e.c.io(), 1, 100); err == nil || err.Code != ErrPriceNotSet().Code {
		t.Fatalf("one bucket is below min_buckets, want ErrPriceNotSet, got %v", err)
	}
	e.h = 115 // bucket 11
	e.ok(e.place(10, Side_SIDE_SELL, p12, 10))
	e.ok(e.place(11, Side_SIDE_BUY, p12, 10)) // 10 units at $12 = $120
	price, err := AssetPrice(e.c.io(), 1, 115)
	if err != nil || price != 11*uCNPY { // (100 + 120) / 20 units
		t.Fatalf("want VWAP $11.00, got %d err %v", price, err)
	}
	ao := new(AssetOracle)
	if err := Unmarshal(e.st.m[string(KeyForAssetOracle(1))], ao); err != nil || ao.LastPrice != p12 || ao.LastHeight != 115 {
		t.Fatalf("last trade not recorded: %+v", ao)
	}
	// both buckets are still in the window two buckets later, then age out
	if price, err = AssetPrice(e.c.io(), 1, 125); err != nil || price != 11*uCNPY {
		t.Fatalf("window should still hold both buckets: %d %v", price, err)
	}
	if _, err = AssetPrice(e.c.io(), 1, 140); err == nil || err.Code != ErrPriceNotSet().Code {
		t.Fatalf("trades older than the window must not price the asset: %v", err)
	}
}

func TestAssetPriceNeedsEnoughValue(t *testing.T) {
	p := okOracleParams() // min notional $50, 2 buckets
	ao := &AssetOracle{Buckets: []*Bucket{
		{Index: 10, Notional: 10 * uCNPY, Units: 1},
		{Index: 11, Notional: 10 * uCNPY, Units: 1},
	}}
	if _, err := computeAssetPrice(p, ao, 115); err == nil || err.Code != ErrPriceNotSet().Code {
		t.Fatal("$20 of volume is below the $50 minimum")
	}
	ao.Buckets[1].Notional = 60 * uCNPY
	if price, err := computeAssetPrice(p, ao, 115); err != nil || price != 35*uCNPY {
		t.Fatalf("want $35 ($70 / 2 units), got %d %v", price, err)
	}
	// buckets from the future and empty buckets are ignored
	ao.Buckets = append(ao.Buckets, &Bucket{Index: 99, Notional: 1000 * uCNPY, Units: 1}, &Bucket{Index: 11})
	if price, _ := computeAssetPrice(p, ao, 115); price != 35*uCNPY {
		t.Fatalf("out-of-window buckets must be ignored, got %d", price)
	}
}

func TestClampMove(t *testing.T) {
	cases := []struct{ old, target, want uint64 }{
		{2_000_000, 2_100_000, 2_100_000}, // inside 10%
		{2_000_000, 3_000_000, 2_200_000}, // capped up
		{2_000_000, 1_000_000, 1_800_000}, // capped down
		{0, 7_000_000, 7_000_000},         // no previous price: no limit
		{1, 1_000_000, 1},                 // tiny price: the band is {1, 1}
	}
	for _, c := range cases {
		if got := clampMove(c.old, c.target, 1000); got != c.want {
			t.Errorf("clampMove(%d,%d)=%d want %d", c.old, c.target, got, c.want)
		}
	}
}

func TestOracleCheckTxAndRouting(t *testing.T) {
	e := newCUSD(t)
	cfg := &OracleConfig{Reporters: reporters(10, 11, 12), Params: okOracleParams()}
	resp := e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, &MessageSetOracle{Config: cfg})})
	if resp.Error != nil || len(resp.AuthorizedSigners) != 1 || !bytes.Equal(resp.AuthorizedSigners[0], addr(1)) {
		t.Fatalf("set_oracle must be admin-signed: %+v", resp)
	}
	if resp = e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, &MessageSetOracle{Config: &OracleConfig{}})}); resp.Error == nil {
		t.Fatal("an invalid config must fail CheckTx")
	}
	// admin posting is blocked at CheckTx once reporters exist
	e.ok(e.c.DeliverTx(&PluginDeliverRequest{Tx: anyTx(t, testFee, &MessageSetOracle{Config: cfg})}))
	if resp = e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, &MessagePostPrice{Price: price2})}); resp.Error == nil || resp.Error.Code != ErrOracleManaged().Code {
		t.Fatalf("post_price must fail CheckTx while reporters are configured: %+v", resp)
	}
	resp = e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, &MessageReportPrice{Reporter: addr(10), Price: price2})})
	if resp.Error != nil || !bytes.Equal(resp.AuthorizedSigners[0], addr(10)) {
		t.Fatalf("report_price must be signed by the reporter: %+v", resp)
	}
	if resp = e.c.CheckTx(&PluginCheckRequest{Tx: anyTx(t, testFee, &MessageReportPrice{Reporter: addr(13), Price: price2})}); resp.Error == nil {
		t.Fatal("a non-reporter must fail CheckTx")
	}
	e.ok(e.c.DeliverTx(&PluginDeliverRequest{Height: startHeight + 1, Tx: anyTx(t, testFee, &MessageReportPrice{Reporter: addr(10), Price: 2_100_000})}))
	if _, ok := e.st.m[string(KeyForReport(addr(10)))]; !ok {
		t.Fatal("report_price not routed by DeliverTx")
	}
}

func TestOracleKeysUseDeclaredPrefixes(t *testing.T) {
	declared := map[string]bool{}
	for _, p := range ContractConfig.CustomStatePrefixes {
		declared[string(p)] = true
	}
	for _, k := range [][]byte{KeyForOracleConfig(), KeyForReport(addr(1)), KeyForAssetOracle(1)} {
		n := int(k[0])
		if !declared[string(k[1:1+n])] {
			t.Fatalf("key %x does not start with a declared prefix", k)
		}
	}
}
