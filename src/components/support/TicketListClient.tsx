"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import ChannelBadge from "./ChannelBadge";
import type {
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketChannel,
} from "@/data/support-data";
import {
  categoryLabels,
  priorityLabels,
  statusLabels,
  channelLabels,
  getConfidenceTier,
} from "@/data/support-data";

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  low:    "border-muted-foreground/30 bg-muted/20 text-muted-foreground",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  high:   "border-red-500/30 bg-red-500/10 text-red-700",
};

const STATUS_PILL: Record<TicketStatus, string> = {
  auto_resolved:     "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  awaiting_approval: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  escalated:         "border-red-500/30 bg-red-500/10 text-red-700",
  in_progress:       "border-violet-500/30 bg-violet-500/10 text-violet-700",
  resolved:          "border-border bg-muted/40 text-muted-foreground",
};

const CONFIDENCE_DOT: Record<"high" | "medium" | "low", string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-red-500",
};

const NEEDS_APPROVAL_STATUS: TicketStatus = "awaiting_approval";

interface TicketListClientProps {
  tickets: SupportTicket[];
}

export default function TicketListClient({ tickets }: TicketListClientProps) {
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [approvalOnly, setApprovalOnly] = useState(false);

  const baseFiltered = useMemo(() => {
    return tickets.filter((t) => {
      if (channelFilter !== "all" && t.channel !== channelFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tickets, channelFilter, categoryFilter, statusFilter, priorityFilter]);

  const approvalCount = useMemo(
    () => baseFiltered.filter((t) => t.status === NEEDS_APPROVAL_STATUS).length,
    [baseFiltered],
  );

  const filtered = useMemo(() => {
    const list = approvalOnly
      ? baseFiltered.filter((t) => t.status === NEEDS_APPROVAL_STATUS)
      : baseFiltered;

    const priorityOrder: Record<TicketPriority, number> = { high: 3, medium: 2, low: 1 };

    return [...list].sort((a, b) => {
      if (sortBy === "priority") {
        const diff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return sortDir === "desc" ? diff : -diff;
      }
      const t = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortDir === "desc" ? t : -t;
    });
  }, [baseFiltered, approvalOnly, sortBy, sortDir]);

  const toggleSort = (col: "date" | "priority") => {
    if (sortBy === col) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  return (
    <>
      {/* Filter strip — mirrors Claims */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-7 py-3">
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="h-9 w-[120px] shrink-0 border-border bg-background text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground [&>span]:truncate">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            {(Object.keys(channelLabels) as TicketChannel[]).map((c) => (
              <SelectItem key={c} value={c}>
                {channelLabels[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[130px] shrink-0 border-border bg-background text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground [&>span]:truncate">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.keys(categoryLabels) as TicketCategory[]).map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabels[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[150px] shrink-0 border-border bg-background text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground [&>span]:truncate">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(statusLabels) as TicketStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-9 w-[120px] shrink-0 border-border bg-background text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground [&>span]:truncate">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {(Object.keys(priorityLabels) as TicketPriority[]).map((p) => (
              <SelectItem key={p} value={p}>
                {priorityLabels[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {approvalCount > 0 && (
          <button
            type="button"
            onClick={() => setApprovalOnly((v) => !v)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition-colors",
              approvalOnly
                ? "border-amber-600 bg-amber-500/25 text-amber-800 ring-1 ring-amber-500/40"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
            )}
          >
            {approvalCount} Awaiting Approval
          </button>
        )}

        <div className="flex-1" />

        <span className="text-[11px] text-muted-foreground">
          {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Column headers — simplified to 4 columns */}
      <div className="flex items-center border-b border-border px-7 py-2">
        <div className="w-7 shrink-0" />
        <div className="flex-1 min-w-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Ticket
        </div>
        <div className="w-32 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Category
        </div>
        <div
          className="w-32 cursor-pointer select-none text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => toggleSort("priority")}
        >
          <span className="inline-flex items-center gap-1">
            Status
            <ArrowUpDown className="h-3 w-3" />
          </span>
        </div>
        <div
          className="w-20 cursor-pointer select-none text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => toggleSort("date")}
        >
          <span className="inline-flex items-center justify-end gap-1">
            Received
            <ArrowUpDown className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Rows */}
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Headphones className="h-8 w-8 opacity-40" />
              <p className="text-[13px] font-medium">No tickets match this filter</p>
            </div>
          ) : (
            filtered.map((ticket) => {
              const tier = getConfidenceTier(ticket.classification.confidence);
              const confPct = Math.round(ticket.classification.confidence * 100);

              return (
                <Link
                  key={ticket.id}
                  href={`/support/${ticket.id}`}
                  className="group block w-full border border-border bg-background/30 text-left transition-all duration-200 hover:border-primary/60 hover:bg-primary/5"
                >
                  <div className="flex items-center px-4 py-3">
                    <div className="w-7 shrink-0 self-start pt-0.5">
                      <ChannelBadge channel={ticket.channel} />
                    </div>

                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {ticket.ticketNumber}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                            PRIORITY_STYLE[ticket.priority],
                          )}
                        >
                          {priorityLabels[ticket.priority]}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          · {ticket.customer.name} · {ticket.customer.company}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] leading-snug text-foreground/90 line-clamp-1 group-hover:text-primary transition-colors">
                        {ticket.subject}
                      </p>
                    </div>

                    <div className="w-32 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            CONFIDENCE_DOT[tier],
                          )}
                          title={`Confidence: ${confPct}%`}
                        />
                        <span className="text-[12px] text-foreground/85 truncate">
                          {categoryLabels[ticket.classification.category]}
                        </span>
                      </div>
                      <p className="mt-0.5 ml-3 text-[10px] tabular-nums text-muted-foreground">
                        {confPct}% confidence
                      </p>
                    </div>

                    <div className="w-32 pr-3">
                      <span
                        className={cn(
                          "inline-flex items-center border px-1.5 py-0.5 text-[10px] font-semibold",
                          STATUS_PILL[ticket.status],
                        )}
                      >
                        {statusLabels[ticket.status]}
                      </span>
                    </div>

                    <div className="w-20 text-right">
                      <p className="text-[12px] text-muted-foreground tabular-nums">
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      {ticket.responseTimeSec && (
                        <p className="mt-0.5 text-[10px] text-emerald-600 tabular-nums">
                          {ticket.responseTimeSec}s
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>

      {filtered.length > 0 && (
        <div className="border-t border-border px-7 py-2 text-[11px] text-muted-foreground">
          Showing {filtered.length} of {tickets.length} tickets
        </div>
      )}
    </>
  );
}
