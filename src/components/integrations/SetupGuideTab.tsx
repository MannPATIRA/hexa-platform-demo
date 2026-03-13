"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  User,
  Navigation,
  ImageIcon,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Play,
  Loader2,
  XCircle,
  Zap,
  TerminalSquare,
} from "lucide-react";
import type { IntegrationProvider, SetupGuideStep, ValidationCheck } from "@/data/integrations-data";

interface SetupGuideTabProps {
  provider: IntegrationProvider;
}

type CheckStatus = "idle" | "running" | "passed" | "failed";

function ValidationCheckItem({
  check,
  status,
  onRun,
}: {
  check: ValidationCheck;
  status: CheckStatus;
  onRun: () => void;
}) {
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-md border px-3 py-2.5 transition-colors",
      status === "passed" && "border-emerald-200 bg-emerald-50/40",
      status === "failed" && "border-red-200 bg-red-50/40",
    )}>
      <div className="mt-0.5 flex-shrink-0">
        {status === "idle" && (
          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
        )}
        {status === "running" && (
          <Loader2 size={16} className="animate-spin text-primary" />
        )}
        {status === "passed" && (
          <CheckCircle2 size={16} className="text-emerald-600" />
        )}
        {status === "failed" && (
          <XCircle size={16} className="text-red-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[12px] font-medium",
            status === "passed" && "text-emerald-800",
            status === "failed" && "text-red-800",
          )}>
            {check.label}
          </span>
          {check.autoRunnable && (
            <Zap size={10} className="text-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
          {check.description}
        </p>
        <div className="mt-1.5 flex items-start gap-1.5">
          <TerminalSquare size={10} className="mt-0.5 text-muted-foreground/60 flex-shrink-0" />
          <code className="text-[10px] text-muted-foreground font-mono leading-relaxed break-all">
            {check.method}
          </code>
        </div>
        {status !== "idle" && (
          <p className={cn(
            "text-[10px] mt-1",
            status === "passed" && "text-emerald-700",
            status === "failed" && "text-red-700",
            status === "running" && "text-muted-foreground",
          )}>
            {status === "running" && "Running..."}
            {status === "passed" && check.expectedResult}
            {status === "failed" && `Expected: ${check.expectedResult}`}
          </p>
        )}
      </div>
      {check.autoRunnable && status !== "running" && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRun}
          className={cn(
            "h-7 text-[10px] px-2 flex-shrink-0",
            status === "passed" && "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
            status === "failed" && "border-red-300 text-red-700 hover:bg-red-50",
          )}
        >
          {status === "idle" && <><Play size={10} className="mr-1" />Run</>}
          {status === "passed" && <><CheckCircle2 size={10} className="mr-1" />Passed</>}
          {status === "failed" && <><Play size={10} className="mr-1" />Retry</>}
        </Button>
      )}
      {!check.autoRunnable && (
        <span className="text-[9px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded flex-shrink-0">
          Manual
        </span>
      )}
    </div>
  );
}

function GuideStep({
  step,
  index,
  isLast,
  checkStatuses,
  onRunCheck,
  onRunAllChecks,
}: {
  step: SetupGuideStep;
  index: number;
  isLast: boolean;
  checkStatuses: Record<string, CheckStatus>;
  onRunCheck: (checkId: string) => void;
  onRunAllChecks: (checkIds: string[]) => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const checks = step.validationChecks ?? [];
  const autoChecks = checks.filter((c) => c.autoRunnable);
  const allPassed = checks.length > 0 && checks.every((c) => checkStatuses[c.id] === "passed");
  const anyFailed = checks.some((c) => checkStatuses[c.id] === "failed");
  const anyRunning = checks.some((c) => checkStatuses[c.id] === "running");

  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 bg-background text-[12px] font-semibold transition-colors",
            allPassed ? "border-emerald-500 text-emerald-600 bg-emerald-50" :
            anyFailed ? "border-red-400 text-red-600 bg-red-50" :
            "border-primary text-primary",
          )}
        >
          {allPassed ? <CheckCircle2 size={14} /> : index + 1}
        </button>
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>

      <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 text-left"
        >
          <h4 className="text-[13px] font-semibold text-foreground">{step.title}</h4>
          {checks.length > 0 && (
            <span className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded",
              allPassed ? "bg-emerald-100 text-emerald-700" :
              anyFailed ? "bg-red-100 text-red-700" :
              "bg-muted text-muted-foreground",
            )}>
              {checks.filter((c) => checkStatuses[c.id] === "passed").length}/{checks.length} checks
            </span>
          )}
          {open ? (
            <ChevronDown size={14} className="ml-auto text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="ml-auto text-muted-foreground flex-shrink-0" />
          )}
        </button>

        {open && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5">
                <User size={11} className="text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{step.who}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Navigation size={11} className="text-muted-foreground" />
                <code className="text-[11px] text-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                  {step.navigation}
                </code>
              </div>
            </div>

            <ol className="space-y-1.5 pl-0">
              {step.instructions.map((instruction, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-medium text-muted-foreground">
                    {String.fromCharCode(97 + i)}
                  </span>
                  <span className="text-[12px] leading-relaxed text-foreground/90">{instruction}</span>
                </li>
              ))}
            </ol>

            {step.fields && step.fields.length > 0 && (
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_1fr_1fr] items-center gap-2 border-b bg-muted/30 px-3 py-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground">Field</span>
                  <span className="text-[10px] font-medium text-muted-foreground">Value</span>
                  <span className="text-[10px] font-medium text-muted-foreground">Note</span>
                </div>
                {step.fields.map((field, i) => (
                  <div
                    key={i}
                    className={cn(
                      "grid grid-cols-[1fr_1fr_1fr] items-center gap-2 px-3 py-1.5",
                      i < step.fields!.length - 1 && "border-b"
                    )}
                  >
                    <span className="text-[11px] font-medium">{field.name}</span>
                    <code className="text-[11px] font-mono text-foreground/80">{field.value}</code>
                    <span className="text-[10px] text-muted-foreground">{field.note || "—"}</span>
                  </div>
                ))}
              </div>
            )}

            {step.warningText && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/50 p-3">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <p className="text-[11px] leading-relaxed text-amber-800">{step.warningText}</p>
              </div>
            )}

            {step.screenshotKey && (
              <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/20 px-3 py-2">
                <ImageIcon size={13} className="text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground">
                  Screenshot: {step.screenshotKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            )}

            {/* Validation checks */}
            {checks.length > 0 && (
              <div className="mt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} className="text-primary" />
                    <span className="text-[11px] font-semibold text-foreground">Validation Checks</span>
                  </div>
                  {autoChecks.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={anyRunning}
                      onClick={() => onRunAllChecks(autoChecks.map((c) => c.id))}
                      className="h-6 text-[10px] px-2 gap-1"
                    >
                      {anyRunning ? (
                        <><Loader2 size={10} className="animate-spin" />Running...</>
                      ) : (
                        <><Play size={10} />Run all checks</>
                      )}
                    </Button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {checks.map((check) => (
                    <ValidationCheckItem
                      key={check.id}
                      check={check}
                      status={checkStatuses[check.id] || "idle"}
                      onRun={() => onRunCheck(check.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SetupGuideTab({ provider }: SetupGuideTabProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [checkStatuses, setCheckStatuses] = useState<Record<string, CheckStatus>>({});

  const simulateCheck = useCallback((checkId: string) => {
    setCheckStatuses((prev) => ({ ...prev, [checkId]: "running" }));
    const delay = 800 + Math.random() * 1500;
    setTimeout(() => {
      const passed = Math.random() > 0.15;
      setCheckStatuses((prev) => ({ ...prev, [checkId]: passed ? "passed" : "failed" }));
    }, delay);
  }, []);

  const runAllChecks = useCallback((checkIds: string[]) => {
    checkIds.forEach((id, i) => {
      setTimeout(() => simulateCheck(id), i * 400);
    });
  }, [simulateCheck]);

  if (!provider.setupGuide) {
    return (
      <div>
        <div className="rounded-md border border-dashed p-8 text-center">
          <BookOpen size={28} className="mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-[13px] font-medium text-muted-foreground">
            Detailed setup guide coming soon
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Use the Connection tab for credential configuration and the{" "}
            {provider.shortName} official documentation for step-by-step setup instructions.
          </p>
        </div>
      </div>
    );
  }

  const guide = provider.setupGuide;
  const checklist = provider.verificationChecklist ?? [];
  const errors = provider.commonErrors ?? [];
  const timeline = provider.timelineEstimate;
  const security = provider.securityNotes ?? [];

  const allChecks = guide.steps.flatMap((s) => s.validationChecks ?? []);
  const autoChecks = allChecks.filter((c) => c.autoRunnable);
  const passedCount = allChecks.filter((c) => checkStatuses[c.id] === "passed").length;
  const failedCount = allChecks.filter((c) => checkStatuses[c.id] === "failed").length;

  const toggleChecklistItem = (i: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Timeline + validation summary banner */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary flex-shrink-0" />
          <p className="text-[13px] font-medium text-foreground">
            Estimated setup time: {guide.estimatedTime}
          </p>
        </div>
        {timeline && (
          <p className="text-[11px] text-muted-foreground pl-6">
            Experienced: {timeline.experienced} · First-timer: {timeline.firstTimer} · With approvals: {timeline.withApprovals}
          </p>
        )}
        {allChecks.length > 0 && (
          <div className="flex items-center gap-3 border-t pt-3">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-primary" />
                <span className="text-[12px] font-medium">{allChecks.length} automated checks available</span>
              </div>
              {passedCount > 0 && (
                <span className="text-[11px] text-emerald-600 font-medium">{passedCount} passed</span>
              )}
              {failedCount > 0 && (
                <span className="text-[11px] text-red-600 font-medium">{failedCount} failed</span>
              )}
            </div>
            <Button
              variant="default"
              size="sm"
              className="h-8 text-[12px] gap-1.5"
              onClick={() => runAllChecks(autoChecks.map((c) => c.id))}
            >
              <Play size={12} />
              Run All Checks
            </Button>
          </div>
        )}
      </div>

      {/* Step-by-step guide */}
      <div>
        <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-4">
          Step-by-step setup ({guide.steps.length} steps)
        </h3>
        <div className="space-y-0">
          {guide.steps.map((step, i) => (
            <GuideStep
              key={step.id}
              step={step}
              index={i}
              isLast={i === guide.steps.length - 1}
              checkStatuses={checkStatuses}
              onRunCheck={simulateCheck}
              onRunAllChecks={runAllChecks}
            />
          ))}
        </div>
      </div>

      {/* Verification checklist */}
      {checklist.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-muted-foreground" />
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
              Verification checklist
            </h3>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {checkedItems.size} / {checklist.length}
            </span>
          </div>
          <div className="rounded-md border divide-y">
            {checklist.map((item, i) => (
              <label
                key={i}
                className={cn(
                  "flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/30",
                  checkedItems.has(i) && "bg-emerald-50/30"
                )}
              >
                <Checkbox
                  checked={checkedItems.has(i)}
                  onCheckedChange={() => toggleChecklistItem(i)}
                  className="mt-0.5 h-4 w-4"
                />
                <span
                  className={cn(
                    "text-[12px] leading-relaxed",
                    checkedItems.has(i) && "line-through text-muted-foreground"
                  )}
                >
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Common errors */}
      {errors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-muted-foreground" />
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
              Common errors & troubleshooting
            </h3>
          </div>
          <div className="rounded-md border">
            <div className="grid grid-cols-[100px_1fr_1fr] items-center gap-2 border-b bg-muted/30 px-3 py-2">
              <span className="text-[10px] font-medium text-muted-foreground">Code</span>
              <span className="text-[10px] font-medium text-muted-foreground">Meaning</span>
              <span className="text-[10px] font-medium text-muted-foreground">Fix</span>
            </div>
            {errors.map((err, i) => (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-[100px_1fr_1fr] items-start gap-2 px-3 py-2",
                  i < errors.length - 1 && "border-b"
                )}
              >
                <code className={cn(
                  "text-[11px] font-mono font-semibold",
                  err.code.startsWith("2") ? "text-emerald-600" : "text-red-600"
                )}>
                  {err.code}
                </code>
                <span className="text-[11px] text-foreground">{err.meaning}</span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">{err.fix}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security notes */}
      {security.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-muted-foreground" />
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
              Security best practices
            </h3>
          </div>
          <ul className="space-y-2 rounded-md border p-3">
            {security.map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                <span className="text-[12px] leading-relaxed text-foreground/80">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
