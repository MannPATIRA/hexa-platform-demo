"use client";

import { useState } from "react";
import { Order, LineItem, CatalogItem } from "@/lib/types";
import {
  CheckCircle2,
  Send,
  FileText,
  Table2,
  Mail,
  Paperclip,
  Check,
  Download,
} from "lucide-react";

export interface ResolvedItem {
  lineItem: LineItem;
  catalogItem: CatalogItem;
}

type FormatTab = "email" | "pdf" | "csv";

const FORMAT_TABS: { id: FormatTab; label: string; icon: typeof Mail }[] = [
  { id: "email", label: "In Email", icon: Mail },
  { id: "pdf", label: "PDF Attachment", icon: FileText },
  { id: "csv", label: "CSV Attachment", icon: Table2 },
];

export function QuotePanel({
  order,
  resolvedItems,
}: {
  order: Order;
  resolvedItems: ResolvedItem[];
}) {
  const [activeTab, setActiveTab] = useState<FormatTab>("email");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const customerFirstName = order.customer.name.split(" ")[0];
  const quoteNumber = order.orderNumber.replace("ORD", "Q");
  const defaultSubject = `${quoteNumber} — ${order.customer.company}`;
  const [toEmail, setToEmail] = useState(order.customer.email);
  const [fromEmail, setFromEmail] = useState("sales@hexa-orders.com");
  const [subject, setSubject] = useState(defaultSubject);

  const subtotal = resolvedItems.reduce(
    (sum, { lineItem, catalogItem }) =>
      sum + catalogItem.catalogPrice * lineItem.parsedQuantity,
    0
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 border border-emerald-500/30 bg-card shadow-sm duration-400">
      {/* ── Success header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-emerald-500/20 bg-emerald-500/5 px-6 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-emerald-500/10">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-emerald-800">
            Quote Ready
          </h3>
          <p className="text-[12px] text-emerald-700/70">
            All {resolvedItems.length} items matched and resolved
          </p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* ── Quote summary table ────────────────────────────────────── */}
        <div>
          <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Quote Summary
          </h4>
          <div className="border border-border">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    SKU
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Unit Price
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Line Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {resolvedItems.map(({ lineItem, catalogItem }, i) => (
                  <tr
                    key={lineItem.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-3 py-2 text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2 font-medium text-foreground/85">
                      {catalogItem.catalogName}
                    </td>
                    <td className="px-3 py-2 font-mono text-foreground/70">
                      {catalogItem.catalogSku}
                    </td>
                    <td className="px-3 py-2 text-right text-foreground/70">
                      {lineItem.parsedQuantity} {lineItem.parsedUom}
                    </td>
                    <td className="px-3 py-2 text-right text-foreground/70">
                      ${catalogItem.catalogPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-foreground/85">
                      $
                      {fmt(
                        catalogItem.catalogPrice * lineItem.parsedQuantity
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/30">
                  <td
                    colSpan={5}
                    className="px-3 py-2.5 text-right text-[12px] font-medium text-foreground/70"
                  >
                    Subtotal
                  </td>
                  <td className="px-3 py-2.5 text-right text-[13px] font-semibold text-foreground">
                    ${fmt(subtotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Email template section ─────────────────────────────────── */}
        <div>
          <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Email Preview
          </h4>

          {/* Format tabs */}
          <div className="flex border-b border-border bg-muted/30">
            {FORMAT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`-mb-px flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium transition-colors ${
                    isActive
                      ? "border-b-2 border-foreground bg-card text-foreground"
                      : "text-muted-foreground hover:text-foreground/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Email preview card */}
          <div className="border border-t-0 border-border bg-card">
            {/* Email headers — editable across all 3 format tabs */}
            <div className="space-y-2 border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-3 text-[12px]">
                <label className="w-12 shrink-0 text-right text-muted-foreground">To</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1.5 text-foreground/85 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <label className="w-12 shrink-0 text-right text-muted-foreground">From</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1.5 text-foreground/85 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <label className="w-12 shrink-0 text-right text-muted-foreground">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1.5 font-medium text-foreground/85 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Email body */}
            <div className="px-5 py-5 text-[12px] leading-relaxed text-foreground/75">
              <p>Dear {customerFirstName},</p>

              <p className="mt-3">
                Thank you for your order request ({order.orderNumber}).{" "}
                {activeTab === "email"
                  ? "Please review the quote details below:"
                  : activeTab === "pdf"
                    ? "Please find the detailed quote attached as a PDF document."
                    : "Please find the quote data attached as a CSV file for your records."}
              </p>

              {/* Inline table for "In Email" tab */}
              {activeTab === "email" && (
                <div className="my-4 border border-border">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">
                          Product
                        </th>
                        <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">
                          SKU
                        </th>
                        <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">
                          Qty
                        </th>
                        <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">
                          Unit Price
                        </th>
                        <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolvedItems.map(({ lineItem, catalogItem }) => (
                        <tr
                          key={lineItem.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-2.5 py-1.5 text-foreground/80">
                            {catalogItem.catalogName}
                          </td>
                          <td className="px-2.5 py-1.5 font-mono text-muted-foreground">
                            {catalogItem.catalogSku}
                          </td>
                          <td className="px-2.5 py-1.5 text-right text-foreground/70">
                            {lineItem.parsedQuantity} {lineItem.parsedUom}
                          </td>
                          <td className="px-2.5 py-1.5 text-right text-foreground/70">
                            ${catalogItem.catalogPrice.toFixed(2)}
                          </td>
                          <td className="px-2.5 py-1.5 text-right font-medium text-foreground/80">
                            $
                            {fmt(
                              catalogItem.catalogPrice *
                                lineItem.parsedQuantity
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td
                          colSpan={4}
                          className="px-2.5 py-1.5 text-right font-medium"
                        >
                          Subtotal
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-semibold">
                          ${fmt(subtotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Attachment indicator for PDF / CSV tabs */}
              {(activeTab === "pdf" || activeTab === "csv") && (
                <div className="my-4 flex items-center gap-2.5 border border-dashed border-border bg-muted/20 px-3.5 py-3">
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="text-[12px]">
                    <span className="font-medium text-foreground/85">
                      {quoteNumber}.{activeTab}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {resolvedItems.length} items &mdash; ${fmt(subtotal)}
                    </span>
                  </div>
                </div>
              )}

              <p className="mt-3">
                This quote is valid for 30 days from the date of issue.
              </p>

              <p className="mt-3">
                If you&apos;d like to proceed or have any questions, please
                don&apos;t hesitate to reply.
              </p>

              <p className="mt-5">
                Best regards,
                <br />
                <span className="font-medium text-foreground/85">
                  Hexa Sales Team
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Action buttons ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-1">
          {!sent ? (
            <button
              type="button"
              onClick={handleSend}
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
                  Send Quote
                </>
              )}
            </button>
          ) : (
            <div className="animate-in fade-in-0 inline-flex items-center gap-2 bg-emerald-600 px-5 py-2.5 text-[13px] font-medium text-white duration-300">
              <Check className="h-3.5 w-3.5" />
              Quote Sent
            </div>
          )}

          {activeTab !== "email" && (
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              Download {activeTab.toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
