"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Order, InventoryStatus } from "@/lib/types";
import type { StageChangeHandler } from "@/components/OrderWorkspace";
import { checkInventory } from "@/lib/bom-data";
import { ArrowRight, Check, Package, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const SKU_TO_PROCUREMENT: Record<string, { id: string; label: string }> = {
  "HB-M10-40": { id: "pi-016", label: "PI-016" },
  "GK-FL-3": { id: "pi-017", label: "PI-017" },
  "SF-3-150": { id: "pi-001", label: "PI-001" },
  "RS-HD-10": { id: "pi-003", label: "PI-003" },
};

interface Props {
  order: Order;
  mode: "active" | "completed";
  onStageChange?: StageChangeHandler;
}

const STATUS_DOT: Record<InventoryStatus["status"], string> = {
  in_stock: "bg-emerald-500",
  low: "bg-amber-500",
  out_of_stock: "bg-red-500",
  custom: "bg-slate-400",
};

const STATUS_LABEL: Record<InventoryStatus["status"], string> = {
  in_stock: "In Stock",
  low: "Low",
  out_of_stock: "Out of Stock",
  custom: "Custom",
};

export function InventoryCheckSection({ order, mode, onStageChange }: Props) {
  const inventory = useMemo(() => {
    if (order.inventoryStatus && order.inventoryStatus.length > 0) {
      return order.inventoryStatus;
    }
    return checkInventory(order.lineItems);
  }, [order.inventoryStatus, order.lineItems]);

  const [sentToProcurement, setSentToProcurement] = useState<Set<string>>(new Set());
  const [advancing, setAdvancing] = useState(false);

  const counts = useMemo(() => {
    const inStock = inventory.filter((i) => i.status === "in_stock").length;
    const low = inventory.filter((i) => i.status === "low").length;
    const outOfStock = inventory.filter((i) => i.status === "out_of_stock").length;
    const custom = inventory.filter((i) => i.status === "custom").length;
    return { inStock, low, outOfStock, custom, total: inventory.length };
  }, [inventory]);

  const needsProcurement = useMemo(
    () => inventory.filter((i) => i.status === "low" || i.status === "out_of_stock"),
    [inventory]
  );

  const handleSendToProcurement = useCallback((sku: string) => {
    setSentToProcurement((prev) => new Set(prev).add(sku));
  }, []);

  const handleContinue = useCallback(async () => {
    setAdvancing(true);
    try {
      if (onStageChange) {
        await onStageChange("quote_draft", { inventoryStatus: inventory });
      }
    } catch {
      setAdvancing(false);
    }
  }, [inventory, onStageChange]);

  if (mode === "completed") {
    return (
      <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-emerald-500/40 bg-emerald-500/10">
          <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
        </div>
        <p className="text-[12px] font-medium text-emerald-700">
          {counts.inStock} in stock, {counts.low + counts.outOfStock} flagged for procurement
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-muted-foreground mb-1">
        Stock levels checked against required quantities. Flag any shortfalls for procurement before building the quote.
      </p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border border-border bg-background shadow-sm px-4 py-3 text-[12px] text-muted-foreground">
        <span>
          <span className="font-medium text-foreground/85">{counts.total}</span> components
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-foreground/85">{counts.inStock}</span> in stock
        </span>
        {counts.low > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-medium text-amber-700">{counts.low}</span> low
          </span>
        )}
        {counts.outOfStock > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="font-medium text-red-700">{counts.outOfStock}</span> out of stock
          </span>
        )}
        {counts.custom > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="font-medium text-foreground/70">{counts.custom}</span> custom
          </span>
        )}
      </div>

      <div className="border border-border bg-background shadow-sm overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Component</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">SKU</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Required</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">In Stock</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Shortfall</th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.catalogSku} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2.5 font-medium text-foreground/85">{item.componentName}</td>
                <td className="px-3 py-2.5 font-mono text-foreground/70">
                  {item.status === "custom" ? "—" : item.catalogSku}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-foreground/70">{item.required}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-foreground/70">
                  {item.status === "custom" ? "—" : item.inStock}
                </td>
                <td className={cn(
                  "px-3 py-2.5 text-right tabular-nums font-medium",
                  item.shortfall > 0 ? "text-red-700" : "text-foreground/70"
                )}>
                  {item.shortfall > 0 ? item.shortfall : "—"}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[item.status])} />
                    <span className={cn(
                      "text-[11px] font-medium",
                      item.status === "in_stock" ? "text-emerald-700" :
                      item.status === "low" ? "text-amber-700" :
                      item.status === "out_of_stock" ? "text-red-700" :
                      "text-muted-foreground"
                    )}>
                      {STATUS_LABEL[item.status]}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {needsProcurement.length > 0 && (
        <div className="space-y-2 border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h4 className="text-[12px] font-semibold text-amber-800">
              Needs Procurement ({needsProcurement.length})
            </h4>
          </div>
          <div className="space-y-2">
            {needsProcurement.map((item) => {
              const isSent = sentToProcurement.has(item.catalogSku);
              return (
                <div key={item.catalogSku} className="flex items-center justify-between border border-border bg-background px-4 py-3">
                  <div>
                    <p className="text-[12px] font-medium text-foreground/85">{item.componentName}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Need: {item.required} · Have: {item.inStock} · Shortfall: {item.shortfall}
                      {item.leadTimeDays && ` · Lead time: ~${item.leadTimeDays} days`}
                    </p>
                  </div>
                  {isSent ? (
                    <Link
                      href="/procurement"
                      className="inline-flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      {SKU_TO_PROCUREMENT[item.catalogSku]
                        ? `Sent — ${SKU_TO_PROCUREMENT[item.catalogSku].label}`
                        : "Flagged"}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendToProcurement(item.catalogSku)}
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-700 transition-colors"
                    >
                      <Package className="h-3 w-3" />
                      Send to Procurement
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={advancing}
        className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {advancing ? "Processing..." : "Continue to Quote Builder"}
        {!advancing && <ArrowRight className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
