# COMi plugin (Go)

Gated asset engine on Canopy: RWA, bonds and (phase 2) synthetics behind one shared gate, with cUSD as the settlement stablecoin.

## Status

| Step | Item | State |
|---|---|---|
| 1 | Scaffold from the official Canopy Go plugin | done |
| 2 | Gate + asset registry (`register_asset`, `set_gate`) | done, unit tested |
| 3 | cUSD: vaults, price, mint/burn/transfer, liquidation | done, unit tested |
| 4 | Tier-one NAV and bond yield (`post_nav`, `fund_yield`, `claim_yield`) | done, unit tested |
| 5 | Trading (`issue_units`, `transfer_units`, `place_order`, `cancel_order`) and the price oracle (`set_oracle`, `report_price`) | done, unit tested |
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
| `issue_units` | `MessageIssueUnits` | asset issuer | mints units of an asset to a gated holder |
| `transfer_units` | `MessageTransferUnits` | sender (gated, both ends) | moves asset units |
| `place_order` | `MessagePlaceOrder` | owner (gated on the asset and on cUSD) | limit order priced in cUSD; matches, then rests any remainder |
| `cancel_order` | `MessageCancelOrder` | owner | cancels a resting order and refunds its escrow (never gated) |
| `set_oracle` | `MessageSetOracle` | admin | sets the price reporters and oracle parameters |
| `report_price` | `MessageReportPrice` | reporter | submits a CNPY price; the oracle price is the median of fresh reports |
| `post_nav` | `MessagePostNav` | admin | posts the NAV of a tier one asset, each update bounded to 50% |
| `fund_yield` | `MessageFundYield` | bond issuer | pays cUSD yield to the bond's current holders, pro rata |
| `claim_yield` | `MessageClaimYield` | holder (gated on the bond and on cUSD) | withdraws the holder's accrued yield as cUSD |

Core does not deduct fees for plugin transactions, so every COMi transaction debits `tx.fee` from the admin and credits the fee pool. The governance `send_fee` is the minimum fee for all types.

## cUSD

Over-collateralized, CNPY-backed. Units: collateral in uCNPY, cUSD in micro-cUSD (1 cUSD = 1,000,000), price in micro-cUSD per 1 CNPY (USD price x 1,000,000). Collateral value is `floor(collateral x price / 1e6)`; every comparison rounds toward solvency.

- Deposited CNPY moves into core pool `CollateralPoolID` (1<<20, above core's highest derived pool id 131071). Total CNPY (accounts + pools) is conserved, and `sum(vault debt) == sum(cUSD balances) == supply total`. Both are asserted after every operation in the tests.
- Parameters have hard limits: mint ratio 150%-1000%, liquidation ratio below the mint ratio and at least 100% + penalty, penalty at most 20%, price move at most 50% per update.
- The price is admin posted. A price older than `max_price_age` blocks mint, withdraw-with-debt and liquidate. Burn and withdraw-without-debt never need a price.
- Exit rights: `vault_withdraw` and `cusd_burn` are never gated, so revoking an address cannot trap funds.
- Liquidation is partial: the liquidator chooses `repay_amount` and receives `floor(repay x (1 + penalty))` of value in collateral. A repay that would seize more than the vault holds is rejected.

Known limits of this step: there is no bad-debt waterfall or reserve fund yet (a vault pushed below 100% keeps residual debt with no collateral), the price has no escape-hatch re-anchor, and there is no redemption queue.

## Tier-one NAV and bond yield

`bond.go`. **NAV**: the admin posts a net asset value (micro-cUSD per unit) for any tier-one asset; after the first post an update may move it by at most 50% (the same hard ceiling as the CNPY price). NAV is a reference value; nothing spends it yet.

**Yield**: only assets of class `BOND` pay yield. The issuer funds a round with `fund_yield`, which moves cUSD into `yieldEscrowAddr` (a protocol address nobody holds a key for, so the cUSD supply invariant still holds) and credits every eligible unit equally. Holders withdraw with `claim_yield`.

- Accounting is a per-unit accumulator (`YieldPool.index`, scaled by 1e18), so neither funding nor claiming iterates over holders. Every balance change settles the holder first (`ledger.settleYield`, called from `ledger.setUnits`, the only writer of holdings), so nobody earns on units they did not hold, and a new holder starts at the current index.
- Eligible units = issued units minus units resting in order escrow. Escrowed units earn nothing while they rest.
- Holders' payouts round down and the issuer's charge rounds up (never above the requested amount), so claims can never exceed what was funded. The sub-micro-cUSD dust stays in yield escrow. A round too small to give any unit a whole micro-cUSD is rejected.
- A seller keeps what it earned before selling, even with a zero balance. A holder revoked from the bond's gate or the cUSD gate cannot claim until re-allowed.
- Asserted in the tests after every operation: escrow equals `funded - claimed`, and everything holders could still claim fits inside it. A randomized test drives issues, transfers, trades, funding and claims and checks each holder was paid at most its exact share.

## Query API

`query.go`. The plugin serves a read-only HTTP API on its RPC address (`rpcAddress`, default `0.0.0.0:50010`), backed by Canopy's `QueryState` at the latest committed state. `GET /v1/query` lists every route; all are GET, none can write.

| Route | Parameters | Returns |
| --- | --- | --- |
| `status` | | build, latest block height, admin, asset and order counts |
| `assets` | `from`, `limit` | a page of the asset registry with units issued |
| `asset` | `id` or `symbol` | asset, units issued and in order escrow, NAV, oracle price, bond yield pool |
| `gate` | `asset_id`, `address` | whether the address passes the gate (`asset_id=0` is the cUSD allowlist) |
| `gates` | `asset_id`, `limit` | allowlisted addresses of an asset |
| `cusd` | | params, CNPY price record with age and freshness, total debt |
| `account` | `address` | CNPY, cUSD, vault with collateral ratio and `liquidatable`, cUSD gate status |
| `holding` | `asset_id`, `address` | balance of one asset and gate status |
| `holdings` | `address`, `from`, `limit` | non-zero balances across the registry |
| `holders` | `asset_id`, `limit` | addresses holding an asset (the order escrow is flagged) |
| `order` | `id` | one resting order |
| `orders` | `owner`, `limit` | an owner's resting orders |
| `book` | `asset_id`, `limit` | best resting orders and price levels per side |
| `oracle` | optional `asset_id` | reporters and reports; with `asset_id`, that asset's trade history and price |
| `nav` | `asset_id` | NAV record of a tier-one asset |
| `yield` | `asset_id`, optional `address` | bond yield pool; with `address`, its claimable yield |

Conventions: uint64 values are decimal **strings** (JSON numbers lose precision above 2^53); small counts such as bps and tier are numbers; addresses and bytes are lowercase hex (a `0x` prefix is accepted in requests); enums are names; a missing record is `null`, a missing asset or order a 404; errors are `{"error", "code"}` with status 400, 404 or 502. Lists take `limit` (default 50, max 200; book depth max 100) and say when they were cut short (`truncated`, or `next` for registry pages). CORS is open (`*`) because everything served is public chain state.

Canopy's query API does not return a block height, so the plugin remembers the latest block it was asked to begin. Until the first block after a restart, `heightKnown` is false and anything that depends on the current height (price freshness, asset oracle price, `liquidatable`) is `null` rather than guessed.

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
| 106 | `106 / asset id / address` | `Holding` (asset unit balance) |
| 107 | `107 / order id` | `Order` |
| 108 | `108 / asset id / side / price key / order id` | order id (price-time book index) |
| 109 | `109 / owner / order id` | `0x01` (orders by owner index) |
| 110 | `110 / reporter` | latest price report |
| 111 | `111 / asset id` | `AssetOracle` (trade history) |
| 112 | `112 / asset id / address` | `YieldAccount` (a holder's yield position in a bond) |

The `103` singletons also include `"units" / id` (`UnitSupply`), `"orders"` (`OrderMeta`), `"oracle"` (`OracleConfig`), `"nav" / id` (`NavRecord`) and `"yield" / id` (`YieldPool`).

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
- Using tier-one assets as cUSD collateral (NAV and the asset oracle exist, but nothing consumes them yet), synthetics (phase 2) and the attester gate.
- Frontend forms for `set_cusd_params`, `post_price`, `set_oracle`, `issue_units`, `transfer_units`, `post_nav`, `fund_yield` and `claim_yield`.
- Bad-debt waterfall, reserve fund and fee accounting (design steps for later).
- No integration test against a running Canopy node yet.
