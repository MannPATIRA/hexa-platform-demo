import { NextResponse } from "next/server";
import { getOrderById, updateOrder } from "@/lib/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await request.json();
  const updated = { ...order };

  if (body.stage) updated.stage = body.stage;
  if (body.orderType) updated.orderType = body.orderType;
  if (body.lineItems) updated.lineItems = body.lineItems;
  if (body.inventoryStatus) updated.inventoryStatus = body.inventoryStatus;
  if (body.drawings) updated.drawings = body.drawings;
  if (body.demoFlow) updated.demoFlow = { ...updated.demoFlow, ...body.demoFlow };

  const result = await updateOrder(updated);
  return NextResponse.json(result);
}
