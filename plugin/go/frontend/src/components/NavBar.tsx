"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWalletStore } from "@/store/walletStore";
import { Logo } from "@/components/Logo";

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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo className="w-7 h-7" />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-zinc-50">COMi</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">RWA Engine</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthority && (
            <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded px-2 py-0.5">
              Authority
            </span>
          )}
          {ethAddress ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-400 tabular-nums bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                {short(ethAddress)}
              </span>
              <button onClick={disconnect} className="text-xs text-zinc-500 hover:text-zinc-200 transition px-2 py-1">
                Disconnect
              </button>
            </div>
          ) : (
            <span className="text-xs text-zinc-500">Not connected</span>
          )}
        </div>
      </nav>
      
      {/* Mobile nav */}
      <div className="md:hidden border-t border-zinc-800 overflow-x-auto">
        <div className="mx-auto max-w-5xl px-4 py-2 flex gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                pathname === l.href
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
