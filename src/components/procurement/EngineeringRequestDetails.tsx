"use client";

import { User, Clock, FileText, Download, Image, Box, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getEngineeringRequest } from "@/data/procurement-data";
import type { RequestUrgency } from "@/lib/procurement-types";

const urgencyLabels: Record<RequestUrgency, string> = {
  routine: "Routine",
  urgent: "Urgent",
  critical: "Critical",
};

const urgencyBadgeClass: Record<RequestUrgency, string> = {
  routine: "border-border bg-transparent text-muted-foreground",
  urgent: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  critical: "border-amber-600/40 bg-amber-600/15 text-amber-800",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSubmittedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFileIcon(fileType: string) {
  const t = fileType.toLowerCase();
  if (t === "pdf") return FileText;
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(t)) return Image;
  return Box;
}

const specLabels: Record<string, string> = {
  material: "Material",
  dimensions: "Dimensions",
  tolerances: "Tolerances",
  grade: "Grade",
  finish: "Surface Finish",
  compliance: "Compliance",
};

export default function EngineeringRequestDetails({ itemId }: { itemId: string }) {
  const request = getEngineeringRequest(itemId);

  if (!request) return null;

  const specEntries = Object.entries(request.specs).filter(
    ([, v]) => v !== undefined && v !== ""
  ) as [string, string][];

  return (
    <div className="border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Engineering Request
        </h3>
        <Badge className={cn("text-[10px]", urgencyBadgeClass[request.urgency])}>
          {urgencyLabels[request.urgency]}
        </Badge>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-[13px] font-medium text-foreground/85">
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span>{request.requesterName}</span>
          <span className="text-muted-foreground">·</span>
          <span>{request.requesterTeam}</span>
          <span className="text-muted-foreground">·</span>
          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span>Submitted {formatSubmittedDate(request.submittedAt)}</span>
        </div>

        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Description
          </p>
          <p className="text-[13px] font-medium text-foreground/85 leading-relaxed">
            {request.description}
          </p>
        </div>

        {specEntries.length > 0 && (
          <div>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Technical Specifications
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {specEntries.map(([key, value]) => (
                <div key={key} className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">
                    {specLabels[key] ?? key}
                  </p>
                  <p className="text-[13px] font-medium text-foreground/85 tabular-nums">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {request.attachments.length > 0 && (
          <div>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Attachments
            </p>
            <div className="space-y-2">
              {request.attachments.map((att) => {
                const Icon = getFileIcon(att.fileType);
                return (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-foreground/85">
                          {att.fileName}
                        </p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          {formatFileSize(att.fileSize)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={att.url}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-none border border-border px-3 py-1.5 text-[12px] text-foreground/85 transition-colors hover:bg-muted/50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {request.classificationTags.length > 0 && (
          <div>
            <p className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Classification
            </p>
            <div className="flex flex-wrap gap-2">
              {request.classificationTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] border-border bg-transparent text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
