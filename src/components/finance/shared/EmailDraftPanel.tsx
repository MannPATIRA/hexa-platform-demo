"use client";

import { useState } from "react";
import { Mail, Paperclip, Send, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmailDraftPanelProps {
  open: boolean;
  onClose: () => void;
  defaultTo: string;
  defaultFrom?: string;
  defaultSubject: string;
  defaultBody: string;
  attachments?: { id: string; label: string }[];
  onSend?: () => void;
  title?: string;
}

export default function EmailDraftPanel({
  open,
  onClose,
  defaultTo,
  defaultFrom = "ap@hexamfg.com",
  defaultSubject,
  defaultBody,
  attachments = [],
  onSend,
  title = "Generated email",
}: EmailDraftPanelProps) {
  const [to, setTo] = useState(defaultTo);
  const [from, setFrom] = useState(defaultFrom);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onSend?.();
      onClose();
      setSent(false);
    }, 700);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="relative z-10 flex h-full w-[640px] max-w-[90vw] flex-col border-l border-border bg-background shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Mail size={14} className="text-primary/80" />
            <h2 className="font-display text-[15px] font-medium leading-none text-foreground">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3 text-[13px]">
            <Field label="From">
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border border-border bg-background px-2 py-1.5 text-[12.5px]"
              />
            </Field>
            <Field label="To">
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border border-border bg-background px-2 py-1.5 text-[12.5px]"
              />
            </Field>
            <Field label="Subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-border bg-background px-2 py-1.5 text-[12.5px]"
              />
            </Field>
            <Field label="Body">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={16}
                className="w-full resize-none border border-border bg-background px-3 py-2 font-mono text-[12px] leading-relaxed"
              />
            </Field>
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Attached evidence
                </p>
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 border border-border bg-muted/30 px-2.5 py-1.5 text-[12px] text-foreground/80"
                  >
                    <Paperclip size={11} className="text-muted-foreground" />
                    {a.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-card px-5 py-3">
          <Button variant="outline" onClick={onClose} disabled={sent}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sent} className="gap-1.5">
            {sent ? (
              <>
                <CheckCircle2 size={14} />
                Sent
              </>
            ) : (
              <>
                <Send size={14} />
                Send
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
