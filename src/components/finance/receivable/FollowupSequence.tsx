"use client";

import { Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { FollowupAttempt } from "@/lib/finance-types";
import VoiceCallCard from "./VoiceCallCard";
import { cn } from "@/lib/utils";

interface FollowupSequenceProps {
  attempts: FollowupAttempt[];
  expandedAttemptId?: string;
}

export default function FollowupSequence({ attempts, expandedAttemptId }: FollowupSequenceProps) {
  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          Follow-up campaign
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {attempts.length} touchpoints across email and voice — every one logged with the outcome.
        </p>
      </div>
      <ol className="divide-y divide-border/60">
        {attempts.map((attempt, i) => (
          <motion.li
            key={attempt.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="px-5 py-4"
          >
            <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="font-mono text-[10.5px]">Day {attempt.dayOffset}</span>
              <span>·</span>
              <span>
                {new Date(attempt.occurredAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {attempt.channel === "email" ? (
              <EmailRow attempt={attempt} defaultOpen={attempt.id === expandedAttemptId} />
            ) : (
              <VoiceCallCard attempt={attempt} defaultOpen={attempt.id === expandedAttemptId} />
            )}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function EmailRow({ attempt, defaultOpen = false }: { attempt: FollowupAttempt; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasBody = !!attempt.emailBody;

  return (
    <div className="border border-border bg-background/40">
      <button
        type="button"
        onClick={() => hasBody && setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left",
          hasBody && "transition-colors hover:bg-muted/30"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-card">
          <Mail size={11} className="text-primary/70" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[12.5px] font-medium text-foreground/85">
              {attempt.subject ?? "Email follow-up"}
            </p>
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 text-[10.5px]",
                outcomeStyle(attempt.outcome)
              )}
            >
              {outcomeLabel(attempt.outcome)}
            </span>
          </div>
          {attempt.notes && (
            <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{attempt.notes}</p>
          )}
        </div>
        {hasBody && (
          <div className="shrink-0 text-muted-foreground">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        )}
      </button>
      {open && hasBody && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border bg-muted/10 px-5 py-4"
        >
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/80">
            {attempt.emailBody}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

function outcomeLabel(o: string): string {
  return (
    {
      delivered: "Delivered",
      opened: "Opened",
      no_response: "No reply",
      bounced: "Bounced",
      paid: "Paid",
      promised: "Promise",
      disputed: "Dispute",
      voicemail: "Voicemail",
      no_answer: "No answer",
      completed_call: "Spoke",
    }[o] ?? o
  );
}

function outcomeStyle(o: string): string {
  if (o === "paid") return "bg-emerald-500/10 text-emerald-700";
  if (o === "promised") return "bg-violet-500/10 text-violet-700";
  if (o === "disputed" || o === "bounced") return "bg-red-500/10 text-red-700";
  if (o === "no_response" || o === "voicemail" || o === "no_answer") return "bg-amber-500/10 text-amber-700";
  return "bg-muted/40 text-muted-foreground";
}
