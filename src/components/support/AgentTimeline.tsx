"use client";

import { motion } from "framer-motion";
import {
  Inbox,
  Tag,
  Database,
  FileText,
  Workflow,
  Send,
  Users,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LifecycleEvent, LifecycleEventType } from "@/data/support-data";

const ICONS: Record<LifecycleEventType, typeof Inbox> = {
  received: Inbox,
  classified: Tag,
  grounded: Database,
  drafted: FileText,
  auto_routed: Workflow,
  approval_requested: Clock,
  escalated_to_owner: AlertTriangle,
  draft_approved: CheckCircle2,
  draft_edited: Pencil,
  draft_rejected: XCircle,
  sent: Send,
  follow_up_queued: Users,
  follow_up_done: CheckCircle2,
  customer_replied: MessageCircle,
  resolved: CheckCircle2,
};

const ACCENT: Partial<Record<LifecycleEventType, string>> = {
  approval_requested: "text-amber-700",
  escalated_to_owner: "text-red-600",
  draft_approved: "text-emerald-600",
  draft_rejected: "text-red-600",
  sent: "text-emerald-600",
  follow_up_done: "text-emerald-600",
  resolved: "text-emerald-600",
  customer_replied: "text-blue-600",
};

interface AgentTimelineProps {
  events: LifecycleEvent[];
  title?: string;
}

export default function AgentTimeline({
  events,
  title = "Agent Activity",
}: AgentTimelineProps) {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>
      <ol className="divide-y divide-border/60">
        {events.map((event, i) => {
          const Icon = ICONS[event.type] ?? Inbox;
          const accent = ACCENT[event.type] ?? "text-muted-foreground";
          return (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.25 }}
              className="flex gap-3 px-4 py-2.5"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-background">
                <Icon size={12} className={accent} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cn("text-[12px] font-medium leading-tight text-foreground/90", accent)}>
                    {event.title}
                  </p>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {formatTime(event.occurredAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {event.detail}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "pm" : "am";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${month} ${day} · ${h12}:${minute}${ampm}`;
}
