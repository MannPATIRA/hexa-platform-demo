"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Pause,
  Play,
  RefreshCcw,
  Trash2,
  Bell,
  AlertTriangle,
} from "lucide-react";
import type { IntegrationProvider } from "@/data/integrations-data";

interface IntegrationSettingsTabProps {
  provider: IntegrationProvider;
}

export default function IntegrationSettingsTab({ provider }: IntegrationSettingsTabProps) {
  const [paused, setPaused] = useState(provider.isPaused ?? false);
  const [notifyOnError, setNotifyOnError] = useState(true);
  const [notifyOnSuccess, setNotifyOnSuccess] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const isConnected = provider.status === "connected" || provider.status === "error" || provider.status === "degraded";

  if (!isConnected) {
    return (
      <div className="p-1">
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-[13px] text-muted-foreground">Settings not available</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Connect this integration first to access management settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1">
      {/* Pause/Resume */}
      <div className="flex items-center justify-between rounded-md border p-4">
        <div className="flex items-center gap-3">
          {paused ? (
            <Play size={16} className="text-muted-foreground" />
          ) : (
            <Pause size={16} className="text-muted-foreground" />
          )}
          <div>
            <p className="text-[13px] font-medium">
              {paused ? "Sync Paused" : "Sync Active"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {paused
                ? "Data sync is paused. Connection remains active."
                : "Data is syncing on the configured schedule."}
            </p>
          </div>
        </div>
        <Switch
          checked={!paused}
          onCheckedChange={(val) => setPaused(!val)}
        />
      </div>

      {/* Re-authenticate */}
      <div className="flex items-center justify-between rounded-md border p-4">
        <div className="flex items-center gap-3">
          <RefreshCcw size={16} className="text-muted-foreground" />
          <div>
            <p className="text-[13px] font-medium">Re-authenticate</p>
            <p className="text-[11px] text-muted-foreground">
              Refresh credentials or rotate API keys
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-[12px]">
          Re-authenticate
        </Button>
      </div>

      <Separator />

      {/* Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell size={14} className="text-muted-foreground" />
          <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            Notifications
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px]">Email on sync errors</p>
              <p className="text-[11px] text-muted-foreground">
                Receive an email when a sync operation fails
              </p>
            </div>
            <Switch checked={notifyOnError} onCheckedChange={setNotifyOnError} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px]">Daily sync summary</p>
              <p className="text-[11px] text-muted-foreground">
                Receive a daily email summarizing sync activity
              </p>
            </div>
            <Switch checked={notifyOnSuccess} onCheckedChange={setNotifyOnSuccess} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Disconnect */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-red-500" />
          <h3 className="text-[12px] font-medium uppercase tracking-wider text-red-600">
            Danger Zone
          </h3>
        </div>

        {!showDisconnectConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowDisconnectConfirm(true)}
            className="h-9 text-[13px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 size={14} className="mr-2" />
            Disconnect Integration
          </Button>
        ) : (
          <div className="rounded-md border border-red-200 bg-red-50/50 p-4">
            <p className="text-[12px] font-medium text-red-800">
              Are you sure you want to disconnect {provider.name}?
            </p>
            <p className="mt-1 text-[11px] text-red-700">
              This will stop all data syncing. Historical sync data will be preserved.
              You can reconnect at any time.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-[12px]"
              >
                Confirm Disconnect
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisconnectConfirm(false)}
                className="h-8 text-[12px]"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
