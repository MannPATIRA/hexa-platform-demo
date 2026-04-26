"use client";

import { useState } from "react";
import { Send, Pencil, AlertTriangle, Save } from "lucide-react";
import type { SupportTicket } from "@/data/support-data";

interface DraftComposerProps {
  ticket: SupportTicket;
  onSend?: (body: string) => void;
  onEscalate?: () => void;
}

const defaultFrom = "support@hexa-demo.com";

// Note: this component is mounted fresh per ticket route, so initial state
// from props is sufficient and we avoid syncing in an effect.
export default function DraftComposer({ ticket, onSend, onEscalate }: DraftComposerProps) {
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

  return (
    <div className="border border-amber-500/30 bg-amber-500/5">
      {/* Draft header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
            Draft Reply — Awaiting Approval
          </span>
          {confPct !== null && (
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
      <div className="space-y-1.5 border-b border-amber-500/20 bg-card/60 px-4 py-3">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-12 shrink-0 text-right text-muted-foreground">To</span>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            disabled={!editing}
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
            disabled={!editing}
            className="flex-1 min-w-0 border border-border bg-background px-2 py-1 text-[12px] font-medium text-foreground/85 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-transparent disabled:border-transparent"
          />
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {editing ? (
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
      <div className="flex flex-wrap items-center gap-2 border-t border-amber-500/20 bg-card/40 px-4 py-2.5">
        <button
          type="button"
          onClick={() => onSend?.(body)}
          className="inline-flex items-center gap-1.5 bg-foreground px-3 py-1.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
        >
          <Send className="h-3.5 w-3.5" />
          Approve & Send
        </button>
        {editing ? (
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground/80 transition-colors hover:bg-accent/60"
          >
            <Save className="h-3.5 w-3.5" />
            Save Edits
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground/80 transition-colors hover:bg-accent/60"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => onEscalate?.()}
          className="inline-flex items-center gap-1.5 border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-[12px] font-medium text-red-700 transition-colors hover:bg-red-500/10"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Reject & Escalate
        </button>
      </div>
    </div>
  );
}
