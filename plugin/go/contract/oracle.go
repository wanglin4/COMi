package contract

import (
	"bytes"
	"math"
	"math/big"
	"sort"
)

/* The in-app oracle has two independent parts.

   1. CNPY price (feeds cUSD collateral math). The admin names up to 9 reporters. Each reporter posts
      its own price; once a majority of reporters have a FRESH report (younger than max_price_age), the
      price is their median, so a minority of wrong or malicious reporters cannot move it. One update
      may move the price at most max_price_move_bps, so even a majority can only walk it gradually.
      Until reporters are configured the admin can post the price directly (bootstrap); afterwards the
      admin cannot.

   2. Asset prices (RWA, bond). Computed purely from this chain's own order book trades: a
      volume-weighted average over a sliding window of block buckets. A price is only reported once the
      window holds trades in at least min_buckets distinct buckets and at least min_notional of value,
      so a single trade (or a single block of wash trading) is not enough to set it. */

const (
	maxReporters     = 9
	maxWindowBuckets = 12
)

func decodeOracleConfig(bz []byte) (*OracleConfig, *PluginError) {
	cfg := new(OracleConfig)
	if err := Unmarshal(bz, cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}

// oracleManaged() reports whether stored oracle config names reporters (so the admin may not post)
func oracleManaged(bz []byte) bool {
	cfg, err := decodeOracleConfig(bz)
	return err == nil && len(cfg.Reporters) > 0
}

func isReporter(cfg *OracleConfig, addr []byte) bool {
	for _, r := range cfg.Reporters {
		if bytes.Equal(r, addr) {
			return true
		}
	}
	return false
}

// ValidateOracleConfig() checks the configuration against the protocol's limits
func ValidateOracleConfig(cfg *OracleConfig) *PluginError {
	if cfg == nil || cfg.Params == nil {
		return ErrInvalidParams()
	}
	p := cfg.Params
	if p.BucketBlocks == 0 || p.WindowBuckets == 0 || p.WindowBuckets > maxWindowBuckets ||
		p.MinBuckets == 0 || p.MinBuckets > p.WindowBuckets || p.MinNotional == 0 {
		return ErrInvalidParams()
	}
	if len(cfg.Reporters) > maxReporters {
		return ErrInvalidParams()
	}
	seen := map[string]bool{}
	for _, r := range cfg.Reporters {
		if len(r) != 20 {
			return ErrInvalidAddress()
		}
		if seen[string(r)] {
			return ErrInvalidParams()
		}
		seen[string(r)] = true
	}
	return nil
}

func validReport(m *MessageReportPrice) *PluginError {
	if len(m.Reporter) != 20 {
		return ErrInvalidAddress()
	}
	if m.Price == 0 || m.Price > maxPrice {
		return ErrInvalidPrice()
	}
	return nil
}

// CheckSetOracle() validates the config and names the admin as the only authorized signer
func (c *Contract) CheckSetOracle(m *MessageSetOracle) *PluginCheckResponse {
	if err := ValidateOracleConfig(m.Config); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return c.adminSigner()
}

// CheckReportPrice() validates the report and requires the signer to be a configured reporter
func (c *Contract) CheckReportPrice(m *MessageReportPrice) *PluginCheckResponse {
	if err := validReport(m); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	vals, err := c.io().Read(KeyForOracleConfig())
	if err != nil {
		return &PluginCheckResponse{Error: err}
	}
	cfg, err := decodeOracleConfig(vals[0])
	if err != nil {
		return &PluginCheckResponse{Error: err}
	}
	if !isReporter(cfg, m.Reporter) {
		return &PluginCheckResponse{Error: ErrNotReporter()}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{m.Reporter}}
}

// DeliverSetOracle() replaces the oracle configuration and charges the admin the fee. Reports of
// reporters that were removed are deleted.
func (c *Contract) DeliverSetOracle(m *MessageSetOracle, fee uint64, memo string) *PluginDeliverResponse {
	if err := ValidateOracleConfig(m.Config); err != nil {
		return fail(err)
	}
	s := c.io()
	admin, err := readAdmin(s)
	if err != nil {
		return fail(err)
	}
	l := newLedger(s)
	if err = l.payFee(c, admin, fee, memo); err != nil {
		return fail(err)
	}
	bz, err := l.get(KeyForOracleConfig())
	if err != nil {
		return fail(err)
	}
	old, err := decodeOracleConfig(bz)
	if err != nil {
		return fail(err)
	}
	for _, r := range old.Reporters {
		if !isReporter(m.Config, r) {
			l.b.del(KeyForReport(r))
		}
	}
	if err = putMsg(l.b, KeyForOracleConfig(), m.Config); err != nil {
		return fail(err)
	}
	ev, err := newEvent("oracle_set", &EventOracleSet{Reporters: uint32(len(m.Config.Reporters))}, nil)
	if err != nil {
		return fail(err)
	}
	if err = l.b.flush(s); err != nil {
		return fail(err)
	}
	return &PluginDeliverResponse{Events: []*Event{ev}}
}

// clampMove() limits target to at most bps basis points away from old (old == 0 means no limit)
func clampMove(old, target uint64, bps uint32) uint64 {
	if old == 0 {
		return target
	}
	o := bigU(old)
	d := new(big.Int).Mul(o, bigU(uint64(bps)))
	d.Div(d, bigU(bpsDenom))
	hi := new(big.Int).Add(o, d)
	lo := new(big.Int).Sub(o, d)
	if lo.Sign() <= 0 {
		lo = bigU(1)
	}
	t := bigU(target)
	if t.Cmp(hi) > 0 {
		t = hi
	} else if t.Cmp(lo) < 0 {
		t = lo
	}
	return t.Uint64()
}

// DeliverReportPrice() records a reporter's price and, when a majority of reporters have fresh
// reports, sets the CNPY price to their median (bounded by max_price_move_bps per update)
func (c *Contract) DeliverReportPrice(m *MessageReportPrice, fee uint64, memo string, height uint64) *PluginDeliverResponse {
	if err := validReport(m); err != nil {
		return fail(err)
	}
	s := c.io()
	l := newLedger(s)
	bz, err := l.get(KeyForOracleConfig())
	if err != nil {
		return fail(err)
	}
	cfg, err := decodeOracleConfig(bz)
	if err != nil {
		return fail(err)
	}
	if !isReporter(cfg, m.Reporter) {
		return fail(ErrNotReporter())
	}
	pbz, err := l.get(KeyForCUSDParams())
	if err != nil {
		return fail(err)
	}
	params, err := decodeParams(pbz)
	if err != nil {
		return fail(err)
	}
	if err = l.payFee(c, m.Reporter, fee, memo); err != nil {
		return fail(err)
	}
	var fresh []uint64
	for _, r := range cfg.Reporters {
		rep := new(Report)
		if bytes.Equal(r, m.Reporter) {
			rep.Price, rep.Height = m.Price, height
		} else {
			rbz, err := l.get(KeyForReport(r))
			if err != nil {
				return fail(err)
			}
			if err = Unmarshal(rbz, rep); err != nil {
				return fail(err)
			}
		}
		if rep.Price == 0 {
			continue
		}
		var age uint64
		if height > rep.Height {
			age = height - rep.Height
		}
		if age <= params.MaxPriceAge {
			fresh = append(fresh, rep.Price)
		}
	}
	if err = putMsg(l.b, KeyForReport(m.Reporter), &Report{Price: m.Price, Height: height}); err != nil {
		return fail(err)
	}
	cur := new(PriceRecord)
	obz, err := l.get(KeyForPrice())
	if err != nil {
		return fail(err)
	}
	if err = Unmarshal(obz, cur); err != nil {
		return fail(err)
	}
	quorum := len(cfg.Reporters)/2 + 1
	aggregate, updated := cur.Price, false
	if len(fresh) >= quorum {
		sort.Slice(fresh, func(i, j int) bool { return fresh[i] < fresh[j] })
		median := clampMove(cur.Price, fresh[(len(fresh)-1)/2], params.MaxPriceMoveBps)
		if err = putMsg(l.b, KeyForPrice(), &PriceRecord{Price: median, Height: height}); err != nil {
			return fail(err)
		}
		aggregate, updated = median, true
	}
	events := make([]*Event, 0, 2)
	ev, err := newEvent("price_reported", &EventPriceReported{Reporter: m.Reporter, Price: m.Price,
		Fresh: uint32(len(fresh)), Quorum: uint32(quorum), Aggregate: aggregate, Updated: updated}, m.Reporter)
	if err != nil {
		return fail(err)
	}
	events = append(events, ev)
	if updated {
		pev, err := newEvent("price_posted", &EventPricePosted{Price: aggregate, Height: height}, nil)
		if err != nil {
			return fail(err)
		}
		events = append(events, pev)
	}
	if err = l.b.flush(s); err != nil {
		return fail(err)
	}
	return &PluginDeliverResponse{Events: events}
}

// ---- asset prices from trades ----

func inWindow(index, cur uint64, window uint32) bool {
	return index <= cur && cur-index < uint64(window)
}

// recordTrades() adds one order's fills to the asset's trade history (no-op until the oracle is configured)
func recordTrades(l *ledger, assetId uint64, acc *tradeAcc, height uint64) *PluginError {
	cbz, err := l.get(KeyForOracleConfig())
	if err != nil {
		return err
	}
	cfg, err := decodeOracleConfig(cbz)
	if err != nil {
		return err
	}
	if cfg.Params == nil {
		return nil
	}
	p := cfg.Params
	bz, err := l.get(KeyForAssetOracle(assetId))
	if err != nil {
		return err
	}
	ao := new(AssetOracle)
	if err = Unmarshal(bz, ao); err != nil {
		return err
	}
	cur := height / p.BucketBlocks
	var kept []*Bucket
	var cb *Bucket
	for _, b := range ao.Buckets {
		if !inWindow(b.Index, cur, p.WindowBuckets) {
			continue
		}
		kept = append(kept, b)
		if b.Index == cur {
			cb = b
		}
	}
	if cb == nil {
		cb = &Bucket{Index: cur}
		kept = append(kept, cb)
	}
	if cb.Notional <= math.MaxUint64-acc.notional && cb.Units <= math.MaxUint64-acc.units {
		cb.Notional += acc.notional
		cb.Units += acc.units
	}
	ao.Buckets, ao.LastPrice, ao.LastHeight = kept, acc.last, height
	return putMsg(l.b, KeyForAssetOracle(assetId), ao)
}

// computeAssetPrice() is the volume-weighted price over the window, or ErrPriceNotSet when the window
// does not hold enough distinct buckets or value to be trusted
func computeAssetPrice(p *OracleParams, ao *AssetOracle, height uint64) (uint64, *PluginError) {
	cur := height / p.BucketBlocks
	notional, units := new(big.Int), new(big.Int)
	buckets := uint32(0)
	for _, b := range ao.Buckets {
		if b.Units == 0 || !inWindow(b.Index, cur, p.WindowBuckets) {
			continue
		}
		buckets++
		notional.Add(notional, bigU(b.Notional))
		units.Add(units, bigU(b.Units))
	}
	if buckets < p.MinBuckets || notional.Cmp(bigU(p.MinNotional)) < 0 || units.Sign() == 0 {
		return 0, ErrPriceNotSet()
	}
	price := new(big.Int).Div(notional, units)
	if !price.IsUint64() || price.Sign() == 0 {
		return 0, ErrPriceNotSet()
	}
	return price.Uint64(), nil
}

// AssetPrice() returns an asset's oracle price in micro-cUSD per unit at the given height
func AssetPrice(s stateIO, assetId, height uint64) (uint64, *PluginError) {
	vals, err := s.Read(KeyForOracleConfig(), KeyForAssetOracle(assetId))
	if err != nil {
		return 0, err
	}
	cfg, err := decodeOracleConfig(vals[0])
	if err != nil {
		return 0, err
	}
	if cfg.Params == nil {
		return 0, ErrPriceNotSet()
	}
	ao := new(AssetOracle)
	if err = Unmarshal(vals[1], ao); err != nil {
		return 0, err
	}
	return computeAssetPrice(cfg.Params, ao, height)
}
