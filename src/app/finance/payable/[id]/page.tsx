"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAPInvoice, formatMoney } from "@/data/finance-data";
import APInvoiceWorkspace from "@/components/finance/payable/APInvoiceWorkspace";
import { cn } from "@/lib/utils";
import type { APInvoiceStatus } from "@/lib/finance-types";

const STATUS_LABEL: Record<APInvoiceStatus, string> = {
  received: "Received",
  matching: "Matching",
  exception: "Exception",
  awaiting_supplier: "Awaiting supplier",
  ready_to_approve: "Ready to approve",
  approved: "Approved",
  paid: "Paid",
  on_hold: "On hold",
};

export default function APDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoice = getAPInvoice(params.id as string);

  if (!invoice) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Button variant="outline" onClick={() => router.push("/finance/payable")}>
          Back to Accounts Payable
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-start justify-between border-b border-border bg-card px-7 py-5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-[13px] text-muted-foreground">
            <Link href="/finance/payable" className="hover:text-foreground transition-colors">
              Accounts Payable
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[22px] font-medium leading-none text-foreground">
              {invoice.invoiceNumber}
            </h1>
            <span
              className={cn(
                "text-[12px] font-medium",
                invoice.status === "exception" || invoice.status === "on_hold"
                  ? "text-red-700"
                  : invoice.status === "awaiting_supplier"
                  ? "text-amber-700"
                  : invoice.status === "approved" || invoice.status === "paid" || invoice.status === "ready_to_approve"
                  ? "text-emerald-700"
                  : "text-muted-foreground"
              )}
            >
              {STATUS_LABEL[invoice.status]}
            </span>
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {invoice.supplierName}
            {" · "}
            {invoice.poNumber === "MISSING" ? (
              <span className="text-red-700">no PO referenced</span>
            ) : (
              <>PO {invoice.poNumber}</>
            )}
            {" · "}
            received{" "}
            {new Date(invoice.receivedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-muted-foreground">Invoice total</p>
          <p className="text-xl font-semibold text-foreground">
            {formatMoney(invoice.totalAmount, invoice.currency)}
          </p>
          {invoice.discrepancyAmount > 0 && (
            <p className="mt-0.5 text-[11px] text-amber-700">
              {formatMoney(invoice.discrepancyAmount, invoice.currency)} disputed
            </p>
          )}
        </div>
      </div>

      <APInvoiceWorkspace invoice={invoice} />
    </div>
  );
}
