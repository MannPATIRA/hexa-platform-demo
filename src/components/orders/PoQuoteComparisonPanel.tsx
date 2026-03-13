"use client";

import { useMemo, useState } from "react";
import { Order, ComparisonField } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Send } from "lucide-react";

const FIELD_LABEL: Record<ComparisonField, string> = {
  price: "Price",
  quantity: "Quantity",
  dueDate: "Due Date",
  drawingRev: "Drawing Rev",
};

export function PoQuoteComparisonPanel({ order }: { order: Order }) {
  const flow = order.demoFlow;
  const [sent, setSent] = useState(false);

  const initialDraft = useMemo(
    () =>
      flow?.correctionDraftEmail ?? {
        to: order.customer.email,
        subject: `PO ${flow?.poNumber ?? order.poNumber ?? ""} requires correction`,
        body: "Please update your PO to match the approved quote.",
      },
    [flow, order.customer.email, order.poNumber]
  );

  const [toEmail, setToEmail] = useState(initialDraft.to);
  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);

  if (!flow) return null;

  if (flow.scenario === "rfq_csv" || flow.scenario === "rfq_handwritten") {
    return (
      <div className="border border-blue-500/30 bg-blue-500/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-semibold text-blue-800">
              RFQ to Quote Path
            </h3>
            <p className="mt-1 text-[12px] text-blue-800/80">
              RFQ parsed from email attachment and prepared as quote{" "}
              <span className="font-mono">{flow.quoteNumber ?? "Q-draft"}</span>.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-700"
          >
            Quote Ready
          </Badge>
        </div>
      </div>
    );
  }

  const comparison = flow.quoteComparison;
  const hasMismatch = comparison ? !comparison.overallMatch : false;

  if (!hasMismatch) {
    return (
      <div className="border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5">
        <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Matches quote{" "}
          <span className="font-mono">{flow.quoteNumber ?? "Quote ref"}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 border border-red-500/30 bg-red-500/5 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-red-800">
            PO needs clarification
          </h3>
          <p className="mt-1 text-[12px] text-red-800/80">
            <span className="font-mono">{flow.poNumber ?? order.poNumber}</span>{" "}
            does not match{" "}
            <span className="font-mono">{flow.quoteNumber ?? "Quote ref"}</span>.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-red-500/30 bg-red-500/10 text-red-700"
        >
          Mismatch Detected
        </Badge>
      </div>

      {comparison && (
        <div className="space-y-2">
          {comparison.checks.map((check) => (
            <div
              key={check.field}
              className="grid grid-cols-1 gap-2 border border-red-200 bg-background px-3 py-2.5 md:grid-cols-3"
            >
              <div className="flex items-center gap-2">
                {check.matches ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-[12px] font-medium text-foreground/85">
                  {FIELD_LABEL[check.field]}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Quote: {check.quoteValue}
              </p>
              <p className="text-[12px] text-muted-foreground">
                Incoming PO: {check.incomingValue}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 border border-red-500/30 bg-red-500/5 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <h4 className="text-[12px] font-semibold uppercase tracking-wide text-red-700">
            Draft customer correction email
          </h4>
        </div>
        <div className="space-y-2">
          <input
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
            placeholder="To"
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
            placeholder="Subject"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
          />
          <button
            type="button"
            onClick={() => setSent(true)}
            className="inline-flex items-center gap-2 bg-foreground px-3 py-2 text-[12px] font-medium text-background hover:opacity-90"
          >
            <Send className="h-3.5 w-3.5" />
            {sent ? "Draft ready to send" : "Prepare correction draft"}
          </button>
        </div>
      </div>
    </div>
  );
}
