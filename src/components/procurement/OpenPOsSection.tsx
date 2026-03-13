"use client";

import { useMemo, useState } from "react";
import { Truck, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getOpenPOsForItem } from "@/data/procurement-data";
import type { OpenPOStatus } from "@/lib/procurement-types";

const statusLabels: Record<OpenPOStatus, string> = {
  confirmed: "Confirmed",
  shipped: "Shipped",
  partial_shipped: "Partial Shipped",
  in_transit: "In Transit",
  delivered: "Delivered",
  delayed: "Delayed",
  exception: "Exception",
  cancelled: "Cancelled",
};

const statusClass: Record<OpenPOStatus, string> = {
  confirmed: "border-border bg-muted/50 text-foreground/70",
  shipped: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  partial_shipped: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  in_transit: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  delayed: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  exception: "border-red-500/30 bg-red-500/10 text-red-700",
  cancelled: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700",
};

export default function OpenPOsSection({ itemId }: { itemId: string }) {
  const openPOs = useMemo(() => getOpenPOsForItem(itemId), [itemId]);
  const [savingPoId, setSavingPoId] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { carrier: string; tracking: string; eta: string; status: OpenPOStatus }>>({});

  const getDraft = (poId: string, currentStatus: OpenPOStatus, currentTracking?: string) =>
    drafts[poId] ?? {
      carrier: "manual",
      tracking: currentTracking ?? "",
      eta: "",
      status: currentStatus,
    };

  const setDraft = (
    poId: string,
    patch: Partial<{ carrier: string; tracking: string; eta: string; status: OpenPOStatus }>
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [poId]: { ...getDraft(poId, "confirmed"), ...prev[poId], ...patch },
    }));
  };

  const savePoShipmentUpdate = async (
    po: (typeof openPOs)[number],
    draft: { carrier: string; tracking: string; eta: string; status: OpenPOStatus }
  ) => {
    setInlineError(null);
    setSavingPoId(po.id);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId: po.id,
          orderNumber: po.id.toUpperCase(),
          customerName: po.supplier.name,
          carrier: draft.carrier,
          trackingNumber: draft.tracking || undefined,
          estimatedDelivery: draft.eta || po.expectedDelivery,
          status:
            draft.status === "confirmed"
              ? "shipment_created"
              : draft.status === "shipped" || draft.status === "partial_shipped"
                ? "in_transit"
                : draft.status,
          source: "mrp_event",
          message: `Manual PO shipment update for ${po.id}`,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Failed to save shipment update");
      }
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Could not save shipment update");
    } finally {
      setSavingPoId(null);
    }
  };

  return (
    <div className="border border-border bg-card p-5 shadow-sm">
      <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Open POs / In-Transit
      </h4>

      {openPOs.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 py-5 text-muted-foreground">
          <Package className="h-5 w-5 opacity-40" />
          <p className="text-[12px]">No open orders</p>
        </div>
      ) : (
        <div className="space-y-2">
          {openPOs.map((po) => {
            const daysUntil = Math.round(
              (new Date(po.expectedDelivery).getTime() - new Date("2026-03-09").getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div key={po.id} className="border border-border bg-background/30 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Truck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-foreground/85 truncate">
                        {po.supplier.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {po.quantity.toLocaleString()} units
                        {po.trackingRef && <span className="ml-2 font-mono">{po.trackingRef}</span>}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 text-[10px] font-semibold", statusClass[po.status])}
                  >
                    {statusLabels[po.status]}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Ordered {new Date(po.orderDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className="text-foreground/60">&middot;</span>
                  <span className={cn(daysUntil <= 2 ? "font-medium text-emerald-600" : "")}>
                    ETA {new Date(po.expectedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {daysUntil > 0 && ` (${daysUntil}d)`}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                  <select
                    value={getDraft(po.id, po.status, po.trackingRef).carrier}
                    onChange={(e) => setDraft(po.id, { carrier: e.target.value })}
                    className="h-8 border border-border bg-background px-2 text-[11px]"
                  >
                    <option value="manual">Manual</option>
                    <option value="ups">UPS</option>
                    <option value="fedex">FedEx</option>
                    <option value="dhl">DHL</option>
                    <option value="shipstation">ShipStation</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={getDraft(po.id, po.status, po.trackingRef).status}
                    onChange={(e) =>
                      setDraft(po.id, { status: e.target.value as OpenPOStatus })
                    }
                    className="h-8 border border-border bg-background px-2 text-[11px]"
                  >
                    <option value="shipped">Shipped</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delayed">Delayed</option>
                    <option value="delivered">Delivered</option>
                    <option value="exception">Exception</option>
                  </select>
                  <Input
                    value={getDraft(po.id, po.status, po.trackingRef).tracking}
                    onChange={(e) => setDraft(po.id, { tracking: e.target.value })}
                    placeholder="Tracking #"
                    className="h-8 text-[11px]"
                  />
                  <Input
                    type="date"
                    value={getDraft(po.id, po.status, po.trackingRef).eta}
                    onChange={(e) => setDraft(po.id, { eta: e.target.value })}
                    className="h-8 text-[11px]"
                  />
                </div>

                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px]"
                    onClick={() =>
                      void savePoShipmentUpdate(po, getDraft(po.id, po.status, po.trackingRef))
                    }
                    disabled={savingPoId === po.id}
                  >
                    {savingPoId === po.id ? "Saving..." : "Log Shipment Event"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {inlineError && <p className="mt-3 text-[11px] text-red-600">{inlineError}</p>}
    </div>
  );
}
