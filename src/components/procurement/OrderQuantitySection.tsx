"use client";

import { useState, useMemo, useEffect } from "react";
import { Calculator, Info, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSupplierHistoriesForItem } from "@/data/procurement-data";
import type { ProcurementItem } from "@/lib/procurement-types";
import { cn } from "@/lib/utils";

const ORDERING_COST = 150;
const HOLDING_COST_PCT = 0.2;

function fmtCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function fmtNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export default function OrderQuantitySection({
  item,
  selectedSupplierIds,
}: {
  item: ProcurementItem;
  selectedSupplierIds: string[];
}) {
  const histories = useMemo(() => getSupplierHistoriesForItem(item.id), [item.id]);

  const activeSupplierData = useMemo(() => {
    const targetId = selectedSupplierIds.length > 0 ? selectedSupplierIds[0] : item.preferredSupplierId;
    return histories.find((h) => h.supplierId === targetId) ?? histories[0];
  }, [histories, selectedSupplierIds, item.preferredSupplierId]);

  const annualDemand = item.avgDailyConsumption * 365;
  const unitPrice = activeSupplierData?.lastUnitPrice ?? 0;
  const holdingCost = unitPrice * HOLDING_COST_PCT;
  const leadTimeDays = activeSupplierData?.avgLeadTimeDays ?? 0;
  const moq = activeSupplierData?.moq ?? 0;

  const eoq = useMemo(() => {
    if (annualDemand <= 0 || holdingCost <= 0) return 0;
    return Math.ceil(Math.sqrt((2 * annualDemand * ORDERING_COST) / holdingCost));
  }, [annualDemand, holdingCost]);

  const reorderQty = useMemo(() => {
    const raw = item.maxStock - item.currentStock + item.avgDailyConsumption * leadTimeDays;
    return Math.max(0, Math.ceil(raw));
  }, [item.maxStock, item.currentStock, item.avgDailyConsumption, leadTimeDays]);

  const suggestedQty = useMemo(() => {
    const base = Math.max(reorderQty, eoq);
    return base < moq ? moq : base;
  }, [reorderQty, eoq, moq]);

  const moqAdjusted = suggestedQty > Math.max(reorderQty, eoq) && moq > 0;

  const [manualQty, setManualQty] = useState<string>(String(suggestedQty));
  useEffect(() => { setManualQty(String(suggestedQty)); }, [suggestedQty]);

  const parsedManualQty = Math.max(0, parseInt(manualQty, 10) || 0);
  const budgetImpact = parsedManualQty * unitPrice;
  const manualBelowMoq = moq > 0 && parsedManualQty < moq;

  if (!activeSupplierData) {
    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Order Quantity
        </h4>
        <div className="flex flex-col items-center gap-1 py-6 text-muted-foreground">
          <Calculator className="h-5 w-5" />
          <p className="text-[11px]">Select a supplier first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Order Quantity
      </h4>

      <TooltipProvider>
        <div className="space-y-4">
          <p className="text-[13px] font-medium text-foreground/85">
            Estimated cost: <span className="tabular-nums text-[12px]">{fmtCurrency(budgetImpact)}</span>
            <span className="ml-1 text-[11px] font-normal text-muted-foreground">
              ({fmtNumber(parsedManualQty)} units × {fmtCurrency(unitPrice)})
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">EOQ</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px]">
                  <p className="font-medium">EOQ = √(2DS / H)</p>
                  <p className="mt-1 text-muted-foreground text-xs">D = annual demand, S = ordering cost, H = holding cost per unit/year</p>
                </TooltipContent>
              </Tooltip>
              <span className="tabular-nums text-[12px] text-foreground">{eoq > 0 ? fmtNumber(eoq) : "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Reorder qty</span>
              <span className="tabular-nums text-[12px] text-foreground">{fmtNumber(reorderQty)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Quantity</span>
              <Input
                type="number"
                min={0}
                value={manualQty}
                onChange={(e) => setManualQty(e.target.value)}
                className={cn(
                  "h-8 w-20 text-[12px] tabular-nums",
                  manualBelowMoq && "border-amber-500"
                )}
              />
              {parsedManualQty !== suggestedQty && (
                <button
                  className="text-[11px] text-primary underline underline-offset-2"
                  onClick={() => setManualQty(String(suggestedQty))}
                >
                  reset
                </button>
              )}
            </div>
          </div>

          {manualBelowMoq && (
            <div className="flex items-center gap-2 border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="text-[12px] text-amber-700">Below MOQ of {fmtNumber(moq)}</p>
            </div>
          )}

          {moqAdjusted && (
            <div className="flex items-center gap-2 border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="text-[12px] text-amber-700">
                Adjusted to MOQ of {fmtNumber(moq)} from {activeSupplierData.supplier.name}
              </p>
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
