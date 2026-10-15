"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

export function QueryCard({
  title,
  subtitle,
  query,
  render,
}: {
  title: string;
  subtitle: string;
  query: UseQueryResult<any, Error>;
  render: (data: any) => ReactNode;
}) {
  return (
    <section className="glass-card p-5 space-y-4 animate-fade-up opacity-0">
      <div className="border-b border-zinc-800 pb-3">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
        <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
      </div>
      {query.isLoading && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          Reading from node…
        </div>
      )}
      {query.isError && (
        <div className="text-xs text-amber-300/90 border border-amber-500/20 bg-amber-500/5 rounded-md p-3">
          <span className="font-semibold">Live reads unavailable.</span>
          <br />
          <span className="text-amber-400/70">Plugin query routes (/v1/query/*) are a pending protocol increment. Writes remain available in Admin.</span>
        </div>
      )}
      {query.data != null && <div className="animate-fade-up opacity-0">{render(query.data)}</div>}
    </section>
  );
}
