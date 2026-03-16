import { getAllOrders } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { ResetOrdersButton } from "@/components/orders/ResetOrdersButton";
import { OrdersListClient } from "@/components/orders/OrdersListClient";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Orders
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
