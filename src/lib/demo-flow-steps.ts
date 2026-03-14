import type { Order, ComparisonField } from "./types";

export interface DemoStep {
  id: string;
  type: "user" | "auto";
  delayMs?: number;
  apply: (order: Order) => Order;
}

function now(): string {
  return new Date().toISOString();
}

function generateClarificationQuestions(order: Order): string[] {
  const questions: string[] = [];
  for (const item of order.lineItems) {
    if (item.matchStatus !== "confirmed") {
      for (const issue of item.issues) {
        questions.push(
          `Line ${item.lineNumber} (${item.parsedProductName}): ${issue}`
        );
      }
    }
  }
  if (order.parseMissingFields && order.parseMissingFields.length > 0) {
    questions.push(
      `Missing order fields: ${order.parseMissingFields.join(", ")}`
    );
  }
  return questions;
}

function deriveQuoteNumber(order: Order): string {
  return `Q-${order.orderNumber.replace("ORD-", "")}`;
}

function derivePoNumber(order: Order): string {
  return `PO-${order.orderNumber.replace("ORD-", "")}`;
}

function deriveErpId(order: Order): string {
  return `ERP-${order.orderNumber.replace("ORD-", "")}`;
}

export const DEMO_STEPS: DemoStep[] = [
  // Step 0: User reviews line items, sees clarification questions, clicks "Send Clarification".
  {
    id: "clarification_sent",
    type: "user",
    apply: (order) => {
      const questions = generateClarificationQuestions(order);
      const customerName = order.customer.name.split(" ")[0];

      const body = questions.length > 0
        ? `Hi ${customerName},\n\nThank you for your RFQ (${order.orderNumber}). We need a few clarifications before we can prepare your quote:\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nBest regards,\nHexa Sales Team`
        : `Hi ${customerName},\n\nThank you for your RFQ (${order.orderNumber}). We're reviewing it now.\n\nBest regards,\nHexa Sales Team`;

      return {
        ...order,
        stage: "clarification_requested",
        demoFlow: {
          ...order.demoFlow!,
          stage: "rfq_received",
          clarifications: [
            {
              questions,
              emailSent: {
                to: order.customer.email,
                subject: `${order.orderNumber} — Clarification needed for ${questions.length} items`,
                body,
                sentAt: now(),
              },
            },
          ],
        },
      };
    },
  },

  // Step 1: clarification reply arrives + auto-generates draft quote (auto 5s)
  {
    id: "clarification_reply",
    type: "auto",
    delayMs: 5000,
    apply: (order) => {
      const clarifications = [...(order.demoFlow!.clarifications ?? [])];
      const unresolvedItems = order.lineItems.filter(
        (i) => i.matchStatus !== "confirmed"
      );

      const parsedAnswers = unresolvedItems.map((item) => {
        if (item.matchedCatalogItems.length > 0) {
          const match = item.matchedCatalogItems[0];
          return `${item.parsedProductName} confirmed as ${match.catalogName} (${match.catalogSku})`;
        }
        return `${item.parsedProductName}: specs confirmed, ready for custom quoting`;
      });
      if (order.parseMissingFields && order.parseMissingFields.length > 0) {
        parsedAnswers.push("Due date and pricing expectations confirmed");
      }

      if (clarifications.length > 0) {
        const customerName = order.customer.name.split(" ")[0];
        clarifications[0] = {
          ...clarifications[0],
          replyReceived: {
            body: `Hi,\n\nHere are the clarifications you requested:\n\n${parsedAnswers.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nThanks,\n${customerName}`,
            receivedAt: now(),
            parsedAnswers,
          },
        };
      }

      const lineItems = order.lineItems.map((item) => {
        if (item.matchStatus === "confirmed") return item;
        const match = item.matchedCatalogItems[0];
        if (match) {
          return {
            ...item,
            parsedSku: match.catalogSku,
            parsedProductName: match.catalogName,
            parsedUnitPrice: match.catalogPrice,
            matchStatus: "confirmed" as const,
            confidence: 92,
            matchedCatalogItems: [match],
            issues: [],
          };
        }
        const fallbackPrice = item.parsedUnitPrice ?? 25.0;
        return {
          ...item,
          parsedUnitPrice: fallbackPrice,
          matchStatus: "confirmed" as const,
          confidence: 85,
          matchedCatalogItems: [
            {
              catalogSku: `CUSTOM-${item.lineNumber}`,
              catalogName: item.parsedProductName,
              catalogDescription: `Custom item — ${item.parsedProductName}`,
              catalogPrice: fallbackPrice,
              catalogUom: item.parsedUom || "unit",
            },
          ],
          issues: [],
        };
      });

      const quoteNumber = deriveQuoteNumber(order);
      const quoteItems = lineItems.map((li) => ({
        sku: li.parsedSku ?? "CUSTOM",
        name: li.parsedProductName,
        qty: li.parsedQuantity,
        unitPrice: li.parsedUnitPrice ?? 0,
      }));
      const subtotal = quoteItems.reduce(
        (s, i) => s + i.qty * i.unitPrice,
        0
      );

      return {
        ...order,
        stage: "quote_sent",
        dueDate: order.dueDate || "2026-04-20",
        lineItems,
        parseMissingFields: [],
        demoFlow: {
          ...order.demoFlow!,
          stage: "quote_prepared",
          quoteNumber,
          clarifications,
          quoteSummary: {
            quoteNumber,
            items: quoteItems,
            subtotal,
            sentAt: "",
            sentTo: order.customer.email,
          },
        },
      };
    },
  },

  // Step 2: User reviews/edits the draft quote and clicks "Send Quote"
  {
    id: "quote_sent",
    type: "user",
    apply: (order) => ({
      ...order,
      stage: "quote_sent",
      demoFlow: {
        ...order.demoFlow!,
        quoteSummary: order.demoFlow!.quoteSummary
          ? { ...order.demoFlow!.quoteSummary, sentAt: now() }
          : undefined,
      },
    }),
  },

  // Step 3: PO arrives with mismatches (auto 2s)
  {
    id: "po_received_mismatch",
    type: "auto",
    delayMs: 2000,
    apply: (order) => {
      const quoteNumber =
        order.demoFlow!.quoteNumber ?? deriveQuoteNumber(order);
      const poNumber = derivePoNumber(order);
      const items = order.lineItems;
      const checks: Array<{
        field: ComparisonField;
        matches: boolean;
        quoteValue: string;
        incomingValue: string;
        note?: string;
      }> = [];

      if (items.length >= 1) {
        const item = items[0];
        const label = item.parsedSku ?? item.parsedProductName;
        const newQty = item.parsedQuantity + 50;
        checks.push({
          field: "quantity",
          matches: false,
          quoteValue: `${label} = ${item.parsedQuantity}`,
          incomingValue: `${label} = ${newQty}`,
          note: `Quantity increased from ${item.parsedQuantity} to ${newQty}`,
        });
      }
      if (items.length >= 2) {
        const item = items[1];
        const label = item.parsedSku ?? item.parsedProductName;
        const quotedPrice = item.parsedUnitPrice ?? 10;
        const poPrice = +(quotedPrice * 0.89).toFixed(2);
        checks.push({
          field: "price",
          matches: false,
          quoteValue: `${label} = $${quotedPrice.toFixed(2)}`,
          incomingValue: `${label} = $${poPrice.toFixed(2)}`,
          note: "Customer expects lower unit price",
        });
      }
      checks.push(
        {
          field: "dueDate",
          matches: true,
          quoteValue: order.dueDate || "2026-04-20",
          incomingValue: order.dueDate || "2026-04-20",
        },
        {
          field: "drawingRev",
          matches: true,
          quoteValue: "All revisions matched",
          incomingValue: "All revisions matched",
        }
      );

      const mismatchLines = checks
        .filter((c) => !c.matches)
        .map(
          (c) =>
            `- ${c.field === "quantity" ? "Quantity" : "Price"}: ${c.incomingValue} on PO vs ${c.quoteValue} quoted`
        )
        .join("\n");

      const customerName = order.customer.name.split(" ")[0];

      return {
        ...order,
        stage: "po_mismatch",
        poNumber,
        paymentTerms: order.paymentTerms || "Net 30",
        shipVia: order.shipVia || "FedEx Economy",
        demoFlow: {
          ...order.demoFlow!,
          stage: "po_received",
          poNumber,
          poConfirmation: {
            poNumber,
            receivedAt: now(),
            matchesQuote: false,
          },
          quoteComparison: {
            overallMatch: false,
            checks,
          },
          correctionDraftEmail: {
            to: order.customer.email,
            subject: `${poNumber} needs correction to match Quote ${quoteNumber}`,
            body: `Hi ${customerName},\n\nThanks for sending ${poNumber}. We detected differences against Quote ${quoteNumber}:\n\n${mismatchLines}\n\nPlease send a corrected PO or confirm you'd like us to requote these lines.\n\nBest,\nHexa Sales Ops`,
          },
        },
      };
    },
  },

  // Step 4: User sends correction email
  {
    id: "correction_sent",
    type: "user",
    apply: (order) => order,
  },

  // Step 5: Corrected PO arrives — all matches (auto 2s)
  {
    id: "po_received_match",
    type: "auto",
    delayMs: 2000,
    apply: (order) => {
      const revisedPoNumber =
        (order.demoFlow?.poNumber ?? order.poNumber ?? "PO") + "-R1";
      return {
        ...order,
        stage: "po_received",
        demoFlow: {
          ...order.demoFlow!,
          stage: "po_validated",
          poConfirmation: {
            poNumber: revisedPoNumber,
            receivedAt: now(),
            matchesQuote: true,
          },
          quoteComparison: {
            overallMatch: true,
            checks: [
              {
                field: "price" as ComparisonField,
                matches: true,
                quoteValue: "All lines matched quoted prices",
                incomingValue: "All lines matched quoted prices",
              },
              {
                field: "quantity" as ComparisonField,
                matches: true,
                quoteValue: "All line quantities unchanged",
                incomingValue: "All line quantities unchanged",
              },
              {
                field: "dueDate" as ComparisonField,
                matches: true,
                quoteValue: "Due dates aligned with quote",
                incomingValue: "Due dates aligned with quote",
              },
              {
                field: "drawingRev" as ComparisonField,
                matches: true,
                quoteValue: "All lines at approved revisions",
                incomingValue: "All lines at approved revisions",
              },
            ],
          },
          correctionDraftEmail: undefined,
        },
      };
    },
  },

  // Step 6: User approves and pushes to MRP
  {
    id: "pushed_to_mrp",
    type: "user",
    apply: (order) => {
      const pushedAt = now();
      const erpOrderId = deriveErpId(order);
      return {
        ...order,
        stage: "pushed_to_mrp",
        mrpRoutedAt: pushedAt,
        demoFlow: {
          ...order.demoFlow!,
          mrpPush: {
            pushedAt,
            erpOrderId,
          },
          erpSync: {
            state: "acknowledged" as const,
            timeline: [
              {
                label: "PO parsed and validated",
                state: "queued" as const,
                at: new Date(Date.now() - 4000).toISOString(),
              },
              {
                label: "Order sent to ERP system",
                state: "sent" as const,
                at: new Date(Date.now() - 2000).toISOString(),
              },
              {
                label: "ERP order acknowledged",
                state: "acknowledged" as const,
                at: pushedAt,
              },
            ],
          },
        },
      };
    },
  },

  // Step 7: In Production — order enters manufacturing (auto 2s)
  {
    id: "shipping_in_production",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      stage: "shipped",
      shipmentSummary: {
        shipmentId: `shp-${order.id.slice(-8)}`,
        status: "shipment_created",
        carrier: "fedex",
        trackingNumber: "794644790188",
        estimatedDelivery: "2026-04-18",
        latestEventAt: now(),
      },
    }),
  },

  // Step 8: Ready for Shipping Collection — production complete, staged for pickup (auto 2s)
  {
    id: "shipping_ready_for_collection",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      shipmentSummary: order.shipmentSummary
        ? { ...order.shipmentSummary, status: "label_created", latestEventAt: now() }
        : undefined,
    }),
  },

  // Step 9: Carrier Pickup Confirmed (auto 2s)
  {
    id: "shipping_pickup",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      shipmentSummary: order.shipmentSummary
        ? { ...order.shipmentSummary, status: "picked_up", latestEventAt: now() }
        : undefined,
    }),
  },

  // Step 10: In Transit (auto 2s)
  {
    id: "shipping_in_transit",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      shipmentSummary: order.shipmentSummary
        ? { ...order.shipmentSummary, status: "in_transit", latestEventAt: now() }
        : undefined,
    }),
  },

  // Step 11: Out for Delivery (auto 2s)
  {
    id: "shipping_out_for_delivery",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      shipmentSummary: order.shipmentSummary
        ? { ...order.shipmentSummary, status: "out_for_delivery", latestEventAt: now() }
        : undefined,
    }),
  },

  // Step 12: Delivered — all substeps complete (auto 2s)
  {
    id: "shipping_delivered",
    type: "auto",
    delayMs: 2000,
    apply: (order) => ({
      ...order,
      stage: "delivered",
      shipmentSummary: order.shipmentSummary
        ? {
            ...order.shipmentSummary,
            status: "delivered",
            latestEventAt: now(),
          }
        : undefined,
    }),
  },
];

export function isDemoEligible(order: Order): boolean {
  return order.stage === "rfq_received" && !!order.demoFlow?.scenario;
}
