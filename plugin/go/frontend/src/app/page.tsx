"use client";

import { useWalletStore } from "@/store/walletStore";
import { useEffect } from "react";

export default function Home() {
  const { ethAddress, blsAddress, isAuthority, isConnecting, error, connect, silentReconnect, disconnect } = useWalletStore();

  useEffect(() => {
    silentReconnect();
  }, [silentReconnect]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 gap-6">
      <div className="glass-card p-8 w-full max-w-md animate-fade-up opacity-0">
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-indigo-500 bg-clip-text text-transparent">
          COMi Markets
        </h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {!ethAddress ? (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="space-y-4 animate-fade-up opacity-0 delay-100">
            <div className="text-sm text-gray-400">
              <div className="font-medium text-gray-300 mb-1">Entropy Source (ETH)</div>
              <div className="font-mono break-all">{ethAddress}</div>
            </div>
            <div className="text-sm text-gray-400">
              <div className="font-medium text-gray-300 mb-1">Derived BLS Address</div>
              <div className="font-mono break-all">{blsAddress}</div>
            </div>
            
            {isAuthority && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded text-center text-sm font-semibold animate-fade-up opacity-0 delay-200">
                🛡️ Authority Access Granted
              </div>
            )}
            
            <button
              onClick={disconnect}
              className="w-full py-2 px-4 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
