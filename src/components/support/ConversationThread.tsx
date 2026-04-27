"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Phone,
  Globe,
  Database,
  Send,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { callDetails } from "@/data/callDetails";
import type { SupportTicket, SupportStage, TicketCategory } from "@/data/support-data";
import {
  channelLabels,
  SUPPORT_STAGES,
} from "@/data/support-data";
import DraftComposer from "./DraftComposer";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
}

function nowDateTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function stageReached(current: SupportStage, target: SupportStage) {
  return SUPPORT_STAGES.indexOf(current) >= SUPPORT_STAGES.indexOf(target);
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

function SentReplyBubble({ body, email }: { body: string; email: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1 items-start"
    >
      <div className="flex items-center gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          <Send size={10} />
          Sent
        </span>
        <span className="text-[11px] text-muted-foreground">
          to {email}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {nowDateTime()}
        </span>
      </div>
      <div className="w-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-line">
          {body}
        </p>
      </div>
    </motion.div>
  );
}

const ACK_MESSAGE: Record<TicketCategory, string> = {
  returns:
    "Perfect — thanks for the quick turnaround. We'll watch out for the replacement and the return label.",
  warranty:
    "Thanks for jumping on this. We'll keep an eye out for the replacement and the engineering follow-up.",
  pricing:
    "Thanks — that pricing works for us. We'll get the PO over shortly.",
  order_status:
    "Brilliant, thanks for the update. That keeps us on track.",
  shipping:
    "Got it — thanks for the tracking. We'll let our receiving dock know.",
  technical:
    "Thanks for the technical detail — that gives us what we needed. We'll regroup with our team.",
};

function CustomerAcknowledgementBubble({
  customerEmail,
  category,
}: {
  customerEmail: string;
  category: TicketCategory;
}) {
  const body = ACK_MESSAGE[category] ?? "Thanks — that resolves it on our side.";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1 items-start"
    >
      <div className="flex items-center gap-2 px-1">
        <span className="inline-flex items-center gap-1.5 border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700">
          <MessageCircle size={10} />
          Customer reply
        </span>
        <span className="text-[11px] text-muted-foreground">
          {customerEmail}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {nowDateTime()}
        </span>
      </div>
      <div className="w-full border border-blue-500/30 bg-blue-500/5 px-4 py-3">
        <p className="text-[13px] leading-relaxed text-foreground/85">{body}</p>
      </div>
    </motion.div>
  );
}

function ResolvedFooter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3 py-2"
    >
      <div className="h-px flex-1 bg-emerald-500/30" />
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
        <CheckCircle2 size={12} />
        Ticket Resolved · {nowDateTime()}
      </div>
      <div className="h-px flex-1 bg-emerald-500/30" />
    </motion.div>
  );
}

interface ConversationThreadProps {
  ticket: SupportTicket;
  onApproveSend?: (body: string) => void | Promise<void>;
  onEscalate?: () => void;
  isCascading?: boolean;
  draftSent?: boolean;
  draftRejected?: boolean;
  currentStage?: SupportStage;
  sentBody?: string | null;
}

export default function ConversationThread({
  ticket,
  onApproveSend,
  onEscalate,
  isCascading,
  draftSent,
  draftRejected,
  currentStage,
  sentBody,
}: ConversationThreadProps) {
  const showCallSnippet =
    ticket.channel === "phone" && ticket.channelRef?.callId;
  const showFormSnippet =
    ticket.channel === "web_form" && ticket.channelRef?.formId;
  const showPortalSnippet =
    ticket.channel === "portal" && ticket.channelRef?.portalRef;

  // Cascade-driven progression bubbles. Only render when the user has
  // actively driven the cascade (draftSent) and the stage has reached the
  // appropriate point. We deliberately don't render these for tickets that
  // are simply already at later stages from mock data, to avoid duplicating
  // the static `sentResponse` bubble that auto-resolved tickets already use.
  const showSentReply =
    draftSent &&
    sentBody &&
    currentStage &&
    stageReached(currentStage, "sent");
  const showCustomerAck =
    draftSent &&
    currentStage &&
    stageReached(currentStage, "customer_acknowledged");
  const showResolved =
    draftSent && currentStage && stageReached(currentStage, "resolved");

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

      {/* Sent reply (auto_resolved tickets — already in mock data) */}
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

      {/* Draft awaiting approval (only while not yet sent via cascade) */}
      {ticket.status === "awaiting_approval" && ticket.draftResponse && !draftSent && (
        <DraftComposer
          ticket={ticket}
          onSend={onApproveSend}
          onEscalate={onEscalate}
          isCascading={isCascading}
          draftSent={draftSent}
          draftRejected={draftRejected}
        />
      )}

      {/* Rejected draft persists in its rejected state */}
      {ticket.status === "awaiting_approval" && ticket.draftResponse && draftRejected && (
        <DraftComposer
          ticket={ticket}
          onSend={onApproveSend}
          onEscalate={onEscalate}
          isCascading={isCascading}
          draftSent={false}
          draftRejected={draftRejected}
        />
      )}

      {/* Cascade progression bubbles */}
      <AnimatePresence>
        {showSentReply && (
          <SentReplyBubble
            key="sent"
            body={sentBody!}
            email={ticket.customer.email}
          />
        )}
        {showCustomerAck && (
          <CustomerAcknowledgementBubble
            key="ack"
            customerEmail={ticket.customer.email}
            category={ticket.classification.category}
          />
        )}
        {showResolved && <ResolvedFooter key="resolved" />}
      </AnimatePresence>
    </div>
  );
}
