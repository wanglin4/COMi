package contract

import (
	"bytes"
	"crypto/sha256"
	"math"
	"math/big"
)

/* Tier one assets: NAV and bond yield.

   NAV: the admin posts a net asset value (micro-cUSD per 1 unit) for every tier one asset (PostNav).
   After the first post, one update may move it by at most maxPriceMoveCapBps (the protocol's hard
   ceiling for any single oracle-style move). NAV is a reference value: nothing in this file spends it.

   Yield: a bond pays yield in cUSD, funded by its issuer (FundYield) and withdrawn by holders
   (ClaimYield). Funding moves cUSD from the issuer into yieldEscrowAddr, a protocol address nobody
   holds a key for; cUSD in it stays in the normal cUSD ledger, so the cUSD supply invariant holds.

   Accounting is a per-unit accumulator, so neither funding nor claiming iterates over holders:
   - YieldPool.index grows by floor(distributed x yieldScale / eligible) each round
   - a holder's entitlement is units x (index - last_index) / yieldScale
   - every change to a holder's balance first settles that holder (ledger.settleYield, called from
     ledger.setUnits, which is the only writer of holdings), so a position can never earn on units it
     did not hold, and a brand new holder starts at the current index
   - eligible units = issued units minus units resting in order escrow. Escrowed units earn nothing
     while they rest (they have no single owner to credit); the seller is settled when the units leave
     their balance and starts earning again from the moment they return
   - claims can never exceed what was funded: holders' payouts round down, while the issuer's charge
     rounds UP to cover eligible x increment exactly (never more than the requested amount). The
     sub-micro-cUSD dust this leaves stays in yield escrow. Rounding the charge down instead is NOT
     safe: a holder's floor over several rounds can exceed the sum of the per-round floors
   - claiming needs the asset gate and the cUSD gate, like every other path that hands out cUSD */

// yieldScale is the fixed-point scale of YieldPool.index
var yieldScale = big.NewInt(1_000_000_000_000_000_000)

// yieldEscrowAddr holds all funded, unclaimed yield. It is a hash of a fixed label, so no private key exists for it.
var yieldEscrowAddr = func() []byte {
	h := sha256.Sum256([]byte("comi/yield/escrow/v1"))
	return h[:20]
}()

// ---- stateless validation + authorization (CheckTx) ----

// ValidatePostNav() performs the stateless validation of a PostNav message
func ValidatePostNav(m *MessagePostNav) *PluginError {
	if m.AssetId == 0 {
		return ErrAssetNotFound()
	}
	if m.Nav == 0 || m.Nav > maxPrice {
		return ErrInvalidNav()
	}
	return nil
}

// ValidateFundYield() performs the stateless validation of a FundYield message
func ValidateFundYield(m *MessageFundYield) *PluginError {
	if m.AssetId == 0 {
		return ErrAssetNotFound()
	}
	if m.Amount == 0 {
		return ErrInvalidAmount()
	}
	return nil
}

// ValidateClaimYield() performs the stateless validation of a ClaimYield message
func ValidateClaimYield(m *MessageClaimYield) *PluginError {
	if m.AssetId == 0 {
		return ErrAssetNotFound()
	}
	return validHolder(m.Holder)
}

// CheckPostNav() validates the message and names the admin as the only authorized signer
func (c *Contract) CheckPostNav(m *MessagePostNav) *PluginCheckResponse {
	if err := ValidatePostNav(m); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return c.adminSigner()
}

// CheckFundYield() validates the message and names the bond's issuer as the only authorized signer
func (c *Contract) CheckFundYield(m *MessageFundYield) *PluginCheckResponse {
	if err := ValidateFundYield(m); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	asset, err := readAsset(c.io(), m.AssetId)
	if err != nil {
		return &PluginCheckResponse{Error: err}
	}
	if asset.Class != AssetClass_ASSET_CLASS_BOND {
		return &PluginCheckResponse{Error: ErrNotYieldAsset()}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{asset.Issuer}}
}

// CheckClaimYield() validates the message and names the holder as the only authorized signer
func (c *Contract) CheckClaimYield(m *MessageClaimYield) *PluginCheckResponse {
	if err := ValidateClaimYield(m); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{m.Holder}}
}

// ---- yield settlement ----

// yieldIndex() returns a bond's current pool index (zero when the bond has never been funded). The
// value is cached for the life of the ledger; it only changes in FundYield, which never settles.
func (l *ledger) yieldIndex(assetId uint64) (*big.Int, *PluginError) {
	if idx, ok := l.yieldIdx[assetId]; ok {
		return idx, nil
	}
	bz, err := l.get(KeyForYieldPool(assetId))
	if err != nil {
		return nil, err
	}
	pool := new(YieldPool)
	if err = Unmarshal(bz, pool); err != nil {
		return nil, err
	}
	idx := new(big.Int).SetBytes(pool.Index)
	if l.yieldIdx == nil {
		l.yieldIdx = map[uint64]*big.Int{}
	}
	l.yieldIdx[assetId] = idx
	return idx, nil
}

// stageYield() stages a holder's yield position. A holder with no units and nothing accrued needs no record.
func (l *ledger) stageYield(assetId uint64, addr []byte, acct *YieldAccount, bal uint64) *PluginError {
	if bal == 0 && acct.Accrued == 0 {
		l.b.del(KeyForYieldAccount(assetId, addr))
		return nil
	}
	return putMsg(l.b, KeyForYieldAccount(assetId, addr), acct)
}

// settleYield() brings a holder's yield position up to the current pool index using the balance held
// up to now, and stages it for a balance of newBal. Call it BEFORE the balance changes. It returns the
// settled position (empty when the asset has never been funded, or for the order escrow address).
func (l *ledger) settleYield(assetId uint64, addr []byte, newBal uint64) (*YieldAccount, *PluginError) {
	acct := new(YieldAccount)
	if bytes.Equal(addr, escrowAddr) {
		return acct, nil
	}
	idx, err := l.yieldIndex(assetId)
	if err != nil {
		return nil, err
	}
	if idx.Sign() == 0 {
		return acct, nil
	}
	bz, err := l.get(KeyForYieldAccount(assetId, addr))
	if err != nil {
		return nil, err
	}
	if err = Unmarshal(bz, acct); err != nil {
		return nil, err
	}
	last := new(big.Int).SetBytes(acct.LastIndex)
	switch idx.Cmp(last) {
	case -1:
		return nil, ErrCorruptState()
	case 1:
		bal, err := l.units(assetId, addr)
		if err != nil {
			return nil, err
		}
		if bal > 0 {
			pending := new(big.Int).Sub(idx, last)
			pending.Mul(pending, bigU(bal)).Div(pending, yieldScale)
			if !pending.IsUint64() || acct.Accrued > math.MaxUint64-pending.Uint64() {
				return nil, ErrInvalidAmount()
			}
			acct.Accrued += pending.Uint64()
		}
		acct.LastIndex = idx.Bytes()
	}
	return acct, l.stageYield(assetId, addr, acct, newBal)
}

// ---- deliveries ----

// DeliverPostNav() posts the NAV of a tier one asset and charges the admin the fee
func (c *Contract) DeliverPostNav(m *MessagePostNav, fee uint64, memo string, height uint64) *PluginDeliverResponse {
	if err := ValidatePostNav(m); err != nil {
		return fail(err)
	}
	s := c.io()
	admin, err := readAdmin(s)
	if err != nil {
		return fail(err)
	}
	vals, err := s.Read(KeyForAsset(m.AssetId), KeyForNav(m.AssetId), KeyForAccount(admin), KeyForFeePool(c.Config.ChainId))
	if err != nil {
		return fail(err)
	}
	if len(vals[0]) == 0 {
		return fail(ErrAssetNotFound())
	}
	asset := new(Asset)
	if err = Unmarshal(vals[0], asset); err != nil {
		return fail(err)
	}
	if asset.Tier != 1 {
		return fail(ErrNotTierOne())
	}
	if len(vals[1]) > 0 {
		old := new(NavRecord)
		if err = Unmarshal(vals[1], old); err != nil {
			return fail(err)
		}
		if old.Nav > 0 {
			diff := new(big.Int).Sub(bigU(m.Nav), bigU(old.Nav))
			diff.Abs(diff).Mul(diff, bigU(bpsDenom))
			limit := new(big.Int).Mul(bigU(old.Nav), bigU(maxPriceMoveCapBps))
			if diff.Cmp(limit) > 0 {
				return fail(ErrNavMoveTooLarge())
			}
		}
	}
	sets, deletes, err := c.feeOps(admin, vals[2], vals[3], fee, memo)
	if err != nil {
		return fail(err)
	}
	bz, err := Marshal(&NavRecord{Nav: m.Nav, Height: height})
	if err != nil {
		return fail(err)
	}
	sets = append(sets, &PluginSetOp{Key: KeyForNav(m.AssetId), Value: bz})
	event, err := newEvent("nav_posted", &EventNavPosted{AssetId: m.AssetId, Nav: m.Nav, Height: height}, nil)
	if err != nil {
		return fail(err)
	}
	if err = s.Write(sets, deletes); err != nil {
		return fail(err)
	}
	return &PluginDeliverResponse{Events: []*Event{event}}
}

// DeliverFundYield() moves up to m.Amount of the issuer's cUSD into yield escrow and spreads it over the
// bond's eligible units. The charge is rounded up to cover the per-unit increment (see the file comment).
func (c *Contract) DeliverFundYield(m *MessageFundYield, fee uint64, memo string) *PluginDeliverResponse {
	if err := ValidateFundYield(m); err != nil {
		return fail(err)
	}
	s := c.io()
	asset, err := readAsset(s, m.AssetId)
	if err != nil {
		return fail(err)
	}
	if asset.Class != AssetClass_ASSET_CLASS_BOND {
		return fail(ErrNotYieldAsset())
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
	escrowed, err := l.units(m.AssetId, escrowAddr)
	if err != nil {
		return fail(err)
	}
	if escrowed > us.Issued {
		return fail(ErrCorruptState())
	}
	eligible := us.Issued - escrowed
	if eligible == 0 {
		return fail(ErrNoEligibleUnits())
	}
	incr := new(big.Int).Mul(bigU(m.Amount), yieldScale)
	incr.Div(incr, bigU(eligible))
	if incr.Sign() == 0 {
		return fail(ErrInvalidAmount())
	}
	// eligible x incr / yieldScale is what the round hands out in total. If it is below one micro-cUSD,
	// nobody would receive anything, so the round is rejected instead of silently stranding the money.
	total := new(big.Int).Mul(incr, bigU(eligible))
	if new(big.Int).Div(total, yieldScale).Sign() == 0 {
		return fail(ErrInvalidAmount())
	}
	// charge the total rounded UP so that escrow always covers every holder's entitlement; since
	// incr = floor(amount x yieldScale / eligible), the charge never exceeds m.Amount (a uint64)
	total.Add(total, new(big.Int).Sub(yieldScale, big.NewInt(1)))
	total.Div(total, yieldScale)
	distributed := total.Uint64()
	if err = l.moveCUSD(asset.Issuer, yieldEscrowAddr, distributed); err != nil {
		return fail(err)
	}
	pbz, err := l.get(KeyForYieldPool(m.AssetId))
	if err != nil {
		return fail(err)
	}
	pool := new(YieldPool)
	if err = Unmarshal(pbz, pool); err != nil {
		return fail(err)
	}
	if pool.Funded > math.MaxUint64-distributed {
		return fail(ErrInvalidAmount())
	}
	pool.Index = new(big.Int).Add(new(big.Int).SetBytes(pool.Index), incr).Bytes()
	pool.Funded += distributed
	if err = putMsg(l.b, KeyForYieldPool(m.AssetId), pool); err != nil {
		return fail(err)
	}
	ev, err := newEvent("yield_funded", &EventYieldFunded{AssetId: m.AssetId, Amount: distributed, EligibleUnits: eligible}, asset.Issuer)
	if err != nil {
		return fail(err)
	}
	if err = l.b.flush(s); err != nil {
		return fail(err)
	}
	return &PluginDeliverResponse{Events: []*Event{ev}}
}

// DeliverClaimYield() pays a holder everything it has accrued on a bond, as cUSD; the holder pays the fee
func (c *Contract) DeliverClaimYield(m *MessageClaimYield, fee uint64, memo string) *PluginDeliverResponse {
	if err := ValidateClaimYield(m); err != nil {
		return fail(err)
	}
	s := c.io()
	asset, err := readAsset(s, m.AssetId)
	if err != nil {
		return fail(err)
	}
	if asset.Class != AssetClass_ASSET_CLASS_BOND {
		return fail(ErrNotYieldAsset())
	}
	if err = RequireAllowed(s, m.AssetId, m.Holder); err != nil {
		return fail(err)
	}
	if err = RequireAllowed(s, CUSDGateID, m.Holder); err != nil {
		return fail(err)
	}
	l := newLedger(s)
	if err = l.payFee(c, m.Holder, fee, memo); err != nil {
		return fail(err)
	}
	bal, err := l.units(m.AssetId, m.Holder)
	if err != nil {
		return fail(err)
	}
	acct, err := l.settleYield(m.AssetId, m.Holder, bal)
	if err != nil {
		return fail(err)
	}
	pay := acct.Accrued
	if pay == 0 {
		return fail(ErrNothingToClaim())
	}
	acct.Accrued = 0
	if err = l.stageYield(m.AssetId, m.Holder, acct, bal); err != nil {
		return fail(err)
	}
	pbz, err := l.get(KeyForYieldPool(m.AssetId))
	if err != nil {
		return fail(err)
	}
	pool := new(YieldPool)
	if err = Unmarshal(pbz, pool); err != nil {
		return fail(err)
	}
	// solvency guard: rounding is always down, so a correct ledger can never pay out more than was funded
	if pool.Funded-pool.Claimed < pay || pool.Claimed > pool.Funded {
		return fail(ErrCorruptState())
	}
	pool.Claimed += pay
	if err = putMsg(l.b, KeyForYieldPool(m.AssetId), pool); err != nil {
		return fail(err)
	}
	if err = l.moveCUSD(yieldEscrowAddr, m.Holder, pay); err != nil {
		return fail(err)
	}
	ev, err := newEvent("yield_claimed", &EventYieldClaimed{AssetId: m.AssetId, Holder: m.Holder, Amount: pay}, m.Holder)
	if err != nil {
		return fail(err)
	}
	if err = l.b.flush(s); err != nil {
		return fail(err)
	}
	return &PluginDeliverResponse{Events: []*Event{ev}}
}
