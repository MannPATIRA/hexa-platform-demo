"use client";

import { useState } from "react";
import { Send, Pencil, AlertTriangle, Save, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportTicket } from "@/data/support-data";

interface DraftComposerProps {
  ticket: SupportTicket;
  onSend?: (body: string) => void | Promise<void>;
  onEscalate?: () => void;
  isCascading?: boolean;
  draftSent?: boolean;
  draftRejected?: boolean;
}

const defaultFrom = "support@hexa-demo.com";

// Note: this component is mounted fresh per ticket route, so initial state
// from props is sufficient and we avoid syncing in an effect.
export default function DraftComposer({
  ticket,
  onSend,
  onEscalate,
  isCascading = false,
  draftSent = false,
  draftRejected = false,
}: DraftComposerProps) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(ticket.draftResponse ?? "");
  const [toEmail, setToEmail] = useState(ticket.customer.email);
  const [subject, setSubject] = useState(`Re: ${ticket.subject}`);
  const [savedFlash, setSavedFlash] = useState(false);

  const confPct = ticket.draftConfidence
    ? Math.round(ticket.draftConfidence * 100)
    : null;

  const handleSave = () => {
    setEditing(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const isDisabled = isCascading || draftSent || draftRejected;

  const headerLabel = draftSent
    ? "Draft Approved & Sent"
    : draftRejected
      ? "Draft Rejected — Escalated"
      : "Draft Reply — Awaiting Approval";

  const headerColor = draftSent
    ? "text-emerald-800"
    : draftRejected
      ? "text-red-800"
      : "text-amber-800";

  const containerColor = draftSent
    ? "border-emerald-500/30 bg-emerald-500/5"
    : draftRejected
      ? "border-red-500/30 bg-red-500/5"
      : "border-amber-500/30 bg-amber-500/5";

  const headerBg = draftSent
    ? "border-emerald-500/20 bg-emerald-500/10"
    : draftRejected
      ? "border-red-500/20 bg-red-500/10"
      : "border-amber-500/20 bg-amber-500/10";

  return (
    <div className={cn("border", containerColor)}>
      {/* Draft header */}
      <div className={cn("flex items-center justify-between border-b px-4 py-2", headerBg)}>
        <div className="flex items-center gap-2">
          {draftSent && <CheckCircle2 size={11} className="text-emerald-700" />}
          {draftRejected && <XCircle size={11} className="text-red-700" />}
          <span className={cn("text-[11px] font-semibold uppercase tracking-wider", headerColor)}>
            {headerLabel}
          </span>
          {confPct !== null && !draftSent && !draftRejected && (
            <span className="text-[11px] tabular-nums text-amber-700">
              · {confPct}% confidence
            </span>
          )}
        </div>
        {savedFlash && (
          <span className="text-[11px] text-emerald-700">Saved</span>
        )}
      </div>

      {/* Editable headers */}
      <div className="space-y-1.5 border-b border-border bg-card/60 px-4 py-3">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-12 shrink-0 text-right text-muted-foreground">To</span>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            disabled={!editing || isDisabled}
            className="flex-1 min-w-0 border border-border bg-background px-2 py-1 text-[12px] text-foreground/85 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-transparent disabled:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-12 shrink-0 text-right text-muted-foreground">From</span>
          <span className="flex-1 min-w-0 px-2 py-1 text-[12px] text-foreground/70">
            {defaultFrom}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-12 shrink-0 text-right text-muted-foreground">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={!editing || isDisabled}
            className="flex-1 min-w-0 border border-border bg-background px-2 py-1 text-[12px] font-medium text-foreground/85 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-transparent disabled:border-transparent"
          />
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {editing && !isDisabled ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full min-w-0 resize-y border border-border bg-background px-3 py-2 font-sans text-[12px] leading-relaxed text-foreground/85 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-line">
            {body}
          </p>
        )}
      </div>

      {/* Actions */}
      {!draftRejected && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-card/40 px-4 py-2.5">
          <button
            type="button"
            onClick={() => onSend?.(body)}
            disabled={isDisabled}
            className="inline-flex items-center gap-1.5 bg-foreground px-3 py-1.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCascading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending…
              </>
            ) : draftSent ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sent
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Approve & Send
              </>
            )}
          </button>
          {!draftSent && (
            editing ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={isDisabled}
                className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground/80 transition-colors hover:bg-accent/60 disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                Save Edits
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={isDisabled}
                className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground/80 transition-colors hover:bg-accent/60 disabled:opacity-60"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )
          )}
          <div className="flex-1" />
          {!draftSent && (
            <button
              type="button"
              onClick={() => onEscalate?.()}
              disabled={isDisabled}
              className="inline-flex items-center gap-1.5 border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-[12px] font-medium text-red-700 transition-colors hover:bg-red-500/10 disabled:opacity-60"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Reject & Escalate
            </button>
          )}
        </div>
      )}
    </div>
  );
}
