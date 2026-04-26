"use client";

import { Suspense } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import KnowledgeOverview from "@/components/support/KnowledgeOverview";
import TicketListClient from "@/components/support/TicketListClient";
import { supportTickets, knowledgeBaseStats } from "@/data/support-data";

function SupportContent() {
  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header — Claims-style compact title + search */}
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Customer Service
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            AI triages, drafts, and routes inbound customer requests across email, phone, web, and portal.
          </p>
        </div>
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search ticket, customer, or PO..."
            className="h-9 w-60 border-border bg-background pl-8 text-[12px] text-muted-foreground"
          />
        </div>
      </div>

      {/* Thin metrics row */}
      <div className="flex items-center gap-6 border-b border-border bg-muted/20 px-7 py-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Auto-Resolved</span>
          <span className="text-[12px] font-semibold tabular-nums text-emerald-700">
            {knowledgeBaseStats.totalAutoResolved}%
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Avg Response</span>
          <span className="text-[12px] font-semibold tabular-nums text-foreground">
            {knowledgeBaseStats.avgResponseTimeSec}s
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Processed</span>
          <span className="text-[12px] font-semibold tabular-nums text-foreground">
            {knowledgeBaseStats.totalTicketsProcessed}
          </span>
        </div>
      </div>

      {/* Knowledge base — collapsed one-liner with disclosure */}
      <KnowledgeOverview />

      {/* Ticket list */}
      <TicketListClient tickets={supportTickets} />
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading...
        </div>
      }
    >
      <SupportContent />
    </Suspense>
  );
}
