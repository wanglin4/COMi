"use client";

import { useWalletStore } from "@/store/walletStore";
import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50";

// Protocol rules mirrored from plugin/go README + registry.go ValidateRegisterAsset
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

function validateGate(assetId: string, address: string): string | null {
  if (!assetId || isNaN(Number(assetId)) || Number(assetId) < 1) return "Asset ID must be a positive integer.";
  if (!HEX40.test(address)) return "Address must be a 20-byte hex address (40 hex chars).";
  return null;
}

export default function AdminPage() {
  const isAuthority = useWalletStore((s) => s.isAuthority);
  const ethAddress = useWalletStore((s) => s.ethAddress);

  const [symbol, setSymbol] = useState("");
  const [assetClass, setAssetClass] = useState<1 | 2>(1);
  const [issuer, setIssuer] = useState("");
  const [gatePolicy, setGatePolicy] = useState<1 | 3>(1);
  const [tier, setTier] = useState<1 | 2>(2);
  const [regError, setRegError] = useState<string | null>(null);

  const [gateAssetId, setGateAssetId] = useState("");
  const [gateAddress, setGateAddress] = useState("");
  const [gateAllowed, setGateAllowed] = useState(true);
  const [gateError, setGateError] = useState<string | null>(null);

  const [payload, setPayload] = useState<string | null>(null);

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

  const buildRegister = () => {
    const sym = symbol.toUpperCase();
    const err = validateRegister(sym, issuer, tier, gatePolicy);
    setRegError(err);
    if (err) return;
    setPayload(
      JSON.stringify(
        {
          message_type: "register_asset",
          type_url: "type.googleapis.com/types.MessageRegisterAsset",
          msg: {
            symbol: sym,
            class: assetClass,
            issuer: "0x" + issuer.toLowerCase(),
            gate_policy: gatePolicy,
            tier: tier,
          },
          signer: ethAddress,
        },
        null,
        2
      )
    );
  };

  const buildGate = () => {
    const err = validateGate(gateAssetId, gateAddress);
    setGateError(err);
    if (err) return;
    setPayload(
      JSON.stringify(
        {
          message_type: "set_gate",
          type_url: "type.googleapis.com/types.MessageSetGate",
          msg: {
            asset_id: Number(gateAssetId),
            address: "0x" + gateAddress.toLowerCase(),
            allowed: gateAllowed,
          },
          signer: ethAddress,
        },
        null,
        2
      )
    );
  };

  return (
    <main className="mx-auto max-w-3xl p-4 pt-24 pb-24 space-y-6">
      <div className="animate-fade-up opacity-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          Admin Console
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Asset registry & gate management. Payloads match comi.proto; signing/submission lands with the tx-layer step.
        </p>
      </div>

      <section className="glass-card p-6 space-y-4 animate-fade-up opacity-0 delay-100">
        <h2 className="font-semibold text-emerald-300">Register Asset</h2>
        <input className={inputCls} placeholder="Symbol (A-Z, 2-12 chars)" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        <div className="flex gap-3">
          <select className={inputCls} value={assetClass} onChange={(e) => setAssetClass(Number(e.target.value) as 1 | 2)}>
            <option value={1}>Class: RWA</option>
            <option value={2}>Class: BOND</option>
            <option value={3} disabled>Class: SYNTH (phase 2)</option>
          </select>
          <select className={inputCls} value={tier} onChange={(e) => setTier(Number(e.target.value) as 1 | 2)}>
            <option value={1}>Tier 1 (collateral-eligible)</option>
            <option value={2}>Tier 2 (listed only)</option>
          </select>
        </div>
        <input className={inputCls} placeholder="Issuer address (40 hex)" value={issuer} onChange={(e) => setIssuer(e.target.value)} />
        <select className={inputCls} value={gatePolicy} onChange={(e) => setGatePolicy(Number(e.target.value) as 1 | 3)}>
          <option value={1}>Gate: ALLOWLIST</option>
          <option value={3}>Gate: OPEN</option>
          <option value={2} disabled>Gate: ATTESTER (phase 2)</option>
        </select>
        {regError && <p className="text-xs text-red-400">{regError}</p>}
        <button onClick={buildRegister} className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
          Preview transaction
        </button>
      </section>

      <section className="glass-card p-6 space-y-4 animate-fade-up opacity-0 delay-200">
        <h2 className="font-semibold text-indigo-300">Set Gate</h2>
        <input className={inputCls} placeholder="Asset ID" value={gateAssetId} onChange={(e) => setGateAssetId(e.target.value)} />
        <input className={inputCls} placeholder="Address (40 hex)" value={gateAddress} onChange={(e) => setGateAddress(e.target.value)} />
        <select className={inputCls} value={gateAllowed ? "allow" : "revoke"} onChange={(e) => setGateAllowed(e.target.value === "allow")}>
          <option value="allow">Allow</option>
          <option value="revoke">Revoke</option>
        </select>
        {gateError && <p className="text-xs text-red-400">{gateError}</p>}
        <button onClick={buildGate} className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
          Preview transaction
        </button>
      </section>

      {payload && (
        <pre className="glass-card p-4 text-xs overflow-x-auto text-gray-300 animate-fade-up opacity-0">{payload}</pre>
      )}
    </main>
  );
}
