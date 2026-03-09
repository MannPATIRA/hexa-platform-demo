"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Package, Wrench, Calendar, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
  ProcurementItem,
  ProcurementStatus,
} from "@/lib/procurement-types";
import InventorySection from "./InventorySection";
import SupplierHistorySection from "./SupplierHistorySection";
import CoOrderSection from "./CoOrderSection";
import EngineeringRequestDetails from "./EngineeringRequestDetails";
import OrderQuantitySection from "./OrderQuantitySection";
import DraftRFQSection from "./DraftRFQSection";

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isEngineering = item.source === "engineering_request";
  const SourceIcon = isEngineering ? Wrench : Package;

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
          {/* Header — matches Orders detail page style */}
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

          {/* Content */}
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="space-y-8 px-7 py-7">
              {isEngineering ? (
                <>
                  <EngineeringRequestDetails itemId={item.id} />
                  <SupplierHistorySection
                    itemId={item.id}
                    selectedSupplierIds={selectedSupplierIds}
                    onToggleSupplier={(id) =>
                      setSelectedSupplierIds((prev) =>
                        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
                      )
                    }
                  />
                  <OrderQuantitySection item={item} selectedSupplierIds={selectedSupplierIds} />
                  <DraftRFQSection item={item} selectedSupplierIds={selectedSupplierIds} />
                </>
              ) : (
                <>
                  <InventorySection item={item} />
                  <SupplierHistorySection
                    itemId={item.id}
                    selectedSupplierIds={selectedSupplierIds}
                    onToggleSupplier={(id) =>
                      setSelectedSupplierIds((prev) =>
                        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
                      )
                    }
                  />
                  <CoOrderSection item={item} />
                  <OrderQuantitySection item={item} selectedSupplierIds={selectedSupplierIds} />
                  <DraftRFQSection item={item} selectedSupplierIds={selectedSupplierIds} />
                </>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
