import { NextRequest, NextResponse } from "next/server";
import { ShippingCarrier, ShipmentStatus } from "@/lib/types";
import { upsertShipmentFromEvent } from "@/lib/shipping-service";

function normalizeCarrierStatus(rawStatus: string): ShipmentStatus {
  const status = rawStatus.toLowerCase();
  if (status.includes("label")) return "label_created";
  if (status.includes("pickup")) return "picked_up";
  if (status.includes("transit")) return "in_transit";
  if (status.includes("out_for_delivery") || status.includes("out for delivery")) {
    return "out_for_delivery";
  }
  if (status.includes("deliver")) return "delivered";
  if (status.includes("except")) return "exception";
  if (status.includes("delay")) return "delayed";
  if (status.includes("return")) return "returned";
  if (status.includes("cancel")) return "cancelled";
  return "shipment_created";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ carrier: string }> }
) {
  const { carrier } = await params;
  const carrierName = carrier.toLowerCase() as ShippingCarrier;
  if (!["ups", "fedex", "dhl", "shipstation"].includes(carrierName)) {
    return NextResponse.json(
      { error: "Unsupported carrier webhook" },
      { status: 400 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid webhook body" }, { status: 400 });
  }

  const trackingNumber =
    (body.trackingNumber as string | undefined) ??
    (body.tracking_number as string | undefined);
  const orderNumber =
    (body.orderNumber as string | undefined) ??
    (body.order_number as string | undefined) ??
    `WEBHOOK-${carrierName.toUpperCase()}`;
  const customerName =
    (body.customerName as string | undefined) ??
    (body.customer_name as string | undefined) ??
    "Customer";
  const customerEmail =
    (body.customerEmail as string | undefined) ??
    (body.customer_email as string | undefined);
  const rawStatus =
    (body.status as string | undefined) ??
    (body.shipment_status as string | undefined) ??
    "shipment_created";
  const status = normalizeCarrierStatus(rawStatus);

  const result = await upsertShipmentFromEvent({
    shipmentId:
      (body.shipmentId as string | undefined) ??
      (body.shipment_id as string | undefined),
    orderId:
      (body.orderId as string | undefined) ??
      (body.order_id as string | undefined),
    poId: (body.poId as string | undefined) ?? (body.po_id as string | undefined),
    orderNumber,
    customerName,
    customerEmail,
    carrier: carrierName,
    carrierService:
      (body.carrierService as string | undefined) ??
      (body.service as string | undefined),
    trackingNumber,
    estimatedDelivery:
      (body.estimatedDelivery as string | undefined) ??
      (body.eta as string | undefined),
    status,
    source: "webhook",
    occurredAt:
      (body.occurredAt as string | undefined) ??
      (body.event_time as string | undefined),
    carrierEventId:
      (body.eventId as string | undefined) ?? (body.event_id as string | undefined),
    message: `Webhook update from ${carrierName.toUpperCase()}: ${rawStatus}`,
    rawPayload: body,
  });

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
