package contract

/* This file contains COMi's state layout (keys) and a small read/write abstraction over the FSM,
   so the business logic can be unit tested against an in-memory store. */

// Custom state prefixes owned by COMi. They MUST stay outside the core-reserved range (1-15).
// Keys are built with JoinLenPrefix, so the leading segment of every COMi key is exactly one of these.
var (
	assetPrefix  = []byte{100} // asset registry records:   100 / id
	symbolPrefix = []byte{101} // symbol -> asset id index: 101 / symbol
	gatePrefix   = []byte{102} // allowlist entries:        102 / id / address
	metaPrefix   = []byte{103} // singleton records:        103 / "admin" | "count" | "cusd_params" | "price" | "cusd_supply"
	cusdPrefix   = []byte{104} // cUSD balances:            104 / address
	vaultPrefix  = []byte{105} // collateral vaults:        105 / address
)

// CollateralPoolID is the core pool that holds all vault collateral (uCNPY). It sits above core's
// highest derived pool id (lib.DAOPoolID = 131071 = 2*MaxUint16+1), so it can never collide with
// the stake, holding, liquidity, escrow or DAO pools core derives from chain ids.
const CollateralPoolID uint64 = 1 << 20

// CUSDGateID is the gate id of the cUSD allowlist (asset ids start at 1, so 0 is free)
const CUSDGateID uint64 = 0

// CustomStatePrefixes returns the prefixes declared to core at handshake
func CustomStatePrefixes() [][]byte {
	return [][]byte{assetPrefix, symbolPrefix, gatePrefix, metaPrefix, cusdPrefix, vaultPrefix}
}

// KeyForAsset() returns the state key of an asset record
func KeyForAsset(id uint64) []byte { return JoinLenPrefix(assetPrefix, formatUint64(id)) }

// KeyForSymbol() returns the state key of the symbol index entry (value: big-endian asset id)
func KeyForSymbol(symbol string) []byte { return JoinLenPrefix(symbolPrefix, []byte(symbol)) }

// KeyForGate() returns the state key of an allowlist entry (present = allowed)
func KeyForGate(assetId uint64, addr []byte) []byte {
	return JoinLenPrefix(gatePrefix, formatUint64(assetId), addr)
}

// KeyForAdmin() returns the state key of the AdminConfig singleton
func KeyForAdmin() []byte { return JoinLenPrefix(metaPrefix, []byte("admin")) }

// KeyForRegistryMeta() returns the state key of the RegistryMeta singleton
func KeyForRegistryMeta() []byte { return JoinLenPrefix(metaPrefix, []byte("count")) }

// KeyForCUSDParams() returns the state key of the CUSDParams singleton
func KeyForCUSDParams() []byte { return JoinLenPrefix(metaPrefix, []byte("cusd_params")) }

// KeyForPrice() returns the state key of the PriceRecord singleton
func KeyForPrice() []byte { return JoinLenPrefix(metaPrefix, []byte("price")) }

// KeyForCUSDSupply() returns the state key of the CUSDSupply singleton
func KeyForCUSDSupply() []byte { return JoinLenPrefix(metaPrefix, []byte("cusd_supply")) }

// KeyForCUSD() returns the state key of an address's cUSD balance
func KeyForCUSD(addr []byte) []byte { return JoinLenPrefix(cusdPrefix, addr) }

// KeyForVault() returns the state key of an address's vault
func KeyForVault(addr []byte) []byte { return JoinLenPrefix(vaultPrefix, addr) }

// KeyForPool() returns the state key of a core pool
func KeyForPool(id uint64) []byte { return JoinLenPrefix(poolPrefix, formatUint64(id)) }

// batch collects writes for one atomic StateWrite. The last write to a key wins, and ops are
// emitted in first-touch order so the result is deterministic.
type batch struct {
	order []string
	sets  map[string][]byte
	dels  map[string]bool
}

func newBatch() *batch { return &batch{sets: map[string][]byte{}, dels: map[string]bool{}} }

func (b *batch) touch(k string) {
	if _, ok := b.sets[k]; ok {
		return
	}
	if _, ok := b.dels[k]; ok {
		return
	}
	b.order = append(b.order, k)
}

// set() records a write
func (b *batch) set(key, val []byte) {
	k := string(key)
	b.touch(k)
	delete(b.dels, k)
	b.sets[k] = val
}

// del() records a delete
func (b *batch) del(key []byte) {
	k := string(key)
	b.touch(k)
	delete(b.sets, k)
	b.dels[k] = true
}

// flush() applies the batch in one write
func (b *batch) flush(s stateIO) *PluginError {
	var sets []*PluginSetOp
	var dels []*PluginDeleteOp
	for _, k := range b.order {
		if b.dels[k] {
			dels = append(dels, &PluginDeleteOp{Key: []byte(k)})
		} else {
			sets = append(sets, &PluginSetOp{Key: []byte(k), Value: b.sets[k]})
		}
	}
	return s.Write(sets, dels)
}

// stateIO is the minimal state interface the business logic depends on
type stateIO interface {
	// Read returns the value of each key, in order; a missing key yields a nil value
	Read(keys ...[]byte) ([][]byte, *PluginError)
	// Write applies sets and deletes atomically (one StateWrite round trip)
	Write(sets []*PluginSetOp, deletes []*PluginDeleteOp) *PluginError
}

// io() returns the state interface for this contract context
func (c *Contract) io() stateIO {
	if c.st != nil {
		return c.st
	}
	return &fsmState{c: c}
}

// fsmState implements stateIO over the Canopy FSM socket
type fsmState struct{ c *Contract }

// Read() implements stateIO
func (f *fsmState) Read(keys ...[]byte) ([][]byte, *PluginError) {
	if len(keys) == 0 {
		return nil, nil
	}
	reads := make([]*PluginKeyRead, len(keys))
	for i, k := range keys {
		// query ids only need to be unique within the request; index based ids are deterministic
		reads[i] = &PluginKeyRead{QueryId: uint64(i) + 1, Key: k}
	}
	resp, err := f.c.plugin.StateRead(f.c, &PluginStateReadRequest{Keys: reads})
	if err != nil {
		return nil, err
	}
	if resp.Error != nil {
		return nil, resp.Error
	}
	out := make([][]byte, len(keys))
	for _, r := range resp.Results {
		if r.QueryId == 0 || r.QueryId > uint64(len(keys)) || len(r.Entries) == 0 {
			continue
		}
		out[r.QueryId-1] = r.Entries[0].Value
	}
	return out, nil
}

// Write() implements stateIO
func (f *fsmState) Write(sets []*PluginSetOp, deletes []*PluginDeleteOp) *PluginError {
	resp, err := f.c.plugin.StateWrite(f.c, &PluginStateWriteRequest{Sets: sets, Deletes: deletes})
	if err != nil {
		return err
	}
	return resp.Error
}
