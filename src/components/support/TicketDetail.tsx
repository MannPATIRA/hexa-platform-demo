"use client";

import Link from "next/link";
import { ChevronRight, CheckCircle2, ArrowUpRight, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import ConversationThread from "./ConversationThread";
import DataSourceCards from "./DataSourceCards";
import AiClassificationCard from "./AiClassificationCard";
import CustomerSnapshotCard from "./CustomerSnapshotCard";
import FollowUpActionsPanel from "./FollowUpActionsPanel";
import ChannelBadge from "./ChannelBadge";
import type { SupportTicket, TicketStatus, TicketPriority } from "@/data/support-data";
import { categoryLabels, priorityLabels, statusLabels } from "@/data/support-data";

const PRIORITY_BADGE: Record<TicketPriority, string> = {
  low: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  high: "border-red-500/30 bg-red-500/10 text-red-700",
};

const STATUS_BADGE: Record<TicketStatus, string> = {
  auto_resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  awaiting_approval: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  escalated: "border-red-500/30 bg-red-500/10 text-red-700",
  in_progress: "border-violet-500/30 bg-violet-500/10 text-violet-700",
  resolved: "border-border bg-muted/40 text-muted-foreground",
};

interface TicketDetailProps {
  ticket: SupportTicket;
}

export default function TicketDetail({ ticket }: TicketDetailProps) {
  const isResolved = ticket.status === "auto_resolved";
  const isEscalated = ticket.status === "escalated";
  const isAwaiting = ticket.status === "awaiting_approval";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-7 py-4">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-2">
          <Link href="/support" className="hover:text-foreground transition-colors">
            Customer Service
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{ticket.ticketNumber}</span>
        </div>

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-1.5">
              <ChannelBadge channel={ticket.channel} showLabel size="md" />
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
                {isAwaiting && <AlertTriangle size={11} />}
                {ticket.status === "in_progress" && <Clock size={11} />}
                {statusLabels[ticket.status]}
              </span>
            </div>
            <p className="text-[14px] text-foreground/85 leading-snug">{ticket.subject}</p>
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
                Sent in {ticket.responseTimeSec}s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two-pane workspace — narrow conversation, wide action panel */}
      <div className="flex flex-1 min-h-0">
        {/* Left — Conversation (narrower) */}
        <div className="w-[480px] shrink-0 overflow-y-auto bg-card border-r border-border">
          <div className="px-5 pb-10 pt-5 space-y-4">
            <ConversationThread ticket={ticket} />

            {/* Escalation reason */}
            {isEscalated && ticket.escalationReason && (
              <div className="border border-red-500/30 bg-red-500/5 p-4">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-red-700">
                  Escalation Reason
                </h4>
                <p className="text-[12px] leading-relaxed text-foreground/85">
                  {ticket.escalationReason}
                </p>
              </div>
            )}

            {/* AI Context Summary (escalated) */}
            {isEscalated && ticket.aiContextSummary && ticket.aiContextSummary.length > 0 && (
              <div className="border border-border bg-card p-4">
                <h4 className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Context Brief
                </h4>
                <ul className="space-y-1.5">
                  {ticket.aiContextSummary.map((point, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-foreground/80 leading-snug">
                      <span className="text-muted-foreground/50 select-none">—</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right — Action Workspace (wider) */}
        <aside className="flex-1 min-w-0 bg-muted/10 overflow-y-auto">
          <div className="px-6 py-6 space-y-4 max-w-[860px]">
            <div className="grid grid-cols-2 gap-4">
              <AiClassificationCard classification={ticket.classification} />
              <CustomerSnapshotCard ticket={ticket} />
            </div>
            <FollowUpActionsPanel actions={ticket.followUpActions} />
            <DataSourceCards sources={ticket.dataSources} />
          </div>
        </aside>
      </div>
    </div>
  );
}
