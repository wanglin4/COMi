"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWalletStore } from "@/store/walletStore";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const BASE_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/assets", label: "Assets" },
  { href: "/vaults", label: "Vaults" },
  { href: "/trade", label: "Trade" },
  { href: "/oracle", label: "Oracle" },
];

export function NavBar() {
  const ethAddress = useWalletStore((s) => s.ethAddress);
  const isAuthority = useWalletStore((s) => s.isAuthority);
  const disconnect = useWalletStore((s) => s.disconnect);
  const pathname = usePathname();

  const links = isAuthority ? [...BASE_LINKS, { href: "/admin", label: "Admin" }] : BASE_LINKS;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2">
        <Link href="/" className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          COMi
        </Link>
        <span className="text-[10px] uppercase tracking-wider text-gray-500">RWA Engine</span>
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
      <div className="mx-auto max-w-3xl px-4 pb-2 flex gap-2 overflow-x-auto">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              pathname === l.href
                ? "bg-gradient-to-r from-emerald-500 to-indigo-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
