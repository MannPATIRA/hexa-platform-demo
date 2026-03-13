import { NextRequest, NextResponse } from "next/server";
import { getShipmentEvents, getShipmentNotifications } from "@/lib/shipping-store";

export async function GET(req: NextRequest) {
  const shipmentId = req.nextUrl.searchParams.get("shipmentId") ?? undefined;
  const [events, notifications] = await Promise.all([
    getShipmentEvents(shipmentId),
    getShipmentNotifications(shipmentId),
  ]);
  return NextResponse.json({
    events,
    notifications,
  });
}
