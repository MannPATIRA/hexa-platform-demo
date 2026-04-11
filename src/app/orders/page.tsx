import { Input } from "@/components/ui/input";
import { ResetOrdersButton } from "@/components/orders/ResetOrdersButton";
import { OrdersListClient } from "@/components/orders/OrdersListClient";
import { Search } from "lucide-react";
import { apiUrl } from "@/lib/api-base";
import { ordersFallback } from "@/lib/orders-fallback";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchOrders(): Promise<{ orders: Order[]; banner: string | null }> {
  const url = apiUrl("/api/orders");
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return {
        orders: ordersFallback,
        banner: null,
      };
    }
    const orders = (await res.json()) as Order[];
    return { orders, banner: null };
  } catch {
    return {
      orders: ordersFallback,
      banner: null,
    };
  }
}

export default async function OrdersPage() {
  const { orders, banner } = await fetchOrders();

  return (
    <div className="flex h-full flex-col bg-card">
      {banner && (
        <div
          role="alert"
          className="border-b border-amber-500/40 bg-amber-500/10 px-7 py-3 text-[13px] text-amber-950 dark:text-amber-100"
        >
          {banner}
        </div>
      )}
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Sales
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track incoming orders from RFQ to delivery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ResetOrdersButton />
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              readOnly
              value="Search orders..."
              className="h-9 w-52 border-border bg-background pl-8 text-xs text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <OrdersListClient orders={orders} />
    </div>
  );
}
