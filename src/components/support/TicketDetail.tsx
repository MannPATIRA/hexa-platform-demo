"use client";

import Link from "next/link";
import { ChevronRight, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import EmailThread from "./EmailThread";
import DataSourceCards from "./DataSourceCards";
import type { SupportTicket } from "@/data/support-data";
import { categoryLabels, priorityLabels, statusLabels } from "@/data/support-data";

const PRIORITY_BADGE: Record<string, string> = {
  low: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  high: "border-red-500/30 bg-red-500/10 text-red-700",
};

const STATUS_BADGE: Record<string, string> = {
  auto_resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  escalated: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  pending: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  in_progress: "border-violet-500/30 bg-violet-500/10 text-violet-600",
};

interface TicketDetailProps {
  ticket: SupportTicket;
}

export default function TicketDetail({ ticket }: TicketDetailProps) {
  const isResolved = ticket.status === "auto_resolved";
  const isEscalated = ticket.status === "escalated";

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="border-b border-border bg-card px-7 py-5">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
          <Link href="/support" className="hover:text-foreground transition-colors">
            Customer Service
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{ticket.ticketNumber}</span>
        </div>

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="font-display text-[22px] font-medium leading-none text-foreground">
                {ticket.ticketNumber}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold",
                  PRIORITY_BADGE[ticket.priority],
                )}
              >
                {priorityLabels[ticket.priority]}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-semibold",
                  STATUS_BADGE[ticket.status],
                )}
              >
                {isResolved && <CheckCircle2 size={11} />}
                {isEscalated && <ArrowUpRight size={11} />}
                {statusLabels[ticket.status]}
              </span>
            </div>
            <p className="text-[14px] text-foreground/80 leading-snug">{ticket.subject}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              {ticket.customer.name} · {ticket.customer.company} · {categoryLabels[ticket.category]} ·{" "}
              {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {isResolved && ticket.responseTimeSec && (
            <div className="shrink-0">
              <div className="inline-flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                <CheckCircle2 size={13} />
                Response Sent in {ticket.responseTimeSec}s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl px-7 pb-10 pt-6 space-y-6">
          {/* Conversation */}
          <EmailThread ticket={ticket} />

          {/* Escalation reason */}
          {isEscalated && ticket.escalationReason && (
            <div className="border border-amber-500/30 bg-amber-500/5 p-5">
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                Escalation Reason
              </h4>
              <p className="text-[13px] leading-relaxed text-foreground/85">
                {ticket.escalationReason}
              </p>
            </div>
          )}

          {/* AI Context Summary */}
          {isEscalated && ticket.aiContextSummary && ticket.aiContextSummary.length > 0 && (
            <div className="border border-border bg-card p-5">
              <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                AI Context Summary
              </h4>
              <ul className="space-y-2">
                {ticket.aiContextSummary.map((point, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-muted-foreground">
                    <span className="text-muted-foreground/50 select-none">—</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Assigned To */}
          {isEscalated && ticket.assignedTo && (
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                    {ticket.assignedTo.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[11px] text-muted-foreground">Assigned to</p>
                  <p className="text-[14px] font-medium text-foreground">
                    {ticket.assignedTo.name} — {ticket.assignedTo.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data sources */}
          {ticket.dataSources.length > 0 && (
            <DataSourceCards sources={ticket.dataSources} />
          )}
        </div>
      </div>
    </div>
  );
}
