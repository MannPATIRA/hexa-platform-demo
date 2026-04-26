"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getARInvoice, formatMoney } from "@/data/finance-data";
import ARInvoiceWorkspace from "@/components/finance/receivable/ARInvoiceWorkspace";
import type { ARInvoiceStatus } from "@/lib/finance-types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ARInvoiceStatus, string> = {
  issued: "Issued",
  viewed: "Viewed",
  approaching_due: "Approaching due",
  overdue: "Overdue",
  promise_to_pay: "Promise to pay",
  in_dispute: "In dispute",
  partial_paid: "Partial paid",
  paid: "Paid",
  written_off: "Written off",
  escalated: "Escalated",
};

const STATUS_TONE: Record<ARInvoiceStatus, string> = {
  issued: "text-muted-foreground",
  viewed: "text-muted-foreground",
  approaching_due: "text-amber-700",
  overdue: "text-red-700",
  promise_to_pay: "text-violet-700",
  in_dispute: "text-red-700",
  partial_paid: "text-amber-700",
  paid: "text-emerald-700",
  written_off: "text-muted-foreground",
  escalated: "text-red-700",
};

export default function ARDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoice = getARInvoice(params.id as string);

  if (!invoice) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Button variant="outline" onClick={() => router.push("/finance/receivable")}>
          Back to Accounts Receivable
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-start justify-between border-b border-border bg-card px-7 py-5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-[13px] text-muted-foreground">
            <Link href="/finance/receivable" className="hover:text-foreground transition-colors">
              Accounts Receivable
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[22px] font-medium leading-none text-foreground">
              {invoice.invoiceNumber}
            </h1>
            <span className={cn("text-[12px] font-medium", STATUS_TONE[invoice.status])}>
              {STATUS_LABEL[invoice.status]}
            </span>
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {invoice.customerName}
            {" · "}
            issued{" "}
            {new Date(invoice.issuedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {" · "}
            due{" "}
            {new Date(invoice.dueDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-muted-foreground">Amount</p>
          <p className="text-xl font-semibold text-foreground">
            {formatMoney(invoice.totalAmount, invoice.currency)}
          </p>
          {invoice.daysOverdue > 0 && (
            <p className="mt-0.5 text-[11px] text-red-700">{invoice.daysOverdue} days overdue</p>
          )}
          {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
            <p className="mt-0.5 text-[11px] text-amber-700">
              {formatMoney(invoice.paidAmount, invoice.currency)} paid
            </p>
          )}
        </div>
      </div>

      <ARInvoiceWorkspace invoice={invoice} />
    </div>
  );
}
