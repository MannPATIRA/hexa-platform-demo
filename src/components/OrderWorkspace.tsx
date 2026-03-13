"use client";

import { useState, useCallback, useMemo } from "react";
import { CatalogItem, Order } from "@/lib/types";
import { LineItemsPanel } from "./LineItemsPanel";
import { QuotePanel, ResolvedItem } from "./QuotePanel";
import { PoQuoteComparisonPanel } from "./orders/PoQuoteComparisonPanel";
import ShipmentPanel from "./shipping/ShipmentPanel";

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
  const showQuotePanelForFlow =
    order.demoFlow == null ||
    order.demoFlow.scenario === "rfq_csv" ||
    order.demoFlow.scenario === "rfq_handwritten";

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
      <PoQuoteComparisonPanel order={order} />

      <div className="border border-border bg-muted/20 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px] text-muted-foreground">
          <span>
            Parse Confidence:{" "}
            <span className="font-medium text-foreground/85">
              {order.parseConfidence ?? 0}%
            </span>
          </span>
          <span>
            Due Date:{" "}
            <span className="font-medium text-foreground/85">
              {order.dueDate || "Not parsed"}
            </span>
          </span>
          <span>
            Ship Via:{" "}
            <span className="font-medium text-foreground/85">
              {order.shipVia || "Not parsed"}
            </span>
          </span>
          <span>
            Payment Terms:{" "}
            <span className="font-medium text-foreground/85">
              {order.paymentTerms || "Not parsed"}
            </span>
          </span>
        </div>
        {order.parseMissingFields && order.parseMissingFields.length > 0 && (
          <p className="mt-1.5 text-[12px] text-amber-700">
            Missing fields: {order.parseMissingFields.join(", ")}
          </p>
        )}
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

      <div className="border border-border bg-card p-6 shadow-sm">
        <LineItemsPanel
          items={order.lineItems}
          resolutions={resolutions}
          onResolve={handleResolve}
        />
      </div>

      {allResolved && showQuotePanelForFlow && (
        <QuotePanel order={order} resolvedItems={resolvedItems} />
      )}

      <ShipmentPanel order={order} />
    </div>
  );
}
