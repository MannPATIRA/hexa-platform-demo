"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Package,
  Wrench,
  Settings,
  Plus,
  User,
  ListFilter,
  ArrowUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  procurementItems,
  getDaysOfStockRemaining,
  getStockColor,
} from "@/data/procurement-data";
import type { ProcurementItem, ProcurementStatus, ProcurementPriority } from "@/lib/procurement-types";
import ItemDetailPanel from "./ItemDetailPanel";
import ManualRequestDemoPanel from "./ManualRequestDemoPanel";
import ERPScanConfig from "./ERPScanConfig";
import EngineeringRequestForm from "./EngineeringRequestForm";
import { cn } from "@/lib/utils";

const statusLabels: Record<ProcurementStatus, string> = {
  flagged: "Flagged",
  rfq_sent: "RFQ Sent",
  quotes_received: "Quotes In",
  po_sent: "PO Sent",
  shipped: "Shipped",
  delivered: "Delivered",
};

const statusBadgeClass: Record<ProcurementStatus, string> = {
  flagged: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  rfq_sent: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  quotes_received: "border-violet-500/30 bg-violet-500/10 text-violet-700",
  po_sent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700",
  shipped: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
};

const priorityLabels: Record<ProcurementPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityBadgeClass: Record<ProcurementPriority, string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-700",
  high: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  medium: "border-border bg-muted/50 text-foreground/70",
  low: "border-border bg-muted/50 text-muted-foreground",
};

const NEEDS_ATTENTION_STATUSES: ProcurementStatus[] = ["flagged", "quotes_received"];
type DateSort = "newest" | "oldest";
const SARAH_PROCUREMENT_ITEM_ID = "pi-015";
const SARAH_PROCUREMENT_VISIBLE_KEY = "hexa:procurement:sarah-visible";

function isSarahProcurementVisible(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SARAH_PROCUREMENT_VISIBLE_KEY) === "1";
}

export default function ProcurementQueue() {
  const [search, setSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showERPConfig, setShowERPConfig] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProcurementStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ProcurementPriority | "all">("all");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [attentionOnly, setAttentionOnly] = useState(false);

  const [items, setItems] = useState<ProcurementItem[]>(() => {
    const ids = ["pi-001", "pi-013", "pi-004", "pi-011", "pi-006"];
    if (isSarahProcurementVisible()) {
      ids.splice(3, 0, SARAH_PROCUREMENT_ITEM_ID);
    }
    return ids.map((id) => procurementItems.find((i) => i.id === id)!).filter(Boolean);
  });

  const handleItemUpdate = useCallback((updated: ProcurementItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i)),
    );
  }, []);

  const baseFiltered = useMemo(() => {
    let result = items;
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      result = result.filter((i) => i.priority === priorityFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.requestedBy.toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, search, statusFilter, priorityFilter]);

  const needAttentionCount = useMemo(
    () => baseFiltered.filter((i) => NEEDS_ATTENTION_STATUSES.includes(i.status)).length,
    [baseFiltered],
  );

  const filtered = useMemo(() => {
    let result = baseFiltered;
    if (attentionOnly) {
      result = result.filter((i) => NEEDS_ATTENTION_STATUSES.includes(i.status));
    }

    result = [...result].sort((a, b) => {
      const da = new Date(a.flaggedAt).getTime();
      const db = new Date(b.flaggedAt).getTime();
      return dateSort === "newest" ? db - da : da - db;
    });

    return result;
  }, [baseFiltered, attentionOnly, dateSort]);

  const selectedItem = selectedItemId ? items.find((i) => i.id === selectedItemId) ?? null : null;

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header — matches Orders/Calls */}
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Procurement
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Manage stock alerts and supplier sourcing requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="h-9 w-52 border-border bg-background pl-8 text-xs text-muted-foreground"
            />
          </div>
          <button
            onClick={() => setShowERPConfig(true)}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
            ERP Config
          </button>
          <button
            onClick={() => setShowRequestForm(true)}
            className="inline-flex items-center gap-1.5 bg-foreground px-3 py-1.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New Request
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-border px-7 py-2.5">
        <ListFilter size={14} className="text-muted-foreground" />
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Filters
        </span>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProcurementStatus | "all")}>
          <SelectTrigger size="sm" className="h-7 min-w-[140px] border-border bg-background text-[12px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="rfq_sent">RFQ Sent</SelectItem>
            <SelectItem value="quotes_received">Quotes In</SelectItem>
            <SelectItem value="po_sent">PO Sent</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(v) => setPriorityFilter(v as ProcurementPriority | "all")}
        >
          <SelectTrigger size="sm" className="h-7 min-w-[130px] border-border bg-background text-[12px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
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
                : "border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
            )}
          >
            {needAttentionCount} Need Attention
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown size={14} className="text-muted-foreground" />
          <Select value={dateSort} onValueChange={(v) => setDateSort(v as DateSort)}>
            <SelectTrigger size="sm" className="h-7 min-w-[140px] border-border bg-background text-[12px]">
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
      <div className="flex items-center border-b border-border px-8 py-2">
        <div className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Item
        </div>
        <div className="w-40 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Source
        </div>
        <div className="w-28 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Priority
        </div>
        <div className="w-28 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Days Left
        </div>
        <div className="w-32 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </div>
        <div className="w-32 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Date Flagged
        </div>
      </div>

      {/* List — card-style rows matching Orders/Calls */}
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Package className="h-8 w-8 opacity-40" />
              <p className="text-[13px] font-medium">No items found</p>
              <p className="text-[11px]">Try a different search term</p>
            </div>
          ) : (
            filtered.map((item) => {
              const days = getDaysOfStockRemaining(item);
              const daysColor = getStockColor(days);
              const Icon = item.source === "engineering_request" ? Wrench : item.source === "manual_request" ? User : Package;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className="group block w-full border text-left transition-all duration-200 border-border bg-background/30 cursor-pointer hover:border-primary/60 hover:bg-primary/5"
                >
                  <div className="flex items-center px-4 py-3.5">
                    <div className="flex flex-1 items-center gap-3.5">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                          <Icon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[13px] font-medium leading-tight text-foreground/85">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {item.sku}
                        </p>
                      </div>
                    </div>

                    <div className="w-40">
                      <p className="text-[12px] text-muted-foreground">
                        {item.source === "erp_alert"
                          ? "ERP Flag"
                          : item.source === "manual_request"
                            ? `Requested by ${item.requestedBy}`
                            : `Suggested by ${item.requestedBy}`}
                      </p>
                    </div>

                    <div className="w-28 flex justify-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2.5 py-0.5 text-[11px] font-semibold",
                          priorityBadgeClass[item.priority]
                        )}
                      >
                        {priorityLabels[item.priority]}
                      </Badge>
                    </div>

                    <div className="w-28 text-center">
                      {item.avgDailyConsumption > 0 ? (
                        <span
                          className={cn(
                            "text-[12px] font-medium tabular-nums",
                            daysColor === "red"
                              ? "text-amber-700"
                              : daysColor === "amber"
                                ? "text-amber-600"
                                : "text-foreground/70"
                          )}
                        >
                          {days}d
                        </span>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      )}
                    </div>

                    <div className="w-32 flex justify-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-3 py-1 text-[11px] font-semibold",
                          statusBadgeClass[item.status]
                        )}
                      >
                        {statusLabels[item.status]}
                      </Badge>
                    </div>

                    <div className="w-32 text-right">
                      <p className="text-[12px] text-muted-foreground">
                        {new Date(item.flaggedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {selectedItem && selectedItem.source === "manual_request" ? (
        <ManualRequestDemoPanel
          item={selectedItem}
          onClose={() => setSelectedItemId(null)}
          onItemUpdate={handleItemUpdate}
        />
      ) : selectedItem ? (
        <ItemDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItemId(null)}
          onItemUpdate={handleItemUpdate}
        />
      ) : null}
      {showERPConfig && <ERPScanConfig onClose={() => setShowERPConfig(false)} />}
      {showRequestForm && <EngineeringRequestForm onClose={() => setShowRequestForm(false)} />}
    </div>
  );
}
