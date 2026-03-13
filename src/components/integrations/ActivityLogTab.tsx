"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import type { IntegrationProvider, SyncLogEntry } from "@/data/integrations-data";
import { useState } from "react";

interface ActivityLogTabProps {
  provider: IntegrationProvider;
}

const statusIcons = {
  success: CheckCircle2,
  partial: AlertTriangle,
  failed: XCircle,
};

const statusColors = {
  success: "text-emerald-600",
  partial: "text-amber-600",
  failed: "text-red-600",
};

const statusBg = {
  success: "bg-emerald-50 border-emerald-200",
  partial: "bg-amber-50 border-amber-200",
  failed: "bg-red-50 border-red-200",
};

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LogEntry({ entry }: { entry: SyncLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = statusIcons[entry.status];

  return (
    <div className={cn("rounded-md border p-3", entry.errorMessage && statusBg[entry.status])}>
      <div className="flex items-start gap-2.5">
        <StatusIcon size={15} className={cn("mt-0.5 flex-shrink-0", statusColors[entry.status])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-medium">{entry.entityType}</span>
            <div className="flex items-center gap-1">
              {entry.direction === "inbound" ? (
                <ArrowDown size={10} className="text-blue-600" />
              ) : (
                <ArrowUp size={10} className="text-violet-600" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {entry.direction === "inbound" ? "IN" : "OUT"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {entry.recordCount.toLocaleString()} records
            </span>
            <span className="text-[11px] text-muted-foreground">&middot; {entry.duration}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formatTimestamp(entry.timestamp)}
          </p>

          {entry.errorMessage && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-foreground hover:underline"
              >
                <ChevronDown
                  size={12}
                  className={cn("transition-transform", expanded && "rotate-180")}
                />
                {expanded ? "Hide details" : "Show details"}
              </button>
              {expanded && (
                <div className="mt-2 rounded border bg-white p-2.5">
                  <p className="text-[11px] text-foreground font-mono leading-relaxed">
                    {entry.errorMessage}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]">
                    <RotateCcw size={11} className="mr-1.5" />
                    Retry
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogTab({ provider }: ActivityLogTabProps) {
  if (provider.syncLogs.length === 0) {
    return (
      <div className="p-1">
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-[13px] text-muted-foreground">No sync activity yet</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Activity logs will appear here once the integration is connected and syncing.
          </p>
        </div>
      </div>
    );
  }

  const successCount = provider.syncLogs.filter((l) => l.status === "success").length;
  const errorCount = provider.syncLogs.filter((l) => l.status === "failed").length;
  const partialCount = provider.syncLogs.filter((l) => l.status === "partial").length;

  return (
    <div className="space-y-4 p-1">
      {/* Summary strip */}
      <div className="flex items-center gap-4 rounded-md bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={12} className="text-emerald-600" />
          <span className="text-[11px] font-medium">{successCount} success</span>
        </div>
        {partialCount > 0 && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-600" />
            <span className="text-[11px] font-medium">{partialCount} partial</span>
          </div>
        )}
        {errorCount > 0 && (
          <div className="flex items-center gap-1.5">
            <XCircle size={12} className="text-red-600" />
            <span className="text-[11px] font-medium">{errorCount} failed</span>
          </div>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">
          Showing last {provider.syncLogs.length} events
        </span>
      </div>

      {/* Log entries */}
      <div className="space-y-2">
        {provider.syncLogs.map((entry) => (
          <LogEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
