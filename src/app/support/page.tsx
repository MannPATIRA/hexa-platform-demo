"use client";

import { Suspense } from "react";
import KnowledgeOverview from "@/components/support/KnowledgeOverview";
import TicketListClient from "@/components/support/TicketListClient";
import { supportTickets, knowledgeBaseStats } from "@/data/support-data";
import { CheckCircle2, Zap, BarChart3 } from "lucide-react";

function SupportContent() {
  return (
    <div className="flex h-full flex-col bg-card">
      {/* Hero header */}
      <div className="border-b border-border px-7 py-6">
        <h1 className="font-display text-2xl font-medium leading-none text-foreground">
          Customer Service
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          AI-powered support inbox — automatically triages, responds, and escalates customer inquiries.
        </p>

        {/* Stats strip */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <div>
              <p className="text-xl font-semibold tabular-nums text-foreground">
                {knowledgeBaseStats.totalAutoResolved}%
              </p>
              <p className="text-[11px] text-muted-foreground">Auto-Resolved</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-primary/20 bg-primary/5 px-4 py-3">
            <Zap size={18} className="shrink-0 text-primary" />
            <div>
              <p className="text-xl font-semibold tabular-nums text-foreground">
                {knowledgeBaseStats.avgResponseTimeSec}s
              </p>
              <p className="text-[11px] text-muted-foreground">Avg Response</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-border bg-muted/20 px-4 py-3">
            <BarChart3 size={18} className="shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xl font-semibold tabular-nums text-foreground">
                {knowledgeBaseStats.totalTicketsProcessed}
              </p>
              <p className="text-[11px] text-muted-foreground">Inquiries Processed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge base */}
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
