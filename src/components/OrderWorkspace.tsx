"use client";

import { useState, useCallback, useMemo } from "react";
import { CatalogItem, Order } from "@/lib/types";
import { LineItemsPanel } from "./LineItemsPanel";
import { QuotePanel, ResolvedItem } from "./QuotePanel";

export function OrderWorkspace({ order }: { order: Order }) {
  const [resolutions, setResolutions] = useState<Record<string, CatalogItem>>(
    () => {
      const initial: Record<string, CatalogItem> = {};
      for (const item of order.lineItems) {
        if (
          item.matchStatus === "confirmed" &&
          item.matchedCatalogItems.length > 0
        ) {
          initial[item.id] = item.matchedCatalogItems[0];
        }
      }
      return initial;
    }
  );

  const handleResolve = useCallback(
    (lineItemId: string, catalogItem: CatalogItem) => {
      setResolutions((prev) => ({ ...prev, [lineItemId]: catalogItem }));
    },
    []
  );

  const resolvedCount = Object.keys(resolutions).length;
  const totalCount = order.lineItems.length;

  const allResolved = resolvedCount === totalCount;

  const resolvedItems: ResolvedItem[] = useMemo(
    () =>
      order.lineItems
        .sort((a, b) => a.lineNumber - b.lineNumber)
        .filter((item) => resolutions[item.id])
        .map((item) => ({
          lineItem: item,
          catalogItem: resolutions[item.id],
        })),
    [order.lineItems, resolutions]
  );

  return (
    <div className="space-y-5">
      <div className="border border-border bg-card p-6 shadow-sm">
        <LineItemsPanel
          items={order.lineItems}
          resolutions={resolutions}
          onResolve={handleResolve}
        />
      </div>

      {!allResolved && (
        <div className="flex items-center gap-4 border border-border bg-card px-5 py-3.5 shadow-sm">
          <div className="h-1.5 flex-1 overflow-hidden bg-muted">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${(resolvedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-[12px] font-medium text-muted-foreground">
            {resolvedCount} of {totalCount} resolved
          </span>
        </div>
      )}

      {allResolved && (
        <QuotePanel order={order} resolvedItems={resolvedItems} />
      )}
    </div>
  );
}
