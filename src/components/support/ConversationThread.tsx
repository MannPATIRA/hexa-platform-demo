"use client";

import Link from "next/link";
import { ExternalLink, Phone, Globe, Database } from "lucide-react";
import { callDetails } from "@/data/callDetails";
import type { SupportTicket } from "@/data/support-data";
import { channelLabels } from "@/data/support-data";
import DraftComposer from "./DraftComposer";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
}

function PhoneCallSnippet({ callId }: { callId: string }) {
  const detail = callDetails[callId];
  if (!detail) return null;

  const customerLines = detail.transcript
    .filter((m) => m.role === "customer")
    .slice(0, 2);
  const agentLines = detail.transcript
    .filter((m) => m.role === "sales")
    .slice(0, 1);

  return (
    <div className="border border-blue-500/30 bg-blue-500/5">
      <div className="flex items-center justify-between border-b border-blue-500/20 bg-blue-500/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <Phone size={12} className="text-blue-700" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">
            Phone call · transcript snippet
          </span>
        </div>
        <Link
          href={`/calls/${callId}`}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900"
        >
          View full call
          <ExternalLink size={10} />
        </Link>
      </div>
      <div className="space-y-2 px-4 py-3">
        {customerLines.map((line, i) => (
          <div key={`c-${i}`} className="text-[12px] leading-relaxed">
            <span className="font-semibold text-blue-800">{line.speaker}:</span>{" "}
            <span className="text-foreground/80">{line.text}</span>
          </div>
        ))}
        {agentLines.map((line, i) => (
          <div key={`a-${i}`} className="text-[12px] leading-relaxed">
            <span className="font-semibold text-foreground/85">{line.speaker}:</span>{" "}
            <span className="text-foreground/70">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebFormSnippet({ formId }: { formId: string }) {
  return (
    <div className="border border-violet-500/30 bg-violet-500/5">
      <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/10 px-4 py-2">
        <Globe size={12} className="text-violet-700" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-800">
          Web form submission · {formId}
        </span>
      </div>
    </div>
  );
}

function PortalSnippet({ portalRef }: { portalRef: string }) {
  return (
    <div className="border border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2">
        <Database size={12} className="text-amber-700" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
          Customer portal · {portalRef}
        </span>
      </div>
    </div>
  );
}

interface ConversationThreadProps {
  ticket: SupportTicket;
}

export default function ConversationThread({ ticket }: ConversationThreadProps) {
  const showCallSnippet =
    ticket.channel === "phone" && ticket.channelRef?.callId;
  const showFormSnippet =
    ticket.channel === "web_form" && ticket.channelRef?.formId;
  const showPortalSnippet =
    ticket.channel === "portal" && ticket.channelRef?.portalRef;

  return (
    <div className="space-y-4">
      {/* Channel context (phone / web form / portal) */}
      {showCallSnippet && <PhoneCallSnippet callId={ticket.channelRef!.callId!} />}
      {showFormSnippet && <WebFormSnippet formId={ticket.channelRef!.formId!} />}
      {showPortalSnippet && (
        <PortalSnippet portalRef={ticket.channelRef!.portalRef!} />
      )}

      {/* Customer message */}
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-2 px-1">
          <span className="inline-flex items-center gap-1.5 border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground">
            Customer
          </span>
          <span className="text-[11px] text-muted-foreground">
            {ticket.customer.email}
          </span>
          <span className="text-[11px] text-muted-foreground">
            · via {channelLabels[ticket.channel]}
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {formatDateTime(ticket.createdAt)}
          </span>
        </div>
        <div className="w-full border border-border bg-background/60 px-4 py-3">
          <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-line">
            {ticket.customerMessage}
          </p>
        </div>
      </div>

      {/* Sent reply (auto_resolved) — neutral chrome */}
      {ticket.sentResponse && (
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-2 px-1">
            <span className="inline-flex items-center border border-border bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-foreground/85">
              Reply
            </span>
            <span className="text-[11px] text-muted-foreground">
              support@hexa-demo.com
            </span>
            {ticket.resolvedAt && (
              <span className="ml-auto text-[11px] text-muted-foreground">
                Sent {formatDateTime(ticket.resolvedAt)}
              </span>
            )}
          </div>
          <div className="w-full border border-border bg-card px-4 py-3">
            <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-line">
              {ticket.sentResponse}
            </p>
          </div>
        </div>
      )}

      {/* Draft awaiting approval */}
      {ticket.status === "awaiting_approval" && ticket.draftResponse && (
        <DraftComposer ticket={ticket} />
      )}
    </div>
  );
}
