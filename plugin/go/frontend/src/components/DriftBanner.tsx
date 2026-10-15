"use client";

import { useWalletStore } from "@/store/walletStore";

export function DriftBanner() {
  const drifted = useWalletStore((s) => s.drifted);
  const reconnect = useWalletStore((s) => s.reconnect);
  const isConnecting = useWalletStore((s) => s.isConnecting);

  if (!drifted) return null;

  return (
    <div className="fixed top-24 left-0 right-0 z-40 flex justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-amber-500/40 bg-amber-500/15 backdrop-blur-md p-3 flex items-center gap-3 animate-fade-up">
        <span className="text-amber-300 text-sm flex-1">Wallet account changed. Session is stale.</span>
        <button
          onClick={() => reconnect()}
          disabled={isConnecting}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition disabled:opacity-50"
        >
          {isConnecting ? "Reconnecting…" : "Reconnect"}
        </button>
      </div>
    </div>
  );
}
