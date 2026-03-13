import Link from "next/link";
import { getAllOrders } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ResetOrdersButton } from "@/components/orders/ResetOrdersButton";
import {
  Search,
  Mail,
  ShoppingCart,
  Phone,
  CircleCheckBig,
  ClipboardCheck,
} from "lucide-react";
import { OrderSource } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getAllOrders();
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const stagedCount = orders.filter(
    (o) => o.mrpRoutingStatus === "staged_for_review"
  ).length;

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Orders
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Manage incoming distributor orders and parsed line items
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
          <Badge
            variant="secondary"
            className={
              stagedCount > 0 || pendingCount > 0
                ? "gap-2 border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-700"
                : "gap-2 border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-600"
            }
          >
            <span className="text-xs font-semibold">
              {stagedCount > 0
                ? `${stagedCount} Staged`
                : pendingCount > 0
                  ? `${pendingCount} Pending`
                  : "All Fulfilled"}
            </span>
          </Badge>
        </div>
      </div>

      <div className="flex items-center border-b border-border px-7 py-2">
        <div className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Order
        </div>
        <div className="w-24 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Source
        </div>
        <div className="w-60 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Subject
        </div>
        <div className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Flow
        </div>
        <div className="w-16 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Items
        </div>
        <div className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </div>
        <div className="w-36 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Routing
        </div>
        <div className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Date
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {orders.map((order) => {
            const personPart = order.customer.name.split(/\s+[-–]\s+/)[0];
            const letters = personPart
              .split(/\s+/)
              .filter((w) => /^[A-Za-z]/.test(w))
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .replace(/[^A-Z]/g, "");
            const initials = letters.slice(0, 2) || "?";

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="group block w-full border text-left transition-all duration-200 border-border bg-background/30 cursor-pointer hover:border-primary/60 hover:bg-primary/5"
              >
                <div className="flex items-center px-4 py-3.5">
                  <div className="flex flex-1 items-center gap-3.5">
                    <Avatar className="h-9 w-9 shrink-0 overflow-hidden">
                      <AvatarFallback className="flex size-full min-w-0 items-center justify-center overflow-hidden bg-muted text-[10px] font-semibold leading-none tracking-tight text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[13px] font-medium leading-tight text-foreground/85">
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {order.customer.name} &middot; {order.customer.company}
                      </p>
                    </div>
                  </div>

                  <div className="w-24 flex justify-center">
                    <SourceBadge source={order.source} />
                  </div>

                  <div className="w-60 text-right">
                    <p className="truncate text-[12px] text-muted-foreground">
                      {order.emailSubject}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                      {order.paymentTerms || "Terms n/a"} &middot;{" "}
                      {order.shipVia || "Ship-via n/a"}
                    </p>
                  </div>

                  <div className="w-28 flex justify-end">
                    <FlowBadge
                      scenario={order.demoFlow?.scenario}
                      hasMismatch={
                        order.demoFlow?.quoteComparison
                          ? !order.demoFlow.quoteComparison.overallMatch
                          : false
                      }
                    />
                  </div>

                  <div className="w-16 text-right">
                    <p className="text-[12px] text-foreground/80">
                      {order.totalItems}
                    </p>
                  </div>

                  <div className="w-28 flex justify-end">
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant="outline"
                        className={
                          order.status === "pending"
                            ? "border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-700"
                            : "border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600"
                        }
                      >
                        {order.status === "pending" ? "Pending" : "Fulfilled"}
                      </Badge>
                      {order.shipmentSummary && (
                        <span className="text-[10px] text-muted-foreground">
                          {prettyShipmentStatus(order.shipmentSummary.status)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-36 flex justify-end">
                    <RoutingBadge route={order.mrpRoutingStatus} />
                  </div>

                  <div className="w-28 text-right">
                    <p className="text-[12px] text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

const SOURCE_CONFIG: Record<
  OrderSource,
  { icon: typeof Mail; label: string }
> = {
  email: { icon: Mail, label: "Email" },
  ecommerce: { icon: ShoppingCart, label: "Ecommerce" },
  phone: { icon: Phone, label: "Phone" },
};

function SourceBadge({ source }: { source?: OrderSource }) {
  const config = SOURCE_CONFIG[source ?? "email"];
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function prettyShipmentStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function RoutingBadge({
  route,
}: {
  route?: "staged_for_review" | "pushed_to_mrp";
}) {
  if (route === "pushed_to_mrp") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700">
        <CircleCheckBig className="h-3.5 w-3.5" />
        Pushed to MRP
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-700">
      <ClipboardCheck className="h-3.5 w-3.5" />
      Staged Review
    </span>
  );
}

function FlowBadge({
  scenario,
  hasMismatch,
}: {
  scenario?: string;
  hasMismatch: boolean;
}) {
  if (!scenario) {
    return <span className="text-[11px] text-muted-foreground">Standard</span>;
  }
  if (scenario === "rfq_csv" || scenario === "rfq_handwritten") {
    return (
      <Badge
        variant="outline"
        className="border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
      >
        RFQ
      </Badge>
    );
  }
  if (hasMismatch) {
    return (
      <Badge
        variant="outline"
        className="border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-700"
      >
        PO Diff
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
    >
      PO Clean
    </Badge>
  );
}
