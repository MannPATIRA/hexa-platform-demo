import { getAllOrders } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ResetOrdersButton } from "@/components/orders/ResetOrdersButton";
import { OrdersListClient } from "@/components/orders/OrdersListClient";
import { Search } from "lucide-react";
import { OrderStage } from "@/lib/types";

export const dynamic = "force-dynamic";

const NEEDS_ATTENTION_STAGES: OrderStage[] = [
  "needs_clarification",
  "po_mismatch",
];

export default async function OrdersPage() {
  const orders = await getAllOrders();
  const attentionCount = orders.filter((o) =>
    NEEDS_ATTENTION_STAGES.includes(o.stage)
  ).length;

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Orders
          </h1>
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
          <Badge
            variant="secondary"
            className={
              attentionCount > 0
                ? "gap-2 border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-700"
                : "gap-2 border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-600"
            }
          >
            <span className="text-xs font-semibold">
              {attentionCount > 0
                ? `${attentionCount} Need Review`
                : "All Clear"}
            </span>
          </Badge>
        </div>
      </div>

      <OrdersListClient orders={orders} />
    </div>
  );
}
