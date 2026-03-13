"use client";

import { cn } from "@/lib/utils";
import type { IntegrationProvider, IntegrationStatus } from "@/data/integrations-data";
import {
  Database, Users, Warehouse, Factory, Calculator,
  ShoppingBag, Mail, Package, FileSpreadsheet,
} from "lucide-react";
import type { CategoryId } from "@/data/integrations-data";

const categoryIcons: Record<CategoryId, React.ElementType> = {
  erp: Database,
  crm: Users,
  wms: Warehouse,
  mrp: Factory,
  accounting: Calculator,
  ecommerce: ShoppingBag,
  communication: Mail,
  shipping: Package,
  data: FileSpreadsheet,
};

const statusConfig: Record<IntegrationStatus, { color: string; label: string }> = {
  connected: { color: "bg-emerald-500", label: "Connected" },
  error: { color: "bg-red-500", label: "Error" },
  degraded: { color: "bg-amber-500", label: "Degraded" },
  not_configured: { color: "bg-zinc-300", label: "Not configured" },
};

interface IntegrationCardProps {
  provider: IntegrationProvider;
  onSelect: (provider: IntegrationProvider) => void;
}

export default function IntegrationCard({ provider, onSelect }: IntegrationCardProps) {
  const status = statusConfig[provider.status];
  const Icon = categoryIcons[provider.category];

  return (
    <button
      onClick={() => onSelect(provider)}
      className={cn(
        "group relative flex flex-col items-start gap-3 rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md",
        provider.status === "error" && "border-red-200",
        provider.status === "connected" && "border-emerald-200/60",
      )}
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/50">
          <Icon size={16} className="text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("h-2 w-2 rounded-full", status.color)} />
          <span className={cn(
            "text-[11px] font-medium",
            provider.status === "connected" && "text-emerald-700",
            provider.status === "error" && "text-red-600",
            provider.status === "degraded" && "text-amber-600",
            provider.status === "not_configured" && "text-muted-foreground",
          )}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[13px] font-semibold text-foreground">{provider.name}</h3>
          {provider.researchVerified && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
              Guide
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
          {provider.description}
        </p>
      </div>

      {provider.lastSync && (
        <div className="flex w-full items-center justify-between border-t pt-2.5">
          <span className="text-[11px] text-muted-foreground">Last sync: {provider.lastSync}</span>
          {provider.syncedRecords24h !== undefined && (
            <span className="text-[11px] text-muted-foreground">
              {provider.syncedRecords24h.toLocaleString()} / 24h
            </span>
          )}
        </div>
      )}

      {!provider.lastSync && (
        <div className="w-full border-t pt-2.5">
          <span className="text-[11px] font-medium text-primary group-hover:underline">
            Configure
          </span>
        </div>
      )}
    </button>
  );
}
