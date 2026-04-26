"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  CheckCircle2,
  PauseCircle,
  CreditCard,
  AlertTriangle,
  Play,
  Inbox,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AP_DEMO_STAGES,
  type APDemoStage,
  type APInvoice,
  type AgentEvent,
} from "@/lib/finance-types";
import { buildAPClarificationDraft, getAPSupplier, formatMoney } from "@/data/finance-data";
import InvoicePreview from "@/components/finance/shared/InvoicePreview";
import EmailDraftPanel from "@/components/finance/shared/EmailDraftPanel";
import AgentTimeline from "@/components/finance/shared/AgentTimeline";
import ThreeWayMatchGrid from "./ThreeWayMatchGrid";
import { cn } from "@/lib/utils";

interface APInvoiceWorkspaceProps {
  invoice: APInvoice;
}

const STAGE_LABEL: Record<APDemoStage, string> = {
  received: "Invoice received",
  matching: "Auto-matching",
  exception_flagged: "Exception flagged",
  email_sent: "Clarification sent",
  awaiting_reply: "Awaiting supplier",
  reply_parsed: "Reply parsed",
  rematch_clean: "Cleared for approval",
  approved: "Approved",
  paid: "Paid",
};

const NEXT_STAGE_LABEL: Record<APDemoStage, string | null> = {
  received: "Run auto-match",
  matching: "Show match results",
  exception_flagged: "Generate clarification email",
  email_sent: "Mark awaiting reply",
  awaiting_reply: "Simulate supplier reply",
  reply_parsed: "Re-run match",
  rematch_clean: "Approve invoice",
  approved: "Mark paid",
  paid: null,
};

export default function APInvoiceWorkspace({ invoice }: APInvoiceWorkspaceProps) {
  const supplier = getAPSupplier(invoice.supplierId);
  const [stage, setStage] = useState<APDemoStage>(invoice.initialDemoStage);
  const [extraEvents, setExtraEvents] = useState<AgentEvent[]>([]);
  const [emailOpen, setEmailOpen] = useState(false);

  const draft = useMemo(() => buildAPClarificationDraft(invoice, supplier), [invoice, supplier]);

  const stageIndex = AP_DEMO_STAGES.indexOf(stage);

  const allEvents = useMemo(
    () => [...invoice.agentTimeline, ...extraEvents],
    [invoice.agentTimeline, extraEvents],
  );

  function appendEvent(ev: Omit<AgentEvent, "id">) {
    setExtraEvents((prev) => [
      ...prev,
      { ...ev, id: `ext-${prev.length + 1}-${Date.now()}` },
    ]);
  }

  function advanceStage() {
    const now = new Date().toISOString();
    switch (stage) {
      case "received":
        appendEvent({
          occurredAt: now,
          type: "match_run",
          title: "Auto-match started",
          detail: "Cross-checking PO and goods receipt for line-by-line reconciliation.",
        });
        setStage("matching");
        break;
      case "matching":
        appendEvent({
          occurredAt: now,
          type: "discrepancy_flagged",
          title: "Match results computed",
          detail: invoice.discrepancySummary || "All lines reconciled.",
        });
        setStage(invoice.discrepancyAmount > 0 ? "exception_flagged" : "rematch_clean");
        break;
      case "exception_flagged":
        setEmailOpen(true);
        break;
      case "email_sent":
        appendEvent({
          occurredAt: now,
          type: "awaiting_reply",
          title: "Awaiting reply",
          detail: "Auto-nudge in 3 days. Held from approval queue meanwhile.",
        });
        setStage("awaiting_reply");
        break;
      case "awaiting_reply":
        appendEvent({
          occurredAt: now,
          type: "reply_received",
          title: "Supplier reply received",
          detail:
            "Supplier accepted the discrepancy and issued a corrected invoice. Auto-parsed and re-linked to PO.",
        });
        setStage("reply_parsed");
        break;
      case "reply_parsed":
        appendEvent({
          occurredAt: now,
          type: "rematch_clean",
          title: "Re-match clean",
          detail: "All lines reconcile within tolerance. Queued for human approval.",
        });
        setStage("rematch_clean");
        break;
      case "rematch_clean":
        appendEvent({
          occurredAt: now,
          type: "approved",
          title: "Approved",
          detail: "Approved by James Morrison.",
        });
        setStage("approved");
        break;
      case "approved":
        appendEvent({
          occurredAt: now,
          type: "paid",
          title: "Paid via ACH",
          detail: "Posted to ledger and reconciled.",
        });
        setStage("paid");
        break;
      case "paid":
        break;
    }
  }

  function handleEmailSent() {
    const now = new Date().toISOString();
    appendEvent({
      occurredAt: now,
      type: "email_drafted",
      title: "Clarification email drafted",
      detail: "Drafted with PO line, last 6 invoices on this SKU and contract reference attached.",
    });
    appendEvent({
      occurredAt: now,
      type: "email_sent",
      title: `Sent to ${supplier?.email ?? "supplier"}`,
      detail: "Awaiting reply (3-day SLA).",
    });
    setStage("email_sent");
  }

  const isExceptionPath = invoice.discrepancyAmount > 0;
  const visibleStages: APDemoStage[] = isExceptionPath
    ? [
        "received",
        "matching",
        "exception_flagged",
        "email_sent",
        "awaiting_reply",
        "reply_parsed",
        "rematch_clean",
        "approved",
        "paid",
      ]
    : ["received", "matching", "rematch_clean", "approved", "paid"];

  return (
    <div className="px-7 pb-10 pt-6">
      <DemoStageBar
        stages={visibleStages}
        currentStage={stage}
        currentIndex={stageIndex}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <InvoicePreview
            invoiceNumber={invoice.invoiceNumber}
            poNumber={invoice.poNumber === "MISSING" ? undefined : invoice.poNumber}
            supplierName={invoice.supplierName}
            supplierAddress={supplier?.address}
            billTo={invoice.billTo}
            shipTo={invoice.shipTo}
            invoiceDate={invoice.invoiceDate}
            dueDate={invoice.dueDate}
            lines={invoice.matchLines.map((l) => ({
              description: l.description,
              qty: l.invoiceQty,
              unitPrice: l.invoiceUnitPrice,
              total: l.invoiceQty * l.invoiceUnitPrice,
            }))}
            subtotal={invoice.subtotal}
            taxAmount={invoice.taxAmount}
            freightAmount={invoice.freightAmount}
            totalAmount={invoice.totalAmount}
            currency={invoice.currency}
            paid={invoice.status === "paid"}
          />

          <DifferentiationCard />
        </div>

        <div className="lg:col-span-7 space-y-5">
          {invoice.discrepancyAmount > 0 && (
            <ExceptionBanner invoice={invoice} />
          )}

          <ThreeWayMatchGrid
            lines={invoice.matchLines}
            currency={invoice.currency}
            poTotal={invoice.poTotalAmount}
            invoiceTotal={invoice.totalAmount}
            taxAmount={invoice.taxAmount}
            freightAmount={invoice.freightAmount}
          />

          <AgentTimeline events={allEvents} />

          <ActionsCard
            stage={stage}
            isExceptionPath={isExceptionPath}
            onNext={advanceStage}
            onOpenEmail={() => setEmailOpen(true)}
          />
        </div>
      </div>

      <EmailDraftPanel
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        defaultTo={draft.to}
        defaultFrom={draft.from}
        defaultSubject={draft.subject}
        defaultBody={draft.body}
        attachments={[
          { id: "att-1", label: `${invoice.poNumber}.pdf — Purchase order` },
          { id: "att-2", label: "GRN-9930.pdf — Goods receipt" },
          { id: "att-3", label: "supplier-history-6mo.csv — Last 6 invoices" },
        ]}
        onSend={handleEmailSent}
        title={`Discrepancy email — ${invoice.invoiceNumber}`}
      />
    </div>
  );
}

function DemoStageBar({
  stages,
  currentStage,
  currentIndex,
}: {
  stages: APDemoStage[];
  currentStage: APDemoStage;
  currentIndex: number;
}) {
  const visibleIndex = stages.indexOf(currentStage);
  const totalIndex = currentIndex >= 0 ? currentIndex : 0;
  return (
    <div className="border border-border bg-card px-5 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={12} className="text-primary/70" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Agent flow
        </p>
        <span className="text-[11px] text-muted-foreground">
          Step {Math.max(visibleIndex, 0) + 1} of {stages.length}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {stages.map((s, i) => {
          const isCurrent = s === currentStage;
          const isPast = stages.indexOf(s) < (visibleIndex >= 0 ? visibleIndex : totalIndex);
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

function ExceptionBanner({ invoice }: { invoice: APInvoice }) {
  return (
    <div className="border border-amber-500/40 bg-amber-50 px-5 py-3.5">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-700" />
        <div>
          <p className="text-[13px] font-semibold text-amber-900">
            {formatMoney(invoice.discrepancyAmount, invoice.currency)} discrepancy detected
          </p>
          <p className="mt-1 text-[12.5px] leading-snug text-amber-900/80">
            {invoice.discrepancySummary}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionsCard({
  stage,
  isExceptionPath,
  onNext,
  onOpenEmail,
}: {
  stage: APDemoStage;
  isExceptionPath: boolean;
  onNext: () => void;
  onOpenEmail: () => void;
}) {
  const nextLabel = NEXT_STAGE_LABEL[stage];
  return (
    <div className="border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Play size={11} className="text-primary/70" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Run agent step
        </p>
      </div>
      <p className="mb-4 text-[12.5px] text-muted-foreground">
        Walks the agent through {isExceptionPath ? "the exception path" : "the clean-match path"}{" "}
        for this invoice. Each step appends to the activity log.
      </p>
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onNext}
          disabled={!nextLabel}
          className="w-full justify-between"
        >
          <span>{nextLabel ?? "All steps complete"}</span>
          {nextLabel && <ArrowRight className="h-4 w-4" />}
        </Button>
      </motion.div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" onClick={onOpenEmail} className="gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          Email
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Approve
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <PauseCircle className="h-3.5 w-3.5" />
          Hold
        </Button>
      </div>
    </div>
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
            Pulled the invoice from the supplier's email + portal sync, ran OCR and extracted every line item.
          </span>
        </li>
        <li className="flex gap-2">
          <CheckCircle2 size={12} className="mt-1 shrink-0 text-primary/70" />
          <span>
            Matched against both the PO and the goods receipt — not just the PO. Most ledgers do 2-way only.
          </span>
        </li>
        <li className="flex gap-2">
          <AlertTriangle size={12} className="mt-1 shrink-0 text-primary/70" />
          <span>
            Discrepancies are explained in plain English with the dollar impact, not just a flag.
          </span>
        </li>
        <li className="flex gap-2">
          <Mail size={12} className="mt-1 shrink-0 text-primary/70" />
          <span>
            Drafted the supplier email with the PO line, GRN, and last 6 invoices already attached.
          </span>
        </li>
        <li className="flex gap-2">
          <CreditCard size={12} className="mt-1 shrink-0 text-primary/70" />
          <span>
            Only clean matches and exceptions reach humans — everything else flows through autonomously.
          </span>
        </li>
      </ul>
    </div>
  );
}
