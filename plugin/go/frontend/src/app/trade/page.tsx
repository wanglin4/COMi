"use client";

import { useQuery } from "@tanstack/react-query";
import { rpcPost } from "@/lib/api";
import { QueryCard } from "@/components/QueryCard";
import { useState } from "react";

export default function TradePage() {
  const [assetId, setAssetId] = useState("1");
  const book = useQuery({
    queryKey: ["comi", "book", assetId],
    queryFn: () => rpcPost("/v1/query/book", { asset_id: Number(assetId) }),
    retry: false,
  });

  return (
    <main className="mx-auto max-w-3xl p-4 pt-28 pb-24 space-y-6">
      <header className="animate-fade-up opacity-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          Order Book
        </h1>
        <p className="text-sm text-gray-400 mt-1">Limit orders with cUSD escrow. Trades print at the resting order price.</p>
      </header>
      <div className="glass-card p-4 animate-fade-up opacity-0">
        <label className="text-xs text-gray-400">Asset ID</label>
        <input
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
        />
      </div>
      <QueryCard
        title="Book depth"
        subtitle="POST /v1/query/book"
        query={book}
        render={(d) => <pre className="text-xs overflow-x-auto text-gray-300">{JSON.stringify(d, null, 2)}</pre>}
      />

    </main>
  );
}
