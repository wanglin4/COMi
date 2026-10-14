package contract

import (
	"math"
	"math/big"
)

/* cUSD: an over-collateralized stablecoin backed by CNPY.

   Units: collateral is uCNPY, cUSD is micro-cUSD (1 cUSD = 1,000,000), and the posted price is
   micro-cUSD per 1 CNPY (USD price x 1,000,000). The value of a vault's collateral in micro-cUSD is
   floor(collateral x price / 1,000,000); every comparison rounds in favor of solvency.

   Money flow: deposited CNPY moves from the user's account into CollateralPoolID and back out on
   withdraw or liquidation, so total CNPY (accounts + pools) is conserved. cUSD exists only as
   vault debt: sum(vault.debt) == sum(cUSD balances) == supply.total_debt.

   Gating (phase 1, admin allowlist on gate id CUSDGateID): deposit, mint, transfer (both ends) and
   liquidate are gated. Withdraw and burn are NEVER gated, so revoking an address can't trap funds. */

const (
	bpsDenom              = 10000
	priceScale            = 1_000_000 // micro-units per whole unit
	minCollateralFloorBps = 15000     // protocol floor for min_collateral_bps (150%)
	maxCollateralBps      = 100000
	maxPenaltyBps         = 2000
	maxPriceMoveCapBps    = 5000
	maxPrice              = uint64(1) << 62
)

func bigU(u uint64) *big.Int { return new(big.Int).SetUint64(u) }

// collateralValue() returns floor(collateral x price / 1e6) in micro-cUSD
func collateralValue(collateral, price uint64) *big.Int {
	v := new(big.Int).Mul(bigU(collateral), bigU(price))
	return v.Div(v, bigU(priceScale))
}

// atLeastRatio() reports whether collateralValue x 10000 >= debt x bps
func atLeastRatio(collateral, debt, price uint64, bps uint32) bool {
	lhs := collateralValue(collateral, price)
	lhs.Mul(lhs, bigU(bpsDenom))
	rhs := bigU(debt)
	rhs.Mul(rhs, bigU(uint64(bps)))
	return lhs.Cmp(rhs) >= 0
}

// ValidateCUSDParams() checks the risk parameters against the protocol's hard limits
func ValidateCUSDParams(p *CUSDParams) *PluginError {
	if p == nil ||
		p.MinCollateralBps < minCollateralFloorBps || p.MinCollateralBps > maxCollateralBps ||
		p.LiquidationPenaltyBps > maxPenaltyBps ||
		// the liquidation threshold must be below the mint threshold, and high enough that seizing
		// debt x (1 + penalty) of collateral is possible at the threshold
		p.LiquidationBps >= p.MinCollateralBps || p.LiquidationBps < bpsDenom+p.LiquidationPenaltyBps ||
		p.MaxPriceAge == 0 ||
		p.MaxPriceMoveBps == 0 || p.MaxPriceMoveBps > maxPriceMoveCapBps {
		return ErrInvalidParams()
	}
	return nil
}

func validAmount(addr []byte, amount uint64) *PluginError {
	if len(addr) != 20 {
		return ErrInvalidAddress()
	}
	if amount == 0 {
		return ErrInvalidAmount()
	}
	return nil
}

// decodeParams() decodes stored params (absent = not set)
func decodeParams(bz []byte) (*CUSDParams, *PluginError) {
	if len(bz) == 0 {
		return nil, ErrParamsNotSet()
	}
	p := new(CUSDParams)
	if err := Unmarshal(bz, p); err != nil {
		return nil, err
	}
	return p, nil
}

// freshPrice() decodes the stored price and rejects it when absent or older than max_price_age
func freshPrice(bz []byte, p *CUSDParams, height uint64) (uint64, *PluginError) {
	if len(bz) == 0 {
		return 0, ErrPriceNotSet()
	}
	rec := new(PriceRecord)
	if err := Unmarshal(bz, rec); err != nil {
		return 0, err
	}
	if rec.Price == 0 {
		return 0, ErrPriceNotSet()
	}
	var age uint64
	if height > rec.Height {
		age = height - rec.Height
	}
	if age > p.MaxPriceAge {
		return 0, ErrPriceStale()
	}
	return rec.Price, nil
}

// chargeFee() debits the fee from the payer and credits the fee pool
func chargeFee(acc *Account, pool *Pool, fee uint64) *PluginError {
	if acc.Amount < fee {
		return ErrInsufficientFunds()
	}
	if pool.Amount > math.MaxUint64-fee {
		return ErrInvalidAmount()
	}
	acc.Amount -= fee
	pool.Amount += fee
	return nil
}

// putAccount() stages an account write, retaining drained accounts that carry nonce state (or RLP.V2)
func putAccount(b *batch, addr []byte, acc *Account, memo string) *PluginError {
	key := KeyForAccount(addr)
	if acc.Amount == 0 && acc.Nonce == 0 && memo != rlpV2Memo {
		b.del(key)
		return nil
	}
	return putMsg(b, key, acc)
}

// putMsg() stages a write of a proto message
func putMsg(b *batch, key []byte, m any) *PluginError {
	bz, err := Marshal(m)
	if err != nil {
		return err
	}
	b.set(key, bz)
	return nil
}

// userState is everything a user-signed cUSD transaction reads, fetched in one round trip
type userState struct {
	paramsBz, priceBz []byte
	supply            *CUSDSupply
	acc               *Account
	feePool, collPool *Pool
	vault             *Vault
	bal               *CUSDAccount
	allowed           bool
}

// loadUser() reads and decodes the state touched by a transaction signed by addr
func (c *Contract) loadUser(s stateIO, addr []byte) (*userState, *PluginError) {
	vals, err := s.Read(KeyForCUSDParams(), KeyForPrice(), KeyForCUSDSupply(), KeyForAccount(addr),
		KeyForFeePool(c.Config.ChainId), KeyForPool(CollateralPoolID), KeyForVault(addr), KeyForCUSD(addr),
		KeyForGate(CUSDGateID, addr))
	if err != nil {
		return nil, err
	}
	u := &userState{paramsBz: vals[0], priceBz: vals[1], supply: new(CUSDSupply), acc: new(Account),
		feePool: new(Pool), collPool: new(Pool), vault: new(Vault), bal: new(CUSDAccount), allowed: len(vals[8]) > 0}
	for i, dst := range []any{u.supply, u.acc, u.feePool, u.collPool, u.vault, u.bal} {
		if err = Unmarshal(vals[i+2], dst); err != nil {
			return nil, err
		}
	}
	return u, nil
}

// stage() writes everything a user transaction may have changed: the payer's account, both pools,
// the vault, the cUSD balance and the supply (empty vaults and zero balances are deleted)
func (u *userState) stage(b *batch, c *Contract, addr []byte, memo string) *PluginError {
	if err := putAccount(b, addr, u.acc, memo); err != nil {
		return err
	}
	if err := putMsg(b, KeyForFeePool(c.Config.ChainId), u.feePool); err != nil {
		return err
	}
	if err := putMsg(b, KeyForPool(CollateralPoolID), u.collPool); err != nil {
		return err
	}
	if err := putMsg(b, KeyForCUSDSupply(), u.supply); err != nil {
		return err
	}
	if u.vault.Collateral == 0 && u.vault.Debt == 0 {
		b.del(KeyForVault(addr))
	} else if err := putMsg(b, KeyForVault(addr), u.vault); err != nil {
		return err
	}
	if u.bal.Amount == 0 {
		b.del(KeyForCUSD(addr))
	} else if err := putMsg(b, KeyForCUSD(addr), u.bal); err != nil {
		return err
	}
	return nil
}

// ---- stateless validation + authorization (CheckTx) ----

func checkFrom(from []byte, amount uint64) *PluginCheckResponse {
	if err := validAmount(from, amount); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{from}}
}

func (c *Contract) CheckVaultDeposit(m *MessageVaultDeposit) *PluginCheckResponse {
	return checkFrom(m.FromAddress, m.Amount)
}
func (c *Contract) CheckVaultWithdraw(m *MessageVaultWithdraw) *PluginCheckResponse {
	return checkFrom(m.FromAddress, m.Amount)
}
func (c *Contract) CheckCUSDMint(m *MessageCUSDMint) *PluginCheckResponse {
	return checkFrom(m.FromAddress, m.Amount)
}
func (c *Contract) CheckCUSDBurn(m *MessageCUSDBurn) *PluginCheckResponse {
	return checkFrom(m.FromAddress, m.Amount)
}

func (c *Contract) CheckCUSDTransfer(m *MessageCUSDTransfer) *PluginCheckResponse {
	resp := checkFrom(m.FromAddress, m.Amount)
	if resp.Error != nil {
		return resp
	}
	if len(m.ToAddress) != 20 {
		return &PluginCheckResponse{Error: ErrInvalidAddress()}
	}
	if string(m.FromAddress) == string(m.ToAddress) {
		return &PluginCheckResponse{Error: ErrSelfTransfer()}
	}
	resp.Recipient = m.ToAddress
	return resp
}

func (c *Contract) CheckLiquidate(m *MessageLiquidate) *PluginCheckResponse {
	resp := checkFrom(m.FromAddress, m.RepayAmount)
	if resp.Error != nil {
		return resp
	}
	if len(m.VaultOwner) != 20 {
		return &PluginCheckResponse{Error: ErrInvalidAddress()}
	}
	if string(m.FromAddress) == string(m.VaultOwner) {
		return &PluginCheckResponse{Error: ErrSelfTransfer()}
	}
	return resp
}

func (c *Contract) CheckSetCUSDParams(m *MessageSetCUSDParams) *PluginCheckResponse {
	if err := ValidateCUSDParams(m.Params); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return c.adminSigner()
}

func (c *Contract) CheckPostPrice(m *MessagePostPrice) *PluginCheckResponse {
	if m.Price == 0 || m.Price > maxPrice {
		return &PluginCheckResponse{Error: ErrInvalidPrice()}
	}
	return c.adminSigner()
}

// adminSigner() names the state admin as the only authorized signer
func (c *Contract) adminSigner() *PluginCheckResponse {
	admin, err := readAdmin(c.io())
	if err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{admin}}
}

// ---- admin deliveries ----

// DeliverSetCUSDParams() replaces the risk parameters and charges the admin the fee
func (c *Contract) DeliverSetCUSDParams(m *MessageSetCUSDParams, fee uint64, memo string) *PluginDeliverResponse {
	if err := ValidateCUSDParams(m.Params); err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	s := c.io()
	admin, err := readAdmin(s)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	vals, err := s.Read(KeyForAccount(admin), KeyForFeePool(c.Config.ChainId))
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	sets, deletes, err := c.feeOps(admin, vals[0], vals[1], fee, memo)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	bz, err := Marshal(m.Params)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	sets = append(sets, &PluginSetOp{Key: KeyForCUSDParams(), Value: bz})
	if err = s.Write(sets, deletes); err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	return &PluginDeliverResponse{}
}

// DeliverPostPrice() posts the CNPY price. After the first post, each update may move the price by at
// most max_price_move_bps from the previous one.
func (c *Contract) DeliverPostPrice(m *MessagePostPrice, fee uint64, memo string, height uint64) *PluginDeliverResponse {
	if m.Price == 0 || m.Price > maxPrice {
		return &PluginDeliverResponse{Error: ErrInvalidPrice()}
	}
	s := c.io()
	admin, err := readAdmin(s)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	vals, err := s.Read(KeyForCUSDParams(), KeyForPrice(), KeyForAccount(admin), KeyForFeePool(c.Config.ChainId))
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	params, err := decodeParams(vals[0])
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	if len(vals[1]) > 0 {
		old := new(PriceRecord)
		if err = Unmarshal(vals[1], old); err != nil {
			return &PluginDeliverResponse{Error: err}
		}
		if old.Price > 0 {
			diff := new(big.Int).Sub(bigU(m.Price), bigU(old.Price))
			diff.Abs(diff).Mul(diff, bigU(bpsDenom))
			limit := new(big.Int).Mul(bigU(old.Price), bigU(uint64(params.MaxPriceMoveBps)))
			if diff.Cmp(limit) > 0 {
				return &PluginDeliverResponse{Error: ErrPriceMoveTooLarge()}
			}
		}
	}
	sets, deletes, err := c.feeOps(admin, vals[2], vals[3], fee, memo)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	bz, err := Marshal(&PriceRecord{Price: m.Price, Height: height})
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	sets = append(sets, &PluginSetOp{Key: KeyForPrice(), Value: bz})
	event, err := newEvent("price_posted", &EventPricePosted{Price: m.Price, Height: height}, nil)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	if err = s.Write(sets, deletes); err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	return &PluginDeliverResponse{Events: []*Event{event}}
}

// ---- user deliveries ----

// vaultEvent() builds the EventVaultUpdated for a user transaction
func vaultEvent(action string, owner []byte, amount uint64, v *Vault) (*Event, *PluginError) {
	return newEvent("vault_updated", &EventVaultUpdated{Action: action, Owner: owner, Amount: amount,
		Collateral: v.Collateral, Debt: v.Debt}, owner)
}

// finishUser() flushes the batch and builds the response
func (c *Contract) finishUser(b *batch, s stateIO, events ...*Event) *PluginDeliverResponse {
	if err := b.flush(s); err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	return &PluginDeliverResponse{Events: events}
}

func fail(err *PluginError) *PluginDeliverResponse { return &PluginDeliverResponse{Error: err} }

// DeliverVaultDeposit() locks uCNPY from the sender's account into the collateral pool
func (c *Contract) DeliverVaultDeposit(m *MessageVaultDeposit, fee uint64, memo string) *PluginDeliverResponse {
	if err := validAmount(m.FromAddress, m.Amount); err != nil {
		return fail(err)
	}
	s := c.io()
	u, err := c.loadUser(s, m.FromAddress)
	if err != nil {
		return fail(err)
	}
	if !u.allowed {
		return fail(ErrNotAllowed())
	}
	if err = chargeFee(u.acc, u.feePool, fee); err != nil {
		return fail(err)
	}
	if u.acc.Amount < m.Amount {
		return fail(ErrInsufficientFunds())
	}
	if u.vault.Collateral > math.MaxUint64-m.Amount || u.collPool.Amount > math.MaxUint64-m.Amount {
		return fail(ErrInvalidAmount())
	}
	u.acc.Amount -= m.Amount
	u.vault.Collateral += m.Amount
	u.collPool.Amount += m.Amount
	b := newBatch()
	if err = u.stage(b, c, m.FromAddress, memo); err != nil {
		return fail(err)
	}
	ev, err := vaultEvent("deposit", m.FromAddress, m.Amount, u.vault)
	if err != nil {
		return fail(err)
	}
	return c.finishUser(b, s, ev)
}

// DeliverVaultWithdraw() unlocks collateral; with outstanding debt the vault must stay at or above
// the minimum collateral ratio at a fresh price. Never gated.
func (c *Contract) DeliverVaultWithdraw(m *MessageVaultWithdraw, fee uint64, memo string, height uint64) *PluginDeliverResponse {
	if err := validAmount(m.FromAddress, m.Amount); err != nil {
		return fail(err)
	}
	s := c.io()
	u, err := c.loadUser(s, m.FromAddress)
	if err != nil {
		return fail(err)
	}
	if err = chargeFee(u.acc, u.feePool, fee); err != nil {
		return fail(err)
	}
	if m.Amount > u.vault.Collateral || m.Amount > u.collPool.Amount {
		return fail(ErrInsufficientCollateral())
	}
	u.vault.Collateral -= m.Amount
	u.collPool.Amount -= m.Amount
	if u.vault.Debt > 0 {
		params, err := decodeParams(u.paramsBz)
		if err != nil {
			return fail(err)
		}
		price, err := freshPrice(u.priceBz, params, height)
		if err != nil {
			return fail(err)
		}
		if !atLeastRatio(u.vault.Collateral, u.vault.Debt, price, params.MinCollateralBps) {
			return fail(ErrUndercollateralized())
		}
	}
	if u.acc.Amount > math.MaxUint64-m.Amount {
		return fail(ErrInvalidAmount())
	}
	u.acc.Amount += m.Amount
	b := newBatch()
	if err = u.stage(b, c, m.FromAddress, memo); err != nil {
		return fail(err)
	}
	ev, err := vaultEvent("withdraw", m.FromAddress, m.Amount, u.vault)
	if err != nil {
		return fail(err)
	}
	return c.finishUser(b, s, ev)
}

// DeliverCUSDMint() borrows cUSD against the vault: needs a fresh price, room under the supply cap
// and a post-mint ratio at or above the minimum.
func (c *Contract) DeliverCUSDMint(m *MessageCUSDMint, fee uint64, memo string, height uint64) *PluginDeliverResponse {
	if err := validAmount(m.FromAddress, m.Amount); err != nil {
		return fail(err)
	}
	s := c.io()
	u, err := c.loadUser(s, m.FromAddress)
	if err != nil {
		return fail(err)
	}
	if !u.allowed {
		return fail(ErrNotAllowed())
	}
	params, err := decodeParams(u.paramsBz)
	if err != nil {
		return fail(err)
	}
	price, err := freshPrice(u.priceBz, params, height)
	if err != nil {
		return fail(err)
	}
	if err = chargeFee(u.acc, u.feePool, fee); err != nil {
		return fail(err)
	}
	if u.supply.TotalDebt > math.MaxUint64-m.Amount || u.supply.TotalDebt+m.Amount > params.SupplyCap {
		return fail(ErrSupplyCapExceeded())
	}
	if u.vault.Debt > math.MaxUint64-m.Amount || u.bal.Amount > math.MaxUint64-m.Amount {
		return fail(ErrInvalidAmount())
	}
	u.vault.Debt += m.Amount
	if !atLeastRatio(u.vault.Collateral, u.vault.Debt, price, params.MinCollateralBps) {
		return fail(ErrUndercollateralized())
	}
	u.bal.Amount += m.Amount
	u.supply.TotalDebt += m.Amount
	b := newBatch()
	if err = u.stage(b, c, m.FromAddress, memo); err != nil {
		return fail(err)
	}
	ev, err := vaultEvent("mint", m.FromAddress, m.Amount, u.vault)
	if err != nil {
		return fail(err)
	}
	return c.finishUser(b, s, ev)
}

// DeliverCUSDBurn() repays debt from the sender's cUSD balance. Never gated, needs no price.
func (c *Contract) DeliverCUSDBurn(m *MessageCUSDBurn, fee uint64, memo string) *PluginDeliverResponse {
	if err := validAmount(m.FromAddress, m.Amount); err != nil {
		return fail(err)
	}
	s := c.io()
	u, err := c.loadUser(s, m.FromAddress)
	if err != nil {
		return fail(err)
	}
	if err = chargeFee(u.acc, u.feePool, fee); err != nil {
		return fail(err)
	}
	if m.Amount > u.vault.Debt {
		return fail(ErrInsufficientDebt())
	}
	if m.Amount > u.bal.Amount || m.Amount > u.supply.TotalDebt {
		return fail(ErrInsufficientCUSD())
	}
	u.vault.Debt -= m.Amount
	u.bal.Amount -= m.Amount
	u.supply.TotalDebt -= m.Amount
	b := newBatch()
	if err = u.stage(b, c, m.FromAddress, memo); err != nil {
		return fail(err)
	}
	ev, err := vaultEvent("burn", m.FromAddress, m.Amount, u.vault)
	if err != nil {
		return fail(err)
	}
	return c.finishUser(b, s, ev)
}

// DeliverCUSDTransfer() moves cUSD between two allowlisted addresses
func (c *Contract) DeliverCUSDTransfer(m *MessageCUSDTransfer, fee uint64, memo string) *PluginDeliverResponse {
	if err := validAmount(m.FromAddress, m.Amount); err != nil {
		return fail(err)
	}
	if len(m.ToAddress) != 20 {
		return fail(ErrInvalidAddress())
	}
	if string(m.FromAddress) == string(m.ToAddress) {
		return fail(ErrSelfTransfer())
	}
	s := c.io()
	u, err := c.loadUser(s, m.FromAddress)
	if err != nil {
		return fail(err)
	}
	rv, err := s.Read(KeyForGate(CUSDGateID, m.ToAddress), KeyForCUSD(m.ToAddress))
	if err != nil {
		return fail(err)
	}
	if !u.allowed || len(rv[0]) == 0 {
		return fail(ErrNotAllowed())
	}
	to := new(CUSDAccount)
	if err = Unmarshal(rv[1], to); err != nil {
		return fail(err)
	}
	if err = chargeFee(u.acc, u.feePool, fee); err != nil {
		return fail(err)
	}
	if u.bal.Amount < m.Amount {
		return fail(ErrInsufficientCUSD())
	}
	if to.Amount > math.MaxUint64-m.Amount {
		return fail(ErrInvalidAmount())
	}
	u.bal.Amount -= m.Amount
	to.Amount += m.Amount
	b := newBatch()
	if err = u.stage(b, c, m.FromAddress, memo); err != nil {
		return fail(err)
	}
	if err = putMsg(b, KeyForCUSD(m.ToAddress), to); err != nil {
		return fail(err)
	}
	ev, err := newEvent("cusd_transfer", &EventCUSDTransfer{FromAddress: m.FromAddress, ToAddress: m.ToAddress, Amount: m.Amount}, m.ToAddress)
	if err != nil {
		return fail(err)
	}
	return c.finishUser(b, s, ev)
}

// DeliverLiquidate() lets a gated liquidator repay part of an unhealthy vault's debt from their own
// cUSD and receive collateral worth repay x (1 + penalty), valued at the posted price.
func (c *Contract) DeliverLiquidate(m *MessageLiquidate, fee uint64, memo string, height uint64) *PluginDeliverResponse {
	if err := validAmount(m.FromAddress, m.RepayAmount); err != nil {
		return fail(err)
	}
	if len(m.VaultOwner) != 20 {
		return fail(ErrInvalidAddress())
	}
	if string(m.FromAddress) == string(m.VaultOwner) {
		return fail(ErrSelfTransfer())
	}
	s := c.io()
	u, err := c.loadUser(s, m.FromAddress)
	if err != nil {
		return fail(err)
	}
	if !u.allowed {
		return fail(ErrNotAllowed())
	}
	params, err := decodeParams(u.paramsBz)
	if err != nil {
		return fail(err)
	}
	price, err := freshPrice(u.priceBz, params, height)
	if err != nil {
		return fail(err)
	}
	ov, err := s.Read(KeyForVault(m.VaultOwner))
	if err != nil {
		return fail(err)
	}
	owner := new(Vault)
	if err = Unmarshal(ov[0], owner); err != nil {
		return fail(err)
	}
	if atLeastRatio(owner.Collateral, owner.Debt, price, params.LiquidationBps) {
		return fail(ErrVaultHealthy())
	}
	if err = chargeFee(u.acc, u.feePool, fee); err != nil {
		return fail(err)
	}
	if m.RepayAmount > owner.Debt || m.RepayAmount > u.supply.TotalDebt {
		return fail(ErrInsufficientDebt())
	}
	if m.RepayAmount > u.bal.Amount {
		return fail(ErrInsufficientCUSD())
	}
	// seized collateral (uCNPY) = floor(floor(repay x (1 + penalty)) x 1e6 / price): rounds against the liquidator
	seizeValue := new(big.Int).Mul(bigU(m.RepayAmount), bigU(bpsDenom+uint64(params.LiquidationPenaltyBps)))
	seizeValue.Div(seizeValue, bigU(bpsDenom))
	seizeBig := seizeValue.Mul(seizeValue, bigU(priceScale))
	seizeBig.Div(seizeBig, bigU(price))
	if !seizeBig.IsUint64() || seizeBig.Uint64() > owner.Collateral || seizeBig.Uint64() > u.collPool.Amount {
		return fail(ErrLiquidationTooLarge())
	}
	seize := seizeBig.Uint64()
	if seize == 0 {
		return fail(ErrInvalidAmount())
	}
	if u.acc.Amount > math.MaxUint64-seize {
		return fail(ErrInvalidAmount())
	}
	u.bal.Amount -= m.RepayAmount
	u.supply.TotalDebt -= m.RepayAmount
	owner.Debt -= m.RepayAmount
	owner.Collateral -= seize
	u.collPool.Amount -= seize
	u.acc.Amount += seize
	b := newBatch()
	if err = u.stage(b, c, m.FromAddress, memo); err != nil {
		return fail(err)
	}
	if owner.Collateral == 0 && owner.Debt == 0 {
		b.del(KeyForVault(m.VaultOwner))
	} else if err = putMsg(b, KeyForVault(m.VaultOwner), owner); err != nil {
		return fail(err)
	}
	ev, err := newEvent("liquidated", &EventLiquidated{VaultOwner: m.VaultOwner, Liquidator: m.FromAddress,
		Repaid: m.RepayAmount, SeizedCollateral: seize, RemainingDebt: owner.Debt, RemainingCollateral: owner.Collateral}, m.VaultOwner)
	if err != nil {
		return fail(err)
	}
	return c.finishUser(b, s, ev)
}
