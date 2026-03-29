"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderStage } from "@/lib/types";

interface PipelineStep {
  stage: OrderStage;
  label: string;
  color: string;
  activeText: string;
}

const STANDARD_PIPELINE: PipelineStep[] = [
  { stage: "rfq_received", label: "RFQ", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "quote_sent", label: "Quote", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "po_received", label: "PO", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "pushed_to_mrp", label: "MRP", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "shipped", label: "Shipping", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "delivered", label: "Delivered", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
];

const QUOTE_BUILDER_PIPELINE: PipelineStep[] = [
  { stage: "rfq_received", label: "RFQ", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "bom_review", label: "BOM", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "inventory_check", label: "Inventory", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "quote_draft", label: "Quote", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "po_received", label: "PO", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "pushed_to_mrp", label: "MRP", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "shipped", label: "Shipping", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
  { stage: "delivered", label: "Delivered", color: "border-blue-500 bg-blue-500 text-white", activeText: "text-blue-700" },
];

const STAGE_TO_PIPELINE_INDEX: Record<string, string> = {
  rfq_received: "rfq_received",
  needs_clarification: "rfq_received",
  clarification_requested: "rfq_received",
  clarification_received: "rfq_received",
  bom_review: "bom_review",
  inventory_check: "inventory_check",
  quote_draft: "quote_draft",
  quote_sent: "quote_sent",
  quote_prepared: "quote_sent",
  po_received: "po_received",
  po_validated: "po_received",
  po_mismatch: "po_received",
  pushed_to_mrp: "pushed_to_mrp",
  shipped: "shipped",
  delivered: "delivered",
};

interface Props {
  order: Order;
  onStageChange?: (newStage: OrderStage) => void;
}

export function OrderProcessBar({ order, onStageChange }: Props) {
  const [navigating, setNavigating] = useState<string | null>(null);

  const pipeline = order.orderType === "quote_builder" ? QUOTE_BUILDER_PIPELINE : STANDARD_PIPELINE;
  const mappedStage = STAGE_TO_PIPELINE_INDEX[order.stage] ?? order.stage;
  const currentIdx = pipeline.findIndex((s) => s.stage === mappedStage);

  const handleGoBack = useCallback(async (targetStage: OrderStage) => {
    setNavigating(targetStage);
    try {
      if (onStageChange) {
        await onStageChange(targetStage);
      }
    } finally {
      setNavigating(null);
    }
  }, [onStageChange]);

  return (
    <div className="flex items-center gap-0 border border-border bg-card px-4 py-3 mb-5 overflow-x-auto">
      {pipeline.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isUpcoming = idx > currentIdx;
        const isLast = idx === pipeline.length - 1;
        const isNavigatingHere = navigating === step.stage;

        return (
          <div key={step.stage} className="flex items-center shrink-0">
            {isCompleted ? (
              <button
                type="button"
                onClick={() => handleGoBack(step.stage)}
                disabled={navigating !== null}
                className="flex items-center gap-1.5 group cursor-pointer disabled:cursor-wait"
                title={`Go back to ${step.label}`}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center border border-emerald-500/50 bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  {isNavigatingHere ? (
                    <span className="text-[9px] font-semibold">...</span>
                  ) : (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  )}
                </div>
                <span className="text-[11px] font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors">
                  {step.label}
                </span>
              </button>
            ) : isCurrent ? (
              <div className="flex items-center gap-1.5">
                <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-semibold", step.color)}>
                  {idx + 1}
                </div>
                <span className={cn("text-[11px] font-semibold", step.activeText)}>
                  {step.label}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center border border-border bg-muted text-[10px] font-semibold text-muted-foreground">
                  {idx + 1}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {step.label}
                </span>
              </div>
            )}
            {!isLast && (
              <div
                className={cn(
                  "mx-2.5 h-px w-6 shrink-0",
                  isCompleted ? "bg-emerald-500/40" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
