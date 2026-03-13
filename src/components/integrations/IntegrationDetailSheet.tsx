"use client";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Database,
  Plug, BookOpen, BarChart3, Settings, Activity,
  X, ArrowLeft,
} from "lucide-react";
import type { IntegrationProvider, IntegrationStatus } from "@/data/integrations-data";
import ConnectionSetupTab from "./ConnectionSetupTab";
import SetupGuideTab from "./SetupGuideTab";
import SyncConfigTab from "./SyncConfigTab";
import ActivityLogTab from "./ActivityLogTab";
import IntegrationSettingsTab from "./IntegrationSettingsTab";

const statusConfig: Record<IntegrationStatus, { color: string; label: string; badge: string }> = {
  connected: { color: "bg-emerald-500", label: "Connected", badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" },
  error: { color: "bg-red-500", label: "Error", badge: "border-red-500/30 bg-red-500/10 text-red-700" },
  degraded: { color: "bg-amber-500", label: "Degraded", badge: "border-amber-500/30 bg-amber-500/10 text-amber-700" },
  not_configured: { color: "bg-zinc-300", label: "Not configured", badge: "border-zinc-300/50 bg-zinc-100 text-zinc-600" },
};

interface IntegrationDetailSheetProps {
  provider: IntegrationProvider | null;
  open: boolean;
  onClose: () => void;
}

export default function IntegrationDetailSheet({
  provider,
  open,
  onClose,
}: IntegrationDetailSheetProps) {
  if (!provider || !open) return null;

  const status = statusConfig[provider.status];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center gap-4 border-b px-6 py-3 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5 text-[13px] h-8 px-2">
          <ArrowLeft size={14} />
          Back to Integrations
        </Button>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/50">
            <Database size={14} className="text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold">{provider.name}</h1>
              <Badge variant="outline" className={cn("text-[10px] font-medium h-5", status.badge)}>
                <div className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", status.color)} />
                {status.label}
              </Badge>
              {provider.researchVerified && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                  Verified Guide
                </span>
              )}
            </div>
          </div>
        </div>

        {(provider.status === "connected" || provider.status === "error") && (
          <div className="flex items-center gap-4 text-[11px]">
            {provider.lastSync && (
              <span className="text-muted-foreground">
                Last sync: <span className="text-foreground font-medium">{provider.lastSync}</span>
              </span>
            )}
            {provider.syncedRecords24h !== undefined && (
              <span className="text-muted-foreground">
                24h: <span className="text-foreground font-medium">{provider.syncedRecords24h.toLocaleString()} records</span>
              </span>
            )}
          </div>
        )}

        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 flex-shrink-0">
          <X size={16} />
        </Button>
      </div>

      {/* Tabs + content */}
      <Tabs defaultValue={provider.setupGuide ? "guide" : "connection"} className="flex flex-col flex-1 min-h-0">
        <div className="border-b px-6 flex-shrink-0">
          <TabsList className="h-10 bg-transparent p-0 gap-0">
            <TabsTrigger
              value="connection"
              className="text-[13px] gap-1.5 px-4 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Plug size={13} />
              Connection
            </TabsTrigger>
            <TabsTrigger
              value="guide"
              className="text-[13px] gap-1.5 px-4 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <BookOpen size={13} />
              Setup Guide
            </TabsTrigger>
            <TabsTrigger
              value="sync"
              className="text-[13px] gap-1.5 px-4 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <BarChart3 size={13} />
              Data & Sync
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="text-[13px] gap-1.5 px-4 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Activity size={13} />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-[13px] gap-1.5 px-4 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Settings size={13} />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-6">
            <TabsContent value="connection" className="mt-0">
              <ConnectionSetupTab provider={provider} />
            </TabsContent>
            <TabsContent value="guide" className="mt-0">
              <SetupGuideTab provider={provider} />
            </TabsContent>
            <TabsContent value="sync" className="mt-0">
              <SyncConfigTab provider={provider} />
            </TabsContent>
            <TabsContent value="activity" className="mt-0">
              <ActivityLogTab provider={provider} />
            </TabsContent>
            <TabsContent value="settings" className="mt-0">
              <IntegrationSettingsTab provider={provider} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
