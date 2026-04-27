"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2, ArrowUpRight, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import ConversationThread from "./ConversationThread";
import DataSourceCards from "./DataSourceCards";
import AiClassificationCard from "./AiClassificationCard";
import CustomerSnapshotCard from "./CustomerSnapshotCard";
import FollowUpActionsPanel from "./FollowUpActionsPanel";
import ChannelBadge from "./ChannelBadge";
import StageBar from "./StageBar";
import AgentTimeline from "./AgentTimeline";
import type {
  SupportTicket,
  TicketStatus,
  TicketPriority,
  SupportStage,
  LifecycleEvent,
  LifecycleEventType,
} from "@/data/support-data";
import {
  categoryLabels,
  priorityLabels,
  statusLabels,
  getLifecyclePath,
} from "@/data/support-data";

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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface TicketDetailProps {
  ticket: SupportTicket;
}

export default function TicketDetail({ ticket }: TicketDetailProps) {
  const isResolved = ticket.status === "auto_resolved";
  const isEscalated = ticket.status === "escalated";
  const isAwaiting = ticket.status === "awaiting_approval";

  const path = getLifecyclePath(ticket.status);

  const [stage, setStage] = useState<SupportStage>(ticket.currentStage);
  const [events, setEvents] = useState<LifecycleEvent[]>(ticket.lifecycleEvents);
  const [isCascading, setIsCascading] = useState(false);
  const [draftSent, setDraftSent] = useState(false);
  const [draftRejected, setDraftRejected] = useState(false);
  const [sentBody, setSentBody] = useState<string | null>(null);

  const appendEvent = useCallback(
    (type: LifecycleEventType, title: string, detail: string) => {
      setEvents((prev) => [
        ...prev,
        {
          id: `${ticket.id}-rt-${prev.length + 1}-${Date.now()}`,
          occurredAt: new Date().toISOString(),
          type,
          title,
          detail,
        },
      ]);
    },
    [ticket.id],
  );

  const approveAndSendCascade = useCallback(async (body: string) => {
    if (isCascading || draftSent) return;
    setIsCascading(true);
    setDraftSent(true);
    setSentBody(body);

    appendEvent(
      "draft_approved",
      "Draft approved by James Morrison",
      "One-click approval; reply dispatching.",
    );
    await sleep(500);

    appendEvent("sent", `Reply sent to ${ticket.customer.email}`, "Reply dispatched.");
    setStage("sent");
    await sleep(900);

    appendEvent(
      "follow_up_queued",
      "Follow-up actions fired",
      `${ticket.followUpActions.length} cross-team action${ticket.followUpActions.length === 1 ? "" : "s"} queued.`,
    );
    setStage("follow_ups_fired");
    await sleep(900);

    appendEvent(
      "customer_replied",
      "Customer acknowledged",
      "Customer confirmed resolution — no further questions.",
    );
    setStage("customer_acknowledged");
    await sleep(900);

    appendEvent("resolved", "Ticket resolved", "Closed and archived.");
    setStage("resolved");
    setIsCascading(false);
  }, [
    isCascading,
    draftSent,
    appendEvent,
    ticket.customer.email,
    ticket.followUpActions.length,
  ]);

  const escalate = useCallback(() => {
    if (isCascading || draftRejected) return;
    setDraftRejected(true);
    appendEvent(
      "draft_rejected",
      "Draft rejected — escalating",
      "Reviewer rejected the draft; routing to human owner.",
    );
    appendEvent(
      "escalated_to_owner",
      ticket.assignedTo
        ? `Escalated to ${ticket.assignedTo.name}`
        : "Escalated to human owner",
      "Owner has full AI context and conversation thread.",
    );
    setStage("routed");
  }, [isCascading, draftRejected, appendEvent, ticket.assignedTo]);

  const handleFollowUpEvent = useCallback(
    (team: string, action: string, kind: "queued" | "done" | "skipped") => {
      if (kind === "queued") {
        appendEvent(
          "follow_up_queued",
          `${team} action queued`,
          action,
        );
      } else if (kind === "done") {
        appendEvent(
          "follow_up_done",
          `${team} action marked done`,
          action,
        );
      }
    },
    [appendEvent],
  );

  // Effective path may shift to escalation if the user rejects the draft
  const effectivePath = draftRejected ? "escalation" : path;

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

      {/* Stage bar */}
      <div className="border-b border-border bg-muted/10 px-7 py-3">
        <StageBar currentStage={stage} path={effectivePath} compact />
      </div>

      {/* Two-pane workspace */}
      <div className="flex flex-1 min-h-0">
        {/* Left — Conversation */}
        <div className="w-[480px] shrink-0 overflow-y-auto bg-card border-r border-border">
          <div className="px-5 pb-10 pt-5 space-y-4">
            <ConversationThread
              ticket={ticket}
              onApproveSend={approveAndSendCascade}
              onEscalate={escalate}
              isCascading={isCascading}
              draftSent={draftSent}
              draftRejected={draftRejected}
              currentStage={stage}
              sentBody={sentBody}
            />

            {(isEscalated || draftRejected) && ticket.escalationReason && (
              <div className="border border-red-500/30 bg-red-500/5 p-4">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-red-700">
                  Escalation Reason
                </h4>
                <p className="text-[12px] leading-relaxed text-foreground/85">
                  {ticket.escalationReason}
                </p>
              </div>
            )}

            {(isEscalated || draftRejected) && ticket.aiContextSummary && ticket.aiContextSummary.length > 0 && (
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

        {/* Right — Action Workspace */}
        <aside className="flex-1 min-w-0 bg-muted/10 overflow-y-auto">
          <div className="px-6 py-6 space-y-4 max-w-[860px]">
            <div className="grid grid-cols-2 gap-4">
              <AiClassificationCard classification={ticket.classification} />
              <CustomerSnapshotCard ticket={ticket} />
            </div>
            <AgentTimeline events={events} />
            <FollowUpActionsPanel
              actions={ticket.followUpActions}
              onActionEvent={handleFollowUpEvent}
            />
            <DataSourceCards sources={ticket.dataSources} />
          </div>
        </aside>
      </div>
    </div>
  );
}
