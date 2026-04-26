"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { SupportTicket, CustomerSentiment } from "@/data/support-data";
import { sentimentLabels } from "@/data/support-data";

const SENTIMENT_STYLE: Record<CustomerSentiment, string> = {
  positive: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  neutral: "border-border bg-muted/30 text-muted-foreground",
  frustrated: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  urgent: "border-red-500/30 bg-red-500/10 text-red-700",
};

interface CustomerSnapshotCardProps {
  ticket: SupportTicket;
}

export default function CustomerSnapshotCard({ ticket }: CustomerSnapshotCardProps) {
  const initials = ticket.customer.name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const stats = ticket.customerStats;

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Customer
        </span>
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-foreground truncate">
            {ticket.customer.name}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {ticket.customer.company}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center border px-1.5 py-0.5 text-[10px] font-semibold",
            SENTIMENT_STYLE[ticket.customerSentiment],
          )}
        >
          {sentimentLabels[ticket.customerSentiment]}
        </span>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-px border-t border-border bg-border">
          {stats.lifetimeSpend && (
            <div className="bg-card px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Lifetime
              </p>
              <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-foreground">
                {stats.lifetimeSpend}
              </p>
            </div>
          )}
          {stats.ordersLast12mo !== undefined && (
            <div className="bg-card px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                12mo Orders
              </p>
              <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-foreground">
                {stats.ordersLast12mo}
              </p>
            </div>
          )}
          {stats.openOrders !== undefined && (
            <div className="bg-card px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Open
              </p>
              <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-foreground">
                {stats.openOrders}
              </p>
            </div>
          )}
        </div>
      )}

      {stats?.notes && (
        <div className="border-t border-border px-4 py-2">
          <p className="text-[11px] text-muted-foreground italic">{stats.notes}</p>
        </div>
      )}

      {ticket.assignedTo && (
        <div className="flex items-center gap-2 border-t border-border bg-muted/20 px-4 py-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary/20 text-[9px] font-semibold text-primary">
              {ticket.assignedTo.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Owner
            </p>
            <p className="text-[11px] font-medium text-foreground/85 truncate">
              {ticket.assignedTo.name} · {ticket.assignedTo.role}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
