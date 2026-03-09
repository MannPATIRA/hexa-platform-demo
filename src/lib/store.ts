import { Redis } from "@upstash/redis";
import { Order } from "./types";
import { mockOrders } from "./mock-data";

// ---------------------------------------------------------------------------
// Picks KV (Vercel KV / Upstash) when env vars exist, otherwise in-memory.
// ---------------------------------------------------------------------------

const ORDERS_KEY = "hexa:orders";
const ORDER_PREFIX = "hexa:order:";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// --- KV helpers ---

async function kvSeed(redis: Redis) {
  const existing: string[] | null = await redis.get(ORDERS_KEY);
  if (existing && existing.length > 0) return;

  const pipe = redis.pipeline();
  const ids: string[] = [];
  for (const o of mockOrders) {
    pipe.set(`${ORDER_PREFIX}${o.id}`, JSON.stringify(o));
    ids.push(o.id);
  }
  pipe.set(ORDERS_KEY, JSON.stringify(ids));
  await pipe.exec();
}

async function kvGetAll(redis: Redis): Promise<Order[]> {
  await kvSeed(redis);
  const ids: string[] | null = await redis.get(ORDERS_KEY);
  if (!ids?.length) return [];

  const pipe = redis.pipeline();
  for (const id of ids) pipe.get(`${ORDER_PREFIX}${id}`);
  const rows = await pipe.exec();

  return (rows.filter(Boolean) as (string | Order)[])
    .map((r) => (typeof r === "string" ? (JSON.parse(r) as Order) : r))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

async function kvGetById(redis: Redis, id: string): Promise<Order | undefined> {
  await kvSeed(redis);
  const raw: string | Order | null = await redis.get(`${ORDER_PREFIX}${id}`);
  if (!raw) return undefined;
  return typeof raw === "string" ? (JSON.parse(raw) as Order) : raw;
}

async function kvAdd(redis: Redis, order: Order): Promise<Order> {
  await kvSeed(redis);
  const ids: string[] = (await redis.get(ORDERS_KEY)) ?? [];
  ids.unshift(order.id);

  const pipe = redis.pipeline();
  pipe.set(`${ORDER_PREFIX}${order.id}`, JSON.stringify(order));
  pipe.set(ORDERS_KEY, JSON.stringify(ids));
  await pipe.exec();
  return order;
}

// --- In-memory fallback (local dev) ---

const mem: Order[] = [...mockOrders];

// --- Public API ---

export async function getAllOrders(): Promise<Order[]> {
  const r = getRedis();
  if (r) return kvGetAll(r);
  return [...mem].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const r = getRedis();
  if (r) return kvGetById(r, id);
  return mem.find((o) => o.id === id);
}

export async function addOrder(order: Order): Promise<Order> {
  const r = getRedis();
  if (r) return kvAdd(r, order);
  mem.unshift(order);
  return order;
}
