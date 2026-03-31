"use client";

import { useState, useMemo, useCallback } from "react";
import { Order, InventoryStatus } from "@/lib/types";
import type { StageChangeHandler } from "@/components/OrderWorkspace";
import { checkInventory } from "@/lib/bom-data";
import { Check, Send, Download, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  order: Order;
  mode: "active" | "completed";
  onStageChange?: StageChangeHandler;
}

interface QuoteRow {
  id: string;
  lineItemId: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  components: Array<{ name: string; sku: string; qty: number; cost: number | null }>;
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function QuoteDraftSection({ order, mode, onStageChange }: Props) {
  const inventory = useMemo(() => {
    if (order.inventoryStatus && order.inventoryStatus.length > 0) return order.inventoryStatus;
    return checkInventory(order.lineItems);
  }, [order.inventoryStatus, order.lineItems]);

  const quoteNumber = `QT-2026-${order.orderNumber.split("-").pop() ?? "0001"}`;

  const [rows, setRows] = useState<QuoteRow[]>(() =>
    order.lineItems.map((li) => {
      const components = (li.bomComponents ?? []).map((c) => ({
        name: c.name,
        sku: c.catalogSku ?? "Custom",
        qty: c.quantity * li.parsedQuantity,
        cost: c.unitCost,
      }));
      const componentCost = components.reduce((sum, c) => sum + (c.cost ?? 0) * c.qty / li.parsedQuantity, 0);
      const unitPrice = li.parsedUnitPrice ?? componentCost;
      return {
        id: li.id,
        lineItemId: li.id,
        name: li.parsedProductName,
        sku: li.parsedSku ?? "—",
        qty: li.parsedQuantity,
        unitPrice,
        components,
      };
    })
  );

  const [markupPct, setMarkupPct] = useState(15);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const subtotal = useMemo(
    () => rows.reduce((sum, r) => sum + r.qty * r.unitPrice, 0),
    [rows]
  );
  const markupAmount = subtotal * markupPct / 100;
  const total = subtotal + markupAmount;

  const maxLeadTime = useMemo(() => {
    const leads = inventory.filter((i) => i.leadTimeDays).map((i) => i.leadTimeDays!);
    return leads.length > 0 ? Math.max(...leads) : 0;
  }, [inventory]);

  const counts = useMemo(() => {
    const inStock = inventory.filter((i) => i.status === "in_stock").length;
    const low = inventory.filter((i) => i.status === "low" || i.status === "out_of_stock").length;
    const custom = inventory.filter((i) => i.status === "custom").length;
    return { inStock, low, custom };
  }, [inventory]);

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const updateRow = useCallback((id: string, patch: Partial<QuoteRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const handleSendQuote = useCallback(async () => {
    setSending(true);
    try {
      const quoteSummary = {
        quoteNumber,
        items: rows.map((r) => ({
          sku: r.sku,
          name: r.name,
          qty: r.qty,
          unitPrice: r.unitPrice,
        })),
        subtotal: total,
        sentAt: new Date().toISOString(),
        sentTo: order.customer.email,
      };
      setSent(true);
      if (onStageChange) {
        const demoFlow = order.demoFlow
          ? { ...order.demoFlow, quoteSummary }
          : { scenario: "dynamic" as const, stage: "rfq_received" as const, quoteSummary };
        setTimeout(() => onStageChange("quote_sent", { demoFlow }), 800);
      }
    } catch {
      setSending(false);
    }
  }, [order, quoteNumber, rows, total, onStageChange]);

  if (mode === "completed") {
    return (
      <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-emerald-500/40 bg-emerald-500/10">
          <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
        </div>
        <p className="text-[12px] font-medium text-emerald-700">
          {quoteNumber} — {rows.length} items, ${fmt(total)} — prepared for {order.customer.company}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">
            Draft Quote — {quoteNumber}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Built from BOM and inventory data — review before sending
          </p>
        </div>
      </div>

      <div className="border border-border bg-background shadow-sm overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px]">
            <span className="text-muted-foreground">
              To: <span className="font-medium text-foreground/85">{order.customer.email}</span>
            </span>
            <span className="text-muted-foreground">
              Company: <span className="font-medium text-foreground/85">{order.customer.company}</span>
            </span>
            {order.paymentTerms && (
              <span className="text-muted-foreground">
                Terms: <span className="font-medium text-foreground/85">{order.paymentTerms ?? "Net 30"}</span>
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground w-8">#</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">SKU</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Unit Price</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isExpanded = expandedRows.has(row.id);
                const hasComponents = row.components.length > 1;
                return (
                  <tr key={row.id} className="border-b border-border last:border-b-0 group">
                    <td className="px-4 py-2.5 text-muted-foreground align-top">{i + 1}</td>
                    <td className="px-3 py-2.5 min-w-[200px] align-top">
                      <div>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => updateRow(row.id, { name: e.target.value })}
                          className="min-w-0 w-full border-0 border-b border-transparent bg-transparent px-1 py-0.5 text-[12px] font-medium text-foreground/85 focus:border-border focus:bg-background/30 focus:outline-none"
                        />
                        {hasComponents && (
                          <button
                            type="button"
                            onClick={() => toggleRow(row.id)}
                            className="mt-1 text-[10px] text-blue-700 hover:underline"
                          >
                            {isExpanded ? "Hide" : "Show"} {row.components.length} components
                          </button>
                        )}
                        {isExpanded && (
                          <div className="mt-2 space-y-0.5 border-l-2 border-blue-500/20 pl-3">
                            {row.components.map((c, ci) => (
                              <div key={ci} className="text-[11px] text-muted-foreground flex items-center gap-2">
                                <span className="font-mono text-[10px]">{c.sku}</span>
                                <span>{c.name}</span>
                                <span className="text-foreground/60">×{c.qty}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-foreground/70 align-top">{row.sku}</td>
                    <td className="px-3 py-2.5 align-top">
                      <input
                        type="number"
                        min={0}
                        value={row.qty}
                        onChange={(e) => updateRow(row.id, { qty: Number(e.target.value) || 0 })}
                        className="w-full min-w-0 border-0 border-b border-transparent bg-transparent px-1 py-0.5 text-[12px] text-right tabular-nums text-foreground/85 focus:border-border focus:bg-background/30 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={row.unitPrice}
                        onChange={(e) => updateRow(row.id, { unitPrice: Number(e.target.value) || 0 })}
                        className="w-full min-w-0 border-0 border-b border-transparent bg-transparent px-1 py-0.5 text-[12px] text-right tabular-nums text-foreground/85 focus:border-border focus:bg-background/30 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground/85 align-top">
                      ${fmt(row.qty * row.unitPrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/20">
                <td colSpan={5} className="px-3 py-2 text-right text-[12px] text-foreground/70">Subtotal</td>
                <td className="px-3 py-2 text-right text-[12px] font-medium text-foreground/85 tabular-nums">${fmt(subtotal)}</td>
              </tr>
              <tr className="bg-muted/20">
                <td colSpan={5} className="px-3 py-2 text-right text-[12px] text-foreground/70">
                  Markup
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={markupPct}
                    onChange={(e) => setMarkupPct(Number(e.target.value) || 0)}
                    className="ml-2 w-14 border border-border bg-background px-1.5 py-0.5 text-[11px] text-right tabular-nums"
                  />
                  %
                </td>
                <td className="px-3 py-2 text-right text-[12px] font-medium text-foreground/85 tabular-nums">${fmt(markupAmount)}</td>
              </tr>
              <tr className="border-t border-border bg-muted/30">
                <td colSpan={5} className="px-3 py-3 text-right text-[13px] font-semibold text-foreground">Total</td>
                <td className="px-3 py-3 text-right text-[14px] font-semibold text-foreground tabular-nums">${fmt(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="border border-border bg-muted/20 p-4 space-y-3">
        <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Availability & Lead Time
        </h4>

        {counts.low === 0 && counts.custom === 0 ? (
          <div className="flex items-center gap-2.5 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[13px] font-medium text-emerald-700">
              All components in stock — ready to ship
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-amber-800">
                Estimated fulfillment: {maxLeadTime > 0 ? `${maxLeadTime} business days` : "TBD"}
              </p>
              <p className="text-[11px] text-amber-700/80 mt-0.5">
                Waiting on {counts.low} component{counts.low !== 1 ? "s" : ""} from procurement
                {counts.custom > 0 && ` + ${counts.custom} custom part${counts.custom !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-[12px]">
          {counts.inStock > 0 && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-foreground/85">{counts.inStock} components in stock</span>
            </div>
          )}
          {counts.low > 0 && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-amber-700">{counts.low} need ordering — est. {maxLeadTime} days</span>
            </div>
          )}
          {counts.custom > 0 && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
              <span className="text-muted-foreground">{counts.custom} custom parts — lead time TBD</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-border pt-3 text-[12px] text-muted-foreground">
          <span>
            Quote valid until: <span className="font-medium text-foreground/85">
              {new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSendQuote}
          disabled={sending || sent}
          className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          {sent ? "Sent" : sending ? "Sending..." : "Send Quote to Customer"}
        </button>
        <p className="text-[11px] text-muted-foreground">
          {rows.length} items · ${fmt(total)} · to {order.customer.email}
        </p>
      </div>
    </div>
  );
}
