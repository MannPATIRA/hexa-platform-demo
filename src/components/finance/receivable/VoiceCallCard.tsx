"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  ChevronDown,
  ChevronUp,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Headphones,
  PlayCircle,
  Clock,
} from "lucide-react";
import type { FollowupAttempt, VoiceTranscriptLine } from "@/lib/finance-types";
import { cn } from "@/lib/utils";

interface VoiceCallCardProps {
  attempt: FollowupAttempt;
  defaultOpen?: boolean;
  onViewDetails?: () => void;
}

const SENTIMENT_META: Record<
  "positive" | "neutral" | "negative",
  { icon: typeof Smile; label: string; color: string; bg: string }
> = {
  positive: {
    icon: Smile,
    label: "Positive",
    color: "text-emerald-700",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  neutral: {
    icon: Meh,
    label: "Neutral",
    color: "text-amber-700",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  negative: {
    icon: Frown,
    label: "Negative",
    color: "text-red-700",
    bg: "bg-red-500/10 border-red-500/30",
  },
};

export default function VoiceCallCard({
  attempt,
  defaultOpen = false,
  onViewDetails,
}: VoiceCallCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const sentiment = attempt.voiceSentiment;
  const sentimentMeta = sentiment ? SENTIMENT_META[sentiment] : null;
  const SentimentIcon = sentimentMeta?.icon;

  const duration = attempt.voiceDurationSeconds
    ? `${Math.floor(attempt.voiceDurationSeconds / 60)}m ${attempt.voiceDurationSeconds % 60}s`
    : "—";

  const hasTranscript = (attempt.voiceTranscript?.length ?? 0) > 0;
  const useSidePane = !!onViewDetails;
  const isInteractive = useSidePane && hasTranscript;

  function handleClick() {
    if (useSidePane && hasTranscript) {
      onViewDetails();
    } else if (hasTranscript) {
      setOpen(!open);
    }
  }

  return (
    <div
      className={cn(
        "group relative border bg-background/40 shadow-sm transition-all duration-200",
        isInteractive
          ? "border-primary/40 hover:border-primary hover:bg-primary/5 hover:shadow-md"
          : "border-border"
      )}
    >
      {isInteractive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary/60 to-primary/20"
        />
      )}

      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex w-full items-center gap-3.5 px-4 py-3.5 text-left",
          hasTranscript && "transition-colors"
        )}
      >
        <div
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center border",
            isInteractive
              ? "border-primary/40 bg-primary/15 text-primary"
              : "border-border bg-card text-primary/70"
          )}
        >
          <Phone size={14} strokeWidth={2.2} />
          {isInteractive && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-primary"
                animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.8, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[13px] font-semibold text-foreground">
              Voice agent call
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10.5px] font-semibold",
                outcomeStyle(attempt.outcome)
              )}
            >
              {outcomeLabel(attempt.outcome)}
            </span>
            {sentimentMeta && SentimentIcon && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10.5px] font-medium",
                  sentimentMeta.color,
                  sentimentMeta.bg
                )}
              >
                <SentimentIcon size={10} />
                {sentimentMeta.label}
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-muted-foreground">
              <Clock size={10} />
              <span className="font-mono">{duration}</span>
            </span>
          </div>

          {attempt.voiceOutcomeSummary && (
            <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">
              {attempt.voiceOutcomeSummary}
            </p>
          )}

          {isInteractive && (
            <div className="mt-2 inline-flex items-center gap-1.5 border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Headphones size={11} strokeWidth={2.2} />
              <span>Listen to call &amp; view AI breakdown</span>
            </div>
          )}
        </div>

        {!useSidePane && hasTranscript && (
          <div className="shrink-0 text-muted-foreground">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        )}
        {isInteractive && (
          <div className="shrink-0 text-primary/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary">
            <PlayCircle size={22} strokeWidth={1.8} />
          </div>
        )}
      </button>

      {!useSidePane && open && hasTranscript && (
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
      promised: "Promise to pay",
      disputed: "Dispute raised",
      voicemail: "Voicemail",
      no_answer: "No answer",
      completed_call: "Completed",
      paid: "Paid",
    }[o] ?? o
  );
}

function outcomeStyle(o: string): string {
  if (o === "paid") return "bg-emerald-500/10 text-emerald-700";
  if (o === "promised") return "bg-violet-500/10 text-violet-700";
  if (o === "disputed") return "bg-red-500/10 text-red-700";
  if (o === "no_response" || o === "voicemail" || o === "no_answer")
    return "bg-amber-500/10 text-amber-700";
  return "bg-muted/40 text-muted-foreground";
}
