import { NextRequest, NextResponse } from "next/server";
import { getShipmentById } from "@/lib/shipping-store";
import {
  markNotificationOutcome,
  shouldSendNotificationForStatus,
  upsertShipmentFromEvent,
} from "@/lib/shipping-service";
import { sendShipmentEmail } from "@/lib/shipment-email";
import { ShipmentSource, ShipmentStatus } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const shipment = await getShipmentById(id);
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  return NextResponse.json(shipment);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await getShipmentById(id);
  if (!existing) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  let body: {
    status?: ShipmentStatus;
    source?: ShipmentSource;
    trackingNumber?: string;
    estimatedDelivery?: string;
    carrierEventId?: string;
    idempotencyKey?: string;
    message?: string;
    rawPayload?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const result = await upsertShipmentFromEvent({
    shipmentId: id,
    orderId: existing.orderId,
    poId: existing.poId,
    orderNumber: existing.orderNumber,
    customerName: existing.customerName,
    customerEmail: existing.customerEmail,
    carrier: existing.carrier,
    carrierService: existing.carrierService,
    trackingNumber: body.trackingNumber ?? existing.trackingNumber,
    estimatedDelivery: body.estimatedDelivery ?? existing.estimatedDelivery,
    status: body.status,
    source: body.source ?? "manual",
    carrierEventId: body.carrierEventId,
    idempotencyKey: body.idempotencyKey,
    message: body.message,
    rawPayload: body.rawPayload,
  });

  if (
    !result.duplicate &&
    result.shipment.customerEmail &&
    shouldSendNotificationForStatus(result.shipment.status)
  ) {
    try {
      await sendShipmentEmail(result.shipment);
      await markNotificationOutcome({
        shipmentId: result.shipment.id,
        recipient: result.shipment.customerEmail,
        eventType: result.event.type,
        status: "sent",
      });
    } catch (error) {
      await markNotificationOutcome({
        shipmentId: result.shipment.id,
        recipient: result.shipment.customerEmail,
        eventType: result.event.type,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Notification failed",
      });
    }
  }

  return NextResponse.json(result);
}
