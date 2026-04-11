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
import { CheckCircle2, ArrowUpRight, Clock, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportTicket, TicketStatus, TicketPriority } from "@/data/support-data";
import { categoryLabels, priorityLabels, statusLabels } from "@/data/support-data";

const STATUS_ICON: Record<TicketStatus, { icon: typeof CheckCircle2; color: string }> = {
  auto_resolved: { icon: CheckCircle2, color: "text-emerald-600" },
  escalated:     { icon: ArrowUpRight, color: "text-amber-600" },
  pending:       { icon: Clock,        color: "text-blue-500" },
  in_progress:   { icon: Clock,        color: "text-violet-500" },
};

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  low:    "border-muted-foreground/30 bg-muted/20 text-muted-foreground",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  high:   "border-red-500/30 bg-red-500/10 text-red-700",
};

interface TicketListClientProps {
  tickets: SupportTicket[];
}

export default function TicketListClient({ tickets }: TicketListClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = tickets;
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter);
    return [...result].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [tickets, statusFilter]);

  const counts = useMemo(() => {
    const c = { auto_resolved: 0, escalated: 0, pending: 0, in_progress: 0 };
    for (const t of tickets) c[t.status]++;
    return c;
  }, [tickets]);

  return (
    <>
      {/* Minimal filter bar */}
      <div className="flex items-center gap-3 border-b border-border px-7 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Inbox
        </span>
        <span className="text-[11px] text-muted-foreground">
          {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
        </span>

        <div className="ml-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="h-7 min-w-[150px] text-[12px] border-border bg-background">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({tickets.length})</SelectItem>
              <SelectItem value="auto_resolved">Auto-Resolved ({counts.auto_resolved})</SelectItem>
              <SelectItem value="escalated">Escalated ({counts.escalated})</SelectItem>
              <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
              <SelectItem value="in_progress">In Progress ({counts.in_progress})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ticket cards */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 px-5 py-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Headphones size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No tickets match this filter</p>
            </div>
          ) : (
            filtered.map((ticket) => {
              const initials = ticket.customer.name
                .split(/\s+/)
                .filter((w) => /^[A-Za-z]/.test(w))
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();

              const StatusIcon = STATUS_ICON[ticket.status].icon;
              const statusColor = STATUS_ICON[ticket.status].color;

              return (
                <Link
                  key={ticket.id}
                  href={`/support/${ticket.id}`}
                  className="group block border border-border bg-background/30 transition-all duration-200 hover:border-primary/60 hover:bg-primary/5"
                >
                  <div className="flex items-start gap-4 px-5 py-4">
                    {/* Avatar */}
                    <Avatar className="mt-0.5 h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Main content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-foreground/85">
                          {ticket.ticketNumber}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center border px-1.5 py-0.5 text-[10px] font-semibold",
                            PRIORITY_STYLE[ticket.priority],
                          )}
                        >
                          {priorityLabels[ticket.priority]}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          · {categoryLabels[ticket.category]}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] leading-snug text-foreground/75 line-clamp-1">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {ticket.customer.name} · {ticket.customer.company}
                      </p>
                    </div>

                    {/* Status + date */}
                    <div className="shrink-0 text-right">
                      <div className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", statusColor)}>
                        <StatusIcon size={13} />
                        {statusLabels[ticket.status]}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      {ticket.responseTimeSec && (
                        <p className="mt-0.5 text-[10px] text-emerald-600">
                          {ticket.responseTimeSec}s response
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
    </>
  );
}
