import { Redis } from "@upstash/redis";
import {
  Shipment,
  ShipmentEvent,
  ShipmentNotification,
  ShippingMetrics,
} from "@/lib/types";

const SHIPMENTS_KEY = "hexa:shipments";
const SHIPMENT_PREFIX = "hexa:shipment:";
const SHIPMENT_EVENT_PREFIX = "hexa:shipment:event:";
const SHIPMENT_EVENTS_KEY = "hexa:shipment:events";
const SHIPMENT_NOTIFICATION_PREFIX = "hexa:shipment:notification:";
const SHIPMENT_NOTIFICATIONS_KEY = "hexa:shipment:notifications";
const SHIPMENT_METRICS_KEY = "hexa:shipment:metrics";
const SHIPMENT_DEDUPE_PREFIX = "hexa:shipment:dedupe:";

const memShipments: Shipment[] = [];
const memEvents: ShipmentEvent[] = [];
const memNotifications: ShipmentNotification[] = [];
const memDedupe = new Set<string>();
let memMetrics: ShippingMetrics = {
  shipmentEventsProcessed: 0,
  notificationSent: 0,
  notificationFailed: 0,
  duplicateSuppressed: 0,
  lastUpdatedAt: new Date().toISOString(),
};

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function kvGetList<T>(redis: Redis, key: string): Promise<T[]> {
  const raw = (await redis.get(key)) as string | T[] | null;
  if (!raw) return [];
  return typeof raw === "string" ? (JSON.parse(raw) as T[]) : raw;
}

async function kvSetList<T>(redis: Redis, key: string, value: T[]): Promise<void> {
  await redis.set(key, JSON.stringify(value));
}

async function kvGetObject<T>(redis: Redis, key: string): Promise<T | null> {
  const raw = (await redis.get(key)) as string | T | null;
  if (!raw) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as T) : raw;
}

export async function getShipments(filters?: {
  orderId?: string;
  poId?: string;
}): Promise<Shipment[]> {
  const r = getRedis();
  const all = r ? await kvGetList<Shipment>(r, SHIPMENTS_KEY) : [...memShipments];
  const filtered = all.filter((shipment) => {
    if (filters?.orderId && shipment.orderId !== filters.orderId) return false;
    if (filters?.poId && shipment.poId !== filters.poId) return false;
    return true;
  });
  return filtered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getShipmentById(id: string): Promise<Shipment | undefined> {
  const r = getRedis();
  if (r) {
    const shipment = await kvGetObject<Shipment>(r, `${SHIPMENT_PREFIX}${id}`);
    return shipment ?? undefined;
  }
  return memShipments.find((shipment) => shipment.id === id);
}

export async function saveShipment(shipment: Shipment): Promise<Shipment> {
  const r = getRedis();
  if (r) {
    const all = await kvGetList<Shipment>(r, SHIPMENTS_KEY);
    const index = all.findIndex((s) => s.id === shipment.id);
    if (index === -1) all.push(shipment);
    else all[index] = shipment;
    await kvSetList(r, SHIPMENTS_KEY, all);
    await r.set(`${SHIPMENT_PREFIX}${shipment.id}`, JSON.stringify(shipment));
    return shipment;
  }

  const index = memShipments.findIndex((s) => s.id === shipment.id);
  if (index === -1) memShipments.push(shipment);
  else memShipments[index] = shipment;
  return shipment;
}

export async function hasIdempotencyKey(idempotencyKey: string): Promise<boolean> {
  const r = getRedis();
  if (r) {
    const existing = await r.get(`${SHIPMENT_DEDUPE_PREFIX}${idempotencyKey}`);
    return Boolean(existing);
  }
  return memDedupe.has(idempotencyKey);
}

export async function markIdempotencyKey(idempotencyKey: string): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.set(`${SHIPMENT_DEDUPE_PREFIX}${idempotencyKey}`, "1");
    return;
  }
  memDedupe.add(idempotencyKey);
}

export async function addShipmentEvent(event: ShipmentEvent): Promise<ShipmentEvent> {
  const r = getRedis();
  if (r) {
    const all = await kvGetList<ShipmentEvent>(r, SHIPMENT_EVENTS_KEY);
    all.push(event);
    await kvSetList(r, SHIPMENT_EVENTS_KEY, all);
    await r.set(`${SHIPMENT_EVENT_PREFIX}${event.id}`, JSON.stringify(event));
    return event;
  }
  memEvents.push(event);
  return event;
}

export async function getShipmentEvents(shipmentId?: string): Promise<ShipmentEvent[]> {
  const r = getRedis();
  const all = r ? await kvGetList<ShipmentEvent>(r, SHIPMENT_EVENTS_KEY) : [...memEvents];
  return all
    .filter((event) => (shipmentId ? event.shipmentId === shipmentId : true))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export async function addShipmentNotification(
  notification: ShipmentNotification
): Promise<ShipmentNotification> {
  const r = getRedis();
  if (r) {
    const all = await kvGetList<ShipmentNotification>(r, SHIPMENT_NOTIFICATIONS_KEY);
    all.push(notification);
    await kvSetList(r, SHIPMENT_NOTIFICATIONS_KEY, all);
    await r.set(
      `${SHIPMENT_NOTIFICATION_PREFIX}${notification.id}`,
      JSON.stringify(notification)
    );
    return notification;
  }
  memNotifications.push(notification);
  return notification;
}

export async function getShipmentNotifications(
  shipmentId?: string
): Promise<ShipmentNotification[]> {
  const r = getRedis();
  const all = r
    ? await kvGetList<ShipmentNotification>(r, SHIPMENT_NOTIFICATIONS_KEY)
    : [...memNotifications];
  return all
    .filter((notification) =>
      shipmentId ? notification.shipmentId === shipmentId : true
    )
    .sort((a, b) => {
      const aDate = a.sentAt ?? "";
      const bDate = b.sentAt ?? "";
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

export async function incrementShippingMetric(
  key: keyof Omit<ShippingMetrics, "lastUpdatedAt">,
  amount = 1
): Promise<ShippingMetrics> {
  const r = getRedis();
  if (r) {
    const current =
      (await kvGetObject<ShippingMetrics>(r, SHIPMENT_METRICS_KEY)) ?? memMetrics;
    const next: ShippingMetrics = {
      ...current,
      [key]: current[key] + amount,
      lastUpdatedAt: new Date().toISOString(),
    };
    await r.set(SHIPMENT_METRICS_KEY, JSON.stringify(next));
    return next;
  }
  memMetrics = {
    ...memMetrics,
    [key]: memMetrics[key] + amount,
    lastUpdatedAt: new Date().toISOString(),
  };
  return memMetrics;
}

export async function getShippingMetrics(): Promise<ShippingMetrics> {
  const r = getRedis();
  if (r) {
    const current = await kvGetObject<ShippingMetrics>(r, SHIPMENT_METRICS_KEY);
    return current ?? memMetrics;
  }
  return memMetrics;
}
