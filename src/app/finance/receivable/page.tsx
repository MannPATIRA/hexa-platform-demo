"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Search,
  Download,
  FileOutput,
  ListFilter,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HandCoins,
  ShieldAlert,
  Flag,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { arInvoices, arCustomers, formatMoney } from "@/data/finance-data";
import type { ARInvoice, ARInvoiceStatus } from "@/lib/finance-types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ARInvoiceStatus, string> = {
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

const STATUS_DOT: Record<ARInvoiceStatus, string> = {
  issued: "bg-blue-500",
  viewed: "bg-blue-500",
  approaching_due: "bg-amber-500",
  overdue: "bg-red-500",
  promise_to_pay: "bg-violet-500",
  in_dispute: "bg-red-500",
  partial_paid: "bg-amber-500",
  paid: "bg-emerald-500",
  written_off: "bg-stone-500",
  escalated: "bg-red-500",
};

const STATUS_COLOR: Record<ARInvoiceStatus, string> = {
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

const NEEDS_ATTENTION: ARInvoiceStatus[] = ["overdue", "in_dispute", "escalated", "approaching_due"];

const GRID_COLS = "minmax(0,1fr) 7rem 9rem 11rem 7rem 9rem";
const GRID_STYLE = { gridTemplateColumns: GRID_COLS, columnGap: "1.25rem" } as const;

function ARListContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState(searchParams.get("customer") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"days" | "amount" | "issued">("days");

  const baseFiltered = useMemo(() => {
    return arInvoices.filter((i) => {
      if (customerFilter !== "all" && i.customerId !== customerFilter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !i.invoiceNumber.toLowerCase().includes(q) &&
          !i.customerName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [search, customerFilter, statusFilter]);

  const needAttentionCount = useMemo(
    () => baseFiltered.filter((i) => NEEDS_ATTENTION.includes(i.status)).length,
    [baseFiltered],
  );

  const filtered = useMemo(() => {
    let result = baseFiltered;
    if (attentionOnly) result = result.filter((i) => NEEDS_ATTENTION.includes(i.status));
    return [...result].sort((a, b) => {
      if (sortBy === "days") return b.daysOverdue - a.daysOverdue;
      if (sortBy === "amount") return b.totalAmount - a.totalAmount;
      return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
    });
  }, [baseFiltered, attentionOnly, sortBy]);

  const kpis = useMemo(() => {
    const outstanding = arInvoices
      .filter((i) => i.status !== "paid" && i.status !== "written_off")
      .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
    const overdue = arInvoices
      .filter((i) => i.daysOverdue > 0 && i.status !== "paid" && i.status !== "written_off")
      .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
    const inDispute = arInvoices
      .filter((i) => i.status === "in_dispute" || i.status === "escalated")
      .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
    const dsoSum = arCustomers.reduce((sum, c) => sum + c.avgDsoDays, 0);
    const avgDso = Math.round(dsoSum / arCustomers.length);
    return { outstanding, overdue, inDispute, avgDso };
  }, []);

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Accounts Receivable
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Every invoice tracked. Every follow-up logged. Voice agents handle dunning — humans handle escalations.
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or customer..."
            className="h-9 w-60 border-border bg-background pl-8 text-[12px] text-muted-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px bg-border border-b border-border">
        <KpiTile
          label="Outstanding"
          value={formatMoney(kpis.outstanding)}
          sub={`${arInvoices.filter((i) => i.status !== "paid" && i.status !== "written_off").length} open invoices`}
          accent="default"
          icon={Clock}
        />
        <KpiTile
          label="Overdue"
          value={formatMoney(kpis.overdue)}
          sub={`${arInvoices.filter((i) => i.daysOverdue > 0 && i.status !== "paid" && i.status !== "written_off").length} past due`}
          accent="amber"
          icon={AlertTriangle}
        />
        <KpiTile
          label="In dispute"
          value={formatMoney(kpis.inDispute)}
          sub={`${arInvoices.filter((i) => i.status === "in_dispute" || i.status === "escalated").length} need review`}
          accent="red"
          icon={ShieldAlert}
        />
        <KpiTile
          label="Average DSO"
          value={`${kpis.avgDso}d`}
          sub="Across all customers"
          accent="primary"
          icon={HandCoins}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/20 px-7 py-2.5">
        <ListFilter size={14} className="text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mr-1">
          Filters
        </span>

        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger size="sm" className="h-7 min-w-[180px] text-[12px] border-border bg-background">
            <SelectValue placeholder="Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All customers</SelectItem>
            {arCustomers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="sm" className="h-7 min-w-[150px] text-[12px] border-border bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(STATUS_LABELS) as ARInvoiceStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {needAttentionCount > 0 && (
          <button
            type="button"
            onClick={() => setAttentionOnly((prev) => !prev)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition-colors",
              attentionOnly
                ? "border-amber-600 bg-amber-500/25 text-amber-800 ring-1 ring-amber-500/40"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
            )}
          >
            {needAttentionCount} Need attention
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown size={14} className="text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "days" | "amount" | "issued")}>
            <SelectTrigger size="sm" className="h-7 min-w-[160px] text-[12px] border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Most overdue</SelectItem>
              <SelectItem value="amount">Largest amount</SelectItem>
              <SelectItem value="issued">Newest issued</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 border border-border px-3 text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid items-center border-b border-border px-7 py-2" style={GRID_STYLE}>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Customer / Invoice
        </div>
        <div className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Amount
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Days vs SLA
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Follow-ups
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Last contact
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <FileOutput className="h-8 w-8 opacity-40" />
              <p className="text-[13px] font-medium">No invoices match these filters</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setCustomerFilter("all");
                  setStatusFilter("all");
                  setAttentionOnly(false);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            filtered.map((inv) => <ARRow key={inv.id} invoice={inv} />)
          )}
        </div>
      </ScrollArea>

      {filtered.length > 0 && (
        <div className="border-t border-border px-7 py-2 text-[11px] text-muted-foreground">
          Showing {filtered.length} of {arInvoices.length} invoices
        </div>
      )}
    </div>
  );
}

function ARRow({ invoice }: { invoice: ARInvoice }) {
  const initials = invoice.customerName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const emails = invoice.followups.filter((f) => f.channel === "email");
  const calls = invoice.followups.filter((f) => f.channel === "voice");
  const lastContact = invoice.followups[invoice.followups.length - 1];

  return (
    <Link
      href={`/finance/receivable/${invoice.id}`}
      className="group block w-full border border-border bg-background/30 transition-all duration-200 hover:border-primary/60 hover:bg-primary/5"
    >
      <div className="grid items-center px-4 py-3.5" style={GRID_STYLE}>
        <div className="flex min-w-0 items-center gap-3.5">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium leading-tight text-foreground/85 group-hover:text-primary transition-colors">
              {invoice.customerName}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <span className="text-[12.5px] font-semibold text-foreground tabular-nums">
            {formatMoney(invoice.totalAmount, invoice.currency)}
          </span>
          {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
            <span className="mt-0.5 text-[10.5px] text-amber-700 tabular-nums">
              {formatMoney(invoice.paidAmount, invoice.currency)} paid
            </span>
          )}
        </div>

        <div className="flex flex-col">
          {invoice.daysOverdue > 0 ? (
            <span className="text-[12px] font-medium tabular-nums text-red-700">
              {invoice.daysOverdue}d overdue
            </span>
          ) : (
            <span className="text-[12px] tabular-nums text-muted-foreground">
              {invoice.agreedSlaDays}-day SLA
            </span>
          )}
          <span className="mt-0.5 text-[10.5px] text-muted-foreground">
            {invoice.paymentTerms}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Mail size={12} />
            {emails.length}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Phone size={12} />
            {calls.length}
          </span>
          {lastContact && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10.5px]",
                lastContact.outcome === "promised"
                  ? "bg-violet-500/10 text-violet-700"
                  : lastContact.outcome === "disputed"
                  ? "bg-red-500/10 text-red-700"
                  : lastContact.outcome === "paid"
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-muted/40 text-muted-foreground"
              )}
            >
              {outcomeLabel(lastContact.outcome)}
            </span>
          )}
        </div>

        <div className="text-[12px] text-muted-foreground">
          {lastContact
            ? new Date(lastContact.occurredAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "—"}
        </div>

        <div>
          <span
            className={cn(
              "inline-flex items-center gap-2 text-[12px]",
              STATUS_COLOR[invoice.status]
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[invoice.status])}
            />
            {STATUS_LABELS[invoice.status]}
          </span>
        </div>
      </div>
    </Link>
  );
}

function outcomeLabel(o: string): string {
  return (
    {
      promised: "Promise",
      disputed: "Dispute",
      paid: "Paid",
      voicemail: "VM left",
      no_answer: "No answer",
      no_response: "No reply",
      opened: "Opened",
      delivered: "Delivered",
      bounced: "Bounced",
      completed_call: "Spoke",
    }[o] ?? o
  );
}

interface KpiTileProps {
  label: string;
  value: string;
  sub: string;
  accent: "default" | "primary" | "amber" | "red";
  icon: typeof CheckCircle2 | typeof Flag;
}

function KpiTile({ label, value, sub, accent, icon: Icon }: KpiTileProps) {
  return (
    <div className="bg-card px-7 py-4">
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            accent === "amber" && "text-amber-600",
            accent === "primary" && "text-primary",
            accent === "red" && "text-red-600",
            accent === "default" && "text-muted-foreground"
          )}
        />
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-1.5 text-[18px] font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

export default function ARListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>}>
      <ARListContent />
    </Suspense>
  );
}
