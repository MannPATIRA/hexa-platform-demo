"use client";

import Link from "next/link";
import { ExternalLink, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataSourceUsed } from "@/data/support-data";

const moduleColors: Record<string, string> = {
  Orders: "text-emerald-700",
  Production: "text-blue-700",
  Logistics: "text-amber-700",
  Inventory: "text-violet-700",
  "Customer History": "text-blue-700",
  "Product Catalog": "text-violet-700",
  "Product Specs": "text-violet-700",
  SOPs: "text-emerald-700",
  "Supplier Records": "text-amber-700",
  "Call Tracker": "text-blue-700",
};

interface DataSourceCardsProps {
  sources: DataSourceUsed[];
}

export default function DataSourceCards({ sources }: DataSourceCardsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <Database size={12} className="text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Grounded data sources
        </span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
          {sources.length}
        </span>
      </div>
      <ul className="divide-y divide-border">
        {sources.map((source) => {
          const color = moduleColors[source.module] ?? "text-muted-foreground";
          const Wrapper: React.ElementType = source.link ? Link : "div";
          const wrapperProps = source.link
            ? { href: source.link }
            : ({} as Record<string, never>);

          return (
            <li key={source.module + source.summary}>
              <Wrapper
                {...wrapperProps}
                className={cn(
                  "flex items-start gap-2 px-4 py-2.5 text-left",
                  source.link
                    ? "transition-colors hover:bg-muted/30"
                    : "",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-semibold uppercase tracking-wide w-24",
                    color,
                  )}
                >
                  {source.module}
                </span>
                <span className="min-w-0 flex-1 text-[11px] leading-snug text-foreground/75">
                  {source.summary}
                </span>
                {source.link && (
                  <ExternalLink
                    size={10}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                )}
              </Wrapper>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
