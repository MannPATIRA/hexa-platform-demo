"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SupportStage, LifecyclePath } from "@/data/support-data";

function nextStepLabel(stage: SupportStage, path: LifecyclePath): string | null {
  switch (stage) {
    case "received":
      return "Run auto-classify";
    case "classified":
      return "Ground in ERP";
    case "grounded":
      return path === "escalation" ? "Prepare AI brief" : "Generate AI draft";
    case "drafted":
      return path === "auto"
        ? "Auto-send reply"
        : path === "approval"
          ? "Hold for approval"
          : "Escalate to owner";
    case "routed":
      return path === "auto"
        ? "Send reply"
        : path === "approval"
          ? "Approve & send"
          : "Mark owner replied";
    case "sent":
      return "Fire follow-up actions";
    case "follow_ups_fired":
      return "Mark customer acknowledged";
    case "customer_acknowledged":
      return "Resolve ticket";
    case "resolved":
      return null;
  }
}

interface StageActionsCardProps {
  stage: SupportStage;
  path: LifecyclePath;
  onAdvance: () => void;
  isCascading?: boolean;
}

export default function StageActionsCard({
  stage,
  path,
  onAdvance,
  isCascading = false,
}: StageActionsCardProps) {
  if (stage === "resolved") return null;

  const label = nextStepLabel(stage, path);
  if (!label) return null;

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <Play size={11} className="text-primary/70" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Run next step
        </span>
      </div>

      <div className="px-4 py-3">
        <p className="mb-3 text-[11.5px] leading-snug text-muted-foreground">
          Walks the agent through{" "}
          {path === "auto"
            ? "the auto-resolution path"
            : path === "approval"
              ? "the approval-gated path"
              : "the escalation path"}{" "}
          for this ticket. Each step appends to the activity log.
        </p>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onAdvance}
            disabled={isCascading}
            className="w-full justify-between"
          >
            <span>{isCascading ? "Running\u2026" : label}</span>
            {isCascading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
