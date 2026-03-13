import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { CollapsibleCustomerCard } from "@/components/CollapsibleCustomerCard";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import { OrderWorkspace } from "@/components/OrderWorkspace";
import {
  ArrowLeft,
  Calendar,
  Mail,
  AlertTriangle,
  Truck,
  CircleCheckBig,
  ClipboardCheck,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const itemsNeedingAction = order.lineItems.filter(
    (i) => i.matchStatus !== "confirmed"
  ).length;

  return (
    <div className="p-7">
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[18px] font-medium leading-none text-foreground">
              {order.customer.company}
            </h1>
            <Badge
              variant="outline"
              className={
                order.status === "pending"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              }
            >
              {order.status === "pending" ? "Pending Review" : "Fulfilled"}
            </Badge>
            {order.shipmentSummary && (
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700">
                {order.shipmentSummary.status
                  .split("_")
                  .map((part) => part[0].toUpperCase() + part.slice(1))
                  .join(" ")}
              </Badge>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
            <span className="font-mono">{order.orderNumber}</span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              {order.emailSubject}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {order.dueDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Due {order.dueDate}
              </span>
            )}
            {order.paymentTerms && (
              <span className="inline-flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" />
                {order.paymentTerms}
              </span>
            )}
            {order.shipVia && (
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3 w-3" />
                {order.shipVia}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 ${
                order.mrpRoutingStatus === "pushed_to_mrp"
                  ? "text-emerald-700"
                  : "text-amber-700"
              }`}
            >
              {order.mrpRoutingStatus === "pushed_to_mrp" ? (
                <CircleCheckBig className="h-3 w-3" />
              ) : (
                <ClipboardCheck className="h-3 w-3" />
              )}
              {order.mrpRoutingStatus === "pushed_to_mrp"
                ? "Pushed to MRP"
                : "Staged for review"}
            </span>
          </div>
        </div>

        {order.status === "pending" && itemsNeedingAction > 0 && (
          <div className="flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-[13px] font-medium text-amber-700">
              {itemsNeedingAction} item{itemsNeedingAction !== 1 ? "s" : ""} need
              {itemsNeedingAction === 1 ? "s" : ""} your review
            </span>
          </div>
        )}
      </div>

      <CollapsibleCustomerCard customer={order.customer} />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <div className="border border-border bg-card p-6 shadow-sm">
            <AttachmentViewer attachments={order.attachments} />
          </div>
        </div>
        <div className="xl:col-span-3">
          <OrderWorkspace order={order} />
        </div>
      </div>
    </div>
  );
}
