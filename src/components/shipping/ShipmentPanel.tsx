"use client";

import { useCallback, useEffect, useState } from "react";
import { Order, Shipment, ShipmentEvent, ShipmentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Package,
  ExternalLink,
  Clock,
  MapPin,
  AlertTriangle,
  Factory,
  Warehouse,
  Handshake,
  PackageCheck,
  PackageSearch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ShipmentWithEvents = {
  shipment: Shipment;
  events: ShipmentEvent[];
};

type ShipmentLifecycleStage = {
  id: string;
  label: string;
  priority: number;
  eventStatus?: ShipmentStatus;
  icon: LucideIcon;
};

const SHIPMENT_STAGES: ShipmentLifecycleStage[] = [
  { id: "in_production",        label: "In Production",                 priority: 1, eventStatus: "shipment_created",  icon: Factory },
  { id: "ready_for_collection", label: "Ready for Shipping Collection", priority: 2, eventStatus: "label_created",     icon: Warehouse },
  { id: "picked_up",            label: "Carrier Pickup Confirmed",      priority: 3, eventStatus: "picked_up",         icon: Handshake },
  { id: "in_transit",           label: "In Transit",                    priority: 4, eventStatus: "in_transit",         icon: Truck },
  { id: "out_for_delivery",     label: "Out for Delivery",              priority: 5, eventStatus: "out_for_delivery",   icon: MapPin },
  { id: "delivered",            label: "Delivered",                     priority: 6, eventStatus: "delivered",          icon: PackageCheck },
];

const STATUS_PRIORITY: Record<string, number> = {
  draft: 0,
  shipment_created: 1,
  label_created: 2,
  picked_up: 3,
  in_transit: 4,
  out_for_delivery: 5,
  delivered: 6,
  exception: 5,
  delayed: 5,
  returned: 6,
  cancelled: 6,
};

const statusBadgeClass: Record<ShipmentStatus, string> = {
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

const CARRIER_LABELS: Record<string, string> = {
  ups: "UPS",
  fedex: "FedEx",
  dhl: "DHL",
  shipstation: "ShipStation",
  manual: "Manual",
  other: "Other",
};

const STAGE_DESCRIPTIONS: Record<string, string> = {
  in_production:        "Order is being manufactured and prepared for shipment.",
  ready_for_collection: "Production complete — packaged and staged for carrier pickup.",
  picked_up:            "Carrier has collected the shipment from the facility.",
  in_transit:           "Shipment is moving through the carrier network.",
  out_for_delivery:     "On the local delivery vehicle for final drop-off today.",
  delivered:            "Shipment has been delivered and signed for.",
};

function getCurrentStage(status?: ShipmentStatus): ShipmentLifecycleStage | undefined {
  if (!status) return undefined;
  return SHIPMENT_STAGES.find((s) => s.eventStatus === status);
}

function CurrentStepCard({ status, carrier, trackingNumber, eta }: {
  status?: ShipmentStatus;
  carrier?: string;
  trackingNumber?: string;
  eta?: string;
}) {
  const stage = getCurrentStage(status);
  if (!stage) return null;

  const StageIcon = stage.icon;
  const description = STAGE_DESCRIPTIONS[stage.id] ?? "";
  const stepNumber = SHIPMENT_STAGES.indexOf(stage) + 1;
  const totalSteps = SHIPMENT_STAGES.length;
  const isDelivered = stage.id === "delivered";

  const badgeClass = isDelivered
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
    : "border-blue-500/30 bg-blue-500/10 text-blue-700";
  const iconBg = isDelivered ? "bg-emerald-500/10" : "bg-blue-500/10";
  const iconColor = isDelivered ? "text-emerald-600" : "text-blue-600";

  return (
    <div className="flex items-start gap-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", iconBg)}>
        <StageIcon className={cn("h-5 w-5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-[14px] font-semibold text-foreground">{stage.label}</h4>
          <Badge variant="outline" className={cn("text-[10px] font-semibold", badgeClass)}>
            {stepNumber}/{totalSteps}
          </Badge>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {carrier && (
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3 w-3" />
              {carrier}
            </span>
          )}
          {trackingNumber && (
            <span className="inline-flex items-center gap-1 font-mono">
              {trackingNumber}
            </span>
          )}
          {eta && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ETA {new Date(eta).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShipmentPanel({ order }: { order: Order }) {
  const [data, setData] = useState<ShipmentWithEvents | null>(null);
  const [loading, setLoading] = useState(false);

  const showTrackingSection =
    order.stage === "pushed_to_mrp" ||
    order.stage === "shipped" ||
    order.stage === "delivered";

  const loadShipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shipments?orderId=${order.id}&withEvents=true`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const payload = (await res.json()) as {
        shipments: ShipmentWithEvents[];
      };
      if (payload.shipments?.length > 0) {
        setData(payload.shipments[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [order.id]);

  useEffect(() => {
    if (showTrackingSection) {
      void loadShipments();
    }
  }, [loadShipments, showTrackingSection]);

  if (!showTrackingSection) return null;

  if (loading && !data) {
    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Truck className="h-4 w-4" />
          Loading shipment data...
        </div>
      </div>
    );
  }

  if (!data) {
    const summary = order.shipmentSummary;

    if (!summary) {
      return (
        <div className="border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-foreground">Awaiting Shipment</h3>
              <p className="text-[12px] text-muted-foreground">
                Shipment tracking will appear here once the order is dispatched from the warehouse.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <CurrentStepCard
          status={summary.status}
          carrier={CARRIER_LABELS[summary.carrier] ?? summary.carrier}
          trackingNumber={summary.trackingNumber}
          eta={summary.estimatedDelivery}
        />
      </div>
    );
  }

  const { shipment, events } = data;
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );
  const currentPriority = STATUS_PRIORITY[shipment.status] ?? 0;

  const eventByStatus = new Map<string, ShipmentEvent>();
  for (const ev of sortedEvents) {
    if (!eventByStatus.has(ev.status)) {
      eventByStatus.set(ev.status, ev);
    }
  }

  const latestEtaEvent = [...sortedEvents]
    .reverse()
    .find((e) => e.estimatedDelivery);

  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <PackageSearch className="h-5 w-5 text-foreground/70" />
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">
              Shipment Tracking
            </h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {CARRIER_LABELS[shipment.carrier] ?? shipment.carrier}
              {shipment.carrierService ? ` — ${shipment.carrierService}` : ""}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-semibold",
            statusBadgeClass[shipment.status]
          )}
        >
          {prettyStatus(shipment.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-px border-b border-border bg-border md:grid-cols-3">
        <div className="bg-card px-6 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tracking Number
          </p>
          {shipment.trackingNumber ? (
            shipment.trackingUrl ? (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-700 hover:underline"
              >
                {shipment.trackingNumber}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="mt-1 text-[13px] font-medium font-mono text-foreground/85">
                {shipment.trackingNumber}
              </p>
            )
          ) : (
            <p className="mt-1 text-[13px] text-muted-foreground">Pending</p>
          )}
        </div>

        <div className="bg-card px-6 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Estimated Delivery
          </p>
          {shipment.estimatedDelivery ? (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-foreground/85">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {new Date(shipment.estimatedDelivery).toLocaleDateString(
                "en-US",
                { weekday: "short", month: "short", day: "numeric", year: "numeric" }
              )}
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-muted-foreground">TBD</p>
          )}
          {latestEtaEvent &&
            latestEtaEvent.estimatedDelivery !==
              shipment.estimatedDelivery && (
              <p className="mt-0.5 text-[11px] text-amber-700">
                Updated from{" "}
                {new Date(latestEtaEvent.estimatedDelivery!).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )}
              </p>
            )}
        </div>

        <div className="bg-card px-6 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Ship To
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-foreground/85">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {order.shipTo || order.customer.shippingAddress}
            </span>
          </p>
        </div>
      </div>

      <div className="px-6 py-5">
        <CurrentStepCard
          status={shipment.status}
          carrier={CARRIER_LABELS[shipment.carrier] ?? shipment.carrier}
          trackingNumber={shipment.trackingNumber}
          eta={shipment.estimatedDelivery}
        />

        {(shipment.status === "exception" ||
          shipment.status === "delayed") && (
          <div className="mt-4 flex items-start gap-2 border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="text-[12px] font-medium text-amber-800">
                {shipment.status === "exception"
                  ? "Shipment Exception"
                  : "Shipment Delayed"}
              </p>
              {sortedEvents
                .filter(
                  (e) =>
                    e.status === "exception" || e.status === "delayed"
                )
                .slice(-1)
                .map((e) => (
                  <p
                    key={e.id}
                    className="mt-0.5 text-[11px] text-amber-700/80"
                  >
                    {e.message || `Status changed to ${prettyStatus(e.status)}`}
                  </p>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
