"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SUPPORT_STAGES,
  stageLabels,
  stageShortLabels,
  type SupportStage,
  type LifecyclePath,
} from "@/data/support-data";

interface StageBarProps {
  currentStage: SupportStage;
  path: LifecyclePath;
  compact?: boolean;
}

// Path-specific label override for stage 5 (routed)
function labelFor(stage: SupportStage, path: LifecyclePath, short = false): string {
  const map = short ? stageShortLabels : stageLabels;
  if (stage === "routed") {
    if (path === "auto") return short ? "Auto-routed" : "Auto-routed";
    if (path === "approval") return short ? "Approval" : "Awaiting Approval";
    if (path === "escalation") return short ? "Escalated" : "Escalated to Owner";
  }
  return map[stage];
}

export default function StageBar({ currentStage, path, compact = false }: StageBarProps) {
  const stages = SUPPORT_STAGES;
  const currentIndex = stages.indexOf(currentStage);
  const stepNum = Math.max(currentIndex, 0) + 1;

  return (
    <div className="border border-border bg-card px-5 py-3">
      <div className="mb-2 flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Lifecycle
        </p>
        <span className="text-[11px] text-muted-foreground">
          Step {stepNum} of {stages.length}
        </span>
        {path === "escalation" && (
          <span className="ml-auto inline-flex items-center gap-1 border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
            <AlertTriangle size={9} />
            Escalation path
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {stages.map((s, i) => {
          const isCurrent = s === currentStage;
          const isPast = i < currentIndex;
          const label = labelFor(s, path, compact);
          const isRoutedAndApproval = s === "routed" && path === "approval" && isCurrent;
          const isRoutedAndEscalation = s === "routed" && path === "escalation" && isCurrent;

          return (
            <div key={s} className="flex items-center gap-1.5">
              <motion.span
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "inline-flex items-center gap-1.5 border px-2 py-1 text-[11.5px] whitespace-nowrap",
                  isCurrent && !isRoutedAndApproval && !isRoutedAndEscalation &&
                    "border-primary bg-primary/10 text-primary font-semibold",
                  isRoutedAndApproval &&
                    "border-amber-500/50 bg-amber-500/15 text-amber-800 font-semibold",
                  isRoutedAndEscalation &&
                    "border-red-500/50 bg-red-500/15 text-red-700 font-semibold",
                  isPast && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
                  !isCurrent && !isPast && "border-border text-muted-foreground/80",
                )}
              >
                {isPast && <CheckCircle2 size={10} />}
                {label}
              </motion.span>
              {i < stages.length - 1 && (
                <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
