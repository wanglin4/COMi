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
    <section className="glass-card p-6 space-y-3 animate-fade-up opacity-0">
      <div>
        <h2 className="font-semibold text-emerald-300">{title}</h2>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      {query.isLoading && <p className="text-sm text-gray-400">Reading from node…</p>}
      {query.isError && (
        <div className="text-xs text-amber-300 border border-amber-500/30 bg-amber-500/10 rounded-lg p-3">
          Live reads unavailable ({(query.error as Error).message}).
          <br />
          Plugin query routes (/v1/query/*) are a pending protocol increment. Writes remain available in Admin.
        </div>
      )}
      {query.data != null && <div className="animate-fade-up opacity-0">{render(query.data)}</div>}
    </section>
  );
}
