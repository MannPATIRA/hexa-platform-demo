"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, BookOpen, Settings, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { knowledgeSources } from "@/data/support-data";
import type { KnowledgeSource } from "@/data/support-data";

const iconMap: Record<string, typeof BookOpen> = {
  BookOpen,
  Settings,
  Package,
  Users,
};

function summarizeSources(): string {
  return knowledgeSources
    .map((s) => {
      if (s.id === "sops") return `${s.count} SOPs`;
      if (s.id === "product-specs") return `${s.count} specs`;
      if (s.id === "order-shipping") return "Live order data";
      if (s.id === "customer-history") return `${s.count} customer records`;
      return s.countLabel;
    })
    .join(" · ");
}

function SourceCard({ source }: { source: KnowledgeSource }) {
  const Icon = iconMap[source.icon] ?? BookOpen;
  const isLive = source.count === null;

  return (
    <div className="border border-border bg-background/50 px-3 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon size={12} className="text-muted-foreground" />
          <span className="text-[12px] font-medium text-foreground">{source.name}</span>
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold",
            isLive ? "text-emerald-600" : "text-primary",
          )}
        >
          {source.countLabel}
        </span>
      </div>
      <ul className="space-y-0.5">
        {source.items.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <CheckCircle2 size={9} className="shrink-0 text-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function KnowledgeOverview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border bg-muted/10">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-7 py-2 text-left transition-colors hover:bg-muted/20"
      >
        {expanded ? (
          <ChevronDown size={12} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={12} className="text-muted-foreground" />
        )}
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Knowledge Base
        </span>
        <span className="inline-flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
        <span className="text-[11px] text-muted-foreground">
          {summarizeSources()}
        </span>
      </button>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 px-7 pb-3 lg:grid-cols-4">
          {knowledgeSources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}
