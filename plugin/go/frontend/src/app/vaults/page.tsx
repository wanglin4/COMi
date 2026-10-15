"use client";

import { useQuery } from "@tanstack/react-query";
import { rpcPost } from "@/lib/api";
import { QueryCard } from "@/components/QueryCard";
import { useWalletStore } from "@/store/walletStore";

export default function VaultsPage() {
  const ethAddress = useWalletStore((s) => s.ethAddress);
  const vault = useQuery({
    queryKey: ["comi", "vault", ethAddress],
    queryFn: () => rpcPost("/v1/query/vault", { address: (ethAddress || "").replace(/^0x/, "") }),
    enabled: !!ethAddress,
    retry: false,
  });

  return (
    <main className="mx-auto max-w-3xl p-4 pt-28 pb-24 space-y-6">
      <header className="animate-fade-up opacity-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          cUSD Vaults
        </h1>
        <p className="text-sm text-gray-400 mt-1">Over-collateralized CNPY vaults: collateral, debt, health. Mint ratio 150%+.</p>
      </header>
      <QueryCard
        title="Your vault"
        subtitle="POST /v1/query/vault"
        query={vault}
        render={(d) => <pre className="text-xs overflow-x-auto text-gray-300">{JSON.stringify(d, null, 2)}</pre>}
      />

    </main>
  );
}
