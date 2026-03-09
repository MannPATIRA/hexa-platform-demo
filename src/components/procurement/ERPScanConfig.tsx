"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Save,
  RefreshCw,
  Bell,
  Mail,
  Trash2,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { procurementItems, defaultERPScanConfig } from "@/data/procurement-data";
import type { ScanFrequency, ReorderPointSource, ERPScanConfig as ERPScanConfigType } from "@/lib/procurement-types";

const frequencyLabels: Record<ScanFrequency, string> = {
  "15min": "Every 15 minutes",
  "1hr": "Every hour",
  "4hr": "Every 4 hours",
  daily: "Daily",
};

const frequencyOptions: ScanFrequency[] = ["15min", "1hr", "4hr", "daily"];

export default function ERPScanConfig({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<ERPScanConfigType>(() => ({
    ...defaultERPScanConfig,
    customReorderPoints: { ...defaultERPScanConfig.customReorderPoints },
    watchedItemIds: [...defaultERPScanConfig.watchedItemIds],
  }));

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleClose = useCallback(() => {
    setMounted(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const watchedItems = procurementItems.filter((item) =>
    config.watchedItemIds.includes(item.id)
  );

  const erpSourcedItems = procurementItems.filter(
    (item) => item.source === "erp_alert"
  );

  function updateCustomPoint(
    itemId: string,
    field: "reorderPoint" | "maxStock",
    value: number
  ) {
    setConfig((prev) => ({
      ...prev,
      customReorderPoints: {
        ...prev.customReorderPoints,
        [itemId]: {
          reorderPoint: prev.customReorderPoints[itemId]?.reorderPoint ?? 0,
          maxStock: prev.customReorderPoints[itemId]?.maxStock ?? 0,
          [field]: value,
        },
      },
    }));
  }

  function removeWatchedItem(itemId: string) {
    setConfig((prev) => ({
      ...prev,
      watchedItemIds: prev.watchedItemIds.filter((id) => id !== itemId),
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200",
          mounted ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      <div
        className={cn(
          "relative z-10 mt-[5vh] flex max-h-[90vh] w-full max-w-3xl flex-col border border-border bg-background shadow-2xl transition-all duration-200",
          mounted
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-[0.98] opacity-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-muted">
              <Settings className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                ERP Scan Configuration
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure automatic inventory monitoring
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            <div className="flex items-start gap-8">
              <div className="flex-1 space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                  Scan Frequency
                </label>
                <div className="relative">
                  <select
                    value={config.scanFrequency}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        scanFrequency: e.target.value as ScanFrequency,
                      }))
                    }
                    className="h-9 w-full appearance-none border border-input bg-background px-3 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {frequencyOptions.map((freq) => (
                      <option key={freq} value={freq}>
                        {frequencyLabels[freq]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Alert Preferences
                </label>
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                      In-app notifications
                    </span>
                    <Switch
                      checked={config.alertInApp}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          alertInApp: checked === true,
                        }))
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Email alerts
                    </span>
                    <Switch
                      checked={config.alertEmail}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          alertEmail: checked === true,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <label className="text-sm font-medium text-foreground">
                Reorder Point Source
              </label>
              <div className="mt-2 inline-flex border border-border">
                {(
                  [
                    { value: "erp", label: "Use ERP-defined reorder points" },
                    {
                      value: "custom",
                      label: "Use custom reorder points set in this platform",
                    },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        reorderPointSource: value as ReorderPointSource,
                      }))
                    }
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors",
                      config.reorderPointSource === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {config.reorderPointSource === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Custom Reorder Points
                </label>
                <div className="border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          Item Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          SKU
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          ERP Reorder Pt
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Custom Reorder Pt
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Max Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {erpSourcedItems.map((item, i) => (
                        <tr
                          key={item.id}
                          className={cn(
                            i < erpSourcedItems.length - 1 &&
                              "border-b border-border"
                          )}
                        >
                          <td className="px-3 py-2 text-foreground">
                            {item.name}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                            {item.sku}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                            {item.reorderPoint.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Input
                              type="number"
                              className="ml-auto h-7 w-24 rounded-none text-right tabular-nums text-xs"
                              value={
                                config.customReorderPoints[item.id]
                                  ?.reorderPoint ?? item.reorderPoint
                              }
                              onChange={(e) =>
                                updateCustomPoint(
                                  item.id,
                                  "reorderPoint",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Input
                              type="number"
                              className="ml-auto h-7 w-24 rounded-none text-right tabular-nums text-xs"
                              value={
                                config.customReorderPoints[item.id]?.maxStock ??
                                item.maxStock
                              }
                              onChange={(e) =>
                                updateCustomPoint(
                                  item.id,
                                  "maxStock",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Item Watchlist
                </label>
                <span className="text-xs text-muted-foreground">
                  {watchedItems.length} items tracked
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {watchedItems.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No items in watchlist
                  </p>
                ) : (
                  watchedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="truncate text-sm text-foreground">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {item.sku}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeWatchedItem(item.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleClose}>
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
