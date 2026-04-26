"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { APMatchLine, Currency } from "@/lib/finance-types";
import { formatMoney } from "@/data/finance-data";

interface ThreeWayMatchGridProps {
  lines: APMatchLine[];
  currency: Currency;
  poTotal: number;
  invoiceTotal: number;
  taxAmount?: number;
  freightAmount?: number;
}

export default function ThreeWayMatchGrid({
  lines,
  currency,
  poTotal,
  invoiceTotal,
  taxAmount = 0,
  freightAmount = 0,
}: ThreeWayMatchGridProps) {
  if (lines.length === 0) {
    return (
      <div className="border border-amber-500/40 bg-amber-50 p-5 text-[13px] text-amber-900">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <p className="font-medium">No PO referenced.</p>
            <p className="mt-1 text-[12.5px]">
              The agent could not find a matching PO in the last 90 days. Line-by-line match unavailable —
              held until requester confirms or supplier provides a PO number.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalRowDelta = invoiceTotal - poTotal;

  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            3-way match
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            PO · Invoice · Goods receipt — line by line
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11.5px]">
          <Legend dot="bg-emerald-500" label="Match" />
          <Legend dot="bg-amber-500" label="Tolerance" />
          <Legend dot="bg-red-500" label="Breach" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-[10.5px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pl-5 pr-2 text-left">SKU</th>
              <th className="py-2 pr-2 text-left">Description</th>
              <th className="py-2 pr-2 text-right">PO Qty</th>
              <th className="py-2 pr-2 text-right">Inv Qty</th>
              <th className="py-2 pr-2 text-right">GRN Qty</th>
              <th className="py-2 pr-2 text-right">PO Unit</th>
              <th className="py-2 pr-2 text-right">Inv Unit</th>
              <th className="py-2 pr-5 text-right">Δ</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const qtyMismatch = line.invoiceQty !== line.poQty || line.invoiceQty !== line.receivedQty;
              const priceMismatch = Math.abs(line.invoiceUnitPrice - line.poUnitPrice) > 0.001;
              const priceDelta = (line.invoiceUnitPrice - line.poUnitPrice) * line.invoiceQty;
              const qtyDelta = (line.invoiceQty - line.poQty) * line.poUnitPrice;
              const totalDelta = priceDelta + qtyDelta;

              return (
                <tr
                  key={line.id}
                  className={cn(
                    "border-b border-border/60 last:border-0",
                    !line.matches && "bg-amber-500/5"
                  )}
                >
                  <td className="py-2.5 pl-5 pr-2 font-mono text-[11.5px] text-muted-foreground">
                    {line.sku}
                  </td>
                  <td className="py-2.5 pr-2 text-foreground/85">{line.description}</td>
                  <td className="py-2.5 pr-2 text-right tabular-nums text-muted-foreground">
                    {line.poQty}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-2 text-right tabular-nums",
                      qtyMismatch ? "font-semibold text-amber-700" : "text-foreground/85"
                    )}
                  >
                    {line.invoiceQty}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-2 text-right tabular-nums",
                      line.receivedQty !== line.poQty
                        ? "font-semibold text-red-700"
                        : "text-muted-foreground"
                    )}
                  >
                    {line.receivedQty}
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums text-muted-foreground">
                    {formatMoney(line.poUnitPrice, currency)}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-2 text-right tabular-nums",
                      priceMismatch ? "font-semibold text-amber-700" : "text-foreground/85"
                    )}
                  >
                    {formatMoney(line.invoiceUnitPrice, currency)}
                  </td>
                  <td className="py-2.5 pr-5 text-right tabular-nums">
                    {line.matches ? (
                      <span className="inline-flex items-center justify-end gap-1 text-[11px] text-emerald-700">
                        <CheckCircle2 size={11} />
                        Match
                      </span>
                    ) : (
                      <span className="text-[11.5px] font-semibold text-amber-700">
                        {totalDelta > 0 ? "+" : ""}
                        {formatMoney(totalDelta, currency)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/20 text-[12px]">
              <td colSpan={5} className="py-2.5 pl-5 text-right text-muted-foreground">
                PO total
              </td>
              <td colSpan={2} className="py-2.5 pr-2 text-right tabular-nums text-muted-foreground">
                {formatMoney(poTotal, currency)}
              </td>
              <td className="py-2.5 pr-5 text-right" />
            </tr>
            {taxAmount > 0 && (
              <tr className="text-[12px]">
                <td colSpan={5} className="py-1 pl-5 text-right text-muted-foreground">
                  Tax (invoice)
                </td>
                <td colSpan={2} className="py-1 pr-2 text-right tabular-nums text-muted-foreground">
                  {formatMoney(taxAmount, currency)}
                </td>
                <td className="py-1 pr-5 text-right" />
              </tr>
            )}
            {freightAmount > 0 && (
              <tr className="text-[12px]">
                <td colSpan={5} className="py-1 pl-5 text-right text-muted-foreground">
                  Freight (invoice)
                </td>
                <td colSpan={2} className="py-1 pr-2 text-right tabular-nums text-muted-foreground">
                  {formatMoney(freightAmount, currency)}
                </td>
                <td className="py-1 pr-5 text-right" />
              </tr>
            )}
            <tr
              className={cn(
                "border-t border-border text-[12.5px] font-semibold",
                Math.abs(totalRowDelta) < 0.01 ? "text-foreground" : "text-amber-700"
              )}
            >
              <td colSpan={5} className="py-2.5 pl-5 text-right">
                Invoice total
              </td>
              <td colSpan={2} className="py-2.5 pr-2 text-right tabular-nums">
                {formatMoney(invoiceTotal, currency)}
              </td>
              <td className="py-2.5 pr-5 text-right tabular-nums">
                {Math.abs(totalRowDelta) < 0.01 ? (
                  <span className="text-[11px] text-emerald-700">Balanced</span>
                ) : (
                  <>
                    {totalRowDelta > 0 ? "+" : ""}
                    {formatMoney(totalRowDelta, currency)}
                  </>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
