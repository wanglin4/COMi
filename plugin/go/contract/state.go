package contract

/* This file contains COMi's state layout (keys) and a small read/write abstraction over the FSM,
   so the business logic can be unit tested against an in-memory store. */

// Custom state prefixes owned by COMi. They MUST stay outside the core-reserved range (1-15).
// Keys are built with JoinLenPrefix, so the leading segment of every COMi key is exactly one of these.
var (
	assetPrefix  = []byte{100} // asset registry records:   100 / id
	symbolPrefix = []byte{101} // symbol -> asset id index: 101 / symbol
	gatePrefix   = []byte{102} // allowlist entries:        102 / id / address
	metaPrefix   = []byte{103} // singleton records:        103 / "admin" | "count"
)

// CustomStatePrefixes returns the prefixes declared to core at handshake
func CustomStatePrefixes() [][]byte {
	return [][]byte{assetPrefix, symbolPrefix, gatePrefix, metaPrefix}
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
