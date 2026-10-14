"use client";

import Link from "next/link";
import { useWalletStore } from "@/store/walletStore";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function NavBar() {
  const ethAddress = useWalletStore((s) => s.ethAddress);
  const isAuthority = useWalletStore((s) => s.isAuthority);
  const disconnect = useWalletStore((s) => s.disconnect);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          COMi
        </Link>
        {isAuthority && (
          <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition">
            Admin
          </Link>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isAuthority && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-500/40 bg-emerald-500/10 rounded-full px-2 py-0.5">
              Authority
            </span>
          )}
          {ethAddress ? (
            <>
              <span className="font-mono text-xs text-gray-400 tabular-nums">{short(ethAddress)}</span>
              <button onClick={disconnect} className="text-xs text-gray-500 hover:text-gray-200 transition">
                Disconnect
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-500">Not connected</span>
          )}
        </div>
      </nav>
    </header>
  );
}
