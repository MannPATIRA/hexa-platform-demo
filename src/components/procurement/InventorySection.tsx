"use client";

import { useMemo } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcurementItem } from "@/lib/procurement-types";
import { getDaysOfStockRemaining, getStockColor } from "@/data/procurement-data";

function computeConsumption7d(item: ProcurementItem): number | null {
  if (item.stockHistory.length < 8) return null;
  const recent = item.stockHistory.slice(-8);
  let totalConsumed = 0;
  for (let i = 1; i < recent.length; i++) {
    const drop = recent[i - 1].level - recent[i].level;
    if (drop > 0) totalConsumed += drop;
  }
  return totalConsumed / 7;
}

export default function InventorySection({ item }: { item: ProcurementItem }) {
  const daysRemaining = getDaysOfStockRemaining(item);
  const stockColor = getStockColor(daysRemaining);
  const hasConsumption = item.avgDailyConsumption > 0;
  const stockPct = item.maxStock > 0 ? Math.min(100, (item.currentStock / item.maxStock) * 100) : 0;
  const reorderPct = item.maxStock > 0 ? Math.min(100, (item.reorderPoint / item.maxStock) * 100) : 0;

  const consumption7d = useMemo(() => computeConsumption7d(item), [item]);
  const hasSpike =
    consumption7d !== null &&
    item.avgDailyConsumption90d > 0 &&
    consumption7d > item.avgDailyConsumption90d * 1.3;
  const spikePercent =
    hasSpike && consumption7d !== null && item.avgDailyConsumption90d > 0
      ? Math.round(((consumption7d - item.avgDailyConsumption90d) / item.avgDailyConsumption90d) * 100)
      : 0;

  return (
    <div className="border border-border bg-card p-5 shadow-sm">
      <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Inventory
      </h4>

      <div className="flex items-baseline gap-8">
        <div>
          <p className="text-[11px] text-muted-foreground">Days of stock</p>
          <p className={cn(
            "mt-0.5 text-lg font-semibold tabular-nums",
            daysRemaining <= 7 ? "text-amber-700" : "text-foreground"
          )}>
            {daysRemaining === Infinity ? "—" : daysRemaining}
            {daysRemaining !== Infinity && <span className="ml-1 text-[12px] font-normal text-muted-foreground">days</span>}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Current stock</p>
          <p className="mt-0.5 text-[13px] font-medium tabular-nums text-foreground/85">
            {item.currentStock.toLocaleString()}
            <span className="ml-1 text-muted-foreground font-normal">/ {item.maxStock.toLocaleString()}</span>
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Reorder point</p>
          <p className="mt-0.5 text-[13px] font-medium tabular-nums text-foreground/85">
            {item.reorderPoint.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-3 relative h-1.5 w-full overflow-hidden bg-muted">
        <div
          className={cn(
            "absolute inset-y-0 left-0",
            stockColor === "red" ? "bg-amber-500" : stockColor === "amber" ? "bg-amber-400" : "bg-emerald-500"
          )}
          style={{ width: `${stockPct}%` }}
        />
        {reorderPct > 0 && (
          <div className="absolute top-0 h-full w-px bg-foreground/30" style={{ left: `${reorderPct}%` }} />
        )}
      </div>

      {hasConsumption && (
        <div className="mt-3 flex items-baseline gap-6">
          <div className="flex items-baseline gap-2">
            <p className="text-[11px] text-muted-foreground">Daily avg (30d)</p>
            <p className="text-[13px] font-medium tabular-nums text-foreground/85">
              {item.avgDailyConsumption30d.toFixed(1)}
            </p>
            {item.avgDailyConsumption30d > item.avgDailyConsumption90d && (
              <TrendingUp className="h-3 w-3 text-amber-500" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-[11px] text-muted-foreground">Daily avg (90d)</p>
            <p className="text-[13px] font-medium tabular-nums text-foreground/85">
              {item.avgDailyConsumption90d.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {hasSpike && consumption7d !== null && (
        <div className="mt-3 flex items-center gap-2 border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p className="text-[12px] text-amber-700">
            Consumption spike — {spikePercent}% above baseline
          </p>
        </div>
      )}
    </div>
  );
}
