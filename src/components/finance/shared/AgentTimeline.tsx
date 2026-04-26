"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  Search,
  Link2,
  AlertTriangle,
  Clock,
  PhoneCall,
  Sparkles,
  CreditCard,
  Inbox,
  RotateCw,
  Flag,
  Phone,
  HandCoins,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRightSquare,
  Info,
} from "lucide-react";
import type { AgentEvent, AgentEventType } from "@/lib/finance-types";
import { cn } from "@/lib/utils";

const ICONS: Record<AgentEventType, typeof Mail> = {
  invoice_received: Inbox,
  fields_extracted: Sparkles,
  po_linked: Link2,
  match_run: Search,
  discrepancy_flagged: AlertTriangle,
  history_checked: Search,
  email_drafted: Mail,
  email_sent: Mail,
  awaiting_reply: Clock,
  reply_received: Inbox,
  rematch_clean: ShieldCheck,
  approved: CheckCircle2,
  paid: CreditCard,
  invoice_issued: Mail,
  reminder_drafted: Mail,
  reminder_sent: Mail,
  reminder_opened: Mail,
  reminder_bounced: AlertTriangle,
  voice_call_placed: PhoneCall,
  voice_call_completed: Phone,
  promise_logged: HandCoins,
  promise_broken: RotateCw,
  dispute_raised: ShieldAlert,
  dispute_resolved: ShieldCheck,
  payment_received: CreditCard,
  escalated: Flag,
  info: Info,
};

const ACCENT: Partial<Record<AgentEventType, string>> = {
  discrepancy_flagged: "text-amber-600",
  reminder_bounced: "text-red-600",
  promise_broken: "text-red-600",
  dispute_raised: "text-amber-600",
  escalated: "text-red-600",
  rematch_clean: "text-emerald-600",
  approved: "text-emerald-600",
  paid: "text-emerald-600",
  payment_received: "text-emerald-600",
  dispute_resolved: "text-emerald-600",
};

interface AgentTimelineProps {
  events: AgentEvent[];
  title?: string;
  subtitle?: string;
}

export default function AgentTimeline({
  events,
  title = "Agent Activity",
  subtitle = "Every check, every email, every call — chronological.",
}: AgentTimelineProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-primary/70" />
          <h4 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h4>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <ol className="divide-y divide-border/60">
        {events.map((event, i) => {
          const Icon = ICONS[event.type] ?? Info;
          const accent = ACCENT[event.type] ?? "text-muted-foreground";
          return (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="flex gap-3 px-5 py-3"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-background">
                <Icon size={12} className={accent} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cn("text-[12.5px] font-medium leading-tight text-foreground/90", accent)}>
                    {event.title}
                  </p>
                  <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
                    {formatTime(event.occurredAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                  {event.detail}
                </p>
                {event.evidence && (
                  <button
                    type="button"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
                  >
                    <ArrowUpRightSquare size={11} />
                    {event.evidence.label}
                  </button>
                )}
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
