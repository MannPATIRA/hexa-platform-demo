"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Order, Shipment, ShipmentEvent, ShipmentStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Truck, Mail, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ShipmentWithEvents = {
  shipment: Shipment;
  events: ShipmentEvent[];
};

type ShipmentMetricsPayload = {
  metrics: {
    shipmentEventsProcessed: number;
    notificationSent: number;
    notificationFailed: number;
    duplicateSuppressed: number;
    lastUpdatedAt: string;
  };
  meanTimeToFirstEmailMs: number | null;
};

const statusClass: Record<ShipmentStatus, string> = {
  draft: "border-border bg-muted/50 text-foreground/70",
  shipment_created: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  label_created: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700",
  picked_up: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700",
  in_transit: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  out_for_delivery: "border-orange-500/30 bg-orange-500/10 text-orange-700",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  exception: "border-red-500/30 bg-red-500/10 text-red-700",
  delayed: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
  returned: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700",
  cancelled: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700",
};

function prettyStatus(status: ShipmentStatus): string {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ShipmentPanel({ order }: { order: Order }) {
  const [items, setItems] = useState<ShipmentWithEvents[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [metrics, setMetrics] = useState<ShipmentMetricsPayload | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState<Shipment["carrier"]>("manual");
  const [status, setStatus] = useState<ShipmentStatus>("shipment_created");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const latestShipment = useMemo(() => items[0]?.shipment, [items]);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/shipments?orderId=${order.id}&withEvents=true`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load shipments");
      const data = (await res.json()) as { shipments: ShipmentWithEvents[] };
      setItems(data.shipments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  }, [order.id]);

  const loadMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/shipments/metrics", { cache: "no-store" });
      if (!res.ok) return;
      const payload = (await res.json()) as ShipmentMetricsPayload;
      setMetrics(payload);
    } catch {
      // Metrics are supplementary; keep panel functional even if unavailable.
    }
  }, []);

  useEffect(() => {
    void loadShipments();
    void loadMetrics();
  }, [loadMetrics, loadShipments]);

  const createManualShipment = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          carrier,
          trackingNumber: trackingNumber || undefined,
          estimatedDelivery: estimatedDelivery || undefined,
          status,
          source: "manual",
          message: "Manual shipment entry from order workspace",
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Failed to create shipment");
      }
      setTrackingNumber("");
      setEstimatedDelivery("");
      await loadShipments();
      await loadMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shipment");
    } finally {
      setCreating(false);
    }
  };

  const resendLatestEmail = async () => {
    if (!latestShipment) return;
    setError(null);
    const res = await fetch("/api/notifications/shipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentId: latestShipment.id }),
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      setError(payload.error || "Could not resend notification");
    }
  };

  return (
    <div className="border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">Shipment Tracking Alerts</h3>
          <p className="text-[12px] text-muted-foreground mt-1">
            Manual shipment entry and tracking updates automatically email the customer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadShipments()} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => void resendLatestEmail()} disabled={!latestShipment}>
            <Mail className="h-3.5 w-3.5 mr-1.5" />
            Resend Email
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div className="border border-border bg-background px-2.5 py-2">
            <p className="text-muted-foreground">Events</p>
            <p className="font-medium text-foreground">{metrics.metrics.shipmentEventsProcessed}</p>
          </div>
          <div className="border border-border bg-background px-2.5 py-2">
            <p className="text-muted-foreground">Emails Sent</p>
            <p className="font-medium text-emerald-700">{metrics.metrics.notificationSent}</p>
          </div>
          <div className="border border-border bg-background px-2.5 py-2">
            <p className="text-muted-foreground">Email Failures</p>
            <p className="font-medium text-red-700">{metrics.metrics.notificationFailed}</p>
          </div>
          <div className="border border-border bg-background px-2.5 py-2">
            <p className="text-muted-foreground">Duplicate Suppressed</p>
            <p className="font-medium text-foreground">{metrics.metrics.duplicateSuppressed}</p>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value as Shipment["carrier"])}
          className="h-9 border border-border bg-background px-3 text-[12px]"
        >
          <option value="manual">Manual</option>
          <option value="ups">UPS</option>
          <option value="fedex">FedEx</option>
          <option value="dhl">DHL</option>
          <option value="shipstation">ShipStation</option>
          <option value="other">Other</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
          className="h-9 border border-border bg-background px-3 text-[12px]"
        >
          <option value="shipment_created">Shipment Created</option>
          <option value="label_created">Label Created</option>
          <option value="picked_up">Picked Up</option>
          <option value="in_transit">In Transit</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="exception">Exception</option>
          <option value="delayed">Delayed</option>
        </select>
        <Input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Tracking number"
          className="h-9 text-[12px]"
        />
        <Input
          type="date"
          value={estimatedDelivery}
          onChange={(e) => setEstimatedDelivery(e.target.value)}
          className="h-9 text-[12px]"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <Button onClick={() => void createManualShipment()} disabled={creating}>
          <Truck className="h-3.5 w-3.5 mr-1.5" />
          {creating ? "Saving..." : "Create / Update Shipment"}
        </Button>
      </div>

      {error && <p className="mt-3 text-[12px] text-red-600">{error}</p>}

      <div className="mt-5 space-y-3">
        {items.length === 0 && !loading ? (
          <p className="text-[12px] text-muted-foreground">No shipment records yet.</p>
        ) : (
          items.map(({ shipment, events }) => (
            <div key={shipment.id} className="border border-border bg-background/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-medium text-foreground">
                    {shipment.carrier.toUpperCase()} {shipment.trackingNumber ? `- ${shipment.trackingNumber}` : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    ETA{" "}
                    {shipment.estimatedDelivery
                      ? new Date(shipment.estimatedDelivery).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "TBD"}
                  </p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] font-semibold", statusClass[shipment.status])}>
                  {prettyStatus(shipment.status)}
                </Badge>
              </div>
              {events.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t pt-3">
                  {events.slice(0, 4).map((event) => (
                    <div key={event.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground/80">{prettyStatus(event.status)}</span>
                      <span className="text-muted-foreground">
                        {new Date(event.occurredAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
