// ─── Types ───────────────────────────────────────────────────────────────────

export type TicketPriority = "low" | "medium" | "high";

export type TicketStatus =
  | "auto_resolved"
  | "awaiting_approval"
  | "escalated"
  | "in_progress"
  | "resolved";

export type TicketCategory =
  | "order_status"
  | "technical"
  | "warranty"
  | "returns"
  | "pricing"
  | "shipping";

export type TicketChannel = "email" | "phone" | "web_form" | "portal";

export type CustomerSentiment = "positive" | "neutral" | "frustrated" | "urgent";

export type FollowUpStatus = "suggested" | "queued" | "done" | "skipped";

export type FollowUpTeam =
  | "Production"
  | "Logistics"
  | "Engineering"
  | "Procurement"
  | "Account Manager"
  | "Warehouse"
  | "Finance"
  | "QC";

export interface FollowUpAction {
  id: string;
  team: FollowUpTeam;
  action: string;
  why: string;
  status: FollowUpStatus;
  link?: string;
}

export interface AiClassification {
  category: TicketCategory;
  confidence: number;
  alternatives: { category: TicketCategory; confidence: number }[];
  reasoning: string;
}

export interface ChannelRef {
  callId?: string;
  formId?: string;
  portalRef?: string;
}

export interface DataSourceUsed {
  module: string;
  summary: string;
  link?: string;
}

export interface AssignedTo {
  name: string;
  role: string;
  initials: string;
}

export interface CustomerStats {
  lifetimeSpend?: string;
  ordersLast12mo?: number;
  openOrders?: number;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customer: {
    name: string;
    email: string;
    company: string;
    phone?: string;
  };
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  channel: TicketChannel;
  channelRef?: ChannelRef;
  classification: AiClassification;
  customerSentiment: CustomerSentiment;
  customerStats?: CustomerStats;
  subject: string;
  customerMessage: string;
  // Sent reply (only present for auto_resolved or resolved by human)
  sentResponse: string | null;
  // Editable AI draft (present for awaiting_approval)
  draftResponse: string | null;
  draftConfidence: number | null;
  escalationReason: string | null;
  aiContextSummary: string[] | null;
  assignedTo: AssignedTo | null;
  followUpActions: FollowUpAction[];
  dataSources: DataSourceUsed[];
  responseTimeSec: number | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  icon: string;
  count: number | null;
  countLabel: string;
  items: string[];
}

// ─── Knowledge Base ──────────────────────────────────────────────────────────

export const knowledgeSources: KnowledgeSource[] = [
  {
    id: "sops",
    name: "SOPs",
    icon: "BookOpen",
    count: 24,
    countLabel: "24 loaded",
    items: [
      "Returns & RMA Process",
      "Warranty Claim Handling",
      "Escalation Procedures",
      "Order Change Policy",
    ],
  },
  {
    id: "product-specs",
    name: "Product Specs",
    icon: "Settings",
    count: 156,
    countLabel: "156 loaded",
    items: [
      "GVS300 Sensor Spec Sheet",
      "CM-500 Wiring Diagrams",
      "Hydraulic Pump Tech Manual",
      "Brazing Alloy Data Sheets",
    ],
  },
  {
    id: "order-shipping",
    name: "Order & Shipping",
    icon: "Package",
    count: null,
    countLabel: "Live",
    items: [
      "Real-time order status",
      "Production stage tracking",
      "Shipment & tracking data",
      "Quote & pricing history",
    ],
  },
  {
    id: "customer-history",
    name: "Customer History",
    icon: "Users",
    count: 842,
    countLabel: "842 loaded",
    items: [
      "Past support tickets",
      "Purchase history",
      "Contact preferences",
      "Account notes & flags",
    ],
  },
];

export const knowledgeBaseStats = {
  totalAutoResolved: 78,
  avgResponseTimeSec: 42,
  totalTicketsProcessed: 164,
};

// ─── Labels ──────────────────────────────────────────────────────────────────

export const categoryLabels: Record<TicketCategory, string> = {
  order_status: "Order Status",
  technical: "Technical",
  warranty: "Warranty",
  returns: "Returns",
  pricing: "Pricing",
  shipping: "Shipping",
};

export const priorityLabels: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const statusLabels: Record<TicketStatus, string> = {
  auto_resolved: "Auto-Resolved",
  awaiting_approval: "Awaiting Approval",
  escalated: "Escalated",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const channelLabels: Record<TicketChannel, string> = {
  email: "Email",
  phone: "Phone",
  web_form: "Web Form",
  portal: "Portal",
};

export const sentimentLabels: Record<CustomerSentiment, string> = {
  positive: "Positive",
  neutral: "Neutral",
  frustrated: "Frustrated",
  urgent: "Urgent",
};

// ─── Mock Tickets ────────────────────────────────────────────────────────────

export const supportTickets: SupportTicket[] = [
  // ── Auto-Resolved (high confidence ≥ 0.9) ─────────────────────────────────
  {
    id: "tkt-001",
    ticketNumber: "TKT-2026-0142",
    customer: {
      name: "John Smith",
      email: "jsmith@acmemfg.com",
      company: "Acme Manufacturing",
    },
    priority: "medium",
    status: "auto_resolved",
    category: "order_status",
    channel: "email",
    classification: {
      category: "order_status",
      confidence: 0.96,
      alternatives: [
        { category: "shipping", confidence: 0.18 },
      ],
      reasoning: "Direct PO reference and explicit delivery-date question.",
    },
    customerSentiment: "neutral",
    customerStats: {
      lifetimeSpend: "$142K",
      ordersLast12mo: 18,
      openOrders: 2,
      notes: "Net-30 customer, on-time payer.",
    },
    subject: "Update on PO-2026-3847 delivery status",
    customerMessage:
      "Hi, I need an update on PO-2026-3847. We placed this order 3 weeks ago for 50 units of the GVS300 Sensor. When can we expect delivery? Our production line needs these by March 20.",
    sentResponse:
      "Hi John,\n\nI checked on PO-2026-3847 for 50x GVS300 Sensors. Here's the current status:\n\n- Production: Complete (finished Mar 4)\n- QC Inspection: Passed\n- Shipping: Dispatched via FedEx Freight\n- Tracking: 7489-2156-3847\n- ETA: March 12\n\nYou're on track to receive well before your March 20 deadline. Let me know if you need anything else!",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Orders", summary: "PO-2026-3847 — 50x GVS300, status: Shipped", link: "/orders" },
      { module: "Production", summary: "Job complete Mar 4, QC passed", link: "/procurement" },
      { module: "Logistics", summary: "FedEx Freight #7489-2156-3847, ETA Mar 12" },
    ],
    responseTimeSec: 47,
    createdAt: "2026-03-08T09:15:00Z",
    resolvedAt: "2026-03-08T09:16:00Z",
  },
  {
    id: "tkt-002",
    ticketNumber: "TKT-2026-0143",
    customer: {
      name: "Sarah Chen",
      email: "s.chen@acmeindustrial.com",
      company: "Acme Industrial",
      phone: "+1 (415) 555-0142",
    },
    priority: "low",
    status: "auto_resolved",
    category: "pricing",
    channel: "phone",
    channelRef: { callId: "call-2" },
    classification: {
      category: "pricing",
      confidence: 0.92,
      alternatives: [
        { category: "order_status", confidence: 0.21 },
      ],
      reasoning: "Caller requested pricing on multiple SKUs for restocking.",
    },
    customerSentiment: "positive",
    customerStats: {
      lifetimeSpend: "$96K",
      ordersLast12mo: 11,
      openOrders: 0,
      notes: "Restocking customer, predictable cadence.",
    },
    subject: "Restocking quote — bolts, tube, O-rings, cable glands",
    customerMessage:
      "Inbound call captured by Call Tracker. Customer requested pricing on 1,000x M10 hex bolts (Grade 8.8), 300m of 316 SS tube (25mm OD), 500x Viton O-rings (AS568-214), and 200x M20 nylon cable glands. Coventry delivery, March 20 deadline on bolts and O-rings, April 4 on tube.",
    sentResponse:
      "Hi Sarah,\n\nThanks for the call earlier — full quote attached as Q-2026-0061.\n\n- 1,000x M10 hex bolts (Grade 8.8): £0.52/unit — £520\n- 300m 316 SS tube 25mm OD/2mm wall (with mill certs): £18.75/m — £5,625\n- 500x Viton O-rings AS568-214: £0.34/unit — £170\n- 200x M20 nylon cable glands: £1.10/unit — £220\n\nTotal £6,535 ex-VAT. Coventry delivery, bolts/O-rings/glands by Mar 20, tube by Apr 4.\n\nReply or click the quote link to convert to PO.",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Call Tracker", summary: "Call #call-2 — full transcript captured", link: "/calls/call-2" },
      { module: "Product Catalog", summary: "All 4 SKUs in stock, standard pricing tier" },
      { module: "Customer History", summary: "Acme Industrial — restocking pattern, last order Q1" },
    ],
    responseTimeSec: 64,
    createdAt: "2026-03-11T14:08:00Z",
    resolvedAt: "2026-03-11T14:09:00Z",
  },
  {
    id: "tkt-003",
    ticketNumber: "TKT-2026-0145",
    customer: {
      name: "Elena Marsh",
      email: "elena.marsh@northfieldcomponents.com",
      company: "Northfield Components",
    },
    priority: "low",
    status: "auto_resolved",
    category: "pricing",
    channel: "email",
    classification: {
      category: "pricing",
      confidence: 0.94,
      alternatives: [
        { category: "order_status", confidence: 0.12 },
      ],
      reasoning: "Volume-tier pricing question on a known SKU within published schedule.",
    },
    customerSentiment: "positive",
    customerStats: {
      lifetimeSpend: "$28K",
      ordersLast12mo: 6,
      openOrders: 1,
    },
    subject: "Volume pricing for brass hinges — 5000+ units",
    customerMessage:
      "We're looking at increasing our order volume for brass hinges (BH-SM-500) to 5,000+ units per quarter. Can you provide updated volume pricing? Our current rate is $0.85 per unit.",
    sentResponse:
      "Hi Elena,\n\nGreat news on the volume increase! Based on our tiered pricing schedule for BH-SM-500 (Brass Hinge Small):\n\n- 500–2,499 units: $0.85/unit (your current rate)\n- 2,500–4,999 units: $0.78/unit\n- 5,000+ units: $0.72/unit\n\nAt 5,000 units/quarter, you'd save approximately $650 per order compared to your current rate.\n\nI've also attached our volume agreement template. Want me to have your account manager reach out to finalize terms?\n\nBest,\nHexa Support",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Product Catalog", summary: "BH-SM-500 — Brass Hinge Small, tiered pricing active" },
      { module: "Customer History", summary: "Northfield Components — current rate $0.85, 3 orders last 6mo" },
    ],
    responseTimeSec: 38,
    createdAt: "2026-03-15T08:45:00Z",
    resolvedAt: "2026-03-15T08:46:00Z",
  },
  {
    id: "tkt-004",
    ticketNumber: "TKT-2026-0148",
    customer: {
      name: "Marcus Rivera",
      email: "m.rivera@toplinehardware.com",
      company: "Topline Hardware LLC",
    },
    priority: "low",
    status: "auto_resolved",
    category: "shipping",
    channel: "web_form",
    channelRef: { formId: "form-2026-0148" },
    classification: {
      category: "shipping",
      confidence: 0.97,
      alternatives: [],
      reasoning: "Web form selected 'Shipping ETA' with order number prefilled.",
    },
    customerSentiment: "neutral",
    customerStats: {
      lifetimeSpend: "$54K",
      ordersLast12mo: 9,
      openOrders: 1,
    },
    subject: "ETA for ORD-2026-0045 — drawer slides and cabinet hardware",
    customerMessage:
      "Quick question — when is ORD-2026-0045 expected to arrive? We have a client installation scheduled for next week.",
    sentResponse:
      "Hi Marcus,\n\nORD-2026-0045 shipped on Feb 25, 2026 via FedEx Economy.\n\n- Tracking: 7834-9021-4456\n- Current status: In transit\n- Estimated delivery: Feb 28, 2026\n\nYou should be all set well ahead of your installation schedule. Let me know if you need a priority upgrade on the shipping.\n\nBest,\nHexa Support",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0045 — Cabinet hardware, status: Shipped", link: "/orders" },
      { module: "Logistics", summary: "FedEx Economy #7834-9021-4456, ETA Feb 28" },
    ],
    responseTimeSec: 28,
    createdAt: "2026-02-26T10:05:00Z",
    resolvedAt: "2026-02-26T10:06:00Z",
  },
  {
    id: "tkt-005",
    ticketNumber: "TKT-2026-0152",
    customer: {
      name: "David Liu",
      email: "d.liu@coastalhydraulics.com",
      company: "Coastal Hydraulics",
    },
    priority: "low",
    status: "auto_resolved",
    category: "pricing",
    channel: "email",
    classification: {
      category: "pricing",
      confidence: 0.95,
      alternatives: [
        { category: "order_status", confidence: 0.09 },
      ],
      reasoning: "Standard tier-pricing question against an in-stock SKU.",
    },
    customerSentiment: "neutral",
    customerStats: {
      lifetimeSpend: "$71K",
      ordersLast12mo: 14,
      openOrders: 0,
    },
    subject: "Current pricing for deep groove bearings — BB-6205",
    customerMessage:
      "We need updated pricing for BB-6205 (Deep Groove Bearing 6205-2RS). We're quoting a job that needs 200 units. What's your best price at that quantity?",
    sentResponse:
      "Hi David,\n\nHere's the current pricing for BB-6205 (Deep Groove Bearing 6205-2RS):\n\n- 1–99 units: $5.10/unit\n- 100–499 units: $4.80/unit\n- 500+ units: $4.55/unit\n\nAt 200 units, your rate would be $4.80/unit ($960 total).\n\nCurrent stock: 1,240 units — no lead time, ships within 24 hours.\n\nWant me to create a formal quote for your records?\n\nBest,\nHexa Support",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Product Catalog", summary: "BB-6205 — Deep Groove Bearing 6205-2RS, tiered pricing" },
      { module: "Inventory", summary: "BB-6205 — 1,240 in stock, ships within 24h" },
    ],
    responseTimeSec: 22,
    createdAt: "2026-03-20T09:30:00Z",
    resolvedAt: "2026-03-20T09:31:00Z",
  },

  // ── Awaiting Approval (medium confidence 0.7–0.9) ─────────────────────────
  {
    id: "tkt-006",
    ticketNumber: "TKT-2026-0146",
    customer: {
      name: "Raj Patel",
      email: "r.patel@thorntonsupplies.co.uk",
      company: "Thornton Supplies",
    },
    priority: "medium",
    status: "awaiting_approval",
    category: "order_status",
    channel: "email",
    classification: {
      category: "returns",
      confidence: 0.83,
      alternatives: [
        { category: "order_status", confidence: 0.41 },
        { category: "shipping", confidence: 0.22 },
      ],
      reasoning: "Customer reports a quantity short — leans Returns/RMA but could be a packing-slip discrepancy.",
    },
    customerSentiment: "neutral",
    customerStats: {
      lifetimeSpend: "£62K",
      ordersLast12mo: 12,
      openOrders: 1,
    },
    subject: "ORD-2026-0054 — missing 200 washers from delivery",
    customerMessage:
      "We received ORD-2026-0054 today but the M6 Zinc-Plated Flat Washers (WSH-M6-ZP) are short. We ordered 2,000 but only received 1,800. Can you look into this and ship the remaining 200?",
    sentResponse: null,
    draftResponse:
      "Hi Raj,\n\nThank you for flagging this. I've confirmed the discrepancy on ORD-2026-0054:\n\n- Ordered: 2,000x WSH-M6-ZP (M6 Zinc-Plated Flat Washer)\n- Shipped: 1,800 units (verified against packing slip)\n- Shortfall: 200 units\n\nI've raised a replacement shipment for the 200 missing washers. They're in stock and will ship today via your standard carrier. You should receive them within 2–3 business days.\n\nTracking will be emailed once dispatched.\n\nApologies for the inconvenience,\nHexa Support",
    draftConfidence: 0.83,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [
      {
        id: "fu-006-1",
        team: "Warehouse",
        action: "Verify packing slip vs. shipped count for ORD-2026-0054",
        why: "Slip shows 1,800; order is for 2,000 — confirm whether under-pick or short-pack.",
        status: "suggested",
        link: "/orders",
      },
      {
        id: "fu-006-2",
        team: "Logistics",
        action: "Create replacement shipment for 200x WSH-M6-ZP",
        why: "12,400 in stock — replacement available same-day.",
        status: "suggested",
      },
      {
        id: "fu-006-3",
        team: "QC",
        action: "Spot-check this week's M6 zinc washer batches",
        why: "Second short-pack flag this quarter on this SKU.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0054 — 2,000x WSH-M6-ZP, status: Delivered", link: "/orders" },
      { module: "Logistics", summary: "Packing slip confirmed 1,800 shipped, 200 short" },
      { module: "Inventory", summary: "WSH-M6-ZP — 12,400 in stock, replacement available" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-18T14:30:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-007",
    ticketNumber: "TKT-2026-0149",
    customer: {
      name: "Hannah Walsh",
      email: "h.walsh@vertexassembly.com",
      company: "Vertex Assembly Co.",
    },
    priority: "medium",
    status: "awaiting_approval",
    category: "pricing",
    channel: "email",
    classification: {
      category: "pricing",
      confidence: 0.78,
      alternatives: [
        { category: "order_status", confidence: 0.34 },
      ],
      reasoning: "Custom-rate request above the published 5K+ tier — needs Account Manager review on standing volume agreement.",
    },
    customerSentiment: "positive",
    customerStats: {
      lifetimeSpend: "$310K",
      ordersLast12mo: 22,
      openOrders: 3,
      notes: "Top-20 account, on a custom volume agreement.",
    },
    subject: "Custom pricing — 25,000 units/quarter on M8 hex nuts",
    customerMessage:
      "We're consolidating fastener spend and would like to lock in pricing for 25,000 units/quarter of HX-M8-ZP for the next 12 months. Current standing rate is $0.18/unit. What's your best multi-year rate at this volume?",
    sentResponse: null,
    draftResponse:
      "Hi Hannah,\n\nThank you for the consolidation opportunity. At 25,000 units/quarter (100K annual), here's what we can offer pending Account Manager sign-off:\n\n- Proposed rate: $0.155/unit (vs. $0.18 standing) — locked for 12 months\n- Annual savings vs. current: ~$2,500\n- Terms: Net-30, quarterly true-up, 30-day price-protect on raw zinc index\n\nI've flagged this for your Account Manager (Priya Shah) to review and confirm — you should hear back within one business day with the formal offer letter.\n\nBest,\nHexa Support",
    draftConfidence: 0.78,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [
      {
        id: "fu-007-1",
        team: "Account Manager",
        action: "Page Priya Shah for custom-rate sign-off",
        why: "Volume above 5K+ tier — discount > 10% requires AM approval per pricing SOP.",
        status: "suggested",
      },
      {
        id: "fu-007-2",
        team: "Procurement",
        action: "Confirm zinc raw-material hedge supports 12-month price-protect",
        why: "Multi-year rate with raw-material clause needs procurement to validate hedging.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-007-3",
        team: "Finance",
        action: "Run margin model at proposed $0.155/unit for sign-off",
        why: "Gross-margin floor for fasteners is 22%; proposed rate needs finance approval.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Product Catalog", summary: "HX-M8-ZP — M8 Zinc Hex Nut, current 5K+ tier $0.18" },
      { module: "Customer History", summary: "Vertex Assembly — $310K lifetime, custom volume agreement" },
      { module: "SOPs", summary: "Pricing SOP — custom rates >10% off published tier need AM approval" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-19T11:50:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-008",
    ticketNumber: "TKT-2026-0150",
    customer: {
      name: "Rachel Kim",
      email: "rachel.kim@meridianeng.com",
      company: "Meridian Engineering",
    },
    priority: "medium",
    status: "awaiting_approval",
    category: "returns",
    channel: "phone",
    channelRef: { callId: "call-1" },
    classification: {
      category: "returns",
      confidence: 0.86,
      alternatives: [
        { category: "warranty", confidence: 0.38 },
      ],
      reasoning: "Shipping damage on flange-cracked valves — RMA flow applies, but high-value RMA needs ops sign-off.",
    },
    customerSentiment: "frustrated",
    customerStats: {
      lifetimeSpend: "$208K",
      ordersLast12mo: 17,
      openOrders: 2,
      notes: "First RMA in 12 months on this account.",
    },
    subject: "RMA for damaged valve assemblies — ORD-2026-0060",
    customerMessage:
      "Inbound call captured by Call Tracker. Two of the valve assemblies from ORD-2026-0060 arrived with cracked flanges. Customer needs to return these and get replacements. The affected line items are the 3\" SS Gate Valves (line 1). Customer requested same-day RMA initiation.",
    sentResponse: null,
    draftResponse:
      "Hi Rachel,\n\nThanks for the call — confirming the RMA is being raised:\n\n- RMA Number: RMA-2026-0089\n- Order: ORD-2026-0060, Line 1 — 3\" SS Gate Valve Assembly\n- Qty affected: 2 of 4 units\n- Reason: Cracked flanges (shipping damage)\n\nNext steps:\n1. Prepaid return label will be emailed within the hour\n2. Once we receive the units, replacements ship same day\n3. Estimated replacement delivery: 5–7 business days\n\nPer our warranty SOP, shipping damage is fully covered. No cost to you.\n\nBest,\nHexa Support",
    draftConfidence: 0.86,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [
      {
        id: "fu-008-1",
        team: "Logistics",
        action: "File carrier damage claim against the original outbound shipment",
        why: "Cracked flanges suggest in-transit damage — claim must be filed within 14 days.",
        status: "suggested",
      },
      {
        id: "fu-008-2",
        team: "Warehouse",
        action: "Pull 2x SF-3-150 SS flanges and assemble replacement valves",
        why: "14 in stock; replacement valves can ship same day.",
        status: "suggested",
      },
      {
        id: "fu-008-3",
        team: "QC",
        action: "Inspect remaining stock from same batch for flange micro-cracks",
        why: "Possible batch issue; inspect before shipping the next 12 valves.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Call Tracker", summary: "Call #call-1 — full transcript captured", link: "/calls/call-1" },
      { module: "Orders", summary: "ORD-2026-0060 — Pump station assembly + valves, BOM Review stage", link: "/orders" },
      { module: "SOPs", summary: "Returns & RMA Process — shipping damage, full replacement" },
      { module: "Inventory", summary: "SF-3-150 (SS Flange 3\") — 14 in stock" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-28T16:10:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-009",
    ticketNumber: "TKT-2026-0156",
    customer: {
      name: "Lisa Park",
      email: "l.park@summitfab.com",
      company: "Summit Fabrication",
    },
    priority: "medium",
    status: "awaiting_approval",
    category: "returns",
    channel: "web_form",
    channelRef: { formId: "form-2026-0156" },
    classification: {
      category: "returns",
      confidence: 0.74,
      alternatives: [
        { category: "shipping", confidence: 0.46 },
        { category: "order_status", confidence: 0.19 },
      ],
      reasoning: "Wrong-SKU shipped — Returns SOP applies, but cross-functional pick/pack root-cause needed.",
    },
    customerSentiment: "frustrated",
    customerStats: {
      lifetimeSpend: "$48K",
      ordersLast12mo: 8,
      openOrders: 1,
    },
    subject: "Return request — wrong gasket kit shipped",
    customerMessage:
      "We received gasket kits from our last order but they're the wrong size. We ordered GK-FL-3 (3\" Flange Gasket Kit) but received GK-FL-2 (2\" kits) instead. Need to arrange a return and get the correct ones shipped ASAP.",
    sentResponse: null,
    draftResponse:
      "Hi Lisa,\n\nApologies — we shipped the wrong SKU. Pulling this together now:\n\n- Wrong shipped: GK-FL-2 (2\" Flange Gasket Kit)\n- Correct SKU: GK-FL-3 (3\" Flange Gasket Kit)\n- RMA: RMA-2026-0093 (return label emailing now)\n- Replacement: Shipping today, expedited to make up for the delay — no cost to you\n\nI've also flagged this with our warehouse team to root-cause the pick error.\n\nBest,\nHexa Support",
    draftConfidence: 0.74,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [
      {
        id: "fu-009-1",
        team: "Warehouse",
        action: "Root-cause pick error: GK-FL-2 vs GK-FL-3 bin proximity",
        why: "Bins are adjacent (A-12-3 / A-12-4) — possible bin labelling confusion.",
        status: "suggested",
      },
      {
        id: "fu-009-2",
        team: "Logistics",
        action: "Expedite GK-FL-3 replacement at Hexa cost",
        why: "Customer's 'ASAP' note — sentiment frustrated, expedite to preserve relationship.",
        status: "suggested",
      },
      {
        id: "fu-009-3",
        team: "Account Manager",
        action: "Goodwill credit on next order ($25)",
        why: "Standard SOP for pick errors causing customer delay.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Inventory", summary: "GK-FL-3 — 38 in stock; GK-FL-2 — 124 in stock (adjacent bins)" },
      { module: "SOPs", summary: "Returns SOP — wrong-SKU expedite at Hexa cost; goodwill threshold $25" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-29T15:40:00Z",
    resolvedAt: null,
  },

  // ── Escalated (low confidence < 0.7) ──────────────────────────────────────
  {
    id: "tkt-010",
    ticketNumber: "TKT-2026-0139",
    customer: {
      name: "Sarah Chen",
      email: "s.chen@precisionparts.com",
      company: "Precision Parts Inc.",
    },
    priority: "high",
    status: "escalated",
    category: "technical",
    channel: "email",
    classification: {
      category: "technical",
      confidence: 0.42,
      alternatives: [
        { category: "warranty", confidence: 0.38 },
        { category: "returns", confidence: 0.21 },
      ],
      reasoning: "Tensile-test discrepancy on a custom alloy batch — outside SOP coverage; engineering call required.",
    },
    customerSentiment: "urgent",
    customerStats: {
      lifetimeSpend: "$184K",
      ordersLast12mo: 12,
      openOrders: 1,
      notes: "First quality issue in 24 months on this account.",
    },
    subject: "Custom brazing alloy not meeting tensile spec — requesting engineering review",
    customerMessage:
      "Custom brazing alloy not meeting tensile spec — requesting engineering review. Our QC found that batch #B2026-0891 of the BAg-24 custom alloy is testing at 82% of the specified tensile strength. We need an engineering review and potential replacement batch.",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason:
      "Technical issue outside SOP — customer reports tensile strength at 82% of spec on BAg-24 custom alloy batch #B2026-0891.",
    aiContextSummary: [
      "Customer ran tensile tests on batch #B2026-0891, results 18% below spec",
      "Checked against QC records — batch passed internal inspection at 97% spec",
      "Possible testing methodology difference or environmental factor",
      "Customer requesting engineering review and potential replacement batch",
    ],
    assignedTo: {
      name: "Mike Rodriguez",
      role: "Engineering Manager",
      initials: "MR",
    },
    followUpActions: [
      {
        id: "fu-010-1",
        team: "Engineering",
        action: "Schedule joint tensile test with customer's QC lab",
        why: "Discrepancy between Hexa QC (97%) and customer (82%) suggests methodology delta.",
        status: "suggested",
      },
      {
        id: "fu-010-2",
        team: "QC",
        action: "Pull retain sample for batch #B2026-0891, re-run tensile per ASTM E8",
        why: "Validate the original 97% pass; rule out post-production change.",
        status: "suggested",
      },
      {
        id: "fu-010-3",
        team: "Production",
        action: "Quarantine remaining stock from batch #B2026-0891",
        why: "Prevent further customer exposure pending engineering verdict.",
        status: "suggested",
      },
      {
        id: "fu-010-4",
        team: "Account Manager",
        action: "Reach out to Precision Parts CTO directly",
        why: "$184K account, first quality issue — preserve relationship.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Product Specs", summary: "BAg-24 alloy — tensile spec 450 MPa, batch QC: 97%" },
      { module: "Production", summary: "Batch #B2026-0891 — produced Feb 14, QC passed Feb 15" },
      { module: "Customer History", summary: "Precision Parts — 12 orders in 24mo, first quality issue" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-06T13:45:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-011",
    ticketNumber: "TKT-2026-0151",
    customer: {
      name: "James Whitfield",
      email: "james.whitfield@acmedist.com",
      company: "Acme Distributors Inc.",
    },
    priority: "high",
    status: "escalated",
    category: "warranty",
    channel: "email",
    classification: {
      category: "warranty",
      confidence: 0.55,
      alternatives: [
        { category: "technical", confidence: 0.39 },
        { category: "returns", confidence: 0.18 },
      ],
      reasoning: "Warranty replacement is in policy, but downtime-compensation request needs Sales Manager approval.",
    },
    customerSentiment: "frustrated",
    customerStats: {
      lifetimeSpend: "$84K",
      ordersLast12mo: 14,
      openOrders: 2,
      notes: "Priority account — track responsiveness.",
    },
    subject: "Hydraulic pump failure after 3 weeks — warranty claim",
    customerMessage:
      "One of the hydraulic pumps from our recent order (ORD-2026-0051) has failed after only 3 weeks of operation. The bearing assembly seized, causing the shaft seal to blow out. Our maintenance team says this is a manufacturing defect. We need a warranty replacement and compensation for our production downtime.",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason:
      "Warranty claim involving suspected manufacturing defect on hydraulic pump — customer reporting premature bearing failure and requesting production downtime compensation, which requires management approval per SOP.",
    aiContextSummary: [
      "Hydraulic pump from ORD-2026-0051 — delivered Feb 28, failure reported after 21 days",
      "Customer describes bearing seizure leading to shaft seal failure",
      "Warranty SOP covers parts replacement within 90 days, but downtime compensation requires Sales Manager approval",
      "Cross-referenced with other pump orders — no similar failures in last 6 months",
      "Customer account: Acme Distributors, 14 orders in 12mo, $84K annual spend",
    ],
    assignedTo: {
      name: "James Morrison",
      role: "Sales Manager",
      initials: "JM",
    },
    followUpActions: [
      {
        id: "fu-011-1",
        team: "Engineering",
        action: "Request failed pump return for teardown analysis",
        why: "Confirm root cause before approving downtime compensation.",
        status: "suggested",
      },
      {
        id: "fu-011-2",
        team: "Account Manager",
        action: "Draft downtime-compensation offer for Sales Manager approval",
        why: "Outside SOP — needs JM sign-off before customer-facing offer.",
        status: "suggested",
      },
      {
        id: "fu-011-3",
        team: "Procurement",
        action: "Check pump supplier batch records for ORD-2026-0051",
        why: "Identify if batch-wide issue or one-off defect.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-011-4",
        team: "Logistics",
        action: "Expedite warranty replacement pump",
        why: "Customer in production downtime — minimize claim exposure.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0051 — Hydraulic fittings & seals, Clarification Requested", link: "/orders" },
      { module: "SOPs", summary: "Warranty Claim Handling — 90-day coverage, downtime claims need approval" },
      { module: "Customer History", summary: "Acme Distributors — $84K annual, 14 orders, priority account" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-21T08:15:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-012",
    ticketNumber: "TKT-2026-0153",
    customer: {
      name: "Emily Watson",
      email: "e.watson@bartonlogistics.co.uk",
      company: "Barton Logistics",
    },
    priority: "high",
    status: "escalated",
    category: "order_status",
    channel: "email",
    classification: {
      category: "order_status",
      confidence: 0.61,
      alternatives: [
        { category: "shipping", confidence: 0.55 },
      ],
      reasoning: "Order at risk of contractual deadline — needs ops to expedite production scheduling.",
    },
    customerSentiment: "urgent",
    customerStats: {
      lifetimeSpend: "£44K",
      ordersLast12mo: 6,
      openOrders: 1,
      notes: "UK-based, hard delivery windows on construction projects.",
    },
    subject: "Urgent — ORD-2026-0055 stuck in production, client deadline at risk",
    customerMessage:
      "Our order ORD-2026-0055 was supposed to ship last week but we haven't received any update. This is a large structural steel order for a construction project with a hard deadline of April 1st. If we miss this delivery, we face liquidated damages. Please escalate immediately.",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason:
      "High-value order at risk of missing contractual deadline — customer reports potential liquidated damages. Order contains custom steel fabrication with extended lead times.",
    aiContextSummary: [
      "ORD-2026-0055 — 8-line structural steel/fastener order, value ~$5,200",
      "Order stage: Quote Sent (not yet in production), customer expected it to be further along",
      "Customer's hard deadline: April 1 — 10 days from now",
      "Lead time for STL-ANG-50x50x5 and STL-SHS-40x40x3 typically 7–10 business days",
      "Customer mentions liquidated damages risk — requires priority handling",
    ],
    assignedTo: {
      name: "Sarah Mitchell",
      role: "Operations Lead",
      initials: "SM",
    },
    followUpActions: [
      {
        id: "fu-012-1",
        team: "Production",
        action: "Insert ORD-2026-0055 into expedited production queue",
        why: "Quote not yet in production; lead time of 7–10 days makes Apr 1 tight.",
        status: "suggested",
      },
      {
        id: "fu-012-2",
        team: "Procurement",
        action: "Verify STL-ANG-50x50x5 and STL-SHS-40x40x3 raw stock availability",
        why: "Custom-cut steel — confirm raw lengths are on-hand before scheduling.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-012-3",
        team: "Logistics",
        action: "Pre-book expedited UK freight slot",
        why: "UK delivery on Apr 1 — secure carrier capacity now.",
        status: "suggested",
      },
      {
        id: "fu-012-4",
        team: "Account Manager",
        action: "Call Emily Watson with revised timeline + LD coverage offer",
        why: "Liquidated damages mentioned — preempt with concrete plan.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0055 — Structural steel + fasteners, Quote Sent stage", link: "/orders" },
      { module: "Production", summary: "Not yet scheduled — needs expedited queue entry" },
      { module: "Customer History", summary: "Barton Logistics — 6 orders in 12mo, UK-based" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-22T07:00:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-013",
    ticketNumber: "TKT-2026-0155",
    customer: {
      name: "Marcus O'Brien",
      email: "m.obrien@greenfieldparts.co.uk",
      company: "Greenfield Parts Co.",
    },
    priority: "medium",
    status: "escalated",
    category: "technical",
    channel: "portal",
    channelRef: { portalRef: "PORTAL-CASE-2026-0118" },
    classification: {
      category: "technical",
      confidence: 0.48,
      alternatives: [
        { category: "warranty", confidence: 0.36 },
        { category: "returns", confidence: 0.22 },
      ],
      reasoning: "Possible supplier-formulation regression — needs supplier liaison and recall assessment.",
    },
    customerSentiment: "frustrated",
    customerStats: {
      lifetimeSpend: "£38K",
      ordersLast12mo: 7,
      openOrders: 1,
    },
    subject: "Cutting fluid concentrate causing corrosion on CNC tooling",
    customerMessage:
      "We've been using the Cutting Fluid Concentrate (FLD-CUT-CONC) from order ORD-2026-0056, and it's causing visible corrosion on our carbide end mills after 48 hours. This has never happened with the previous formulation. Has the supplier changed the formula? We need a technical review urgently.",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason:
      "Technical product issue — customer reports formulation change causing corrosion on carbide tooling. Requires supplier liaison and potentially a product recall assessment.",
    aiContextSummary: [
      "FLD-CUT-CONC from ORD-2026-0056 — ordered 20 units, delivered Mar 10",
      "Customer reports corrosion on carbide end mills within 48 hours of use",
      "Product spec sheet indicates compatible with carbide, HSS, and ceramic tooling",
      "Checked recent supplier batches — new formulation received Jan 2026 from primary supplier",
      "No other corrosion complaints yet, but limited shipments of new batch so far",
    ],
    assignedTo: {
      name: "Mike Rodriguez",
      role: "Engineering Manager",
      initials: "MR",
    },
    followUpActions: [
      {
        id: "fu-013-1",
        team: "Procurement",
        action: "Open ChemTech case for Jan-2026 reformulation",
        why: "New formulation batch — confirm if pH or inhibitor package changed.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-013-2",
        team: "Engineering",
        action: "Run carbide compatibility test on new batch",
        why: "Validate the spec-sheet claim against the new supplier formulation.",
        status: "suggested",
      },
      {
        id: "fu-013-3",
        team: "QC",
        action: "Quarantine remaining FLD-CUT-CONC inventory",
        why: "Prevent further customer shipments until formulation is verified.",
        status: "suggested",
      },
      {
        id: "fu-013-4",
        team: "Account Manager",
        action: "Notify all customers who received the Jan-2026 batch",
        why: "If recall is required, prepare proactive customer outreach list.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Product Specs", summary: "FLD-CUT-CONC — Cutting Fluid Concentrate, carbide-safe rated" },
      { module: "Orders", summary: "ORD-2026-0056 — 20x FLD-CUT-CONC, delivered Mar 10", link: "/orders" },
      { module: "Supplier Records", summary: "New formulation batch received Jan 2026, supplier: ChemTech" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-25T11:20:00Z",
    resolvedAt: null,
  },

  // ── In Progress (human-driven) ────────────────────────────────────────────
  {
    id: "tkt-014",
    ticketNumber: "TKT-2026-0157",
    customer: {
      name: "Kevin Brooks",
      email: "k.brooks@deltamanufacturing.com",
      company: "Delta Manufacturing",
    },
    priority: "low",
    status: "in_progress",
    category: "order_status",
    channel: "email",
    classification: {
      category: "order_status",
      confidence: 0.85,
      alternatives: [
        { category: "pricing", confidence: 0.31 },
      ],
      reasoning: "Quote-status follow-up — answer depends on Sales workflow, not auto-resolvable.",
    },
    customerSentiment: "neutral",
    customerStats: {
      lifetimeSpend: "$76K",
      ordersLast12mo: 9,
      openOrders: 0,
    },
    subject: "When will Q-2026-0049 quote be ready?",
    customerMessage:
      "Hi, just checking in on the quote we requested (Q-2026-0049). We submitted the RFQ last week for shaft collars, bearings, and gasket packs. When can we expect the formal quote? We'd like to place the PO this week if possible.",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: {
      name: "James Morrison",
      role: "Sales Manager",
      initials: "JM",
    },
    followUpActions: [
      {
        id: "fu-014-1",
        team: "Account Manager",
        action: "Push Q-2026-0049 through sales review",
        why: "Customer ready to place PO — don't lose the order on internal lag.",
        status: "queued",
      },
    ],
    dataSources: [
      { module: "Orders", summary: "Q-2026-0049 — RFQ Received stage, awaiting pricing", link: "/orders" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-30T09:15:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-015",
    ticketNumber: "TKT-2026-0158",
    customer: {
      name: "Amanda Foster",
      email: "a.foster@precisiontools.com",
      company: "Precision Tools Inc.",
    },
    priority: "medium",
    status: "in_progress",
    category: "warranty",
    channel: "email",
    classification: {
      category: "warranty",
      confidence: 0.68,
      alternatives: [
        { category: "technical", confidence: 0.42 },
      ],
      reasoning: "Premature degradation claim — needs investigation before warranty disposition.",
    },
    customerSentiment: "frustrated",
    customerStats: {
      lifetimeSpend: "$92K",
      ordersLast12mo: 11,
      openOrders: 1,
    },
    subject: "Anti-vibration mounts degrading prematurely",
    customerMessage:
      "We purchased 200 Rubber Anti-Vibration Mounts (MNT-AVB-M8-RBR) about 6 weeks ago. Around 15% of them are showing significant rubber degradation and have lost their damping properties. These are rated for 12+ months in our operating environment. Is this covered under warranty?",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: {
      name: "Mike Rodriguez",
      role: "Engineering Manager",
      initials: "MR",
    },
    followUpActions: [
      {
        id: "fu-015-1",
        team: "Engineering",
        action: "Request 3 failed mounts for material analysis",
        why: "15% failure rate at 6 weeks vs. 12-month spec — need root cause.",
        status: "queued",
      },
      {
        id: "fu-015-2",
        team: "QC",
        action: "Pull retain sample, run accelerated aging test",
        why: "Validate batch against spec; rule out raw rubber issue.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Product Specs", summary: "MNT-AVB-M8-RBR — rated 12+ months, -30°C to 80°C range" },
      { module: "SOPs", summary: "Warranty Claim Handling — premature degradation, investigation required" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-31T12:00:00Z",
    resolvedAt: null,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTicket(id: string): SupportTicket | undefined {
  return supportTickets.find((t) => t.id === id);
}

export function getTicketsByStatus(status: TicketStatus): SupportTicket[] {
  return supportTickets.filter((t) => t.status === status);
}

export function getConfidenceTier(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.9) return "high";
  if (confidence >= 0.7) return "medium";
  return "low";
}

export function getAiActionLabel(t: SupportTicket): string {
  switch (t.status) {
    case "auto_resolved":
      return "Sent";
    case "awaiting_approval":
      return "Draft ready";
    case "escalated":
      return "Escalated";
    case "in_progress":
      return "In review";
    case "resolved":
      return "Resolved";
    default:
      return "—";
  }
}
