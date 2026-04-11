"use client";

import type { DataSourceUsed } from "@/data/support-data";
import { cn } from "@/lib/utils";

const moduleColors: Record<string, { bg: string; border: string; label: string }> = {
  Orders:            { bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "text-emerald-700" },
  Production:        { bg: "bg-blue-500/10",    border: "border-blue-500/30",    label: "text-blue-700" },
  Logistics:         { bg: "bg-amber-500/10",   border: "border-amber-500/30",   label: "text-amber-700" },
  Inventory:         { bg: "bg-violet-500/10",   border: "border-violet-500/30",  label: "text-violet-700" },
  "Customer History": { bg: "bg-blue-500/10",    border: "border-blue-500/30",    label: "text-blue-700" },
  "Product Catalog":  { bg: "bg-violet-500/10",  border: "border-violet-500/30",  label: "text-violet-700" },
  "Product Specs":    { bg: "bg-violet-500/10",  border: "border-violet-500/30",  label: "text-violet-700" },
  SOPs:              { bg: "bg-emerald-500/10",  border: "border-emerald-500/30", label: "text-emerald-700" },
  "Supplier Records": { bg: "bg-amber-500/10",  border: "border-amber-500/30",   label: "text-amber-700" },
};

const defaultColor = { bg: "bg-muted/30", border: "border-border", label: "text-muted-foreground" };

interface DataSourceCardsProps {
  sources: DataSourceUsed[];
}

export default function DataSourceCards({ sources }: DataSourceCardsProps) {
  if (sources.length === 0) return null;

  return (
    <div>
      <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Data Sources Used
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {sources.map((source) => {
          const colors = moduleColors[source.module] ?? defaultColor;
          return (
            <div
              key={source.module}
              className={cn("border px-3 py-2.5", colors.bg, colors.border)}
            >
              <p className={cn("text-[11px] font-semibold uppercase tracking-wide", colors.label)}>
                {source.module}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground/70 leading-snug">
                {source.summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
