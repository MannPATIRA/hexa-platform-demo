"use client";

import { cn } from "@/lib/utils";
import type { AiClassification } from "@/data/support-data";
import { categoryLabels, getConfidenceTier } from "@/data/support-data";

const TIER_RING: Record<"high" | "medium" | "low", string> = {
  high: "text-emerald-600",
  medium: "text-amber-600",
  low: "text-red-600",
};

const TIER_TRACK: Record<"high" | "medium" | "low", string> = {
  high: "text-emerald-500/15",
  medium: "text-amber-500/15",
  low: "text-red-500/15",
};

interface AiClassificationCardProps {
  classification: AiClassification;
}

export default function AiClassificationCard({ classification }: AiClassificationCardProps) {
  const tier = getConfidenceTier(classification.confidence);
  const pct = Math.round(classification.confidence * 100);
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const dash = (classification.confidence * circumference).toFixed(2);

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Classification
        </span>
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Confidence ring */}
        <div className="relative h-9 w-9 shrink-0">
          <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              strokeWidth="3"
              className={cn("stroke-current", TIER_TRACK[tier])}
            />
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              className={cn("stroke-current", TIER_RING[tier])}
            />
          </svg>
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center text-[10px] font-semibold tabular-nums",
              TIER_RING[tier],
            )}
          >
            {pct}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-foreground">
            {categoryLabels[classification.category]}
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {classification.reasoning}
          </p>
        </div>
      </div>

      {classification.alternatives.length > 0 && (
        <div className="border-t border-border px-4 py-2.5">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Alternative categories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {classification.alternatives.map((alt) => (
              <button
                key={alt.category}
                type="button"
                className="inline-flex items-center gap-1 border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/75 transition-colors hover:border-primary/60 hover:text-primary"
              >
                {categoryLabels[alt.category]}
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {Math.round(alt.confidence * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
