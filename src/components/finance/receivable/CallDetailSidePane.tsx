"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Clock,
  CheckCircle2,
  HandCoins,
  ShieldAlert,
  Mic,
  User,
} from "lucide-react";
import type { FollowupAttempt, VoiceTranscriptLine } from "@/lib/finance-types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CallDetailSidePaneProps {
  attempt: FollowupAttempt | null;
  customerName?: string;
  customerSubtitle?: string;
  invoiceLabel?: string;
  onClose: () => void;
}

const SENTIMENT_META = {
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

const OUTCOME_META: Record<
  string,
  { label: string; icon: typeof CheckCircle2; tone: "emerald" | "violet" | "red" | "amber" | "muted" }
> = {
  promised: { label: "Promise to pay logged", icon: HandCoins, tone: "violet" },
  disputed: { label: "Dispute raised", icon: ShieldAlert, tone: "red" },
  voicemail: { label: "Voicemail left", icon: Phone, tone: "amber" },
  no_answer: { label: "No answer", icon: Phone, tone: "amber" },
  completed_call: { label: "Conversation completed", icon: CheckCircle2, tone: "emerald" },
  paid: { label: "Paid in call", icon: CheckCircle2, tone: "emerald" },
};

export default function CallDetailSidePane({
  attempt,
  customerName,
  customerSubtitle,
  invoiceLabel,
  onClose,
}: CallDetailSidePaneProps) {
  useEffect(() => {
    if (!attempt) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [attempt, onClose]);

  return (
    <AnimatePresence>
      {attempt && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            key="pane"
            role="dialog"
            aria-modal="true"
            aria-label="Voice call detail"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 340, mass: 0.9 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[min(960px,92vw)] flex-col border-l border-border bg-card shadow-2xl"
          >
            <PaneHeader
              attempt={attempt}
              customerName={customerName}
              customerSubtitle={customerSubtitle}
              invoiceLabel={invoiceLabel}
              onClose={onClose}
            />
            <SummaryBanner attempt={attempt} />
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <div
                className="flex min-h-0 w-[44%] flex-col overflow-hidden"
                style={{ borderRight: "1px solid hsl(var(--border))" }}
              >
                <TranscriptPanel attempt={attempt} />
              </div>
              <div className="flex min-h-0 w-[56%] flex-col overflow-hidden bg-background/40">
                <KeyDetailsPanel attempt={attempt} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PaneHeader({
  attempt,
  customerName,
  customerSubtitle,
  invoiceLabel,
  onClose,
}: {
  attempt: FollowupAttempt;
  customerName?: string;
  customerSubtitle?: string;
  invoiceLabel?: string;
  onClose: () => void;
}) {
  const sentiment = attempt.voiceSentiment;
  const sentimentMeta = sentiment ? SENTIMENT_META[sentiment] : null;
  const SentimentIcon = sentimentMeta?.icon;

  const duration = attempt.voiceDurationSeconds
    ? `${Math.floor(attempt.voiceDurationSeconds / 60)}m ${attempt.voiceDurationSeconds % 60}s`
    : null;

  const date = new Date(attempt.occurredAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const initials = customerName
    ? customerName
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "VC";

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-primary/20 text-[11px] font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-display truncate text-[20px] font-medium leading-none text-foreground">
              {customerName ?? "Voice call"}
            </h2>
            <span className="inline-flex shrink-0 items-center gap-1 border border-primary/30 bg-primary/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary/80">
              <Phone size={9} strokeWidth={2.5} />
              Voice call
            </span>
          </div>
          <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
            {customerSubtitle && <span>{customerSubtitle}</span>}
            {customerSubtitle && invoiceLabel && <span className="px-1.5">·</span>}
            {invoiceLabel && <span className="font-mono">{invoiceLabel}</span>}
            {(customerSubtitle || invoiceLabel) && <span className="px-1.5">·</span>}
            <span>{date}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {sentimentMeta && SentimentIcon && (
          <span
            className={cn(
              "inline-flex items-center gap-1 border px-2 py-1 text-[11px] font-medium",
              sentimentMeta.color,
              sentimentMeta.bg
            )}
          >
            <SentimentIcon size={11} />
            {sentimentMeta.label}
          </span>
        )}
        <span className="border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground">
          Call ended
        </span>
        {duration && (
          <span className="tabular-nums font-mono text-[13px] text-foreground/70">
            {duration}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close call detail"
          title="Close (Esc)"
          className="group ml-1 inline-flex items-center gap-1.5 border border-border bg-background/60 px-2 py-1.5 text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted hover:text-foreground"
        >
          <X size={14} />
          <kbd className="hidden font-mono text-[10px] tracking-wide text-muted-foreground/70 transition-colors group-hover:text-foreground/70 sm:inline">
            ESC
          </kbd>
        </button>
      </div>
    </div>
  );
}

function SummaryBanner({ attempt }: { attempt: FollowupAttempt }) {
  const outcomeMeta = OUTCOME_META[attempt.outcome];
  const OutcomeIcon = outcomeMeta?.icon ?? Sparkles;

  if (!attempt.voiceOutcomeSummary && !outcomeMeta) return null;

  return (
    <div
      className="flex items-center justify-between border-b px-6 py-2.5"
      style={{
        background: "rgba(79,70,229,0.08)",
        borderBottomColor: "rgba(79,70,229,0.24)",
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Sparkles size={12} className="shrink-0 text-primary/80" />
        <p className="truncate text-[12px] text-foreground/85">
          <span className="font-semibold text-primary/90">AI summary · </span>
          {attempt.voiceOutcomeSummary ?? outcomeMeta?.label}
        </p>
      </div>
      {outcomeMeta && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold",
            outcomeMeta.tone === "emerald" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
            outcomeMeta.tone === "violet" && "border-violet-500/30 bg-violet-500/10 text-violet-700",
            outcomeMeta.tone === "red" && "border-red-500/30 bg-red-500/10 text-red-700",
            outcomeMeta.tone === "amber" && "border-amber-500/30 bg-amber-500/10 text-amber-700",
            outcomeMeta.tone === "muted" && "border-border bg-muted/40 text-muted-foreground"
          )}
        >
          <OutcomeIcon size={11} strokeWidth={2.2} />
          {outcomeMeta.label}
        </div>
      )}
    </div>
  );
}

function TranscriptPanel({ attempt }: { attempt: FollowupAttempt }) {
  const transcript = attempt.voiceTranscript ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Mic size={12} className="text-primary/80" />
          <span className="text-[12px] font-semibold text-muted-foreground">
            Transcript
          </span>
          {transcript.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {transcript.length} messages
            </Badge>
          )}
        </div>
      </div>

      {transcript.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-[12px] text-muted-foreground">
          No transcript available for this call.
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 px-5 py-5">
            {transcript.map((line, i) => (
              <TranscriptBubble key={i} line={line} index={i} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function TranscriptBubble({ line, index }: { line: VoiceTranscriptLine; index: number }) {
  const isAgent = line.role === "agent";
  return (
    <motion.div
      initial={{ y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: Math.min(index * 0.025, 0.4), duration: 0.22, ease: "easeOut" }}
      className={cn("flex flex-col gap-1", isAgent ? "items-end" : "items-start")}
    >
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
          "max-w-[88%] border px-4 py-2.5 text-[13px] leading-[1.65]",
          isAgent
            ? "border-primary/30 bg-primary/10 text-foreground/90"
            : "border-border bg-background/60 text-foreground/85"
        )}
      >
        {line.highlights?.length ? renderHighlighted(line.text, line.highlights) : line.text}
      </div>
    </motion.div>
  );
}

function KeyDetailsPanel({ attempt }: { attempt: FollowupAttempt }) {
  const duration = attempt.voiceDurationSeconds
    ? `${Math.floor(attempt.voiceDurationSeconds / 60)}m ${attempt.voiceDurationSeconds % 60}s`
    : "—";

  const outcomeMeta = OUTCOME_META[attempt.outcome];
  const sentiment = attempt.voiceSentiment;
  const sentimentMeta = sentiment ? SENTIMENT_META[sentiment] : null;
  const SentimentIcon = sentimentMeta?.icon;

  const allHighlights = [
    ...new Set(attempt.voiceTranscript?.flatMap((l) => l.highlights ?? []) ?? []),
  ];

  const highlightLines = (attempt.voiceTranscript ?? []).filter(
    (l) => (l.highlights?.length ?? 0) > 0
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Sparkles size={13} className="text-primary/80" />
          <span className="text-[12px] font-semibold text-muted-foreground">
            AI-extracted key details
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">No human listening required</p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-3 gap-3">
            <DetailTile
              label="Outcome"
              value={outcomeMeta?.label ?? attempt.outcome}
              tone={outcomeMeta?.tone ?? "muted"}
              icon={outcomeMeta?.icon}
            />
            <DetailTile label="Duration" value={duration} mono />
            <DetailTile
              label="Sentiment"
              value={sentimentMeta?.label ?? "—"}
              tone={
                sentiment === "positive"
                  ? "emerald"
                  : sentiment === "negative"
                  ? "red"
                  : sentiment === "neutral"
                  ? "amber"
                  : "muted"
              }
              icon={SentimentIcon}
            />
          </div>

          {attempt.voiceOutcomeSummary && (
            <DetailSection
              title="Summary"
              subtitle="What the agent took away from the conversation"
            >
              <p className="text-[13px] leading-relaxed text-foreground/85">
                {attempt.voiceOutcomeSummary}
              </p>
            </DetailSection>
          )}

          {allHighlights.length > 0 && (
            <DetailSection
              title="Extracted terms"
              subtitle="Key terms auto-detected from the conversation"
            >
              <div className="flex flex-wrap gap-1.5">
                {allHighlights.map((h, i) => (
                  <span
                    key={i}
                    className="border px-2 py-0.5 text-[11.5px] font-medium"
                    style={{
                      backgroundColor: "rgba(250,204,21,0.18)",
                      color: "#B45309",
                      borderColor: "rgba(250,204,21,0.4)",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          {highlightLines.length > 0 && (
            <DetailSection
              title="Key snippets"
              subtitle="Lines flagged by the agent during transcription"
            >
              <ul className="space-y-2.5">
                {highlightLines.map((line, i) => (
                  <li
                    key={i}
                    className="border border-border bg-card px-3 py-2.5 text-[12.5px] leading-snug"
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      {line.role === "agent" ? (
                        <Mic size={10} className="text-primary/70" />
                      ) : (
                        <User size={10} className="text-muted-foreground" />
                      )}
                      {line.speaker}
                    </div>
                    <p className="text-foreground/85">
                      {line.highlights?.length
                        ? renderHighlighted(line.text, line.highlights)
                        : line.text}
                    </p>
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          <div className="border border-dashed border-border bg-muted/20 px-4 py-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock size={10} />
              Recorded
            </div>
            <p className="text-[12.5px] text-foreground/80">
              {new Date(attempt.occurredAt).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function DetailTile({
  label,
  value,
  tone = "muted",
  icon: Icon,
  mono = false,
}: {
  label: string;
  value: string;
  tone?: "emerald" | "violet" | "red" | "amber" | "muted";
  icon?: typeof CheckCircle2;
  mono?: boolean;
}) {
  return (
    <div className="border border-border bg-card px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div
        className={cn(
          "mt-1 flex items-center gap-1.5 text-[12.5px] font-medium",
          tone === "emerald" && "text-emerald-700",
          tone === "violet" && "text-violet-700",
          tone === "red" && "text-red-700",
          tone === "amber" && "text-amber-700",
          tone === "muted" && "text-foreground/85",
          mono && "font-mono"
        )}
      >
        {Icon && <Icon size={12} strokeWidth={2.2} />}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-[10.5px] text-muted-foreground/80">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function renderHighlighted(text: string, highlights: string[]) {
  const sorted = [...highlights].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${sorted.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isHL = sorted.some((h) => h.toLowerCase() === part.toLowerCase());
    if (!isHL) return part;
    return (
      <span
        key={i}
        className="px-[3px] py-[1px]"
        style={{ backgroundColor: "rgba(250,204,21,0.25)", color: "#B45309" }}
      >
        {part}
      </span>
    );
  });
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
