"use client";

import { useState } from "react";
import { Send, FileCheck, Save, XCircle, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcurementRecommendedAction } from "@/lib/procurement-types";

interface ActionBarProps {
  hasSupplierSelected: boolean;
  hasOrderHistory: boolean;
  recommendedAction?: ProcurementRecommendedAction | null;
  onClose: () => void;
  onSendRFQ?: () => Promise<void>;
  onSaveDraftRFQ?: () => Promise<void>;
}

export default function ActionBar({
  hasSupplierSelected,
  hasOrderHistory,
  recommendedAction = null,
  onClose,
  onSendRFQ,
  onSaveDraftRFQ,
}: ActionBarProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "saving_draft" | "sent" | "error" | "po_raised" | "drafted">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSendRFQ = async () => {
    setStatus("sending");
    setErrorMsg("");
    try {
      await onSendRFQ?.();
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send RFQ");
      setStatus("error");
    }
  };

  const handleRaisePO = () => {
    setStatus("po_raised");
  };

  const handleSaveDraft = async () => {
    setStatus("saving_draft");
    setErrorMsg("");
    try {
      await onSaveDraftRFQ?.();
      setStatus("drafted");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save draft");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex-none border-t border-emerald-500/20 bg-emerald-500/5 px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-2.5 text-[13px] font-medium text-white">
            <Check className="h-3.5 w-3.5" />
            RFQ Sent
          </div>
          <p className="text-[12px] text-emerald-700/70">
            RFQ has been sent to the selected supplier
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex-none border-t border-red-500/20 bg-red-500/5 px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-red-600 px-5 py-2.5 text-[13px] font-medium text-white">
            <AlertCircle className="h-3.5 w-3.5" />
            Action Failed
          </div>
          <p className="text-[12px] text-red-700/70 flex-1 truncate">
            {errorMsg || "Could not send the RFQ. Check your email configuration."}
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="text-[12px] text-muted-foreground underline hover:text-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status === "po_raised") {
    return (
      <div className="flex-none border-t border-emerald-500/20 bg-emerald-500/5 px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-2.5 text-[13px] font-medium text-white">
            <Check className="h-3.5 w-3.5" />
            PO Raised
          </div>
          <p className="text-[12px] text-emerald-700/70">
            Purchase order has been created
          </p>
        </div>
      </div>
    );
  }

  const poIsPrimary = recommendedAction === "po";
  const rfqIsPrimary = recommendedAction !== "po";

  return (
    <div className="flex-none border-t border-border bg-card px-7 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleSendRFQ}
          disabled={!hasSupplierSelected || status === "sending" || status === "saving_draft"}
          className={cn(
            "inline-flex items-center gap-2 border px-5 py-2.5 text-[13px] font-medium transition-colors",
            hasSupplierSelected && rfqIsPrimary
              ? "border-transparent bg-foreground text-background hover:opacity-90"
              : hasSupplierSelected
                ? "border-border text-foreground/70 hover:bg-accent/60 hover:text-foreground"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {status === "sending" ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
              Sending&hellip;
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Send RFQ{rfqIsPrimary ? " (Recommended)" : ""}
            </>
          )}
        </button>

        <button
          onClick={handleRaisePO}
          disabled={!hasSupplierSelected}
          className={cn(
            "inline-flex items-center gap-2 border px-4 py-2.5 text-[13px] font-medium transition-colors",
            hasSupplierSelected && poIsPrimary
              ? "border-transparent bg-foreground text-background hover:opacity-90"
              : hasSupplierSelected
                ? "border-border text-foreground/70 hover:bg-accent/60 hover:text-foreground"
                : "cursor-not-allowed border-border text-muted-foreground/50"
          )}
        >
          <FileCheck className="h-3.5 w-3.5" />
          Raise PO{poIsPrimary ? " (Recommended)" : ""}
        </button>

        {!hasOrderHistory && (
          <p className="text-[11px] text-muted-foreground">
            No prior supplier orders on this SKU
          </p>
        )}

        <button
          onClick={handleSaveDraft}
          disabled={!hasSupplierSelected || status === "sending" || status === "saving_draft"}
          className={cn(
            "inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-accent/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
            status === "drafted" && "border-emerald-500/30 bg-emerald-500/5 text-emerald-600"
          )}
        >
          <Save className="h-3.5 w-3.5" />
          {status === "saving_draft" ? "Saving..." : status === "drafted" ? "Saved" : "Save Draft"}
        </button>

        <div className="flex-1" />

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          <XCircle className="h-3.5 w-3.5" />
          Dismiss
        </button>
      </div>
    </div>
  );
}
