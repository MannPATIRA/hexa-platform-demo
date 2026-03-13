import { NextRequest, NextResponse } from "next/server";
import { getShipmentById } from "@/lib/shipping-store";
import { sendShipmentEmail } from "@/lib/shipment-email";
import { markNotificationOutcome } from "@/lib/shipping-service";

export async function POST(req: NextRequest) {
  let body: { shipmentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.shipmentId) {
    return NextResponse.json({ error: "shipmentId is required" }, { status: 400 });
  }

  const shipment = await getShipmentById(body.shipmentId);
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  if (!shipment.customerEmail) {
    return NextResponse.json(
      { error: "Shipment has no customer email recipient" },
      { status: 400 }
    );
  }

  try {
    await sendShipmentEmail(shipment);
    await markNotificationOutcome({
      shipmentId: shipment.id,
      recipient: shipment.customerEmail,
      eventType: "notification_sent",
      status: "sent",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification failed";
    await markNotificationOutcome({
      shipmentId: shipment.id,
      recipient: shipment.customerEmail,
      eventType: "notification_failed",
      status: "failed",
      errorMessage: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
