"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, ShoppingCart, Phone, ListFilter, ArrowUpDown } from "lucide-react";
import type { Order, OrderSource, OrderStage } from "@/lib/types";
import { cn } from "@/lib/utils";

const NEEDS_ATTENTION_STAGES: OrderStage[] = [
  "rfq_received",
  "needs_clarification",
  "clarification_received",
  "po_received",
  "po_mismatch",
];

const STAGE_CONFIG: Record<OrderStage, { label: string; dot: string }> = {
  needs_clarification:     { label: "Needs Clarification",    dot: "bg-red-500" },
  clarification_requested: { label: "Clarification Requested", dot: "bg-amber-500" },
  clarification_received:  { label: "Clarification Received",  dot: "bg-blue-500" },
  rfq_received:            { label: "RFQ Received",            dot: "bg-blue-500" },
  bom_review:              { label: "BOM Review",              dot: "bg-violet-500" },
  inventory_check:         { label: "Inventory Check",         dot: "bg-amber-500" },
  quote_draft:             { label: "Quote Draft",             dot: "bg-violet-500" },
  quote_sent:              { label: "Quote Sent",              dot: "bg-violet-500" },
  quote_prepared:          { label: "Quote Prepared",          dot: "bg-violet-500" },
  po_received:             { label: "PO Received",             dot: "bg-blue-500" },
  po_mismatch:             { label: "PO Mismatch",            dot: "bg-red-500" },
  pushed_to_mrp:           { label: "Pushed to MRP",          dot: "bg-emerald-500" },
  po_validated:            { label: "PO Validated",            dot: "bg-emerald-500" },
  shipped:                 { label: "Shipped",                 dot: "bg-emerald-500" },
  delivered:               { label: "Delivered",               dot: "bg-emerald-500" },
};

const SOURCE_CONFIG: Record<OrderSource, { icon: typeof Mail; label: string }> = {
  email: { icon: Mail, label: "Email" },
  ecommerce: { icon: ShoppingCart, label: "Ecommerce" },
  phone: { icon: Phone, label: "Phone" },
};

function SourceBadge({ source }: { source?: OrderSource }) {
  const config = SOURCE_CONFIG[source ?? "email"] ?? SOURCE_CONFIG["email"];
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function StageBadge({ stage }: { stage: OrderStage }) {
  const config = STAGE_CONFIG[stage] ?? {
    label: stage ?? "Unknown",
    dot: "bg-muted-foreground",
  };
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}

const GRID_COLS = "13rem 5rem 1fr 3rem 11rem 6.5rem";
const gridStyle = { gridTemplateColumns: GRID_COLS, columnGap: "0.75rem" } as const;

type DateSort = "newest" | "oldest";

export function OrdersListClient({ orders }: { orders: Order[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("email");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [attentionOnly, setAttentionOnly] = useState(false);

  const availableStages = useMemo(() => {
    const stages = new Set(orders.map((o) => o.stage));
    return Object.keys(STAGE_CONFIG).filter((s) => stages.has(s as OrderStage)) as OrderStage[];
  }, [orders]);

  const baseFilteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter((o) => o.stage === statusFilter);
    }
    if (sourceFilter !== "all") {
      result = result.filter((o) => o.source === sourceFilter);
    }

    return result;
  }, [orders, statusFilter, sourceFilter]);

  const needAttentionCount = useMemo(
    () =>
      baseFilteredOrders.filter((o) => NEEDS_ATTENTION_STAGES.includes(o.stage))
        .length,
    [baseFilteredOrders],
  );

  const filteredOrders = useMemo(() => {
    let result = baseFilteredOrders;

    if (attentionOnly) {
      result = result.filter((o) => NEEDS_ATTENTION_STAGES.includes(o.stage));
    }

    result = [...result].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return dateSort === "newest" ? db - da : da - db;
    });

    return result;
  }, [baseFilteredOrders, dateSort, attentionOnly]);

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-3 border-b border-border px-7 py-2.5">
        <ListFilter size={14} className="text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mr-1">
          Filters
        </span>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="sm" className="h-7 min-w-[160px] text-[12px] border-border bg-background">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {availableStages.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {STAGE_CONFIG[stage].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger size="sm" className="h-7 min-w-[130px] text-[12px] border-border bg-background">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.entries(SOURCE_CONFIG).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
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
            {needAttentionCount} Need Attention
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown size={14} className="text-muted-foreground" />
          <Select value={dateSort} onValueChange={(v) => setDateSort(v as DateSort)}>
            <SelectTrigger size="sm" className="h-7 min-w-[140px] text-[12px] border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid items-center border-b border-border px-7 py-2" style={gridStyle}>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Order
        </div>
        <div className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Source
        </div>
        <div className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Subject
        </div>
        <div className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Items
        </div>
        <div className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </div>
        <div className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Date
        </div>
      </div>

      {/* Order list */}
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ListFilter size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No orders match the current filters</p>
              <p className="mt-1 text-xs opacity-70">Try adjusting or clearing your filters</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const personPart = (order.customer?.name ?? "").split(/\s+[-–]\s+/)[0];
              const letters = personPart
                .split(/\s+/)
                .filter((w) => /^[A-Za-z]/.test(w))
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .replace(/[^A-Z]/g, "");
              const initials = letters.slice(0, 2) || "?";

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group block w-full border text-left transition-all duration-200 border-border bg-background/30 cursor-pointer hover:border-primary/60 hover:bg-primary/5"
                >
                  <div className="grid items-center px-4 py-3.5" style={gridStyle}>
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0 overflow-hidden">
                        <AvatarFallback className="flex size-full min-w-0 items-center justify-center overflow-hidden bg-muted text-[10px] font-semibold leading-none tracking-tight text-muted-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium leading-tight text-foreground/85">
                          {order.orderNumber}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {order.customer?.name ?? "Unknown"} &middot;{" "}
                          {order.customer?.company ?? "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <SourceBadge source={order.source} />
                    </div>

                    <div className="min-w-0 text-left">
                      <p className="truncate text-[12px] text-muted-foreground">
                        {order.emailSubject}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                        {order.paymentTerms || "Terms n/a"} &middot;{" "}
                        {order.shipVia || "Ship-via n/a"}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-[12px] text-foreground/80">{order.totalItems}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StageBadge stage={order.stage} />
                      {order.orderType === "quote_builder" && order.inventoryStatus && (() => {
                        const outCount = order.inventoryStatus.filter((i) => i.status === "out_of_stock").length;
                        const lowCount = order.inventoryStatus.filter((i) => i.status === "low").length;
                        if (outCount > 0) return (
                          <span className="inline-flex items-center gap-1 border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />{outCount} out
                          </span>
                        );
                        if (lowCount > 0) return (
                          <span className="inline-flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{lowCount} low
                          </span>
                        );
                        return null;
                      })()}
                    </div>

                    <div className="text-right">
                      <p className="text-[12px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </>
  );
}
