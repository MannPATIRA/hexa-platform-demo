import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  addOrder,
  deleteOrders,
  getAllOrders,
  getOrderById,
  resetToBasicOrders,
  updateOrder,
} from "./lib/store.js";
import type { Order } from "./lib/types.js";
import { generateDefaultLineItems, getDemoLineItemsForSubject } from "./lib/default-line-items.js";
import {
  mapParsedLineItemsToOrderLines,
  parsePurchaseOrderWithFallback,
} from "./lib/po-parser.js";
import {
  getShipmentById,
  getShipmentEvents,
  getShipments,
  getShipmentNotifications,
  getShippingMetrics,
} from "./lib/shipping-store.js";
import {
  markNotificationOutcome,
  shouldSendNotificationForStatus,
  upsertShipmentFromEvent,
} from "./lib/shipping-service.js";
import { sendShipmentEmail } from "./lib/shipment-email.js";
import type {
  ShipmentSource,
  ShipmentStatus,
  ShippingCarrier,
} from "./lib/types.js";
import { handleSendDemoEmails } from "./handlers/send-demo-emails.js";
import { handleProcurementSendRfq } from "./handlers/procurement-send-rfq.js";
import { handleProcurementSaveRfqDraft } from "./handlers/procurement-save-rfq-draft.js";

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

export function createApp() {
  const app = new Hono();

  const originsEnv = process.env.CORS_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean);
  const origins =
    originsEnv && originsEnv.length > 0
      ? originsEnv
      : ["http://localhost:3000", "http://127.0.0.1:3000"];

  app.use(
    "*",
    cors({
      origin: origins,
      allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  app.get("/health", (c) => c.json({ ok: true }));

  // --- Orders ---
  app.get("/api/orders", async (c) => {
    const orders = await getAllOrders();
    return c.json(orders);
  });

  app.post("/api/orders", async (c) => {
    const body = await c.req.json();

    const orderId = `ord-${Date.now()}`;
    const existingOrders = await getAllOrders();
    const parsedPo =
      body.parsedPoData && typeof body.parsedPoData === "object"
        ? body.parsedPoData
        : parsePurchaseOrderWithFallback({
            streamLabel: body.source,
            subject: body.emailSubject,
            bodyText: body.emailBody,
            extraText: body.rawInputText ? [body.rawInputText] : undefined,
            attachments: body.attachments,
          });

    const demoItems = getDemoLineItemsForSubject(body.emailSubject ?? "", orderId);
    const lineItems =
      demoItems ??
      (Array.isArray(body.lineItems) && body.lineItems.length > 0
        ? body.lineItems
        : parsedPo.lineItems.length > 0
          ? mapParsedLineItemsToOrderLines(parsedPo.lineItems, orderId)
          : generateDefaultLineItems(orderId));

    const defaultStage = "rfq_received";

    const fallbackCustomer = {
      id: `cust-${Date.now()}`,
      name: body.senderName || "Unknown",
      email: body.senderEmail || "unknown@example.com",
      phone: "",
      company: body.senderName?.split("@")[1] || "Unknown Company",
      billingAddress: "Not provided",
      shippingAddress: parsedPo.shipTo || "Not provided",
    };
    const customer = body.customer
      ? {
          ...body.customer,
          shippingAddress:
            body.customer.shippingAddress === "Not provided" && parsedPo.shipTo
              ? parsedPo.shipTo
              : body.customer.shippingAddress,
        }
      : fallbackCustomer;

    const order: Order = {
      id: orderId,
      orderNumber: `ORD-2026-${String(existingOrders.length + 43).padStart(4, "0")}`,
      stage: body.stage ?? defaultStage,
      source: body.source || "email",
      orderType: body.orderType ?? "quote_builder",
      createdAt: new Date().toISOString(),
      emailSubject: body.emailSubject || "New Order",
      customer,
      attachments: body.attachments || [],
      lineItems,
      totalItems: lineItems.length,
      poNumber: body.poNumber ?? parsedPo.poNumber ?? null,
      dueDate: body.dueDate ?? parsedPo.dueDate ?? null,
      shipTo: body.shipTo ?? parsedPo.shipTo ?? customer.shippingAddress ?? null,
      shipVia: body.shipVia ?? parsedPo.shipVia ?? null,
      paymentTerms: body.paymentTerms ?? parsedPo.paymentTerms ?? null,
      parseConfidence: body.parseConfidence ?? parsedPo.overallConfidence ?? 0,
      parseFieldConfidence: body.parseFieldConfidence ?? parsedPo.fieldConfidence ?? {},
      parseMissingFields: body.parseMissingFields ?? parsedPo.missingFields ?? [],
      mrpRoutedAt:
        body.stage === "pushed_to_mrp" ||
        body.stage === "shipped" ||
        body.stage === "delivered" ||
        body.stage === "complete"
          ? new Date().toISOString()
          : null,
      ingestionSourceLabel: body.ingestionSourceLabel ?? body.source ?? "email",
      demoFlow: {
        scenario: "dynamic" as const,
        stage: "rfq_received" as const,
      },
    };

    const created = await addOrder(order);
    return c.json(created, 201);
  });

  app.delete("/api/orders", async (c) => {
    const body = await c.req.json();
    const ids = body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: "ids[] required" }, 400);
    }
    await deleteOrders(ids);
    return c.json({ deleted: ids.length });
  });

  app.post("/api/orders/reset", async (c) => {
    await resetToBasicOrders();
    return c.json({ success: true });
  });

  app.get("/api/orders/:id", async (c) => {
    const id = c.req.param("id");
    const order = await getOrderById(id);
    if (!order) return c.json({ error: "Order not found" }, 404);
    return c.json(order);
  });

  app.patch("/api/orders/:id/stage", async (c) => {
    const id = c.req.param("id");
    const order = await getOrderById(id);
    if (!order) return c.json({ error: "Order not found" }, 404);

    const body = await c.req.json();
    const updated = { ...order };

    if (body.stage) updated.stage = body.stage;
    if (body.orderType) updated.orderType = body.orderType;
    if (body.lineItems) updated.lineItems = body.lineItems;
    if (body.inventoryStatus) updated.inventoryStatus = body.inventoryStatus;
    if (body.drawings) updated.drawings = body.drawings;
    if (body.demoFlow) updated.demoFlow = { ...updated.demoFlow, ...body.demoFlow };

    const result = await updateOrder(updated);
    return c.json(result);
  });

  // --- Shipments ---
  app.get("/api/shipments", async (c) => {
    const orderId = c.req.query("orderId") ?? undefined;
    const poId = c.req.query("poId") ?? undefined;
    const withEvents = c.req.query("withEvents") === "true";

    const shipments = await getShipments({ orderId, poId });
    if (!withEvents) return c.json({ shipments });

    const payload = await Promise.all(
      shipments.map(async (shipment) => ({
        shipment,
        events: await getShipmentEvents(shipment.id),
      }))
    );
    return c.json({ shipments: payload });
  });

  app.post("/api/shipments", async (c) => {
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
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid request body" }, 400);
    }

    if (!body.orderNumber) {
      return c.json({ error: "orderNumber is required" }, 400);
    }
    if (!body.customerName) {
      return c.json({ error: "customerName is required" }, 400);
    }
    if (!body.carrier) {
      return c.json({ error: "carrier is required" }, 400);
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

    return c.json(result, result.duplicate ? 200 : 201);
  });

  app.get("/api/shipments/metrics", async (c) => {
    const [metrics, events, notifications] = await Promise.all([
      getShippingMetrics(),
      getShipmentEvents(),
      getShipmentNotifications(),
    ]);

    const latestEvent = events[0];
    const latestNotification = notifications[0];
    const meanTimeToFirstEmailMs = (() => {
      const firstByShipment = new Map<string, number>();
      for (const notification of notifications) {
        if (notification.status !== "sent" || !notification.sentAt) continue;
        const ts = new Date(notification.sentAt).getTime();
        const current = firstByShipment.get(notification.shipmentId);
        if (!current || ts < current) firstByShipment.set(notification.shipmentId, ts);
      }
      if (firstByShipment.size === 0) return null;
      const shipmentCreatedById = new Map<string, number>();
      for (const event of events) {
        if (event.type !== "shipment_created") continue;
        const ts = new Date(event.occurredAt).getTime();
        const current = shipmentCreatedById.get(event.shipmentId);
        if (!current || ts < current) shipmentCreatedById.set(event.shipmentId, ts);
      }
      let total = 0;
      let count = 0;
      firstByShipment.forEach((sentTs, shipmentId) => {
        const createdTs = shipmentCreatedById.get(shipmentId);
        if (!createdTs) return;
        total += sentTs - createdTs;
        count += 1;
      });
      if (!count) return null;
      return Math.round(total / count);
    })();

    return c.json({
      metrics,
      latestEvent,
      latestNotification,
      meanTimeToFirstEmailMs,
    });
  });

  app.get("/api/shipments/activity", async (c) => {
    const shipmentId = c.req.query("shipmentId") ?? undefined;
    const [events, notifications] = await Promise.all([
      getShipmentEvents(shipmentId),
      getShipmentNotifications(shipmentId),
    ]);
    return c.json({ events, notifications });
  });

  app.get("/api/shipments/:id", async (c) => {
    const id = c.req.param("id");
    const shipment = await getShipmentById(id);
    if (!shipment) return c.json({ error: "Shipment not found" }, 404);
    return c.json(shipment);
  });

  app.patch("/api/shipments/:id", async (c) => {
    const id = c.req.param("id");
    const existing = await getShipmentById(id);
    if (!existing) return c.json({ error: "Shipment not found" }, 404);

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
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid request body" }, 400);
    }

    if (!body.status) {
      return c.json({ error: "status is required" }, 400);
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

    return c.json(result);
  });

  app.post("/api/shipments/webhooks/:carrier", async (c) => {
    const carrierName = c.req.param("carrier").toLowerCase() as ShippingCarrier;
    if (!["ups", "fedex", "dhl", "shipstation"].includes(carrierName)) {
      return c.json({ error: "Unsupported carrier webhook" }, 400);
    }

    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid webhook body" }, 400);
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
        (body.shipmentId as string | undefined) ?? (body.shipment_id as string | undefined),
      orderId: (body.orderId as string | undefined) ?? (body.order_id as string | undefined),
      poId: (body.poId as string | undefined) ?? (body.po_id as string | undefined),
      orderNumber,
      customerName,
      customerEmail,
      carrier: carrierName,
      carrierService:
        (body.carrierService as string | undefined) ?? (body.service as string | undefined),
      trackingNumber,
      estimatedDelivery:
        (body.estimatedDelivery as string | undefined) ?? (body.eta as string | undefined),
      status,
      source: "webhook",
      occurredAt:
        (body.occurredAt as string | undefined) ?? (body.event_time as string | undefined),
      carrierEventId:
        (body.eventId as string | undefined) ?? (body.event_id as string | undefined),
      message: `Webhook update from ${carrierName.toUpperCase()}: ${rawStatus}`,
      rawPayload: body,
    });

    return c.json(result, result.duplicate ? 200 : 201);
  });

  app.post("/api/notifications/shipment", async (c) => {
    let body: { shipmentId?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid request body" }, 400);
    }

    if (!body.shipmentId) {
      return c.json({ error: "shipmentId is required" }, 400);
    }

    const shipment = await getShipmentById(body.shipmentId);
    if (!shipment) return c.json({ error: "Shipment not found" }, 404);
    if (!shipment.customerEmail) {
      return c.json({ error: "Shipment has no customer email recipient" }, 400);
    }

    try {
      await sendShipmentEmail(shipment);
      await markNotificationOutcome({
        shipmentId: shipment.id,
        recipient: shipment.customerEmail,
        eventType: "notification_sent",
        status: "sent",
      });
      return c.json({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Notification failed";
      await markNotificationOutcome({
        shipmentId: shipment.id,
        recipient: shipment.customerEmail,
        eventType: "notification_failed",
        status: "failed",
        errorMessage: message,
      });
      return c.json({ error: message }, 500);
    }
  });

  app.post("/api/send-demo-emails", handleSendDemoEmails);
  app.post("/api/procurement/send-rfq", handleProcurementSendRfq);
  app.post("/api/procurement/save-rfq-draft", handleProcurementSaveRfqDraft);

  return app;
}
