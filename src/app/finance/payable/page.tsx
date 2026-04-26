"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Search,
  Download,
  FileInput,
  ListFilter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
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

import { apInvoices, apSuppliers, formatMoney } from "@/data/finance-data";
import type { APInvoice, APInvoiceStatus, APMatchResult } from "@/lib/finance-types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<APInvoiceStatus, string> = {
  received: "Received",
  matching: "Matching",
  exception: "Exception",
  awaiting_supplier: "Awaiting Supplier",
  ready_to_approve: "Ready to Approve",
  approved: "Approved",
  paid: "Paid",
  on_hold: "On Hold",
};

const STATUS_DOT: Record<APInvoiceStatus, string> = {
  received: "bg-blue-500",
  matching: "bg-blue-500",
  exception: "bg-red-500",
  awaiting_supplier: "bg-amber-500",
  ready_to_approve: "bg-violet-500",
  approved: "bg-emerald-500",
  paid: "bg-emerald-500",
  on_hold: "bg-stone-500",
};

const MATCH_LABELS: Record<APMatchResult, string> = {
  exact: "Exact",
  within_tolerance: "Within tolerance",
  qty_mismatch: "Qty mismatch",
  price_mismatch: "Price mismatch",
  duplicate: "Duplicate",
  missing_po: "Missing PO",
  tax_mismatch: "Tax error",
  line_missing: "Line missing",
  freight_mismatch: "Freight error",
};

const NEEDS_ATTENTION: APInvoiceStatus[] = ["exception", "awaiting_supplier", "ready_to_approve", "on_hold"];

const GRID_COLS = "minmax(0,1.2fr) 7rem 7rem 10rem minmax(0,1.5fr) 10rem 5.5rem";
const GRID_STYLE = { gridTemplateColumns: GRID_COLS, columnGap: "1.25rem" } as const;

function APListContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState(searchParams.get("supplier") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [matchFilter, setMatchFilter] = useState("all");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");

  const baseFiltered = useMemo(() => {
    return apInvoices.filter((i) => {
      if (supplierFilter !== "all" && i.supplierId !== supplierFilter) return false;
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (matchFilter !== "all" && i.matchResult !== matchFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !i.invoiceNumber.toLowerCase().includes(q) &&
          !i.poNumber.toLowerCase().includes(q) &&
          !i.supplierName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [search, supplierFilter, statusFilter, matchFilter]);

  const needAttentionCount = useMemo(
    () => baseFiltered.filter((i) => NEEDS_ATTENTION.includes(i.status)).length,
    [baseFiltered],
  );

  const filtered = useMemo(() => {
    let result = baseFiltered;
    if (attentionOnly) result = result.filter((i) => NEEDS_ATTENTION.includes(i.status));
    return [...result].sort((a, b) => {
      const da = new Date(a.receivedAt).getTime();
      const db = new Date(b.receivedAt).getTime();
      return dateSort === "newest" ? db - da : da - db;
    });
  }, [baseFiltered, attentionOnly, dateSort]);

  const totalsByStatus = useMemo(() => {
    const map: Partial<Record<APInvoiceStatus, { count: number; amount: number }>> = {};
    apInvoices.forEach((i) => {
      const cur = map[i.status] ?? { count: 0, amount: 0 };
      cur.count += 1;
      cur.amount += i.totalAmount;
      map[i.status] = cur;
    });
    return map;
  }, []);

  const exceptionsTotal = (totalsByStatus.exception?.amount ?? 0) + (totalsByStatus.on_hold?.amount ?? 0);
  const readyTotal = totalsByStatus.ready_to_approve?.amount ?? 0;
  const awaitingTotal = totalsByStatus.awaiting_supplier?.amount ?? 0;
  const paidTotal = totalsByStatus.paid?.amount ?? 0;

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Accounts Payable
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Auto-matched against POs and goods receipts. Only exceptions reach you.
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, PO, supplier..."
            className="h-9 w-60 border-border bg-background pl-8 text-[12px] text-muted-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px bg-border border-b border-border">
        <KpiTile label="Exceptions" value={formatMoney(exceptionsTotal)} sub={`${(totalsByStatus.exception?.count ?? 0) + (totalsByStatus.on_hold?.count ?? 0)} invoices`} accent="amber" icon={AlertTriangle} />
        <KpiTile label="Awaiting supplier" value={formatMoney(awaitingTotal)} sub={`${totalsByStatus.awaiting_supplier?.count ?? 0} chasing reply`} accent="default" icon={Clock} />
        <KpiTile label="Ready to approve" value={formatMoney(readyTotal)} sub={`${totalsByStatus.ready_to_approve?.count ?? 0} clean matches`} accent="primary" icon={ShieldCheck} />
        <KpiTile label="Paid this month" value={formatMoney(paidTotal)} sub={`${totalsByStatus.paid?.count ?? 0} settled`} accent="emerald" icon={CheckCircle2} />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/20 px-7 py-2.5">
        <ListFilter size={14} className="text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mr-1">
          Filters
        </span>

        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger size="sm" className="h-7 min-w-[160px] text-[12px] border-border bg-background">
            <SelectValue placeholder="Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All suppliers</SelectItem>
            {apSuppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="sm" className="h-7 min-w-[150px] text-[12px] border-border bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(STATUS_LABELS) as APInvoiceStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={matchFilter} onValueChange={setMatchFilter}>
          <SelectTrigger size="sm" className="h-7 min-w-[150px] text-[12px] border-border bg-background">
            <SelectValue placeholder="Match result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All match results</SelectItem>
            {(Object.keys(MATCH_LABELS) as APMatchResult[]).map((m) => (
              <SelectItem key={m} value={m}>{MATCH_LABELS[m]}</SelectItem>
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
          <Select value={dateSort} onValueChange={(v) => setDateSort(v as "newest" | "oldest")}>
            <SelectTrigger size="sm" className="h-7 min-w-[140px] text-[12px] border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
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
          Supplier / Invoice
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          PO Ref
        </div>
        <div className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Amount
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Match
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Discrepancy
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </div>
        <div className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Received
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <FileInput className="h-8 w-8 opacity-40" />
              <p className="text-[13px] font-medium">No invoices match these filters</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSupplierFilter("all");
                  setStatusFilter("all");
                  setMatchFilter("all");
                  setAttentionOnly(false);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            filtered.map((inv) => <APRow key={inv.id} invoice={inv} />)
          )}
        </div>
      </ScrollArea>

      {filtered.length > 0 && (
        <div className="border-t border-border px-7 py-2 text-[11px] text-muted-foreground">
          Showing {filtered.length} of {apInvoices.length} invoices
        </div>
      )}
    </div>
  );
}

function APRow({ invoice }: { invoice: APInvoice }) {
  const initials = invoice.supplierName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/finance/payable/${invoice.id}`}
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
              {invoice.supplierName}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="truncate font-mono text-[12px] text-muted-foreground">
          {invoice.poNumber === "MISSING" ? (
            <span className="text-red-700">missing</span>
          ) : (
            invoice.poNumber
          )}
        </div>

        <div className="text-right">
          <span className="text-[12.5px] font-semibold text-foreground tabular-nums">
            {formatMoney(invoice.totalAmount, invoice.currency)}
          </span>
        </div>

        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[12px]",
              invoice.matchResult === "exact" || invoice.matchResult === "within_tolerance"
                ? "text-emerald-700"
                : invoice.matchResult === "duplicate" || invoice.matchResult === "missing_po"
                ? "text-red-700"
                : "text-amber-700"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                invoice.matchResult === "exact" || invoice.matchResult === "within_tolerance"
                  ? "bg-emerald-500"
                  : invoice.matchResult === "duplicate" || invoice.matchResult === "missing_po"
                  ? "bg-red-500"
                  : "bg-amber-500"
              )}
            />
            <span className="truncate">{MATCH_LABELS[invoice.matchResult]}</span>
          </span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-[12px] text-muted-foreground">
            {invoice.discrepancySummary}
          </p>
        </div>

        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[invoice.status])} />
            <span className="truncate">{STATUS_LABELS[invoice.status]}</span>
          </span>
        </div>

        <div className="text-right text-[12px] text-muted-foreground">
          {new Date(invoice.receivedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </Link>
  );
}

interface KpiTileProps {
  label: string;
  value: string;
  sub: string;
  accent: "default" | "primary" | "amber" | "emerald";
  icon: typeof CheckCircle2;
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
            accent === "emerald" && "text-emerald-600",
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

export default function APListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>}>
      <APListContent />
    </Suspense>
  );
}
