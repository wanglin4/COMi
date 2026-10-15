"use client";

import { useQuery } from "@tanstack/react-query";
import { rpcPost } from "@/lib/api";
import { QueryCard } from "@/components/QueryCard";


export default function OraclePage() {
  const prices = useQuery({
    queryKey: ["comi", "prices"],
    queryFn: () => rpcPost("/v1/query/prices", {}),
    retry: false,
  });

  return (
    <main className="mx-auto max-w-3xl p-4 pt-28 pb-24 space-y-6">
      <header className="animate-fade-up opacity-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          Oracle & Prices
        </h1>
        <p className="text-sm text-gray-400 mt-1">CNPY price via reporter median; per-asset trade prices via volume-weighted buckets.</p>
      </header>
      <QueryCard
        title="Price feeds"
        subtitle="POST /v1/query/prices"
        query={prices}
        render={(d) => <pre className="text-xs overflow-x-auto text-gray-300">{JSON.stringify(d, null, 2)}</pre>}
      />

    </main>
  );
}
