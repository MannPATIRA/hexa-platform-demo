"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Order } from "@/lib/types";
import { Package, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ orders }: { orders: Order[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center gap-2.5 border-b px-5 py-4">
        <Hexagon className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">Hexa Platform</h1>
          <p className="text-xs text-muted-foreground">Order Management</p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Orders
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {orders.map((order) => {
          const isActive = pathname === `/orders/${order.id}`;
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className={cn(
                "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Package className="h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{order.orderNumber}</p>
                <p
                  className={cn(
                    "truncate text-xs",
                    isActive
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {order.customer.company}
                </p>
              </div>
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  order.status === "pending" ? "bg-amber-400" : "bg-emerald-400"
                )}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
