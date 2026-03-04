import { NextResponse } from "next/server";
import { getAllOrders, addOrder } from "@/lib/store";
import { Order } from "@/lib/types";

export async function GET() {
  const orders = getAllOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();

  const order: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: `ORD-2026-${String(getAllOrders().length + 43).padStart(4, "0")}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    emailSubject: body.emailSubject || "New Order",
    customer: body.customer || {
      id: `cust-${Date.now()}`,
      name: body.senderName || "Unknown",
      email: body.senderEmail || "unknown@example.com",
      phone: "",
      company: body.senderName?.split("@")[1] || "Unknown Company",
      billingAddress: "Not provided",
      shippingAddress: "Not provided",
    },
    attachments: body.attachments || [],
    lineItems: body.lineItems || [],
    totalItems: body.lineItems?.length || 0,
  };

  const created = addOrder(order);
  return NextResponse.json(created, { status: 201 });
}
