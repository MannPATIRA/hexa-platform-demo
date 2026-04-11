"use client";

import { CheckCircle2, BookOpen, Settings, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { knowledgeSources } from "@/data/support-data";
import type { KnowledgeSource } from "@/data/support-data";

const iconMap: Record<string, typeof BookOpen> = {
  BookOpen,
  Settings,
  Package,
  Users,
};

function SourceCard({ source }: { source: KnowledgeSource }) {
  const Icon = iconMap[source.icon] ?? BookOpen;
  const isLive = source.count === null;

  return (
    <div className="border border-border bg-background/50 px-4 py-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">{source.name}</span>
        </div>
        <span
          className={cn(
            "text-[11px] font-semibold",
            isLive ? "text-emerald-600" : "text-primary",
          )}
        >
          {source.countLabel}
        </span>
      </div>
      <ul className="space-y-1">
        {source.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <CheckCircle2 size={10} className="shrink-0 text-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function KnowledgeOverview() {
  return (
    <div className="border-b border-border px-7 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Knowledge Base
        </span>
        <span className="inline-flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {knowledgeSources.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </div>
    </div>
  );
}
