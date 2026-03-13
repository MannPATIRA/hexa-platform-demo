import { NextRequest, NextResponse } from "next/server";
import { getShipmentEvents, getShipments } from "@/lib/shipping-store";
import {
  markNotificationOutcome,
  shouldSendNotificationForStatus,
  upsertShipmentFromEvent,
} from "@/lib/shipping-service";
import { sendShipmentEmail } from "@/lib/shipment-email";
import { ShipmentSource, ShipmentStatus, ShippingCarrier } from "@/lib/types";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId") ?? undefined;
  const poId = req.nextUrl.searchParams.get("poId") ?? undefined;
  const withEvents = req.nextUrl.searchParams.get("withEvents") === "true";

  const shipments = await getShipments({ orderId, poId });
  if (!withEvents) return NextResponse.json({ shipments });

  const payload = await Promise.all(
    shipments.map(async (shipment) => ({
      shipment,
      events: await getShipmentEvents(shipment.id),
    }))
  );
  return NextResponse.json({ shipments: payload });
}

export async function POST(req: NextRequest) {
  let body: {
    shipmentId?: string;
    orderId?: string;
    poId?: string;
    orderNumber?: string;
    customerName?: string;
    customerEmail?: string;
    carrier?: ShippingCarrier;
    carrierService?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    status?: ShipmentStatus;
    source?: ShipmentSource;
    occurredAt?: string;
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

  if (!body.orderNumber) {
    return NextResponse.json(
      { error: "orderNumber is required" },
      { status: 400 }
    );
  }

  if (!body.customerName) {
    return NextResponse.json(
      { error: "customerName is required" },
      { status: 400 }
    );
  }

  if (!body.carrier) {
    return NextResponse.json({ error: "carrier is required" }, { status: 400 });
  }

  const result = await upsertShipmentFromEvent({
    shipmentId: body.shipmentId,
    orderId: body.orderId,
    poId: body.poId,
    orderNumber: body.orderNumber,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    carrier: body.carrier,
    carrierService: body.carrierService,
    trackingNumber: body.trackingNumber,
    estimatedDelivery: body.estimatedDelivery,
    status: body.status ?? "shipment_created",
    source: body.source ?? "manual",
    occurredAt: body.occurredAt,
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

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
