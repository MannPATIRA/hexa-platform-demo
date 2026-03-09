"use client";

import { useState, useMemo } from "react";
import { Send, Save, Eye, FileText, Check, Mail, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProcurementItem } from "@/lib/procurement-types";
import {
  getSupplier, getSupplierHistoriesForItem, getDaysOfStockRemaining,
} from "@/data/procurement-data";

interface DraftRFQSectionProps {
  item: ProcurementItem;
  selectedSupplierIds: string[];
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DraftRFQSection({ item, selectedSupplierIds }: DraftRFQSectionProps) {
  const suppliers = useMemo(
    () => selectedSupplierIds.map((id) => getSupplier(id)).filter(Boolean) as NonNullable<ReturnType<typeof getSupplier>>[],
    [selectedSupplierIds]
  );

  const histories = useMemo(() => getSupplierHistoriesForItem(item.id), [item.id]);
  const defaultLeadTime = useMemo(() => {
    const preferred = histories.find((h) => selectedSupplierIds.includes(h.supplierId));
    return preferred?.avgLeadTimeDays ?? histories[0]?.avgLeadTimeDays ?? 14;
  }, [histories, selectedSupplierIds]);

  const daysRemaining = getDaysOfStockRemaining(item);
  const defaultDeliveryDate = useMemo(() => {
    const now = new Date("2026-03-09");
    now.setDate(now.getDate() + (daysRemaining === Infinity ? defaultLeadTime + 7 : Math.max(daysRemaining, defaultLeadTime)));
    return formatDate(now);
  }, [daysRemaining, defaultLeadTime]);

  const defaultQuantity = useMemo(() => {
    if (item.source === "engineering_request") return item.maxStock || 25;
    return Math.max(item.maxStock - item.currentStock, item.reorderPoint);
  }, [item]);

  const [rfqRef] = useState(() => `RFQ-${item.id.replace("pi-", "").toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`);
  const [quantity] = useState(defaultQuantity);
  const [deliveryDate] = useState(defaultDeliveryDate);
  const [rfqStatus, setRfqStatus] = useState<"editing" | "drafted" | "sent">("editing");
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendRFQ = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentAt(new Date().toISOString());
      setRfqStatus("sent");
    }, 1500);
  };

  const supplierName = suppliers.length > 0 ? suppliers[0].name : "—";
  const supplierEmail = suppliers.length > 0 ? suppliers[0].contactEmail : "—";
  const unitPrice = histories.find((h) => selectedSupplierIds.includes(h.supplierId))?.lastUnitPrice ?? histories[0]?.lastUnitPrice ?? 0;
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (selectedSupplierIds.length === 0) {
    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Draft RFQ</h4>
        <div className="flex items-center justify-center border border-dashed border-border py-8">
          <p className="text-[12px] text-muted-foreground">Select a supplier above to generate an RFQ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card shadow-sm">
      {/* Success/status header */}
      {rfqStatus === "sent" ? (
        <div className="flex items-center gap-3 border-b border-emerald-500/20 bg-emerald-500/5 px-6 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-emerald-500/10">
            <Check className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-emerald-800">RFQ Sent</h3>
            <p className="text-[12px] text-emerald-700/70">
              Sent to {supplierName} {sentAt && `at ${new Date(sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Draft RFQ</h3>
            <p className="text-[12px] text-muted-foreground">{rfqRef}</p>
          </div>
          {rfqStatus === "drafted" && (
            <Badge variant="outline" className="ml-auto border-amber-500/30 bg-amber-500/10 text-[11px] font-semibold text-amber-700">
              Draft Saved
            </Badge>
          )}
        </div>
      )}

      <div className="space-y-6 p-6">
        {/* Email preview — matches QuotePanel pattern */}
        <div>
          <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            RFQ Email Preview
          </h4>
          <div className="border border-border bg-card">
            {/* Email headers */}
            <div className="space-y-1.5 border-b border-border px-5 py-3.5">
              <div className="flex items-baseline gap-3 text-[12px]">
                <span className="w-12 shrink-0 text-right text-muted-foreground">To</span>
                <span className="text-foreground/85">{supplierEmail}</span>
              </div>
              <div className="flex items-baseline gap-3 text-[12px]">
                <span className="w-12 shrink-0 text-right text-muted-foreground">From</span>
                <span className="text-foreground/85">procurement@hexamfg.com</span>
              </div>
              <div className="flex items-baseline gap-3 text-[12px]">
                <span className="w-12 shrink-0 text-right text-muted-foreground">Subject</span>
                <span className="font-medium text-foreground/85">{rfqRef} &mdash; {item.name}</span>
              </div>
            </div>

            {/* Email body */}
            <div className="px-5 py-5 text-[12px] leading-relaxed text-foreground/75">
              <p>Dear {supplierName} Team,</p>
              <p className="mt-3">
                We are requesting a quotation for the following item. Please review the details below and provide your best pricing and lead time.
              </p>

              {/* Inline item table */}
              <div className="my-4 border border-border">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">Item</th>
                      <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">SKU</th>
                      <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">Qty</th>
                      <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">Est. Unit Price</th>
                      <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">Est. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-2.5 py-1.5 text-foreground/80">{item.name}</td>
                      <td className="px-2.5 py-1.5 font-mono text-muted-foreground">{item.sku}</td>
                      <td className="px-2.5 py-1.5 text-right text-foreground/70">{quantity.toLocaleString()}</td>
                      <td className="px-2.5 py-1.5 text-right text-foreground/70">${fmt(unitPrice)}</td>
                      <td className="px-2.5 py-1.5 text-right font-medium text-foreground/80">${fmt(unitPrice * quantity)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30">
                      <td colSpan={4} className="px-2.5 py-1.5 text-right font-medium">Estimated Total</td>
                      <td className="px-2.5 py-1.5 text-right font-semibold">${fmt(unitPrice * quantity)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Technical specs if engineering request */}
              {item.technicalSpecs && Object.keys(item.technicalSpecs).length > 0 && (
                <div className="my-4">
                  <p className="font-medium text-foreground/85">Technical Specifications:</p>
                  <div className="mt-1 space-y-0.5">
                    {Object.entries(item.technicalSpecs).filter(([, v]) => v).map(([key, value]) => (
                      <p key={key} className="text-[11px]">
                        <span className="capitalize text-muted-foreground">{key}:</span>{" "}
                        <span className="text-foreground/80">{value}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {item.attachments.length > 0 && (
                <div className="my-4 flex items-center gap-2.5 border border-dashed border-border bg-muted/20 px-3.5 py-3">
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="text-[12px]">
                    <span className="font-medium text-foreground/85">{item.attachments.length} attachment{item.attachments.length > 1 ? "s" : ""}</span>
                    <span className="ml-2 text-muted-foreground">
                      {item.attachments.map((a) => a.fileName).join(", ")}
                    </span>
                  </div>
                </div>
              )}

              <p className="mt-3">
                Requested delivery date: <span className="font-medium text-foreground/85">{formatDisplayDate(deliveryDate)}</span>
              </p>
              <p className="mt-1">
                Payment terms: <span className="font-medium text-foreground/85">Net 30</span>
              </p>
              <p className="mt-1">
                Delivery address: <span className="text-foreground/85">1500 Factory Lane, Dock 4, Milwaukee, WI 53201</span>
              </p>
              <p className="mt-3">This RFQ is valid for 14 days from the date of issue.</p>

              <p className="mt-5">
                Best regards,<br />
                <span className="font-medium text-foreground/85">Hexa Procurement Team</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons — matches QuotePanel pattern */}
        <div className="flex items-center gap-3 pt-1">
          {rfqStatus !== "sent" ? (
            <>
              <button
                onClick={handleSendRFQ}
                disabled={sending}
                className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                    Sending&hellip;
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send RFQ
                  </>
                )}
              </button>
              <button
                onClick={() => setRfqStatus("drafted")}
                className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                <Save className="h-3.5 w-3.5" />
                Save Draft
              </button>
            </>
          ) : (
            <div className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-2.5 text-[13px] font-medium text-white">
              <Check className="h-3.5 w-3.5" />
              RFQ Sent
            </div>
          )}
          <button
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>RFQ Preview</DialogTitle></DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto border border-border bg-card p-5 space-y-4">
            <div className="border-b border-border pb-3">
              <h4 className="text-base font-semibold">Request for Quotation</h4>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{rfqRef} &middot; {formatDisplayDate("2026-03-09")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">From</p>
                <p className="mt-1 font-medium">Hexa Manufacturing Co.</p>
                <p className="text-muted-foreground">procurement@hexamfg.com</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">To</p>
                <p className="mt-1 font-medium">{supplierName}</p>
                <p className="text-muted-foreground">{supplierEmail}</p>
              </div>
            </div>
            <div className="border-t border-border pt-3 text-[12px]">
              <p className="font-medium">{item.name}</p>
              <p className="font-mono text-muted-foreground">{item.sku}</p>
              <p className="mt-1 text-muted-foreground">{item.description}</p>
              <p className="mt-2">Quantity: <span className="font-medium tabular-nums">{quantity.toLocaleString()}</span></p>
              <p>Delivery by: <span className="font-medium">{formatDisplayDate(deliveryDate)}</span></p>
            </div>
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
