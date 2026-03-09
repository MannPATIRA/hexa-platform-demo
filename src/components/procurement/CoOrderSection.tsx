"use client";

import { useMemo } from "react";
import { PackagePlus, AlertCircle, Truck, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ProcurementItem } from "@/lib/procurement-types";
import {
  getCoOrderItems,
  getDaysOfStockRemaining,
  getStockColor,
  getSupplier,
  getItemsForSameSupplier,
  getSupplierHistoriesForItem,
} from "@/data/procurement-data";

export default function CoOrderSection({ item }: { item: ProcurementItem }) {
  const coOrderItems = useMemo(() => getCoOrderItems(item.id), [item.id]);

  const moqNote = useMemo(() => {
    const histories = getSupplierHistoriesForItem(item.id);
    const preferred = histories.find((h) => h.supplierId === item.preferredSupplierId);
    if (!preferred || item.currentStock >= item.reorderPoint) return null;
    const orderQty = item.reorderPoint - item.currentStock;
    if (orderQty < preferred.moq) return { qty: orderQty, moq: preferred.moq };
    return null;
  }, [item]);

  const consolidationItems = useMemo(() => {
    const others = getItemsForSameSupplier(item.id, item.preferredSupplierId);
    return others.length >= 1 ? others : null;
  }, [item.id, item.preferredSupplierId]);

  const supplier = getSupplier(item.preferredSupplierId);

  if (coOrderItems.length === 0) {
    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Co-Order Suggestions
        </h4>
        <div className="flex flex-col items-center py-6 text-center">
          <PackagePlus className="h-6 w-6 text-muted-foreground/40" />
          <p className="mt-2 text-[13px] font-medium text-foreground/85">
            No co-order patterns detected yet.
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            This improves as more POs are logged.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Co-Order Suggestions
          </h4>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 cursor-help text-muted-foreground/60" />
            </TooltipTrigger>
            <TooltipContent>
              Items historically ordered alongside {item.name}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-0 divide-y divide-border">
          {coOrderItems.map((co) => {
            const coItem = co.item;
            const days = getDaysOfStockRemaining(coItem);
            const daysColor = getStockColor(days);
            const isSuggested =
              coItem.reorderPoint > 0 &&
              coItem.currentStock <= coItem.reorderPoint * 1.3;

            return (
              <div key={co.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground/85 truncate">
                    {coItem.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground font-mono">
                    {coItem.sku}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-[12px] tabular-nums">
                  <span className="text-foreground/85">{co.coOrderFrequencyPct}%</span>
                  <span className="text-muted-foreground">
                    {coItem.currentStock.toLocaleString()} stock
                  </span>
                  {days !== Infinity && (
                    <span
                      className={cn(
                        "font-medium",
                        daysColor === "red"
                          ? "text-amber-700"
                          : daysColor === "amber"
                            ? "text-amber-600"
                            : "text-emerald-600"
                      )}
                    >
                      {days}d left
                    </span>
                  )}
                  {isSuggested && (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                    >
                      Bundle
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {moqNote && (
          <div className="mt-4 flex items-start gap-2 border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-[12px] text-amber-700">
              <span className="font-medium">MOQ: </span>
              Need {moqNote.qty.toLocaleString()} but MOQ is{" "}
              {moqNote.moq.toLocaleString()}. Consider bundling co-order items.
            </p>
          </div>
        )}

        {consolidationItems && (
          <div className="mt-4 flex items-start gap-2 border border-border bg-muted/20 px-4 py-3">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-[12px] text-foreground/85">
                <span className="font-medium">Consolidate: </span>
                {consolidationItems.length} other item
                {consolidationItems.length > 1 ? "s" : ""} also use{" "}
                {supplier?.name}:
              </p>
              <ul className="mt-1 space-y-0.5">
                {consolidationItems.map((ci) => (
                  <li
                    key={ci.id}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground"
                  >
                    <span className="h-0.5 w-0.5 shrink-0 rounded-full bg-muted-foreground/60" />
                    {ci.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
