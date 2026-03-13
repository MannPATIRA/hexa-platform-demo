"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Database,
  Package,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import {
  integrationCategories,
  type IntegrationProvider,
} from "@/data/integrations-data";
import IntegrationDetailSheet from "@/components/integrations/IntegrationDetailSheet";

const erpCategory = integrationCategories.find((c) => c.id === "erp")!;
const shippingCategory = integrationCategories.find((c) => c.id === "shipping")!;

const erpProviders = erpCategory.providers.filter((p) => p.researchVerified);
const shippingProviders = shippingCategory.providers;

const statusDot: Record<string, string> = {
  connected: "bg-emerald-500",
  error: "bg-red-500",
  degraded: "bg-amber-500",
  not_configured: "bg-zinc-300",
};

const statusLabel: Record<string, string> = {
  connected: "Connected",
  error: "Error",
  degraded: "Degraded",
  not_configured: "Not configured",
};

export default function IntegrationsPage() {
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);

  const renderProviderCards = (providers: IntegrationProvider[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {providers.map((provider) => (
        <button
          key={provider.id}
          onClick={() => setSelectedProvider(provider)}
          className={cn(
            "group relative flex flex-col rounded-xl border bg-card p-5 text-left transition-all hover:shadow-lg hover:border-primary/20",
            provider.status === "connected" && "border-emerald-200/70",
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-foreground">{provider.name}</h3>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">{provider.authMethod}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("h-2 w-2 rounded-full", statusDot[provider.status])} />
              <span className={cn(
                "text-[11px] font-medium",
                provider.status === "connected" ? "text-emerald-700" : "text-muted-foreground",
              )}>
                {statusLabel[provider.status]}
              </span>
            </div>
          </div>

          <p className="text-[12px] leading-relaxed text-muted-foreground mb-4">
            {provider.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {provider.setupGuide && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/8 border border-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                <BookOpen size={10} />
                Step-by-step guide
              </span>
            )}
            {provider.verificationChecklist && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/8 border border-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 size={10} />
                Verification checklist
              </span>
            )}
            {provider.securityNotes && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/8 border border-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                <ShieldCheck size={10} />
                Security guide
              </span>
            )}
          </div>

          <div className="mb-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              Data modules
            </p>
            <div className="flex flex-wrap gap-1">
              {provider.syncModules.slice(0, 5).map((mod) => (
                <span
                  key={mod.id}
                  className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {mod.name.replace(/\s*\(.*?\)\s*/g, "")}
                </span>
              ))}
              {provider.syncModules.length > 5 && (
                <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  +{provider.syncModules.length - 5} more
                </span>
              )}
            </div>
          </div>

          {provider.timelineEstimate && (
            <div className="flex items-center gap-1.5 mb-4 text-[11px] text-muted-foreground">
              <Clock size={11} />
              <span>Setup: {provider.timelineEstimate.experienced} (experienced)</span>
            </div>
          )}

          <div className="mt-auto pt-3 border-t flex items-center justify-between">
            {provider.status === "connected" ? (
              <>
                <span className="text-[11px] text-muted-foreground">
                  Last sync: {provider.lastSync}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {provider.syncedRecords24h?.toLocaleString() ?? 0} records / 24h
                </span>
              </>
            ) : (
              <>
                <span className="text-[12px] font-medium text-primary group-hover:underline">
                  View setup guide
                </span>
                <ArrowRight size={14} className="text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </>
            )}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="font-display text-[28px] font-normal text-foreground">
          Integrations
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1 max-w-xl">
          Connect ERP and shipping providers to sync inventory, shipments, labels, tracking, and customer status updates.
        </p>
      </div>

      {/* ERP cards */}
      <div className="px-8 pb-8">
        <div className="flex items-center gap-2 mb-5">
          <Database size={15} className="text-muted-foreground" />
          <h2 className="text-[14px] font-semibold text-foreground">ERP Systems</h2>
          <span className="text-[11px] text-muted-foreground ml-1">
            {erpProviders.filter((p) => p.status === "connected").length} of {erpProviders.length} connected
          </span>
        </div>

        {renderProviderCards(erpProviders)}

        {/* Other ERPs - coming soon */}
        <div className="mt-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Coming soon
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {erpCategory.providers
              .filter((p) => !p.researchVerified)
              .map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/20 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/50 flex-shrink-0">
                    <Database size={14} className="text-muted-foreground/50" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-foreground/60 truncate">{provider.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{provider.authMethod}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Shipping carriers */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-5">
            <Package size={15} className="text-muted-foreground" />
            <h2 className="text-[14px] font-semibold text-foreground">Shipping & Logistics</h2>
            <span className="text-[11px] text-muted-foreground ml-1">
              {shippingProviders.filter((p) => p.status === "connected").length} of {shippingProviders.length} connected
            </span>
          </div>
          {renderProviderCards(shippingProviders)}
        </div>
      </div>

      {/* Detail overlay */}
      <IntegrationDetailSheet
        provider={selectedProvider}
        open={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
      />
    </div>
  );
}
