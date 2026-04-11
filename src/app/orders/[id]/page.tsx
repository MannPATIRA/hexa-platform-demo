import { notFound } from "next/navigation";
import Link from "next/link";
import { CollapsibleCustomerCard } from "@/components/CollapsibleCustomerCard";
import { OrderDetailClient } from "@/components/orders/OrderDetailClient";
import { ArrowLeft } from "lucide-react";
import { apiUrl, getApiBaseUrl } from "@/lib/api-base";
import { ordersFallback } from "@/lib/orders-fallback";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

function orderFromFallback(id: string): Order | undefined {
  return ordersFallback.find((o) => o.id === id);
}

async function fetchOrder(
  id: string
): Promise<{ order: Order | null; fetchError: string | null }> {
  try {
    const res = await fetch(apiUrl(`/api/orders/${encodeURIComponent(id)}`), {
      cache: "no-store",
    });
    if (res.ok) {
      const order = (await res.json()) as Order;
      return { order, fetchError: null };
    }
    if (res.status === 404) {
      const fromFallback = orderFromFallback(id);
      return fromFallback
        ? { order: fromFallback, fetchError: null }
        : { order: null, fetchError: null };
    }
    const fromFallback = orderFromFallback(id);
    if (fromFallback) return { order: fromFallback, fetchError: null };
    return {
      order: null,
      fetchError: `API returned ${res.status}`,
    };
  } catch {
    const fromFallback = orderFromFallback(id);
    if (fromFallback) return { order: fromFallback, fetchError: null };
    return {
      order: null,
      fetchError: `Cannot reach the API (${getApiBaseUrl()}). Start it with: cd hexa-platform-api && npm run dev`,
    };
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { order, fetchError } = await fetchOrder(id);

  if (fetchError) {
    return (
      <div className="p-7">
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales
        </Link>
        <div
          role="alert"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-950 dark:text-amber-100"
        >
          {fetchError}
        </div>
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="p-7">
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sales
      </Link>

      {order.customer && <CollapsibleCustomerCard customer={order.customer} />}

      <OrderDetailClient
        order={order}
        showLeftPanel={order.source !== "phone"}
      />
    </div>
  );
}
