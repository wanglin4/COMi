package contract

import (
	"bytes"
	"math"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
)

/* This file implements the asset registry (RegisterAsset) and gate management (SetGate).
   Phase 1: both are admin only. Fees are charged to the admin and credited to the fee pool,
   because Canopy core does not deduct fees for plugin transactions. */

const (
	minSymbolLen = 2
	maxSymbolLen = 12
	// rlpV2Memo is the memo that makes core advance the sender's nonce AFTER plugin delivery, so a
	// drained sender must be retained (not deleted) for that write to land
	rlpV2Memo = "RLP.V2"
	// synthEnabled flips on in phase 2 (collateral ratios, liquidation and a price oracle must exist first)
	synthEnabled = false
)

// reservedSymbols can never be registered as assets (they would impersonate protocol currencies)
var reservedSymbols = map[string]struct{}{"CUSD": {}, "CNPY": {}}

// validSymbol() reports whether s is a legal, unreserved asset symbol
func validSymbol(s string) bool {
	if len(s) < minSymbolLen || len(s) > maxSymbolLen {
		return false
	}
	for i := 0; i < len(s); i++ {
		ch := s[i]
		isUpper := ch >= 'A' && ch <= 'Z'
		isDigit := ch >= '0' && ch <= '9'
		if !isUpper && !(isDigit && i > 0) {
			return false
		}
	}
	_, reserved := reservedSymbols[s]
	return !reserved
}

// ValidateRegisterAsset() performs the stateless validation of a RegisterAsset message
func ValidateRegisterAsset(msg *MessageRegisterAsset) *PluginError {
	if !validSymbol(msg.Symbol) {
		return ErrInvalidSymbol()
	}
	switch msg.Class {
	case AssetClass_ASSET_CLASS_RWA, AssetClass_ASSET_CLASS_BOND:
	case AssetClass_ASSET_CLASS_SYNTH:
		if !synthEnabled {
			return ErrInvalidAssetClass()
		}
	default:
		return ErrInvalidAssetClass()
	}
	if len(msg.Issuer) != 20 {
		return ErrInvalidAddress()
	}
	if _, err := gateFor(msg.GatePolicy); err != nil {
		return err
	}
	if msg.Tier != 1 && msg.Tier != 2 {
		return ErrInvalidTier()
	}
	// tier one assets are collateral-eligible, so they must be fully gated
	if msg.Tier == 1 && msg.GatePolicy == GatePolicy_GATE_POLICY_OPEN {
		return ErrInvalidGatePolicy()
	}
	return nil
}

// ValidateSetGate() performs the stateless validation of a SetGate message
func ValidateSetGate(msg *MessageSetGate) *PluginError {
	// asset id 0 (CUSDGateID) is the cUSD allowlist
	if len(msg.Address) != 20 {
		return ErrInvalidAddress()
	}
	return nil
}

// readAdmin() loads the admin address from state
func readAdmin(s stateIO) ([]byte, *PluginError) {
	vals, err := s.Read(KeyForAdmin())
	if err != nil {
		return nil, err
	}
	if len(vals[0]) == 0 {
		return nil, ErrAdminNotSet()
	}
	cfg := new(AdminConfig)
	if err = Unmarshal(vals[0], cfg); err != nil {
		return nil, err
	}
	if len(cfg.Admin) != 20 {
		return nil, ErrAdminNotSet()
	}
	return cfg.Admin, nil
}

// CheckRegisterAsset() validates a RegisterAsset message and names the admin as the only authorized signer
func (c *Contract) CheckRegisterAsset(msg *MessageRegisterAsset) *PluginCheckResponse {
	if err := ValidateRegisterAsset(msg); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	admin, err := readAdmin(c.io())
	if err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{admin}}
}

// CheckSetGate() validates a SetGate message and names the admin as the only authorized signer
func (c *Contract) CheckSetGate(msg *MessageSetGate) *PluginCheckResponse {
	if err := ValidateSetGate(msg); err != nil {
		return &PluginCheckResponse{Error: err}
	}
	admin, err := readAdmin(c.io())
	if err != nil {
		return &PluginCheckResponse{Error: err}
	}
	return &PluginCheckResponse{AuthorizedSigners: [][]byte{admin}, Recipient: msg.Address}
}

// DeliverRegisterAsset() lists a new asset: assigns the next id, indexes the symbol and charges the fee
func (c *Contract) DeliverRegisterAsset(msg *MessageRegisterAsset, fee uint64, memo string) *PluginDeliverResponse {
	if err := ValidateRegisterAsset(msg); err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	s := c.io()
	admin, err := readAdmin(s)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	adminKey, poolKey := KeyForAccount(admin), KeyForFeePool(c.Config.ChainId)
	vals, err := s.Read(KeyForRegistryMeta(), KeyForSymbol(msg.Symbol), adminKey, poolKey)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	if len(vals[1]) > 0 {
		return &PluginDeliverResponse{Error: ErrSymbolTaken()}
	}
	meta := new(RegistryMeta)
	if err = Unmarshal(vals[0], meta); err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	if meta.AssetCount == math.MaxUint64 {
		return &PluginDeliverResponse{Error: ErrRegistryFull()}
	}
	meta.AssetCount++
	asset := &Asset{
		Id: meta.AssetCount, Symbol: msg.Symbol, Class: msg.Class,
		Issuer: msg.Issuer, GatePolicy: msg.GatePolicy, Tier: msg.Tier,
	}
	assetBz, err := Marshal(asset)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	metaBz, err := Marshal(meta)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	sets, deletes, err := c.feeOps(admin, vals[2], vals[3], fee, memo)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	sets = append(sets,
		&PluginSetOp{Key: KeyForAsset(asset.Id), Value: assetBz},
		&PluginSetOp{Key: KeyForSymbol(asset.Symbol), Value: formatUint64(asset.Id)},
		&PluginSetOp{Key: KeyForRegistryMeta(), Value: metaBz},
	)
	event, err := newEvent("asset_registered", &EventAssetRegistered{
		AssetId: asset.Id, Symbol: asset.Symbol, Class: asset.Class,
		Issuer: asset.Issuer, GatePolicy: asset.GatePolicy, Tier: asset.Tier,
	}, asset.Issuer)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	if err = s.Write(sets, deletes); err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	return &PluginDeliverResponse{Events: []*Event{event}}
}

// DeliverSetGate() adds or revokes an allowlist entry and charges the fee
func (c *Contract) DeliverSetGate(msg *MessageSetGate, fee uint64, memo string) *PluginDeliverResponse {
	if err := ValidateSetGate(msg); err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	s := c.io()
	admin, err := readAdmin(s)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	adminKey, poolKey, gateKey := KeyForAccount(admin), KeyForFeePool(c.Config.ChainId), KeyForGate(msg.AssetId, msg.Address)
	vals, err := s.Read(KeyForAsset(msg.AssetId), gateKey, adminKey, poolKey)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	// the cUSD allowlist (CUSDGateID) has no asset record; every real asset must exist and use an allowlist
	if msg.AssetId != CUSDGateID {
		if len(vals[0]) == 0 {
			return &PluginDeliverResponse{Error: ErrAssetNotFound()}
		}
		asset := new(Asset)
		if err = Unmarshal(vals[0], asset); err != nil {
			return &PluginDeliverResponse{Error: err}
		}
		if asset.GatePolicy != GatePolicy_GATE_POLICY_ALLOWLIST {
			return &PluginDeliverResponse{Error: ErrGateNotAllowlist()}
		}
	}
	sets, deletes, err := c.feeOps(admin, vals[2], vals[3], fee, memo)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	if msg.Allowed {
		sets = append(sets, &PluginSetOp{Key: gateKey, Value: []byte{1}})
	} else if len(vals[1]) > 0 {
		deletes = append(deletes, &PluginDeleteOp{Key: gateKey})
	}
	event, err := newEvent("gate_set", &EventGateSet{AssetId: msg.AssetId, Address: msg.Address, Allowed: msg.Allowed}, msg.Address)
	if err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	if err = s.Write(sets, deletes); err != nil {
		return &PluginDeliverResponse{Error: err}
	}
	return &PluginDeliverResponse{Events: []*Event{event}}
}

// feeOps() builds the write ops that debit `fee` from the payer and credit the fee pool.
// payerBz / poolBz are the current stored values (nil when absent).
func (c *Contract) feeOps(payer, payerBz, poolBz []byte, fee uint64, memo string) (sets []*PluginSetOp, deletes []*PluginDeleteOp, err *PluginError) {
	acc, pool := new(Account), new(Pool)
	if err = Unmarshal(payerBz, acc); err != nil {
		return
	}
	if err = Unmarshal(poolBz, pool); err != nil {
		return
	}
	if acc.Amount < fee {
		return nil, nil, ErrInsufficientFunds()
	}
	if pool.Amount > math.MaxUint64-fee {
		return nil, nil, ErrInvalidAmount()
	}
	acc.Amount -= fee
	pool.Amount += fee
	poolOut, err := Marshal(pool)
	if err != nil {
		return nil, nil, err
	}
	sets = append(sets, &PluginSetOp{Key: KeyForFeePool(c.Config.ChainId), Value: poolOut})
	payerKey := KeyForAccount(payer)
	// retain a drained account only when it carries nonce state or core will advance the nonce after RLP.V2 delivery
	if acc.Amount == 0 && acc.Nonce == 0 && memo != rlpV2Memo {
		deletes = append(deletes, &PluginDeleteOp{Key: payerKey})
		return
	}
	accOut, err := Marshal(acc)
	if err != nil {
		return nil, nil, err
	}
	sets = append(sets, &PluginSetOp{Key: payerKey, Value: accOut})
	return
}

// newEvent() wraps a custom event payload in the Event envelope
func newEvent(eventType string, payload proto.Message, addr []byte) (*Event, *PluginError) {
	a, e := anypb.New(payload)
	if e != nil {
		return nil, ErrFromAny(e)
	}
	return &Event{
		EventType: eventType,
		Msg:       &Event_Custom{Custom: &EventCustom{Msg: a}},
		Address:   bytes.Clone(addr),
	}, nil
}
