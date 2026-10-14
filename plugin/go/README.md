# COMi plugin (Go)

Gated asset engine on Canopy: RWA, bonds and (phase 2) synthetics behind one shared gate, with cUSD as the settlement stablecoin.

## Status

| Step | Item | State |
|---|---|---|
| 1 | Scaffold from the official Canopy Go plugin | done |
| 2 | Gate + asset registry (`register_asset`, `set_gate`) | done, unit tested |
| 3 | cUSD mint/burn against CNPY | not started |
| 4 | Tier-one bond, NAV, `claim_yield` | not started |
| 5 | Trading | not started |
| 6 | Synthetics (phase 2) | rejected by `RegisterAsset` until enabled |

## Transactions

| `message_type` | Message | Signer | Effect |
|---|---|---|---|
| `send` | `MessageSend` | sender | native CNPY transfer (unchanged from upstream) |
| `register_asset` | `MessageRegisterAsset` | admin | lists an asset, assigns the next id, indexes the symbol |
| `set_gate` | `MessageSetGate` | admin | adds or revokes an allowlist entry for an asset |

Core does not deduct fees for plugin transactions, so every COMi transaction debits `tx.fee` from the admin and credits the fee pool. The governance `send_fee` is the minimum fee for all types.

## The gate

`gate.go` is the single check every asset-touching transaction must call: `RequireAllowed(state, assetId, addr)`. Phase 1 implements `ALLOWLIST` (admin managed) and `OPEN`. `ATTESTER` plugs in by implementing the `Gate` interface and flipping `attesterGateEnabled`; no caller changes.

Rules enforced at registration: symbols are 2-12 chars of A-Z/0-9 starting with a letter; `CUSD` and `CNPY` are reserved; tier is 1 (collateral-eligible later) or 2 (listed only); tier-one assets cannot use an `OPEN` gate.

## State layout

All keys are built with `JoinLenPrefix` and use custom prefixes outside core's reserved range (1-15), declared in `CustomStatePrefixes`.

| Prefix | Key | Value |
|---|---|---|
| 100 | `100 / id` | `Asset` |
| 101 | `101 / symbol` | asset id (big-endian uint64) |
| 102 | `102 / id / address` | `0x01` (present = allowed) |
| 103 | `103 / "admin"`, `103 / "count"` | `AdminConfig`, `RegistryMeta` |

## Genesis

Core re-marshals its own `GenesisState` before calling the plugin, so plugin fields cannot live in `genesis.json`. Place `comi_genesis.json` in the plugin data directory (`/tmp/plugin/` by default) before the first start:

```json
{ "admin": "<40 hex chars>" }
```

Genesis fails loudly if the file is missing or the address is not a non-zero 20-byte hex string, so a chain can never start without an admin.

## Build and test

```
make test    # unit tests, in-memory state
make build   # produces ./go-plugin
```

The binary keeps the name `go-plugin` because Canopy's `pluginctl.sh` and the Dockerfile start it by that name.

## Not yet done

- Admin rotation (`set_admin`) and multi-sig admin.
- Read-only query RPC (`/v1/query/asset`, gate lookups) via `QueryState`.
- No integration test against a running Canopy node yet.
