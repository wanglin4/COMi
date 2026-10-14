# COMi plugin (Go)

Gated asset engine on Canopy: RWA, bonds and (phase 2) synthetics behind one shared gate, with cUSD as the settlement stablecoin.

## Status

| Step | Item | State |
|---|---|---|
| 1 | Scaffold from the official Canopy Go plugin | done |
| 2 | Gate + asset registry (`register_asset`, `set_gate`) | done, unit tested |
| 3 | cUSD: vaults, price, mint/burn/transfer, liquidation | done, unit tested |
| 4 | Tier-one bond, NAV, `claim_yield` | not started |
| 5 | Trading | not started |
| 6 | Synthetics (phase 2) | rejected by `RegisterAsset` until enabled |

## Transactions

| `message_type` | Message | Signer | Effect |
|---|---|---|---|
| `send` | `MessageSend` | sender | native CNPY transfer (unchanged from upstream) |
| `register_asset` | `MessageRegisterAsset` | admin | lists an asset, assigns the next id, indexes the symbol |
| `set_gate` | `MessageSetGate` | admin | adds or revokes an allowlist entry for an asset (`asset_id` 0 = the cUSD allowlist) |
| `set_cusd_params` | `MessageSetCUSDParams` | admin | sets supply cap and risk parameters |
| `post_price` | `MessagePostPrice` | admin | posts the CNPY price, each update bounded by `max_price_move_bps` |
| `vault_deposit` | `MessageVaultDeposit` | sender (gated) | locks uCNPY into the sender's vault |
| `vault_withdraw` | `MessageVaultWithdraw` | sender | unlocks uCNPY; with debt the vault must stay at the minimum ratio |
| `cusd_mint` | `MessageCUSDMint` | sender (gated) | borrows cUSD against the vault |
| `cusd_burn` | `MessageCUSDBurn` | sender | repays debt from the sender's cUSD |
| `cusd_transfer` | `MessageCUSDTransfer` | sender (gated, both ends) | moves cUSD |
| `liquidate` | `MessageLiquidate` | liquidator (gated) | repays part of an unhealthy vault's debt and seizes collateral plus the penalty |

Core does not deduct fees for plugin transactions, so every COMi transaction debits `tx.fee` from the admin and credits the fee pool. The governance `send_fee` is the minimum fee for all types.

## cUSD

Over-collateralized, CNPY-backed. Units: collateral in uCNPY, cUSD in micro-cUSD (1 cUSD = 1,000,000), price in micro-cUSD per 1 CNPY (USD price x 1,000,000). Collateral value is `floor(collateral x price / 1e6)`; every comparison rounds toward solvency.

- Deposited CNPY moves into core pool `CollateralPoolID` (1<<20, above core's highest derived pool id 131071). Total CNPY (accounts + pools) is conserved, and `sum(vault debt) == sum(cUSD balances) == supply total`. Both are asserted after every operation in the tests.
- Parameters have hard limits: mint ratio 150%-1000%, liquidation ratio below the mint ratio and at least 100% + penalty, penalty at most 20%, price move at most 50% per update.
- The price is admin posted. A price older than `max_price_age` blocks mint, withdraw-with-debt and liquidate. Burn and withdraw-without-debt never need a price.
- Exit rights: `vault_withdraw` and `cusd_burn` are never gated, so revoking an address cannot trap funds.
- Liquidation is partial: the liquidator chooses `repay_amount` and receives `floor(repay x (1 + penalty))` of value in collateral. A repay that would seize more than the vault holds is rejected.

Known limits of this step: there is no bad-debt waterfall or reserve fund yet (a vault pushed below 100% keeps residual debt with no collateral), the price has no escape-hatch re-anchor, and there is no redemption queue.

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
| 103 | `103 / "admin"`, `"count"`, `"cusd_params"`, `"price"`, `"cusd_supply"` | `AdminConfig`, `RegistryMeta`, `CUSDParams`, `PriceRecord`, `CUSDSupply` |
| 104 | `104 / address` | `CUSDAccount` (cUSD balance) |
| 105 | `105 / address` | `Vault` |

## Genesis

Core re-marshals its own `GenesisState` before calling the plugin, so plugin fields cannot live in `genesis.json`. Place `comi_genesis.json` in the plugin data directory (`/tmp/plugin/` by default) before the first start:

```json
{ "admin": "<40 hex chars>" }
```

Genesis fails loudly if the file is missing or the address is not a non-zero 20-byte hex string, so a chain can never start without an admin.

## Build and test

```
make test        # unit tests, in-memory state (works on Termux)
make test-race   # same with the race detector (not supported on android/arm64)
make build   # produces ./go-plugin
```

The binary keeps the name `go-plugin` because Canopy's `pluginctl.sh` and the Dockerfile start it by that name.

## Not yet done

- Admin rotation (`set_admin`) and multi-sig admin.
- Bad-debt waterfall, reserve fund and fee accounting (design steps for later).
- Read-only query RPC (`/v1/query/asset`, gate lookups) via `QueryState`.
- No integration test against a running Canopy node yet.
