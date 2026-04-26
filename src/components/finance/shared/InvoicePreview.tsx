"use client";

import { cn } from "@/lib/utils";

interface InvoicePreviewLine {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface InvoicePreviewProps {
  invoiceNumber: string;
  poNumber?: string;
  supplierName?: string;
  customerName?: string;
  supplierAddress?: string;
  customerAddress?: string;
  billTo: string;
  shipTo: string;
  invoiceDate: string;
  dueDate: string;
  lines: InvoicePreviewLine[];
  subtotal: number;
  taxAmount?: number;
  freightAmount?: number;
  totalAmount: number;
  currency?: "GBP" | "USD" | "EUR";
  highlightInvoiceNumber?: boolean;
  highlightPoNumber?: boolean;
  paid?: boolean;
}

export default function InvoicePreview({
  invoiceNumber,
  poNumber,
  supplierName,
  customerName,
  supplierAddress,
  customerAddress,
  billTo,
  shipTo,
  invoiceDate,
  dueDate,
  lines,
  subtotal,
  taxAmount = 0,
  freightAmount = 0,
  totalAmount,
  currency = "USD",
  highlightInvoiceNumber = true,
  highlightPoNumber = true,
  paid = false,
}: InvoicePreviewProps) {
  const sym = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
  const fmt = (n: number) =>
    `${sym}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="border border-border bg-white text-stone-800 shadow-sm">
      <div className="px-6 pt-6 pb-4">
        <p className="font-display text-[20px] font-semibold uppercase tracking-[0.18em] text-stone-700">
          Invoice
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 px-6 pb-4 text-[12px] text-stone-600">
        <div>
          <p className="font-medium text-stone-800">{supplierName ?? customerName ?? "—"}</p>
          {supplierAddress && <p className="mt-0.5 leading-snug">{supplierAddress}</p>}
          {customerAddress && !supplierAddress && (
            <p className="mt-0.5 leading-snug">{customerAddress}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-stone-500">Invoice date</p>
          <p className="text-stone-800">{formatDate(invoiceDate)}</p>
          <p className="mt-1 text-stone-500">Due date</p>
          <p className="text-stone-800">{formatDate(dueDate)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-y border-stone-200 bg-stone-50 px-6 py-3 text-[12px]">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 font-mono",
            highlightInvoiceNumber
              ? "bg-amber-200/70 text-amber-900"
              : "text-stone-700"
          )}
        >
          Invoice Number: {invoiceNumber}
        </span>
        {poNumber && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 font-mono",
              highlightPoNumber
                ? "bg-amber-200/70 text-amber-900"
                : "text-stone-700"
            )}
          >
            PO Number: {poNumber}
          </span>
        )}
        {paid && (
          <span className="ml-auto inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Paid
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-stone-200 px-6 py-3 text-[11.5px] text-stone-600">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-stone-400">Bill to</p>
          <p className="mt-1 leading-snug">{billTo}</p>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-stone-400">Ship to</p>
          <p className="mt-1 leading-snug">{shipTo}</p>
        </div>
      </div>

      <div className="px-6 py-4">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="border-b border-stone-200 text-stone-400">
              <th className="py-1.5 text-left font-semibold uppercase tracking-wider">Description</th>
              <th className="py-1.5 text-right font-semibold uppercase tracking-wider">Qty</th>
              <th className="py-1.5 text-right font-semibold uppercase tracking-wider">Unit</th>
              <th className="py-1.5 text-right font-semibold uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-stone-400">
                  No PO referenced — line detail unavailable
                </td>
              </tr>
            ) : (
              lines.map((line, i) => (
                <tr key={i} className="border-b border-stone-100 last:border-0">
                  <td className="py-1.5 pr-2 text-stone-700">{line.description}</td>
                  <td className="py-1.5 text-right tabular-nums text-stone-700">{line.qty}</td>
                  <td className="py-1.5 text-right tabular-nums text-stone-700">{fmt(line.unitPrice)}</td>
                  <td className="py-1.5 text-right tabular-nums text-stone-700">{fmt(line.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-stone-200 px-6 py-3 text-[12px] text-stone-700">
        <div className="ml-auto flex w-56 flex-col gap-1">
          <Row label="Subtotal" value={fmt(subtotal)} />
          {taxAmount > 0 && <Row label="Tax" value={fmt(taxAmount)} />}
          {freightAmount > 0 && <Row label="Freight" value={fmt(freightAmount)} />}
          <div className="mt-1 flex items-baseline justify-between border-t border-stone-200 pt-1.5">
            <span className="font-semibold">Total Due</span>
            <span className="font-semibold tabular-nums">{fmt(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-stone-600">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
