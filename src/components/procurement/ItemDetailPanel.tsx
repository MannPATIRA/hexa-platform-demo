"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Package, Wrench, Calendar, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
  ProcurementItem,
  ProcurementStatus,
} from "@/lib/procurement-types";
import {
  getSupplier,
  getSupplierHistoriesForItem,
  getDaysOfStockRemaining,
  getRecommendedProcurementAction,
  getProcurementRoutingReason,
  isAutoErpMrpItem,
} from "@/data/procurement-data";
import UrgencyBanner from "./UrgencyBanner";
import InventorySection from "./InventorySection";
import StockTrendChart from "./StockTrendChart";
import SupplierComparisonTable from "./SupplierComparisonTable";
import CoOrderSection from "./CoOrderSection";
import OpenPOsSection from "./OpenPOsSection";
import EngineeringRequestDetails from "./EngineeringRequestDetails";
import OrderQuantitySection from "./OrderQuantitySection";
import DraftRFQSection from "./DraftRFQSection";
import ActionBar from "./ActionBar";

const statusLabels: Record<ProcurementStatus, string> = {
  flagged: "Flagged",
  under_review: "Under Review",
  rfq_drafted: "RFQ Drafted",
  rfq_sent: "RFQ Sent",
  po_raised: "PO Raised",
};

const statusBadgeClass: Record<ProcurementStatus, string> = {
  flagged: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  under_review: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  rfq_drafted: "border-border bg-muted/50 text-foreground/70",
  rfq_sent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  po_raised: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
};

interface ItemDetailPanelProps {
  item: ProcurementItem;
  onClose: () => void;
}

export default function ItemDetailPanel({ item, onClose }: ItemDetailPanelProps) {
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(
    item.preferredSupplierId ? [item.preferredSupplierId] : []
  );

  // Stable RFQ reference generated once per panel open
  const [rfqRef] = useState(
    () => `RFQ-${item.id.replace("pi-", "").toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isEngineering = item.source === "engineering_request";
  const SourceIcon = isEngineering ? Wrench : Package;

  const hasOrderHistory = useMemo(() => {
    const histories = getSupplierHistoriesForItem(item.id);
    return histories.some((h) => selectedSupplierIds.includes(h.supplierId) && h.totalOrders12mo > 0);
  }, [item.id, selectedSupplierIds]);
  const recommendedAction = useMemo(() => getRecommendedProcurementAction(item), [item]);
  const routingReason = useMemo(() => getProcurementRoutingReason(item), [item]);
  const isAutoRouted = useMemo(() => isAutoErpMrpItem(item), [item]);

  const handleToggleSupplier = (id: string) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const buildRFQPayload = useCallback(() => {
    if (selectedSupplierIds.length === 0) return;

    const histories = getSupplierHistoriesForItem(item.id);
    const preferred = histories.find((h) => selectedSupplierIds.includes(h.supplierId));
    const leadTime = preferred?.avgLeadTimeDays ?? histories[0]?.avgLeadTimeDays ?? 14;
    const daysRemaining = getDaysOfStockRemaining(item);

    const deliveryDate = (() => {
      const d = new Date("2026-03-09");
      d.setDate(d.getDate() + (daysRemaining === Infinity ? leadTime + 7 : Math.max(daysRemaining, leadTime)));
      return d.toISOString().split("T")[0];
    })();

    const quantity =
      item.source === "engineering_request"
        ? item.maxStock || 25
        : Math.max(item.maxStock - item.currentStock, item.reorderPoint);

    const unitPrice = preferred?.lastUnitPrice ?? histories[0]?.lastUnitPrice ?? 0;
    const supplier = getSupplier(selectedSupplierIds[0]);
    if (!supplier) return;

    return {
      rfqRef,
      itemName: item.name,
      itemSku: item.sku,
      itemDescription: item.description,
      technicalSpecs: item.technicalSpecs,
      attachments: item.attachments,
      supplierName: supplier.name,
      supplierEmail: supplier.contactEmail,
      quantity,
      unitPrice,
      deliveryDate,
    };
  }, [rfqRef, item, selectedSupplierIds]);

  const handleSendRFQ = useCallback(async () => {
    const payload = buildRFQPayload();
    if (!payload) return;

    const res = await fetch("/api/procurement/send-rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to send RFQ");
    }
  }, [buildRFQPayload]);

  const handleSaveRFQDraft = useCallback(async () => {
    const payload = buildRFQPayload();
    if (!payload) return;

    const res = await fetch("/api/procurement/save-rfq-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to save RFQ draft");
    }
  }, [buildRFQPayload]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative z-10 flex h-full w-[85vw] flex-col border-l border-border bg-background shadow-2xl"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex-none border-b border-border bg-card px-7 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-[22px] font-medium leading-none text-foreground">
                    {item.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className={cn("text-[11px] font-semibold", statusBadgeClass[item.status])}
                  >
                    {statusLabels[item.status]}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <SourceIcon className="h-3.5 w-3.5" />
                    {item.sku}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.flaggedAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {isEngineering && item.requestedBy && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Requested by {item.requestedBy}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground/80 leading-relaxed max-w-2xl">
                  {item.description}
                </p>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 rounded-xs p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Urgency Banner */}
          <div className="flex-none px-7 pt-5">
            <UrgencyBanner item={item} />
            {isAutoRouted && recommendedAction && (
              <div className="mt-3 border border-border bg-card px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Automated ERP/MRP Routing
                </p>
                <p className="mt-1 text-[12px] text-foreground/80">
                  Recommended path:{" "}
                  <span className="font-medium">{recommendedAction === "po" ? "Raise PO" : "Send RFQ to new supplier"}</span>
                </p>
                {routingReason && <p className="mt-1 text-[12px] text-muted-foreground">{routingReason}</p>}
              </div>
            )}
          </div>

          {/* Two-Column Content */}
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="px-7 py-5">
              {isEngineering ? (
                <div className="grid grid-cols-5 gap-6">
                  {/* Left column: decision flow */}
                  <div className="col-span-3 space-y-5">
                    <EngineeringRequestDetails itemId={item.id} />
                    <SupplierComparisonTable
                      itemId={item.id}
                      selectedSupplierIds={selectedSupplierIds}
                      onToggleSupplier={handleToggleSupplier}
                    />
                    <OrderQuantitySection item={item} selectedSupplierIds={selectedSupplierIds} />
                    <DraftRFQSection item={item} selectedSupplierIds={selectedSupplierIds} rfqRef={rfqRef} />
                  </div>
                  {/* Right column: context */}
                  <div className="col-span-2 space-y-5">
                    <OpenPOsSection itemId={item.id} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-6">
                  {/* Left column: decision flow */}
                  <div className="col-span-3 space-y-5">
                    <InventorySection item={item} />
                    <SupplierComparisonTable
                      itemId={item.id}
                      selectedSupplierIds={selectedSupplierIds}
                      onToggleSupplier={handleToggleSupplier}
                    />
                    <OrderQuantitySection item={item} selectedSupplierIds={selectedSupplierIds} />
                    <DraftRFQSection item={item} selectedSupplierIds={selectedSupplierIds} rfqRef={rfqRef} />
                  </div>
                  {/* Right column: context */}
                  <div className="col-span-2 space-y-5">
                    <StockTrendChart item={item} />
                    <CoOrderSection item={item} />
                    <OpenPOsSection itemId={item.id} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Sticky Action Bar */}
          <ActionBar
            hasSupplierSelected={selectedSupplierIds.length > 0}
            hasOrderHistory={hasOrderHistory}
            recommendedAction={recommendedAction}
            onClose={onClose}
            onSendRFQ={handleSendRFQ}
            onSaveDraftRFQ={handleSaveRFQDraft}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
