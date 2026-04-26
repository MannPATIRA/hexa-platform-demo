"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Clock, X, ExternalLink, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FollowUpAction, FollowUpStatus, FollowUpTeam } from "@/data/support-data";

const TEAM_STYLE: Record<FollowUpTeam, string> = {
  Production:        "border-blue-500/30 bg-blue-500/10 text-blue-700",
  Logistics:         "border-amber-500/30 bg-amber-500/10 text-amber-700",
  Engineering:       "border-violet-500/30 bg-violet-500/10 text-violet-700",
  Procurement:       "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  "Account Manager": "border-primary/30 bg-primary/10 text-primary",
  Warehouse:         "border-slate-500/30 bg-slate-500/10 text-slate-700",
  Finance:           "border-cyan-500/30 bg-cyan-500/10 text-cyan-700",
  QC:                "border-rose-500/30 bg-rose-500/10 text-rose-700",
};

interface FollowUpActionsPanelProps {
  actions: FollowUpAction[];
}

export default function FollowUpActionsPanel({ actions }: FollowUpActionsPanelProps) {
  const [statusMap, setStatusMap] = useState<Record<string, FollowUpStatus>>(
    () => Object.fromEntries(actions.map((a) => [a.id, a.status])),
  );

  const setStatus = (id: string, status: FollowUpStatus) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  const counts = useMemo(() => {
    const c = { suggested: 0, queued: 0, done: 0, skipped: 0 } as Record<FollowUpStatus, number>;
    for (const a of actions) c[statusMap[a.id] ?? a.status]++;
    return c;
  }, [actions, statusMap]);

  if (actions.length === 0) {
    return (
      <div className="border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
          <Workflow size={12} className="text-muted-foreground" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Suggested Follow-ups
          </span>
        </div>
        <div className="px-4 py-3 text-[12px] text-muted-foreground">
          No cross-team actions suggested for this ticket.
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <Workflow size={12} className="text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Suggested Follow-ups
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
          {counts.queued} queued · {counts.done} done · {counts.suggested} suggested
        </span>
      </div>

      <ul className="divide-y divide-border">
        {actions.map((a) => {
          const status = statusMap[a.id] ?? a.status;
          const isSkipped = status === "skipped";
          const isDone = status === "done";
          const isQueued = status === "queued";

          return (
            <li
              key={a.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 transition-opacity",
                isSkipped && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 shrink-0 inline-flex w-32 items-center justify-center border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                  TEAM_STYLE[a.team],
                )}
              >
                {a.team}
              </span>

              <div className="min-w-0 flex-1">
                <p className={cn("text-[12px] font-medium leading-snug", isDone ? "text-muted-foreground line-through" : "text-foreground/90")}>
                  {a.action}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {a.why}
                </p>
                {a.link && (
                  <Link
                    href={a.link}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    Open in module
                    <ExternalLink size={9} />
                  </Link>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatus(a.id, isQueued ? "suggested" : "queued")}
                  className={cn(
                    "inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-semibold transition-colors",
                    isQueued
                      ? "border-blue-500/40 bg-blue-500/15 text-blue-700"
                      : "border-border bg-background text-foreground/70 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-700",
                  )}
                >
                  <Clock size={10} />
                  {isQueued ? "Queued" : "Queue"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(a.id, isDone ? "suggested" : "done")}
                  className={cn(
                    "inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-semibold transition-colors",
                    isDone
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700"
                      : "border-border bg-background text-foreground/70 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-700",
                  )}
                >
                  <Check size={10} />
                  {isDone ? "Done" : "Done"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(a.id, isSkipped ? "suggested" : "skipped")}
                  className={cn(
                    "inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-semibold transition-colors",
                    isSkipped
                      ? "border-muted-foreground/40 bg-muted/40 text-muted-foreground"
                      : "border-border bg-background text-foreground/70 hover:border-muted-foreground/30 hover:bg-muted/40",
                  )}
                >
                  <X size={10} />
                  {isSkipped ? "Skipped" : "Skip"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
