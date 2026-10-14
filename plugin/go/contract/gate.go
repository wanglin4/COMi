package contract

/* The gate: ONE shared check that every asset-touching transaction (mint, redeem, transfer, trade,
   claim_yield) calls. Phase 1 supports ALLOWLIST (admin managed) and OPEN. ATTESTER is reserved:
   it plugs in here by implementing Gate, without touching any caller. */

// Gate decides whether an address may hold, transfer or trade an asset
type Gate interface {
	// Allowed reports whether addr passes the gate for the given asset
	Allowed(s stateIO, asset *Asset, addr []byte) (bool, *PluginError)
}

// attesterGateEnabled flips on in phase 2, once attester-signed approvals are implemented
const attesterGateEnabled = false

// gateFor() resolves the Gate implementation for a policy
func gateFor(policy GatePolicy) (Gate, *PluginError) {
	switch policy {
	case GatePolicy_GATE_POLICY_ALLOWLIST:
		return allowlistGate{}, nil
	case GatePolicy_GATE_POLICY_OPEN:
		return openGate{}, nil
	case GatePolicy_GATE_POLICY_ATTESTER:
		if !attesterGateEnabled {
			return nil, ErrInvalidGatePolicy()
		}
	}
	return nil, ErrInvalidGatePolicy()
}

// allowlistGate admits only addresses the admin has explicitly allowed
type allowlistGate struct{}

// Allowed() implements Gate
func (allowlistGate) Allowed(s stateIO, asset *Asset, addr []byte) (bool, *PluginError) {
	if len(addr) != 20 {
		return false, ErrInvalidAddress()
	}
	vals, err := s.Read(KeyForGate(asset.Id, addr))
	if err != nil {
		return false, err
	}
	return len(vals[0]) > 0, nil
}

// openGate admits every valid address
type openGate struct{}

// Allowed() implements Gate
func (openGate) Allowed(_ stateIO, _ *Asset, addr []byte) (bool, *PluginError) {
	if len(addr) != 20 {
		return false, ErrInvalidAddress()
	}
	return true, nil
}

// RequireAllowed() is the single entry point later transaction types call. It loads the asset,
// resolves its gate and returns ErrNotAllowed when addr does not pass.
func RequireAllowed(s stateIO, assetId uint64, addr []byte) *PluginError {
	// gate id 0 is the cUSD allowlist; it has no registry record and is always an allowlist
	if assetId == CUSDGateID {
		ok, err := allowlistGate{}.Allowed(s, &Asset{Id: CUSDGateID}, addr)
		if err != nil {
			return err
		}
		if !ok {
			return ErrNotAllowed()
		}
		return nil
	}
	vals, err := s.Read(KeyForAsset(assetId))
	if err != nil {
		return err
	}
	if len(vals[0]) == 0 {
		return ErrAssetNotFound()
	}
	asset := new(Asset)
	if err = Unmarshal(vals[0], asset); err != nil {
		return err
	}
	gate, err := gateFor(asset.GatePolicy)
	if err != nil {
		return err
	}
	ok, err := gate.Allowed(s, asset, addr)
	if err != nil {
		return err
	}
	if !ok {
		return ErrNotAllowed()
	}
	return nil
}
