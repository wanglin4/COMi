"use client";

import { useQuery } from "@tanstack/react-query";
import { rpcPost } from "@/lib/api";
import { QueryCard } from "@/components/QueryCard";


export default function AssetsPage() {
  const assets = useQuery({
    queryKey: ["comi", "assets"],
    queryFn: () => rpcPost("/v1/query/assets", {}),
    retry: false,
  });

  return (
    <main className="mx-auto max-w-3xl p-4 pt-28 pb-24 space-y-6">
      <header className="animate-fade-up opacity-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          Asset Registry
        </h1>
        <p className="text-sm text-gray-400 mt-1">Gated RWA and bond listings. Tier 1 = collateral-eligible, Tier 2 = listed only.</p>
      </header>
      <QueryCard
        title="Listed assets"
        subtitle="POST /v1/query/assets"
        query={assets}
        render={(d) => <pre className="text-xs overflow-x-auto text-gray-300">{JSON.stringify(d, null, 2)}</pre>}
      />

    </main>
  );
}
