"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp, ArrowLeftRight, ArrowRight } from "lucide-react";
import type { IntegrationProvider, SyncModule } from "@/data/integrations-data";

interface SyncConfigTabProps {
  provider: IntegrationProvider;
}

const directionConfig = {
  inbound: { label: "Inbound", icon: ArrowDown, color: "text-blue-600" },
  outbound: { label: "Outbound", icon: ArrowUp, color: "text-violet-600" },
  bidirectional: { label: "Bidirectional", icon: ArrowLeftRight, color: "text-amber-600" },
};

const frequencyLabels: Record<string, string> = {
  realtime: "Real-time",
  "15min": "Every 15 min",
  hourly: "Hourly",
  daily: "Daily",
};

export default function SyncConfigTab({ provider }: SyncConfigTabProps) {
  const [modules, setModules] = useState<SyncModule[]>(provider.syncModules);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const updateFrequency = (id: string, frequency: SyncModule["frequency"]) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, frequency } : m))
    );
  };

  const enabledCount = modules.filter((m) => m.enabled).length;

  return (
    <div className="space-y-5 p-1">
      {/* Module toggles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            Data Modules
          </h3>
          <span className="text-[11px] text-muted-foreground">
            {enabledCount} of {modules.length} enabled
          </span>
        </div>

        <div className="space-y-1">
          {modules.map((mod) => {
            const dir = directionConfig[mod.direction];
            const DirIcon = dir.icon;
            return (
              <div
                key={mod.id}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                  mod.enabled ? "bg-muted/40" : "opacity-60"
                )}
              >
                <Checkbox
                  checked={mod.enabled}
                  onCheckedChange={() => toggleModule(mod.id)}
                  className="h-4 w-4"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium">{mod.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DirIcon size={12} className={dir.color} />
                  <span className={cn("text-[11px] font-medium", dir.color)}>{dir.label}</span>
                </div>
                <Select
                  value={mod.frequency}
                  onValueChange={(val) =>
                    updateFrequency(mod.id, val as SyncModule["frequency"])
                  }
                  disabled={!mod.enabled}
                >
                  <SelectTrigger className="h-7 w-[120px] text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime" className="text-[12px]">Real-time</SelectItem>
                    <SelectItem value="15min" className="text-[12px]">Every 15 min</SelectItem>
                    <SelectItem value="hourly" className="text-[12px]">Hourly</SelectItem>
                    <SelectItem value="daily" className="text-[12px]">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Mappings */}
      {provider.fieldMappings.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Field Mappings
            </h3>
            <div className="rounded-md border">
              <div className="grid grid-cols-[1fr_24px_1fr_80px] items-center gap-2 border-b bg-muted/30 px-3 py-2">
                <span className="text-[11px] font-medium text-muted-foreground">Hexa Field</span>
                <span />
                <span className="text-[11px] font-medium text-muted-foreground">{provider.shortName} Field</span>
                <span className="text-[11px] font-medium text-muted-foreground text-right">Status</span>
              </div>
              {provider.fieldMappings.map((mapping, i) => (
                <div
                  key={i}
                  className={cn(
                    "grid grid-cols-[1fr_24px_1fr_80px] items-center gap-2 px-3 py-2",
                    i < provider.fieldMappings.length - 1 && "border-b"
                  )}
                >
                  <code className="text-[11px] text-foreground font-mono">{mapping.hexaField}</code>
                  <ArrowRight size={12} className="text-muted-foreground mx-auto" />
                  <code className="text-[11px] text-muted-foreground font-mono truncate">
                    {mapping.providerField}
                  </code>
                  <span
                    className={cn(
                      "text-[10px] font-medium text-right",
                      mapping.status === "mapped" && "text-emerald-600",
                      mapping.status === "custom" && "text-amber-600",
                      mapping.status === "unmapped" && "text-red-500"
                    )}
                  >
                    {mapping.status === "mapped" && "Auto-mapped"}
                    {mapping.status === "custom" && "Custom"}
                    {mapping.status === "unmapped" && "Unmapped"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {provider.fieldMappings.length === 0 && provider.status === "not_configured" && (
        <>
          <Separator />
          <div className="rounded-md border border-dashed p-4 text-center">
            <p className="text-[12px] text-muted-foreground">
              Field mappings will be auto-detected after you connect this integration.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
