"use client";

import { useEffect, useState } from "react";

// Temporary diagnostic: show any hydration errors
function DiagnosticBanner() {
  const [error, setError] = useState<string | null>(null);
  const [txBuilderLoaded, setTxBuilderLoaded] = useState(false);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      setError(`JS Error: ${e.message} at ${e.filename}:${e.lineno}`);
      console.error("Caught error:", e.error);
    };
    window.addEventListener("error", handler);

    // Test if txBuilder imports correctly
    import("@/lib/txBuilder")
      .then((m) => {
        console.log("✓ txBuilder loaded:", Object.keys(m));
        setTxBuilderLoaded(true);
      })
      .catch((e) => {
        console.error("✗ txBuilder import failed:", e);
        setError(`txBuilder import failed: ${e.message}`);
      });

    return () => window.removeEventListener("error", handler);
  }, []);

  if (!error) return null;

  return (
    <div style={{
      position: "fixed",
      top: "10px",
      left: "10px",
      right: "10px",
      zIndex: 9999,
      padding: "12px",
      background: error ? "#dc2626" : "#16a34a",
      color: "white",
      borderRadius: "8px",
      fontSize: "12px",
      fontFamily: "monospace",
      wordBreak: "break-word",
    }}>
      {error || "✓ txBuilder loaded successfully"}
    </div>
  );
}


import { useWalletStore } from "@/store/walletStore";
import { buildAndSignTransaction, getAccountNonce, submitTransaction } from "@/lib/txBuilder";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50";

const SYMBOL_RE = /^[A-Z][A-Z0-9]{1,11}$/;
const RESERVED = ["CUSD", "CNPY"];
const HEX40 = /^[0-9a-fA-F]{40}$/;

function validateRegister(symbol: string, issuer: string, tier: number, gatePolicy: number): string | null {
  if (!SYMBOL_RE.test(symbol)) return "Symbol must be 2-12 chars A-Z/0-9, starting with a letter.";
  if (RESERVED.includes(symbol)) return "CUSD and CNPY are reserved symbols.";
  if (!HEX40.test(issuer)) return "Issuer must be a 20-byte hex address (40 hex chars).";
  if (tier !== 1 && tier !== 2) return "Tier must be 1 or 2.";
  if (tier === 1 && gatePolicy === 3) return "Tier-1 assets cannot use an OPEN gate.";
  return null;
}

function validateHex40(addr: string, name: string): string | null {
  if (!HEX40.test(addr)) return `${name} must be a 20-byte hex address (40 hex chars).`;
  return null;
}

function validatePositive(num: string, name: string): string | null {
  const n = Number(num);
  if (!num || isNaN(n) || n < 0 || !Number.isInteger(n)) return `${name} must be a non-negative integer.`;
  return null;
}

export default function AdminPageWrapper() { return <div><DiagnosticBanner /><AdminPageInner /></div>; }

function AdminPageInner() {
  const isAuthority = useWalletStore((s) => s.isAuthority);
  const ethAddress = useWalletStore((s) => s.ethAddress);

  const [activeTab, setActiveTab] = useState<"registry" | "vaults" | "orders" | "oracle">("registry");
  const [payload, setPayload] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Registry state
  const [symbol, setSymbol] = useState("");
  const [assetClass, setAssetClass] = useState<1 | 2>(1);
  const [issuer, setIssuer] = useState("");
  const [gatePolicy, setGatePolicy] = useState<1 | 3>(1);
  const [tier, setTier] = useState<1 | 2>(2);

  // Vault state
  const [vaultOp, setVaultOp] = useState<"deposit" | "withdraw" | "mint" | "burn" | "transfer" | "liquidate">("deposit");
  const [vaultAmount, setVaultAmount] = useState("");
  const [vaultTo, setVaultTo] = useState("");

  // Order state
  const [orderOp, setOrderOp] = useState<"place" | "cancel">("place");
  const [orderAssetId, setOrderAssetId] = useState("");
  const [orderSide, setOrderSide] = useState<1 | 2>(1);
  const [orderPrice, setOrderPrice] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [orderId, setOrderId] = useState("");

  // Oracle state
  const [oracleOp, setOracleOp] = useState<"set" | "report">("report");
  const [oraclePrice, setOraclePrice] = useState("");

  const buildPayload = (messageType: string, msg: any, typeUrl: string) => {
    setPayload(
      JSON.stringify(
        {
          message_type: messageType,
          type_url: typeUrl,
          msg,
          signer: ethAddress,
        },
        null,
        2
      )
    );
  };

  const buildRegister = () => {
    const sym = symbol.toUpperCase();
    const err = validateRegister(sym, issuer, tier, gatePolicy);
    if (err) { alert(err); return; }
    buildPayload("register_asset", {
      symbol: sym,
      class: assetClass,
      issuer: "0x" + issuer.toLowerCase(),
      gate_policy: gatePolicy,
      tier: tier,
    }, "type.googleapis.com/types.MessageRegisterAsset");
  };

  const buildGate = () => {
    const assetId = prompt("Asset ID (0 for cUSD allowlist):");
    if (!assetId) return;
    const addr = prompt("Address (40 hex):");
    if (!addr) return;
    const err = validatePositive(assetId, "Asset ID") || validateHex40(addr, "Address");
    if (err) { alert(err); return; }
    const allow = confirm("Allow? (Cancel for Revoke)");
    buildPayload("set_gate", {
      asset_id: Number(assetId),
      address: "0x" + addr.toLowerCase(),
      allowed: allow,
    }, "type.googleapis.com/types.MessageSetGate");
  };

  const buildVault = () => {
    let msg: any = {};
    let typeUrl = "";
    let err: string | null = null;

    switch (vaultOp) {
      case "deposit":
        err = validatePositive(vaultAmount, "Amount");
        if (err) { alert(err); return; }
        msg = { amount: Number(vaultAmount) };
        typeUrl = "type.googleapis.com/types.MessageVaultDeposit";
        break;
      case "withdraw":
        err = validatePositive(vaultAmount, "Amount");
        if (err) { alert(err); return; }
        msg = { amount: Number(vaultAmount) };
        typeUrl = "type.googleapis.com/types.MessageVaultWithdraw";
        break;
      case "mint":
        err = validatePositive(vaultAmount, "Amount");
        if (err) { alert(err); return; }
        msg = { amount: Number(vaultAmount) };
        typeUrl = "type.googleapis.com/types.MessageCUSDMint";
        break;
      case "burn":
        err = validatePositive(vaultAmount, "Amount");
        if (err) { alert(err); return; }
        msg = { amount: Number(vaultAmount) };
        typeUrl = "type.googleapis.com/types.MessageCUSDBurn";
        break;
      case "transfer":
        err = validatePositive(vaultAmount, "Amount") || validateHex40(vaultTo, "Recipient");
        if (err) { alert(err); return; }
        msg = { to_address: "0x" + vaultTo.toLowerCase(), amount: Number(vaultAmount) };
        typeUrl = "type.googleapis.com/types.MessageCUSDTransfer";
        break;
      case "liquidate":
        err = validatePositive(vaultAmount, "Repay Amount") || validateHex40(vaultTo, "Vault Owner");
        if (err) { alert(err); return; }
        msg = { vault_owner: "0x" + vaultTo.toLowerCase(), repay_amount: Number(vaultAmount) };
        typeUrl = "type.googleapis.com/types.MessageLiquidate";
        break;
    }

    buildPayload(vaultOp === "deposit" ? "vault_deposit" : 
                 vaultOp === "withdraw" ? "vault_withdraw" :
                 vaultOp === "mint" ? "cusd_mint" :
                 vaultOp === "burn" ? "cusd_burn" :
                 vaultOp === "transfer" ? "cusd_transfer" : "liquidate",
      msg, typeUrl);
  };

  const buildOrder = () => {
    if (orderOp === "place") {
      const err = validatePositive(orderAssetId, "Asset ID") || 
                  validatePositive(orderPrice, "Price") ||
                  validatePositive(orderAmount, "Amount");
      if (err) { alert(err); return; }
      buildPayload("place_order", {
        asset_id: Number(orderAssetId),
        owner: ethAddress,
        side: orderSide,
        price: Number(orderPrice),
        amount: Number(orderAmount),
      }, "type.googleapis.com/types.MessagePlaceOrder");
    } else {
      const err = validatePositive(orderId, "Order ID");
      if (err) { alert(err); return; }
      buildPayload("cancel_order", {
        owner: ethAddress,
        order_id: Number(orderId),
      }, "type.googleapis.com/types.MessageCancelOrder");
    }
  };

  const buildOracle = () => {
    if (oracleOp === "report") {
      const err = validatePositive(oraclePrice, "Price");
      if (err) { alert(err); return; }
      buildPayload("report_price", {
        reporter: ethAddress,
        price: Number(oraclePrice),
      }, "type.googleapis.com/types.MessageReportPrice");
    } else {
      alert("set_oracle requires admin privileges and reporter list (not yet implemented in UI)");
    }
  };

  const handleSubmit = async () => {
    if (!payload || !ethAddress) return;
    
    setSubmitting(true);
    setSubmitError(null);
    setTxHash(null);
    
    try {
      const txData = JSON.parse(payload);
      const rpcUrl = process.env.NEXT_PUBLIC_NODE_RPC_URL || "http://localhost:8545";
      const nonce = await getAccountNonce(ethAddress, rpcUrl);
      
      const signedTx = await buildAndSignTransaction(
        {
          messageType: txData.message_type,
          msg: txData.msg,
          typeUrl: txData.type_url,
          signer: ethAddress,
          nonce: nonce + 1,
          fee: 10000,
          networkId: 1,
          chainId: 1,
          createdHeight: 0,
        },
        ethAddress,
        window.ethereum
      );
      
      const hash = await submitTransaction(signedTx, rpcUrl);
      setTxHash(hash);
    } catch (e: any) {
      setSubmitError(e.message || "Submission failed. Note: Browser signing requires protocol update to accept EIP-191 signatures.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ethAddress) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-card p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Connect first</h1>
          <p className="text-sm text-gray-400">Connect your wallet on the home page to access the console.</p>
        </div>
      </main>
    );
  }

  if (!isAuthority) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-card p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2 text-red-300">403 — Authority only</h1>
          <p className="text-sm text-gray-400">This console is gated to the protocol authority address.</p>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "registry", label: "Registry & Gate" },
    { id: "vaults", label: "cUSD Vaults" },
    { id: "orders", label: "Order Book" },
    { id: "oracle", label: "Oracle" },
  ];

  return (
    <main className="mx-auto max-w-3xl p-4 pt-28 pb-24 space-y-6">
      <div className="animate-fade-up opacity-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          Admin Console
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Complete protocol surface. Submission requires node keystore or EIP-191 protocol update.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto animate-fade-up opacity-0 delay-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setPayload(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-emerald-500 to-indigo-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "registry" && (
        <section className="glass-card p-6 space-y-4 animate-fade-up opacity-0 delay-200">
          <h2 className="font-semibold text-emerald-300">Register Asset</h2>
          <input className={inputCls} placeholder="Symbol (A-Z, 2-12 chars)" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          <div className="flex gap-3">
            <select className={inputCls} value={assetClass} onChange={(e) => setAssetClass(Number(e.target.value) as 1 | 2)}>
              <option value={1}>Class: RWA</option>
              <option value={2}>Class: BOND</option>
              <option value={3} disabled>Class: SYNTH (phase 2)</option>
            </select>
            <select className={inputCls} value={tier} onChange={(e) => setTier(Number(e.target.value) as 1 | 2)}>
              <option value={1}>Tier 1</option>
              <option value={2}>Tier 2</option>
            </select>
          </div>
          <input className={inputCls} placeholder="Issuer address (40 hex)" value={issuer} onChange={(e) => setIssuer(e.target.value)} />
          <select className={inputCls} value={gatePolicy} onChange={(e) => setGatePolicy(Number(e.target.value) as 1 | 3)}>
            <option value={1}>Gate: ALLOWLIST</option>
            <option value={3}>Gate: OPEN</option>
            <option value={2} disabled>Gate: ATTESTER (phase 2)</option>
          </select>
          <button onClick={buildRegister} className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
            Preview Register Asset
          </button>
          <button onClick={buildGate} className="w-full py-2 px-4 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition">
            Preview Set Gate
          </button>
        </section>
      )}

      {activeTab === "vaults" && (
        <section className="glass-card p-6 space-y-4 animate-fade-up opacity-0 delay-200">
          <h2 className="font-semibold text-indigo-300">cUSD Vault Operations</h2>
          <select className={inputCls} value={vaultOp} onChange={(e) => setVaultOp(e.target.value as any)}>
            <option value="deposit">Vault Deposit (lock uCNPY)</option>
            <option value="withdraw">Vault Withdraw (unlock uCNPY)</option>
            <option value="mint">cUSD Mint (borrow)</option>
            <option value="burn">cUSD Burn (repay)</option>
            <option value="transfer">cUSD Transfer</option>
            <option value="liquidate">Liquidate Vault</option>
          </select>
          <input className={inputCls} placeholder="Amount" value={vaultAmount} onChange={(e) => setVaultAmount(e.target.value)} />
          {(vaultOp === "transfer" || vaultOp === "liquidate") && (
            <input className={inputCls} placeholder={vaultOp === "transfer" ? "Recipient (40 hex)" : "Vault Owner (40 hex)"} value={vaultTo} onChange={(e) => setVaultTo(e.target.value)} />
          )}
          <button onClick={buildVault} className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
            Preview {vaultOp}
          </button>
        </section>
      )}

      {activeTab === "orders" && (
        <section className="glass-card p-6 space-y-4 animate-fade-up opacity-0 delay-200">
          <h2 className="font-semibold text-indigo-300">Order Book</h2>
          <select className={inputCls} value={orderOp} onChange={(e) => setOrderOp(e.target.value as any)}>
            <option value="place">Place Order</option>
            <option value="cancel">Cancel Order</option>
          </select>
          {orderOp === "place" ? (
            <>
              <input className={inputCls} placeholder="Asset ID" value={orderAssetId} onChange={(e) => setOrderAssetId(e.target.value)} />
              <select className={inputCls} value={orderSide} onChange={(e) => setOrderSide(Number(e.target.value) as 1 | 2)}>
                <option value={1}>Side: BUY</option>
                <option value={2}>Side: SELL</option>
              </select>
              <input className={inputCls} placeholder="Price (micro-cUSD per unit)" value={orderPrice} onChange={(e) => setOrderPrice(e.target.value)} />
              <input className={inputCls} placeholder="Amount (units)" value={orderAmount} onChange={(e) => setOrderAmount(e.target.value)} />
            </>
          ) : (
            <input className={inputCls} placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          )}
          <button onClick={buildOrder} className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
            Preview {orderOp === "place" ? "Place Order" : "Cancel Order"}
          </button>
        </section>
      )}

      {activeTab === "oracle" && (
        <section className="glass-card p-6 space-y-4 animate-fade-up opacity-0 delay-200">
          <h2 className="font-semibold text-indigo-300">Oracle</h2>
          <select className={inputCls} value={oracleOp} onChange={(e) => setOracleOp(e.target.value as any)}>
            <option value="report">Report Price (reporter only)</option>
            <option value="set" disabled>Set Oracle (admin only, not yet implemented)</option>
          </select>
          {oracleOp === "report" && (
            <input className={inputCls} placeholder="Price (micro-cUSD per CNPY)" value={oraclePrice} onChange={(e) => setOraclePrice(e.target.value)} />
          )}
          <button onClick={buildOracle} className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
            Preview Report Price
          </button>
        </section>
      )}

      {payload && (
        <div className="space-y-2 animate-fade-up opacity-0">
          <pre className="glass-card p-4 text-xs overflow-x-auto text-gray-300">{payload}</pre>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2 px-4 bg-gradient-to-r from-emerald-600 to-indigo-700 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Signing & Submitting..." : "Sign & Submit Transaction"}
          </button>
          {submitError && <p className="text-xs text-red-400">{submitError}</p>}
          {txHash && (
            <div className="glass-card p-3 text-xs">
              <div className="text-emerald-400 font-semibold mb-1">✓ Transaction Submitted</div>
              <div className="font-mono break-all text-gray-300">{txHash}</div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
