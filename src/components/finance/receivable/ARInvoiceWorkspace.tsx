"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  PhoneCall,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  HandCoins,
  Sparkles,
  ArrowRight,
  Play,
  Flag,
  Inbox,
  Waves,
  Headphones,
  Phone,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AR_DEMO_STAGES,
  type ARDemoStage,
  type ARInvoice,
  type AgentEvent,
  type FollowupAttempt,
} from "@/lib/finance-types";
import { getARCustomer, formatMoney } from "@/data/finance-data";
import InvoicePreview from "@/components/finance/shared/InvoicePreview";
import EmailDraftPanel from "@/components/finance/shared/EmailDraftPanel";
import AgentTimeline from "@/components/finance/shared/AgentTimeline";
import FollowupSequence from "./FollowupSequence";
import CallDetailSidePane from "./CallDetailSidePane";
import { cn } from "@/lib/utils";

interface ARInvoiceWorkspaceProps {
  invoice: ARInvoice;
}

const STAGE_LABEL: Record<ARDemoStage, string> = {
  issued: "Invoice issued",
  approaching_due: "Approaching due",
  first_reminder: "Friendly reminder",
  second_reminder: "Firm reminder",
  voice_call_1: "Voice call placed",
  promise_logged: "Promise logged",
  promise_broken: "Promise broken",
  voice_call_2: "Follow-up call",
  dispute_raised: "Dispute raised",
  dispute_resolved: "Dispute resolved",
  paid: "Paid",
};

const NEXT_STAGE_LABEL: Record<ARDemoStage, string | null> = {
  issued: "Wait until 5 days from due",
  approaching_due: "Send friendly reminder",
  first_reminder: "Send firm reminder",
  second_reminder: "Place voice call",
  voice_call_1: "Log promise to pay",
  promise_logged: "Re-check on promise date",
  promise_broken: "Re-dial customer",
  voice_call_2: "Log dispute",
  dispute_raised: "Resolve dispute",
  dispute_resolved: "Mark paid",
  paid: null,
};

export default function ARInvoiceWorkspace({ invoice }: ARInvoiceWorkspaceProps) {
  const customer = getARCustomer(invoice.customerId);
  const [stage, setStage] = useState<ARDemoStage>(invoice.initialDemoStage);
  const [extraEvents, setExtraEvents] = useState<AgentEvent[]>([]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailKind, setEmailKind] = useState<"first" | "second">("first");
  const [activeVoiceCall, setActiveVoiceCall] = useState<FollowupAttempt | null>(null);

  const allEvents = useMemo(
    () => [...invoice.agentTimeline, ...extraEvents],
    [invoice.agentTimeline, extraEvents],
  );

  const latestVoiceCall = useMemo(() => {
    const voiceCalls = invoice.followups.filter(
      (f) => f.channel === "voice" && (f.voiceTranscript?.length ?? 0) > 0,
    );
    if (voiceCalls.length === 0) return null;
    return voiceCalls.reduce((latest, current) =>
      new Date(current.occurredAt).getTime() > new Date(latest.occurredAt).getTime()
        ? current
        : latest,
    );
  }, [invoice.followups]);

  function handlePlaceCallClick() {
    if (latestVoiceCall) {
      setActiveVoiceCall(latestVoiceCall);
      return;
    }
    if (stage === "second_reminder" || stage === "promise_broken") {
      advanceStage();
    }
  }

  function appendEvent(ev: Omit<AgentEvent, "id">) {
    setExtraEvents((prev) => [
      ...prev,
      { ...ev, id: `ext-${prev.length + 1}-${Date.now()}` },
    ]);
  }

  function advanceStage() {
    const now = new Date().toISOString();
    switch (stage) {
      case "issued":
        appendEvent({
          occurredAt: now,
          type: "info",
          title: "Approaching due date",
          detail: "Auto-reminder scheduled. Customer payment behaviour score reviewed.",
        });
        setStage("approaching_due");
        break;
      case "approaching_due":
        setEmailKind("first");
        setEmailOpen(true);
        break;
      case "first_reminder":
        setEmailKind("second");
        setEmailOpen(true);
        break;
      case "second_reminder":
        appendEvent({
          occurredAt: now,
          type: "voice_call_placed",
          title: "Voice agent placed call",
          detail: "Reached customer. Promise-to-pay logged.",
          evidence: { label: "Listen to call" },
        });
        setStage("voice_call_1");
        break;
      case "voice_call_1":
        appendEvent({
          occurredAt: now,
          type: "promise_logged",
          title: "Promise to pay logged",
          detail: "Calendar reminder set for promise date.",
        });
        setStage("promise_logged");
        break;
      case "promise_logged":
        appendEvent({
          occurredAt: now,
          type: "promise_broken",
          title: "Promise broken",
          detail: "Payment did not land. Re-dial scheduled.",
        });
        setStage("promise_broken");
        break;
      case "promise_broken":
        appendEvent({
          occurredAt: now,
          type: "voice_call_completed",
          title: "Second voice call completed",
          detail: "Customer flagged a partial dispute on the invoice.",
          evidence: { label: "Listen to call" },
        });
        setStage("voice_call_2");
        break;
      case "voice_call_2":
        appendEvent({
          occurredAt: now,
          type: "dispute_raised",
          title: "Partial dispute raised",
          detail: "Disputed line auto-extracted from transcript and routed for evidence.",
        });
        setStage("dispute_raised");
        break;
      case "dispute_raised":
        appendEvent({
          occurredAt: now,
          type: "dispute_resolved",
          title: "Dispute resolved",
          detail: "Net of disputed line settled. Credit memo issued for $185.",
        });
        setStage("dispute_resolved");
        break;
      case "dispute_resolved":
        appendEvent({
          occurredAt: now,
          type: "payment_received",
          title: "Payment received",
          detail: "Reconciled and posted to ledger.",
        });
        setStage("paid");
        break;
      case "paid":
      default:
        break;
    }
  }

  function handleReminderSent() {
    const now = new Date().toISOString();
    appendEvent({
      occurredAt: now,
      type: "reminder_sent",
      title: emailKind === "first" ? "Friendly reminder sent" : "Firm reminder sent",
      detail:
        emailKind === "first"
          ? "Soft tone aligned to relationship score. Tracking opens + replies."
          : "Action-needed tone. Voice call queued if no reply within 72h.",
    });
    setStage(emailKind === "first" ? "first_reminder" : "second_reminder");
  }

  const visibleStages: ARDemoStage[] =
    invoice.status === "in_dispute" || invoice.id === "ar-inv-001"
      ? [
          "issued",
          "approaching_due",
          "first_reminder",
          "second_reminder",
          "voice_call_1",
          "promise_logged",
          "promise_broken",
          "voice_call_2",
          "dispute_raised",
          "dispute_resolved",
          "paid",
        ]
      : ["issued", "approaching_due", "first_reminder", "second_reminder", "voice_call_1", "promise_logged", "paid"];

  const draftSubject =
    emailKind === "first"
      ? `Friendly reminder — ${invoice.invoiceNumber}`
      : `Past-Due Invoice ${invoice.invoiceNumber} Reminder — Action Needed`;

  const draftBody =
    emailKind === "first"
      ? `Hi ${customer?.contactName ?? "there"},\n\nJust a quick reminder that ${invoice.invoiceNumber} for ${formatMoney(invoice.totalAmount, invoice.currency)} was due on ${new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.\n\nIf it's already in process on your side, no need to reply — we'll see it land. Otherwise let me know if there's anything you need from us to help move it along.\n\nThanks,\nHexa Accounts Receivable`
      : `${customer?.contactName ?? "Hi"},\n\nI'm reaching out regarding an open invoice on our end for ${formatMoney(invoice.totalAmount, invoice.currency)}, which was due on ${new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. When you get a moment, could you take a look and let me know if this is already in process on your side?\n\nIf there's anything you need from us to help move it along — updated paperwork, a copy of the invoice, or clarification on the details — just let me know. Happy to help however I can.\n\nIf I don't hear back, I'll give you a quick call so we can get this wrapped up smoothly.\n\nSam\nHexa Industries`;

  return (
    <div className="px-7 pb-10 pt-6">
      <DemoStageBar stages={visibleStages} currentStage={stage} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <InvoicePreview
            invoiceNumber={invoice.invoiceNumber}
            customerName={invoice.customerName}
            customerAddress={invoice.billTo}
            billTo={invoice.billTo}
            shipTo={invoice.shipTo}
            invoiceDate={invoice.issuedAt}
            dueDate={invoice.dueDate}
            lines={invoice.lines.map((l) => ({
              description: l.description,
              qty: l.qty,
              unitPrice: l.unitPrice,
              total: l.total,
            }))}
            subtotal={invoice.totalAmount}
            totalAmount={invoice.totalAmount}
            currency={invoice.currency}
            highlightInvoiceNumber={false}
            highlightPoNumber={false}
            paid={invoice.status === "paid"}
          />

          {customer && <CustomerProfileCard customer={customer} invoice={invoice} />}

          <DifferentiationCard />
        </div>

        <div className="lg:col-span-7 space-y-5">
          {latestVoiceCall && (
            <VoiceCallHighlight
              attempt={latestVoiceCall}
              onOpen={() => setActiveVoiceCall(latestVoiceCall)}
            />
          )}

          <SLAPanel invoice={invoice} />

          <FollowupSequence
            attempts={invoice.followups}
            onOpenVoiceCall={setActiveVoiceCall}
          />

          <AgentTimeline events={allEvents} />

          <ActionsCard
            stage={stage}
            onNext={advanceStage}
            onTriggerEmail={() => {
              setEmailKind(stage === "approaching_due" ? "first" : "second");
              setEmailOpen(true);
            }}
            onPlaceCall={handlePlaceCallClick}
            hasRecentCall={!!latestVoiceCall}
            recentCallDuration={latestVoiceCall?.voiceDurationSeconds}
          />
        </div>
      </div>

      <EmailDraftPanel
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        defaultTo={invoice.customerEmail}
        defaultFrom="ar@hexamfg.com"
        defaultSubject={draftSubject}
        defaultBody={draftBody}
        attachments={[
          { id: "att-1", label: `${invoice.invoiceNumber}.pdf — Invoice` },
          { id: "att-2", label: `${customer?.contractRef ?? "Contract"}.pdf — Agreement reference` },
        ]}
        onSend={handleReminderSent}
        title={`Reminder — ${invoice.invoiceNumber}`}
      />

      <CallDetailSidePane
        attempt={activeVoiceCall}
        customerName={invoice.customerName}
        customerSubtitle={customer?.contactName}
        invoiceLabel={invoice.invoiceNumber}
        onClose={() => setActiveVoiceCall(null)}
      />
    </div>
  );
}

function SLAPanel({ invoice }: { invoice: ARInvoice }) {
  const customer = getARCustomer(invoice.customerId);
  return (
    <div className="border border-border bg-card p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        SLA &amp; aging
      </p>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-[12.5px] sm:grid-cols-4">
        <Cell label="Payment terms" value={invoice.paymentTerms} />
        <Cell label="Agreed SLA" value={`${invoice.agreedSlaDays} days`} />
        <Cell
          label={invoice.daysOverdue > 0 ? "Days overdue" : "Days until due"}
          value={
            invoice.daysOverdue > 0
              ? `${invoice.daysOverdue}d`
              : `${Math.max(
                  0,
                  Math.ceil(
                    (new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  ),
                )}d`
          }
          accent={invoice.daysOverdue > 0 ? "red" : "default"}
        />
        <Cell label="Contract ref" value={customer?.contractRef ?? "—"} mono />
      </div>

      {invoice.promiseToPayDate && (
        <div className="mt-4 flex items-start gap-2.5 border border-violet-500/30 bg-violet-500/10 px-3.5 py-2.5 text-[12.5px]">
          <HandCoins size={14} className="mt-0.5 shrink-0 text-violet-700" />
          <div className="min-w-0">
            <p className="font-medium text-violet-900">
              Promise to pay logged for{" "}
              {new Date(invoice.promiseToPayDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="mt-0.5 text-violet-800/80">
              Auto-extracted from the voice transcript with 96% confidence.
            </p>
          </div>
        </div>
      )}

      {invoice.disputeReason && (
        <div className="mt-3 flex items-start gap-2.5 border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12.5px]">
          <ShieldAlert size={14} className="mt-0.5 shrink-0 text-red-700" />
          <div className="min-w-0">
            <p className="font-medium text-red-900">Dispute logged</p>
            <p className="mt-0.5 text-red-800/80">{invoice.disputeReason}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerProfileCard({
  customer,
  invoice,
}: {
  customer: NonNullable<ReturnType<typeof getARCustomer>>;
  invoice: ARInvoice;
}) {
  return (
    <div className="border border-border bg-card p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Customer profile
      </p>
      <div className="mt-3 space-y-1.5 text-[12.5px]">
        <p className="font-medium text-foreground">{customer.name}</p>
        <p className="text-muted-foreground">
          {customer.contactName} · {customer.email}
        </p>
        <p className="text-muted-foreground">{customer.phone}</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
        <Cell label="Avg DSO" value={`${customer.avgDsoDays}d`} />
        <Cell label="Lifetime value" value={formatMoney(customer.lifetimeValue, invoice.currency)} />
        <Cell
          label="Behaviour"
          value={`${customer.paymentBehaviourScore}/100`}
          accent={
            customer.paymentBehaviourScore >= 80
              ? "emerald"
              : customer.paymentBehaviourScore >= 60
              ? "default"
              : "red"
          }
        />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  mono = false,
  accent = "default",
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: "default" | "red" | "emerald";
}) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5",
          mono && "font-mono text-[11.5px]",
          accent === "red" && "text-red-700 font-medium",
          accent === "emerald" && "text-emerald-700 font-medium",
          accent === "default" && "text-foreground/85"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DemoStageBar({ stages, currentStage }: { stages: ARDemoStage[]; currentStage: ARDemoStage }) {
  const visibleIndex = stages.indexOf(currentStage);
  return (
    <div className="border border-border bg-card px-5 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={12} className="text-primary/70" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Collections flow
        </p>
        <span className="text-[11px] text-muted-foreground">
          Step {Math.max(visibleIndex, 0) + 1} of {stages.length}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {stages.map((s, i) => {
          const isCurrent = s === currentStage;
          const isPast = stages.indexOf(s) < (visibleIndex >= 0 ? visibleIndex : 0);
          return (
            <div key={s} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 border px-2 py-1 text-[11.5px]",
                  isCurrent && "border-primary bg-primary/10 text-primary font-semibold",
                  isPast && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
                  !isCurrent && !isPast && "border-border text-muted-foreground"
                )}
              >
                {isPast && <CheckCircle2 size={10} />}
                {STAGE_LABEL[s]}
              </span>
              {i < stages.length - 1 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionsCard({
  stage,
  onNext,
  onTriggerEmail,
  onPlaceCall,
  hasRecentCall,
  recentCallDuration,
}: {
  stage: ARDemoStage;
  onNext: () => void;
  onTriggerEmail: () => void;
  onPlaceCall: () => void;
  hasRecentCall: boolean;
  recentCallDuration?: number;
}) {
  const nextLabel = NEXT_STAGE_LABEL[stage];
  const callDurationLabel = recentCallDuration
    ? `${Math.floor(recentCallDuration / 60)}m ${recentCallDuration % 60}s`
    : null;

  return (
    <div className="border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Play size={11} className="text-primary/70" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Run agent step
        </p>
      </div>
      <p className="mb-4 text-[12.5px] text-muted-foreground">
        Walks the agent through the dunning sequence for this invoice. Each step appends to the activity log.
      </p>
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button onClick={onNext} disabled={!nextLabel} className="w-full justify-between">
          <span>{nextLabel ?? "All steps complete"}</span>
          {nextLabel && <ArrowRight className="h-4 w-4" />}
        </Button>
      </motion.div>

      <div className="mt-4 mb-2 flex items-center gap-2">
        <Phone size={11} className="text-primary/70" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Customer outreach
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={onTriggerEmail}
          className="h-12 justify-start gap-2.5 px-3 text-left"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-card">
            <Mail className="h-3.5 w-3.5 text-foreground/70" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-[12.5px] font-semibold text-foreground">Email</span>
            <span className="text-[10.5px] text-muted-foreground">Send reminder</span>
          </div>
        </Button>
        <Button
          variant="outline"
          onClick={onPlaceCall}
          className="relative h-12 justify-start gap-2.5 overflow-hidden border-primary/50 bg-primary/8 px-3 text-left text-primary transition-all hover:border-primary hover:bg-primary/15 hover:text-primary active:scale-[0.99]"
        >
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center border border-primary/40 bg-primary/15 text-primary">
            <Waves className="h-3.5 w-3.5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-[12.5px] font-semibold text-primary">
              {hasRecentCall ? "Open last call" : "Place AI voice call"}
            </span>
            <span className="text-[10.5px] text-primary/70">
              {hasRecentCall && callDurationLabel
                ? `Listen · ${callDurationLabel}`
                : "Live AI voice agent"}
            </span>
          </div>
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Mark paid
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Flag className="h-3.5 w-3.5" />
          Escalate
        </Button>
      </div>
    </div>
  );
}

function VoiceCallHighlight({
  attempt,
  onOpen,
}: {
  attempt: FollowupAttempt;
  onOpen: () => void;
}) {
  const duration = attempt.voiceDurationSeconds
    ? `${Math.floor(attempt.voiceDurationSeconds / 60)}m ${attempt.voiceDurationSeconds % 60}s`
    : null;

  const sentiment = attempt.voiceSentiment;
  const SentimentIcon =
    sentiment === "positive" ? Smile : sentiment === "negative" ? Frown : Meh;
  const sentimentColor =
    sentiment === "positive"
      ? "text-emerald-700"
      : sentiment === "negative"
      ? "text-red-700"
      : "text-amber-700";

  const date = new Date(attempt.occurredAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      className="group relative flex w-full items-center gap-4 overflow-hidden border border-primary/40 bg-gradient-to-r from-primary/12 via-primary/6 to-transparent px-5 py-4 text-left shadow-sm transition-colors hover:border-primary hover:from-primary/18 hover:via-primary/10"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary via-primary/70 to-primary/20"
      />

      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center border border-primary/40 bg-primary/15 text-primary">
        <Phone size={16} strokeWidth={2.2} />
        <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-primary"
            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.9, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">
            Voice agent call
          </span>
          <span className="text-[11px] text-muted-foreground">· {date}</span>
          {duration && (
            <span className="font-mono text-[11px] text-muted-foreground">
              · {duration}
            </span>
          )}
          {sentiment && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium",
                sentimentColor,
              )}
            >
              <SentimentIcon size={11} />
              {sentiment}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-1 text-[13px] font-medium text-foreground/90">
          {attempt.voiceOutcomeSummary ?? "AI voice agent reached the customer"}
        </p>
      </div>

      <div className="ml-2 flex shrink-0 items-center gap-2 border border-primary/40 bg-primary px-3 py-2 text-[12px] font-semibold text-primary-foreground shadow-sm transition-transform group-hover:translate-x-0.5">
        <Headphones size={12} strokeWidth={2.4} />
        Listen &amp; review
      </div>
    </motion.button>
  );
}

function DifferentiationCard() {
  return (
    <div className="border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={12} className="text-primary/70" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          What the agent did
        </p>
      </div>
      <ul className="space-y-2.5 text-[12.5px] leading-snug text-muted-foreground">
        <li className="flex gap-2">
          <Inbox size={12} className="mt-1 shrink-0 text-primary/70" />
          <span>
            Issued invoice + tracked open / read receipts. Built a relationship-aware reminder cadence.
          </span>
        </li>
        <li className="flex gap-2">
          <Mail size={12} className="mt-1 shrink-0 text-primary/70" />
          <span>
            Sent reminders with tone matched to payment behaviour score and prior interactions.
          </span>
        </li>
        <li className="flex gap-2">
          <PhoneCall size={12} className="mt-1 shrink-0 text-primary/70" />
          <span>
            Voice agent called the customer when email stalled. Full transcript stored against the invoice.
          </span>
        </li>
        <li className="flex gap-2">
          <HandCoins size={12} className="mt-1 shrink-0 text-primary/70" />
          <span>
            Promises and disputes auto-extracted from the call — no human listening required.
          </span>
        </li>
        <li className="flex gap-2">
          <Flag size={12} className="mt-1 shrink-0 text-primary/70" />
          <span>
            Humans only see escalations: broken promises, disputes, or no-answer streaks.
          </span>
        </li>
      </ul>
    </div>
  );
}
