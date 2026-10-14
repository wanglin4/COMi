"use client";

import { useWalletStore } from "@/store/walletStore";
import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50";

export default function AdminPage() {
  const isAuthority = useWalletStore((s) => s.isAuthority);
  const ethAddress = useWalletStore((s) => s.ethAddress);

  const [symbol, setSymbol] = useState("");
  const [tier, setTier] = useState<"1" | "2">("2");
  const [gateType, setGateType] = useState<"ALLOWLIST" | "OPEN">("ALLOWLIST");

  const [gateAssetId, setGateAssetId] = useState("");
  const [gateAddress, setGateAddress] = useState("");
  const [gateAllow, setGateAllow] = useState(true);

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
    setPayload(
      JSON.stringify(
        {
          message_type: "register_asset",
          signer: ethAddress,
          symbol: symbol.toUpperCase(),
          tier: Number(tier),
          gate: gateType,
        },
        null,
        2
      )
    );
  };

  const buildGate = () => {
    setPayload(
      JSON.stringify(
        {
          message_type: "set_gate",
          signer: ethAddress,
          asset_id: Number(gateAssetId),
          address: gateAddress,
          allow: gateAllow,
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
          Asset registry & gate management. Signing/submission lands with the next protocol step.
        </p>
      </div>

      <section className="glass-card p-6 space-y-4 animate-fade-up opacity-0 delay-100">
        <h2 className="font-semibold text-emerald-300">Register Asset</h2>
        <input className={inputCls} placeholder="Symbol (A-Z, 2-12 chars)" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        <div className="flex gap-3">
          <select className={inputCls} value={tier} onChange={(e) => setTier(e.target.value as "1" | "2")}>
            <option value="1">Tier 1 (collateral-eligible)</option>
            <option value="2">Tier 2 (listed only)</option>
          </select>
          <select className={inputCls} value={gateType} onChange={(e) => setGateType(e.target.value as "ALLOWLIST" | "OPEN")}>
            <option value="ALLOWLIST">ALLOWLIST gate</option>
            <option value="OPEN">OPEN gate</option>
          </select>
        </div>
        <button onClick={buildRegister} className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
          Preview transaction
        </button>
      </section>

      <section className="glass-card p-6 space-y-4 animate-fade-up opacity-0 delay-200">
        <h2 className="font-semibold text-indigo-300">Set Gate</h2>
        <input className={inputCls} placeholder="Asset ID" value={gateAssetId} onChange={(e) => setGateAssetId(e.target.value)} />
        <input className={inputCls} placeholder="Address (40 hex)" value={gateAddress} onChange={(e) => setGateAddress(e.target.value)} />
        <select className={inputCls} value={gateAllow ? "allow" : "revoke"} onChange={(e) => setGateAllow(e.target.value === "allow")}>
          <option value="allow">Allow</option>
          <option value="revoke">Revoke</option>
        </select>
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
