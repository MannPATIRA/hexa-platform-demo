import { NextResponse } from "next/server";
import {
  getShipmentEvents,
  getShipmentNotifications,
  getShippingMetrics,
} from "@/lib/shipping-store";

export async function GET() {
  const [metrics, events, notifications] = await Promise.all([
    getShippingMetrics(),
    getShipmentEvents(),
    getShipmentNotifications(),
  ]);

  const latestEvent = events[0];
  const latestNotification = notifications[0];
  const meanTimeToFirstEmailMs = (() => {
    const firstByShipment = new Map<string, number>();
    for (const notification of notifications) {
      if (notification.status !== "sent" || !notification.sentAt) continue;
      const ts = new Date(notification.sentAt).getTime();
      const current = firstByShipment.get(notification.shipmentId);
      if (!current || ts < current) firstByShipment.set(notification.shipmentId, ts);
    }
    if (firstByShipment.size === 0) return null;
    const shipmentCreatedById = new Map<string, number>();
    for (const event of events) {
      if (event.type !== "shipment_created") continue;
      const ts = new Date(event.occurredAt).getTime();
      const current = shipmentCreatedById.get(event.shipmentId);
      if (!current || ts < current) shipmentCreatedById.set(event.shipmentId, ts);
    }
    let total = 0;
    let count = 0;
    firstByShipment.forEach((sentTs, shipmentId) => {
      const createdTs = shipmentCreatedById.get(shipmentId);
      if (!createdTs) return;
      total += sentTs - createdTs;
      count += 1;
    });
    if (!count) return null;
    return Math.round(total / count);
  })();

  return NextResponse.json({
    metrics,
    latestEvent,
    latestNotification,
    meanTimeToFirstEmailMs,
  });
}
