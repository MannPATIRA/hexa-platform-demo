"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, ChevronDown, ChevronUp, Smile, Meh, Frown, Sparkles } from "lucide-react";
import type { FollowupAttempt, VoiceTranscriptLine } from "@/lib/finance-types";
import { cn } from "@/lib/utils";

interface VoiceCallCardProps {
  attempt: FollowupAttempt;
  defaultOpen?: boolean;
}

const SENTIMENT_META: Record<"positive" | "neutral" | "negative", { icon: typeof Smile; label: string; color: string }> = {
  positive: { icon: Smile, label: "Positive", color: "text-emerald-700" },
  neutral: { icon: Meh, label: "Neutral", color: "text-amber-700" },
  negative: { icon: Frown, label: "Negative", color: "text-red-700" },
};

export default function VoiceCallCard({ attempt, defaultOpen = false }: VoiceCallCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const sentiment = attempt.voiceSentiment;
  const sentimentMeta = sentiment ? SENTIMENT_META[sentiment] : null;
  const SentimentIcon = sentimentMeta?.icon;

  const duration = attempt.voiceDurationSeconds
    ? `${Math.floor(attempt.voiceDurationSeconds / 60)}m ${attempt.voiceDurationSeconds % 60}s`
    : "—";

  const hasTranscript = (attempt.voiceTranscript?.length ?? 0) > 0;

  return (
    <div className="border border-border bg-background/40 shadow-sm">
      <button
        type="button"
        onClick={() => hasTranscript && setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left",
          hasTranscript && "transition-colors hover:bg-muted/30"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-card">
          <Phone size={11} className="text-primary/70" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[12.5px] font-medium text-foreground/85">
              Voice agent · {outcomeLabel(attempt.outcome)}
            </p>
            <span className="font-mono text-[10.5px] text-muted-foreground">{duration}</span>
            {sentimentMeta && SentimentIcon && (
              <span className={cn("inline-flex items-center gap-1 text-[10.5px]", sentimentMeta.color)}>
                <SentimentIcon size={11} />
                {sentimentMeta.label}
              </span>
            )}
          </div>
          {attempt.voiceOutcomeSummary && (
            <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
              {attempt.voiceOutcomeSummary}
            </p>
          )}
        </div>
        {hasTranscript && (
          <div className="shrink-0 text-muted-foreground">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        )}
      </button>

      {open && hasTranscript && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border bg-muted/10 px-4 py-4"
        >
          <div className="mb-2.5 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles size={11} className="text-primary/60" />
            AI-transcribed conversation
          </div>
          <div className="space-y-3">
            {attempt.voiceTranscript!.map((line, i) => (
              <TranscriptBubble key={i} line={line} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function TranscriptBubble({ line }: { line: VoiceTranscriptLine }) {
  const isAgent = line.role === "agent";
  return (
    <div className={cn("flex flex-col gap-1", isAgent ? "items-end" : "items-start")}>
      <span
        className={cn(
          "px-1 text-[10.5px] font-medium",
          isAgent ? "text-primary/80" : "text-muted-foreground"
        )}
      >
        {line.speaker}
      </span>
      <div
        className={cn(
          "max-w-[88%] border px-3 py-2 text-[12.5px] leading-snug",
          isAgent
            ? "border-primary/30 bg-primary/10 text-foreground/90"
            : "border-border bg-background/60 text-foreground/85"
        )}
      >
        {line.highlights?.length ? renderHighlighted(line.text, line.highlights) : line.text}
      </div>
    </div>
  );
}

function renderHighlighted(text: string, highlights: string[]) {
  if (!highlights?.length) return text;
  const sorted = [...highlights].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${sorted.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isHL = sorted.some((h) => h.toLowerCase() === part.toLowerCase());
    if (isHL) {
      return (
        <span
          key={i}
          className="px-[3px] py-[1px]"
          style={{ backgroundColor: "rgba(250,204,21,0.25)", color: "#B45309" }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function outcomeLabel(o: string): string {
  return (
    {
      promised: "Promise to pay logged",
      disputed: "Dispute raised",
      voicemail: "Voicemail left",
      no_answer: "No answer",
      completed_call: "Conversation completed",
      paid: "Paid in call",
    }[o] ?? o
  );
}
