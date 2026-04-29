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

// ─── Lifecycle stages ────────────────────────────────────────────────────────

export const SUPPORT_STAGES = [
  "received",
  "classified",
  "grounded",
  "drafted",
  "routed",
  "sent",
  "follow_ups_fired",
  "customer_acknowledged",
  "resolved",
] as const;

export type SupportStage = (typeof SUPPORT_STAGES)[number];

export type LifecyclePath = "auto" | "approval" | "escalation";

export type LifecycleEventType =
  | "received"
  | "classified"
  | "grounded"
  | "drafted"
  | "auto_routed"
  | "approval_requested"
  | "escalated_to_owner"
  | "draft_approved"
  | "draft_edited"
  | "draft_rejected"
  | "sent"
  | "follow_up_queued"
  | "follow_up_done"
  | "customer_replied"
  | "resolved";

export interface LifecycleEvent {
  id: string;
  occurredAt: string;
  type: LifecycleEventType;
  title: string;
  detail: string;
}

export const stageLabels: Record<SupportStage, string> = {
  received: "Received",
  classified: "Classified",
  grounded: "Grounded",
  drafted: "Drafted",
  routed: "Routed",
  sent: "Sent",
  follow_ups_fired: "Follow-ups Fired",
  customer_acknowledged: "Customer Acknowledged",
  resolved: "Resolved",
};

export const stageShortLabels: Record<SupportStage, string> = {
  received: "Received",
  classified: "Classified",
  grounded: "Grounded",
  drafted: "Drafted",
  routed: "Routed",
  sent: "Sent",
  follow_ups_fired: "Follow-ups",
  customer_acknowledged: "Acknowledged",
  resolved: "Resolved",
};

export function getLifecyclePath(status: TicketStatus): LifecyclePath {
  switch (status) {
    case "auto_resolved":
      return "auto";
    case "awaiting_approval":
      return "approval";
    case "escalated":
    case "in_progress":
      return "escalation";
    case "resolved":
      return "approval";
  }
}

export function getInitialStage(status: TicketStatus): SupportStage {
  switch (status) {
    case "auto_resolved":
      return "resolved";
    case "awaiting_approval":
    case "escalated":
    case "in_progress":
      return "routed";
    case "resolved":
      return "resolved";
  }
}

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
  currentStage: SupportStage;
  lifecycleEvents: LifecycleEvent[];
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

type SupportTicketBase = Omit<SupportTicket, "currentStage" | "lifecycleEvents">;

const supportTicketsBase: SupportTicketBase[] = [
  // ── Auto-Resolved (high confidence ≥ 0.9) ─────────────────────────────────
  {
    id: "tkt-001",
    ticketNumber: "TKT-2026-0142",
    customer: {
      name: "John Smith",
      email: "jsmith@apexseating.com",
      company: "Apex Seating Group",
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
      reasoning: "Direct PO reference and explicit delivery-date question on a blanket call-off.",
    },
    customerSentiment: "neutral",
    customerStats: {
      lifetimeSpend: "$1.84M",
      ordersLast12mo: 38,
      openOrders: 4,
      notes: "Tier-1 auto seating account. Net-30 customer, blanket release cadence.",
    },
    subject: "Status on PO-2026-3847 — M8 flange bolt blanket release",
    customerMessage:
      "Hi, I need an update on PO-2026-3847. We placed this call-off 3 weeks ago for 50,000 M8x25 Grade 10.9 zinc flange bolts (FB-M8X25-1090-ZN). When can we expect delivery to our Wabash dock? Line ramp on the new program is Mar 20.",
    sentResponse:
      "Hi John,\n\nI checked on PO-2026-3847 for 50,000x M8x25 Grade 10.9 flange bolts. Here's the current status:\n\n- Pick & pack: Complete (finished Mar 4)\n- Outbound QC inspection: Passed\n- 3.1 mill cert: Attached to packing slip\n- Shipping: Dispatched via FedEx Freight\n- Tracking: 7489-2156-3847\n- ETA Wabash dock: March 12\n\nYou're on track to receive well before your March 20 line-ramp date. Let me know if you need anything else!",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Orders", summary: "PO-2026-3847 — 50,000x FB-M8X25-1090-ZN, status: Shipped", link: "/orders" },
      { module: "Warehouse", summary: "Pick & pack complete Mar 4, outbound QC passed", link: "/procurement" },
      { module: "Logistics", summary: "FedEx Freight #7489-2156-3847, ETA Mar 12 — Wabash dock" },
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
      email: "s.chen@stoughtontrailer.com",
      company: "Stoughton Trailer Mfg.",
      phone: "+1 (608) 873-2500",
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
      reasoning: "Caller requested pricing on multiple fastener SKUs for assembly-line restocking.",
    },
    customerSentiment: "positive",
    customerStats: {
      lifetimeSpend: "$410K",
      ordersLast12mo: 24,
      openOrders: 1,
      notes: "Off-highway equipment OEM. Predictable restocking cadence.",
    },
    subject: "Restocking quote — assembly-line fasteners",
    customerMessage:
      "Inbound call captured by Call Tracker. Customer requested pricing on 1,000x M10x30 hex bolts Grade 8.8 zinc, 1,000x M10 nylock nuts Grade 8, 2,000x M10 flat washers DIN 125, 500x SHCS M6x20 A2 stainless, 250x lag screws 3/8 x 4 inch HDG, 100x stainless spring washers M12, and 200x Helicoil M8x1.25 tangless inserts. Stoughton plant delivery, March 20 deadline.",
    sentResponse:
      "Hi Sarah,\n\nThanks for the call earlier — full quote attached as Q-2026-0061.\n\n- 1,000x M10x30 Grade 8.8 hex bolts (HEX-M10X30-88-ZN): $0.32/unit — $320\n- 1,000x M10 Grade 8 nylock nuts (NUT-NYL-M10-ZN): $0.14/unit — $140\n- 2,000x M10 flat washers DIN 125 (WSH-FLT-M10-ZN): $0.04/unit — $80\n- 500x SHCS M6x20 A2 (SHCS-M6X20-A2): $0.22/unit — $110\n- 250x Lag screws 3/8 x 4 HDG (LAG-38X4-HDG): $0.48/unit — $120\n- 100x Spring washer M12 stainless (WSH-SPR-M12-SS): $0.18/unit — $18\n- 200x Helicoil M8x1.25 tangless (HEL-M8X125-TL): $0.85/unit — $170\n\nTotal $958 ex-tax. Stoughton plant delivery by Mar 20. Net 30 standard.\n\nReply or click the quote link to convert to PO.",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Call Tracker", summary: "Call #call-2 — full transcript captured", link: "/calls/call-2" },
      { module: "Product Catalog", summary: "All 7 SKUs in stock, standard pricing tier" },
      { module: "Customer History", summary: "Stoughton Trailer — restocking pattern, last order Q1" },
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
    subject: "Volume pricing for M10x40 Grade 10.9 SHCS — 50,000+ units/qtr",
    customerMessage:
      "We're looking at increasing our blanket release for M10x40 Grade 12.9 SHCS black oxide (SHCS-M10X40-1290-BO) to 50,000+ units per quarter on the Detroit program. Can you provide updated volume pricing? Our current rate is $0.42 per unit.",
    sentResponse:
      "Hi Elena,\n\nGreat news on the volume increase! Based on our tiered pricing schedule for SHCS-M10X40-1290-BO:\n\n- 5,000–24,999 units: $0.42/unit (your current rate)\n- 25,000–49,999 units: $0.38/unit\n- 50,000+ units: $0.35/unit\n\nAt 50,000 units/quarter, you'd save approximately $3,500 per release compared to your current rate. PPAP package + EN 10204 3.1 mill cert remain included.\n\nI've also attached our volume agreement template. Want me to have your account manager reach out to finalize terms?\n\nBest,\nHexa Support",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Product Catalog", summary: "SHCS-M10X40-1290-BO — M10x40 Grade 12.9 SHCS, tiered pricing active" },
      { module: "Customer History", summary: "Northfield Components — current rate $0.42, 4 releases last 6mo" },
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
    subject: "ETA for ORD-2026-0045 — fastener kit (M12 hex bolts + F436 washers)",
    customerMessage:
      "Quick question — when is ORD-2026-0045 expected to arrive at our Topline DC? We have an OEM customer install scheduled for next week and need the M12 hex bolts and F436 washers in hand.",
    sentResponse:
      "Hi Marcus,\n\nORD-2026-0045 shipped on Feb 25, 2026 via FedEx Economy.\n\n- Contents: 12,000x M12x40 Grade 8.8 hex bolts, 8,000x F436 1/2\" structural washers HDG\n- Tracking: 7834-9021-4456\n- Current status: In transit\n- Estimated delivery: Feb 28, 2026\n\nYou should be all set well ahead of your install. Let me know if you need a priority upgrade on the shipping.\n\nBest,\nHexa Support",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0045 — M12 hex bolts + F436 washers, status: Shipped", link: "/orders" },
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
    subject: "Current pricing for SHCS — SHCS-M6X20-A2",
    customerMessage:
      "We need updated pricing for SHCS-M6X20-A2 (M6x20 A2 stainless socket head cap screws). We're quoting a job that needs 8,000 units. What's your best price at that quantity?",
    sentResponse:
      "Hi David,\n\nHere's the current pricing for SHCS-M6X20-A2 (M6x20 A2 SHCS):\n\n- 1,000–4,999 units: $0.22/unit\n- 5,000–9,999 units: $0.20/unit\n- 10,000+ units: $0.18/unit\n\nAt 8,000 units, your rate would be $0.20/unit ($1,600 total).\n\nCurrent stock: 8,500 units — no lead time, ships within 24 hours.\n\nWant me to create a formal quote for your records?\n\nBest,\nHexa Support",
    draftResponse: null,
    draftConfidence: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [],
    dataSources: [
      { module: "Product Catalog", summary: "SHCS-M6X20-A2 — M6x20 A2 SHCS, tiered pricing" },
      { module: "Inventory", summary: "SHCS-M6X20-A2 — 8,500 in stock, ships within 24h" },
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
    subject: "RMA — wrong grade hex bolts shipped (Grade 5 instead of Grade 8)",
    customerMessage:
      "Inbound call captured by Call Tracker. Order ORD-2026-0060 was for 5,000x 3/8-16 x 4 inch Grade 8 yellow zinc hex bolts. Receiving found Grade 5 plain bolts in the boxes (head markings show 3 radial lines, not 6). Wrong product — needs full RMA and rush replacement. Customer's structural assembly job is on hold.",
    sentResponse: null,
    draftResponse:
      "Hi Rachel,\n\nThanks for the call — confirming the RMA is being raised:\n\n- RMA Number: RMA-2026-0089\n- Order: ORD-2026-0060, Line 1\n- Ordered: 5,000x HEX-38X4-G8-YZ (3/8-16 x 4\" Grade 8 yellow zinc)\n- Shipped (in error): 5,000x Grade 5 plain (head markings 3 radial lines)\n- Qty affected: 5,000 of 5,000\n\nNext steps:\n1. Prepaid return label will be emailed within the hour\n2. Correct Grade 8 yellow zinc bolts ship today via expedited freight (no charge to you)\n3. Estimated delivery: 2–3 business days\n4. We're root-causing the pick error in our Solon DC — same-bin proximity to G5 plain SKU\n\nPer our SOP, wrong-SKU shipments are full-replacement at our cost. No restocking fee.\n\nBest,\nHexa Support",
    draftConfidence: 0.86,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [
      {
        id: "fu-008-1",
        team: "Warehouse",
        action: "Root-cause pick error: HEX-38X4-G8-YZ vs Grade 5 plain bin proximity",
        why: "Bins are adjacent in Solon DC — Grade 8 yellow-zinc and Grade 5 plain commonly mis-picked.",
        status: "suggested",
      },
      {
        id: "fu-008-2",
        team: "Logistics",
        action: "Expedite Grade 8 replacement at Hexa cost",
        why: "Customer's structural job on hold — preserve relationship.",
        status: "suggested",
      },
      {
        id: "fu-008-3",
        team: "QC",
        action: "Audit head-marking inspection on outbound G8 picks for the next 7 days",
        why: "Wrong-grade pick is a 90-day repeat — tighten outbound QC until root cause closed.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Call Tracker", summary: "Call #call-1 — full transcript captured", link: "/calls/call-1" },
      { module: "Orders", summary: "ORD-2026-0060 — 5,000x HEX-38X4-G8-YZ Grade 8 yellow zinc, shipped wrong-grade", link: "/orders" },
      { module: "SOPs", summary: "Returns & RMA Process — wrong-SKU full replacement at Hexa cost" },
      { module: "Inventory", summary: "HEX-38X4-G8-YZ — 750 in stock, expedite 5,000 from Brighton-Best" },
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
    subject: "Return request — wrong-finish lag bolts shipped (zinc instead of HDG)",
    customerMessage:
      "We received our last lag bolt order but they're the wrong finish. We ordered LAG-516X3-HDG (5/16 x 3 inch hot-dip galvanized) but received LAG-516X3-ZN (zinc plated) instead. Outdoor application — we need HDG. Arrange return and ship correct ones ASAP please.",
    sentResponse: null,
    draftResponse:
      "Hi Lisa,\n\nApologies — we shipped the wrong finish. Pulling this together now:\n\n- Wrong shipped: LAG-516X3-ZN (5/16 x 3\" lag bolt, zinc plated)\n- Correct SKU: LAG-516X3-HDG (5/16 x 3\" lag bolt, hot-dip galvanized)\n- RMA: RMA-2026-0093 (return label emailing now)\n- Replacement: Shipping today, expedited to make up for the delay — no cost to you\n\nI've also flagged this with our warehouse team to root-cause the pick error — adjacent bins for HDG and zinc finish on the same SKU base.\n\nBest,\nHexa Support",
    draftConfidence: 0.74,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    followUpActions: [
      {
        id: "fu-009-1",
        team: "Warehouse",
        action: "Root-cause pick error: LAG-516X3-HDG vs LAG-516X3-ZN bin proximity",
        why: "Bins are adjacent (A-12-3 / A-12-4) — finish-SKU split confusion.",
        status: "suggested",
      },
      {
        id: "fu-009-2",
        team: "Logistics",
        action: "Expedite LAG-516X3-HDG replacement at Hexa cost",
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
      { module: "Inventory", summary: "LAG-516X3-HDG — 5,400 in stock; LAG-516X3-ZN — 8,200 in stock (adjacent bins)" },
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
      notes: "First quality issue in 24 months. QA-driven counterfeit concern — high stakes.",
    },
    subject: "Suspect counterfeit Grade 8 hex bolts — non-conforming head markings on Pacific Rim batch",
    customerMessage:
      "Our QA team is flagging a possible counterfeit issue. Batch #PRF-2026-0891 of HEX-516-18X1-G8-ZN (5/16-18 x 1\" Grade 8 hex bolts) shows non-conforming head markings — only 4 of the 6 required Grade 8 radial lines, and the manufacturer mark is unreadable. Hardness testing puts them in the Grade 5 range (~85,000 PSI vs Grade 8 spec of 150,000). We're holding the entire batch and need an immediate engineering review plus a replacement batch.",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason:
      "Suspected counterfeit Grade 8 fastener batch from Pacific Rim Fasteners (offshore importer). Non-conforming head markings, hardness in Grade 5 range. High-risk: customer is using these in safety-critical applications. Requires QA + supplier-development review.",
    aiContextSummary: [
      "Customer batch test on PRF-2026-0891 (5/16-18 x 1\" Grade 8 hex bolts) — 4 of 6 radial lines instead of 6, hardness ~85K PSI",
      "Pacific Rim Fasteners has had 2 prior counterfeit-marking flags in 12 months — pattern emerging",
      "Hexa QA records show this batch passed visual inspection but no hardness sampling on ingest",
      "Customer requesting full replacement batch + traceability docs (mill cert chain)",
      "Cross-reference: same batch shipped to 3 other customers — proactive recall outreach needed",
    ],
    assignedTo: {
      name: "Mike Rodriguez",
      role: "Engineering Manager",
      initials: "MR",
    },
    followUpActions: [
      {
        id: "fu-010-1",
        team: "QC",
        action: "Pull retain sample from batch PRF-2026-0891, run head-marking + hardness test per SAE J429",
        why: "Validate counterfeit suspicion before notifying supplier — need internal evidence.",
        status: "suggested",
      },
      {
        id: "fu-010-2",
        team: "Procurement",
        action: "Quarantine all Pacific Rim Grade 8 stock pending verification",
        why: "Prevent further customer exposure. Open formal supplier investigation.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-010-3",
        team: "Account Manager",
        action: "Proactive recall outreach to other 3 customers who received PRF-2026-0891",
        why: "Counterfeit Grade 8 in safety-critical applications — must notify before failure.",
        status: "suggested",
      },
      {
        id: "fu-010-4",
        team: "Engineering",
        action: "Source verified-domestic replacement (Brighton-Best HEX-516-18X1-G8-ZN-US)",
        why: "Customer needs replacement batch with full mill-cert traceability — switch supplier for this lot.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Product Specs", summary: "HEX-516-18X1-G8-ZN — SAE J429 Grade 8: 150K PSI minimum tensile, 6 radial lines + manufacturer mark required" },
      { module: "Supplier Records", summary: "Pacific Rim Fasteners — batch PRF-2026-0891 received Feb 12; 2 prior counterfeit flags in 12mo" },
      { module: "Customer History", summary: "Precision Parts — 12 orders in 24mo, first quality issue. Used in safety-critical structural assemblies." },
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
    subject: "Premature thread strip on stud bolts — warranty claim with downtime",
    customerMessage:
      "We're seeing a high failure rate on the 5/8-11 x 8 inch B7 stud bolts (STUD-58-11X8-B7) from ORD-2026-0051. After only 3 weeks installed in a flange-bolt application, the threads are stripping at well below the design torque. Our maintenance team teardown shows the threads were under-formed — possibly a thread-rolling die wear issue at the mill. We need a warranty replacement for all 480 studs plus compensation for the production downtime caused by the unscheduled re-torque rounds.",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason:
      "Warranty claim with suspected thread-rolling die wear from supplier (Würth) on B7 stud bolts. Customer requesting downtime compensation, which exceeds the standard parts-replacement SOP and needs Sales Manager approval.",
    aiContextSummary: [
      "STUD-58-11X8-B7 from ORD-2026-0051 — delivered Feb 28, failures reported after 21 days",
      "Customer describes thread strip below design torque — suggests under-formed threads from die wear",
      "Warranty SOP covers parts replacement within 90 days, but downtime compensation requires Sales Manager approval",
      "Cross-referenced with other stud orders from same Würth lot — 1 other customer has flagged similar",
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
        team: "QC",
        action: "Request 5 failed studs returned for thread-form analysis (microscope + go/no-go gauge)",
        why: "Confirm under-formed thread root-cause before approving downtime compensation.",
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
        action: "Open NCR with Würth on STUD-58-11X8-B7 lot — check thread-rolling die maintenance records",
        why: "Identify if batch-wide issue or one-off; supplier credit/claim opportunity.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-011-4",
        team: "Logistics",
        action: "Expedite warranty replacement studs from Cardinal Fastener (US-mill backup)",
        why: "Customer in production downtime — minimize claim exposure with verified-domestic replacement.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0051 — STUD-58-11X8-B7 + B7 nuts, delivered Feb 28", link: "/orders" },
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
      email: "e.watson@apexseating.com",
      company: "Apex Seating Group",
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
      lifetimeSpend: "$1.84M",
      ordersLast12mo: 38,
      openOrders: 4,
      notes: "Tier-1 auto seating account. Hard PPAP deadlines on new program launches.",
    },
    subject: "URGENT — PPAP rejection on M10 SHCS launch shipment, line-down risk",
    customerMessage:
      "Our quality team rejected the PPAP submission on the M10x40 Grade 12.9 SHCS shipment from PO-2026-0055 for the new program. The Cpk on the head-marking depth measurement is 1.15 — our spec is Cpk ≥ 1.33. Line ramp is April 1st and if we don't have approved PPAP we cannot run production. Liquidated damages are on the table. We need a fix from your supplier IMMEDIATELY plus replacement parts that pass PPAP.",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason:
      "PPAP rejection on a tier-1 auto OEM launch — customer line-ramp deadline 10 days out. Cpk 1.15 vs 1.33 spec. Requires supplier engagement + new replacement run + accelerated PPAP re-submission. Liquidated damages exposure if missed.",
    aiContextSummary: [
      "PO-2026-0055 — 25,000x SHCS-M10X40-1290-BO for Apex Detroit program launch",
      "Bossard PPAP submission rejected — Cpk 1.15 on head-marking depth vs 1.33 spec",
      "Apex line-ramp date: April 1 — 10 days away, no slack",
      "Bossard's PPAP rerun lead time is typically 14 days — too long",
      "Backup option: Würth has same Cpk capability and 7-day rerun. Cardinal Fastener (US mill) can rerun in 5 days at premium",
      "Customer threatens liquidated damages if missed — requires priority handling + replacement plan",
    ],
    assignedTo: {
      name: "Sarah Mitchell",
      role: "Operations Lead",
      initials: "SM",
    },
    followUpActions: [
      {
        id: "fu-012-1",
        team: "Procurement",
        action: "Engage Bossard QA + escalate to supplier dev manager — request emergency Cpk improvement plan",
        why: "Existing supplier has 14-day rerun. Need either accelerated rerun or backup activation.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-012-2",
        team: "Procurement",
        action: "Activate Cardinal Fastener (US-mill backup) for emergency 5-day rerun",
        why: "Cardinal can rerun + ship faster than Bossard. Premium pricing acceptable to save the program.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-012-3",
        team: "QC",
        action: "Have Hexa internal QA witness Cardinal's first-article inspection",
        why: "Critical PPAP rerun — independent verification before parts ship.",
        status: "suggested",
      },
      {
        id: "fu-012-4",
        team: "Account Manager",
        action: "Call Emily Watson at Apex with rerun plan + LD-coverage clause",
        why: "Liquidated damages threat — preempt with concrete plan + indemnity from supplier credit.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Orders", summary: "PO-2026-0055 — 25,000x SHCS-M10X40-1290-BO (Apex Detroit launch), PPAP rejected", link: "/orders" },
      { module: "Procurement", summary: "Bossard rerun lead 14d; Cardinal Fastener (US mill) 5d at premium; Würth 7d", link: "/procurement" },
      { module: "Customer History", summary: "Apex Seating Group — $1.84M lifetime, tier-1 auto. First PPAP rejection in 18mo." },
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
      lifetimeSpend: "$138K",
      ordersLast12mo: 17,
      openOrders: 1,
    },
    subject: "Zinc-flake coating failing salt-spray test — supplier formulation change?",
    customerMessage:
      "We've been receiving M10x40 zinc-flake-coated flange bolts (BLT-FLG-M10x30-HT) from order ORD-2026-0056, and they're failing the 720-hour salt-spray test at 480 hours. Previous batches always passed 720+. Our customer (auto OEM) requires 720-hour minimum per their plating spec. Has the supplier changed the coating formulation? We need a technical review urgently — this affects our PPAP submission.",
    sentResponse: null,
    draftResponse: null,
    draftConfidence: null,
    escalationReason:
      "Technical product issue — customer reports salt-spray performance regression on zinc-flake-coated flange bolts. Suggests supplier coating formulation change. Affects PPAP submission. Requires supplier liaison and potentially a product recall assessment.",
    aiContextSummary: [
      "BLT-FLG-M10x30-HT (zinc-flake coated) from ORD-2026-0056 — ordered 5,000 units, delivered Mar 10",
      "Customer reports salt-spray failure at 480h vs 720h spec",
      "Supplier (TR Fastenings UK) recently switched zinc-flake topcoat to a lower-VOC formulation per regulatory pressure",
      "Spec sheet still cites 720-hour rating but validation may not have been re-run after formulation change",
      "PPAP impact — customer cannot submit to OEM without 720-hour validation",
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
        action: "Open NCR with TR Fastenings on zinc-flake formulation regression",
        why: "Likely supplier-side coating change without validation — supplier needs to fix or pull the batch.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-013-2",
        team: "QC",
        action: "Run independent salt-spray test on retain sample per ASTM B117",
        why: "Verify the 480h failure before notifying supplier/customer — internal evidence.",
        status: "suggested",
      },
      {
        id: "fu-013-3",
        team: "Procurement",
        action: "Quarantine remaining BLT-FLG-M10x30-HT inventory from this lot",
        why: "Prevent further customer shipments until formulation is verified.",
        status: "suggested",
        link: "/procurement",
      },
      {
        id: "fu-013-4",
        team: "Account Manager",
        action: "Proactive outreach to 4 other customers who received this lot",
        why: "If salt-spray failure confirmed, multiple customers will face PPAP issues — get ahead of it.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Product Specs", summary: "BLT-FLG-M10x30-HT — zinc-flake coated, 720h salt-spray rated per ASTM B117" },
      { module: "Orders", summary: "ORD-2026-0056 — 5,000x BLT-FLG-M10x30-HT, delivered Mar 10", link: "/orders" },
      { module: "Supplier Records", summary: "TR Fastenings UK — new zinc-flake formulation Jan 2026, validation re-run not on file" },
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
      "Hi, just checking in on the quote we requested (Q-2026-0049). We submitted the RFQ last week for SHCS M6x20 A2, M10 flat washers, and Helicoil M8x1.25 tangless inserts. When can we expect the formal quote? We'd like to place the PO this week if possible.",
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
      email: "a.foster@apexseating.com",
      company: "Apex Seating Group",
    },
    priority: "high",
    status: "in_progress",
    category: "order_status",
    channel: "email",
    classification: {
      category: "order_status",
      confidence: 0.68,
      alternatives: [
        { category: "technical", confidence: 0.42 },
      ],
      reasoning: "Kanban replenishment failure — line-down risk requires immediate ops intervention.",
    },
    customerSentiment: "urgent",
    customerStats: {
      lifetimeSpend: "$1.84M",
      ordersLast12mo: 38,
      openOrders: 4,
      notes: "Tier-1 auto seating account on Kanban replenishment.",
    },
    subject: "Kanban card not triggering replenishment on M8 flange bolt bin",
    customerMessage:
      "Our Kanban card for M8x25 Grade 10.9 flange bolt (FB-M8X25-1090-ZN) on Line 4 didn't trigger automatic replenishment last cycle. Bin is at 12% — well below the trigger point — but no PO has come in. We're going to run line-side stock-out within 36 hours. Has something changed in your system? We need this fixed and a same-day expedite of 5,000 units to keep the line running.",
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
        team: "Procurement",
        action: "Audit Kanban trigger config for FB-M8X25-1090-ZN on Apex Line 4",
        why: "Bin at 12% not triggering — possible reorder-point misconfiguration on the EDI feed.",
        status: "queued",
        link: "/procurement",
      },
      {
        id: "fu-015-2",
        team: "Logistics",
        action: "Same-day expedite 5,000 units M8x25 flange bolts to Apex Line 4",
        why: "Customer 36 hours from line stop — preserve relationship at our cost.",
        status: "suggested",
      },
    ],
    dataSources: [
      { module: "Product Specs", summary: "FB-M8X25-1090-ZN — M8x25 Grade 10.9 flange bolt, line-side critical" },
      { module: "SOPs", summary: "Kanban Replenishment SOP — auto-trigger at 25% bin level via EDI 850" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-31T12:00:00Z",
    resolvedAt: null,
  },
];

// ─── Lifecycle event factory ─────────────────────────────────────────────────

function plusSec(iso: string, seconds: number): string {
  return new Date(new Date(iso).getTime() + seconds * 1000).toISOString();
}

function buildLifecycleEvents(t: SupportTicketBase): LifecycleEvent[] {
  const start = t.createdAt;
  const channelLabel = channelLabels[t.channel];
  const confPct = Math.round(t.classification.confidence * 100);
  const categoryLabel = categoryLabels[t.classification.category];
  const path = getLifecyclePath(t.status);

  const events: LifecycleEvent[] = [
    {
      id: `${t.id}-ev-1`,
      occurredAt: start,
      type: "received",
      title: `Inbound captured via ${channelLabel}`,
      detail: `Routed into the support inbox from ${t.customer.name} at ${t.customer.company}.`,
    },
    {
      id: `${t.id}-ev-2`,
      occurredAt: plusSec(start, 4),
      type: "classified",
      title: `Classified as ${categoryLabel}`,
      detail: `${confPct}% confidence — ${t.classification.reasoning}`,
    },
    {
      id: `${t.id}-ev-3`,
      occurredAt: plusSec(start, 11),
      type: "grounded",
      title: "Grounded in ERP",
      detail:
        t.dataSources.length > 0
          ? `Pulled context from ${t.dataSources.map((d) => d.module).join(", ")}.`
          : "No structured ERP context required for this request.",
    },
    {
      id: `${t.id}-ev-4`,
      occurredAt: plusSec(start, 19),
      type: "drafted",
      title:
        path === "escalation" ? "AI brief prepared" : "AI reply drafted",
      detail:
        path === "escalation"
          ? "Outside-SOP signal detected — assembled context brief instead of customer-facing reply."
          : `Draft reply generated and grounded against ${t.dataSources.length} source${t.dataSources.length === 1 ? "" : "s"}.`,
    },
  ];

  if (path === "auto") {
    events.push(
      {
        id: `${t.id}-ev-5`,
        occurredAt: plusSec(start, 24),
        type: "auto_routed",
        title: "Auto-send approved",
        detail: `Confidence ${confPct}% \u2265 90% threshold — clear to dispatch without human review.`,
      },
      {
        id: `${t.id}-ev-6`,
        occurredAt: plusSec(start, 29),
        type: "sent",
        title: `Reply sent to ${t.customer.email}`,
        detail: t.responseTimeSec
          ? `Response time ${t.responseTimeSec}s end-to-end.`
          : "Reply dispatched.",
      },
      {
        id: `${t.id}-ev-7`,
        occurredAt: plusSec(start, 60),
        type: "resolved",
        title: "Ticket resolved",
        detail: "No human intervention required. Closed as auto-resolved.",
      },
    );
  } else if (path === "approval") {
    events.push({
      id: `${t.id}-ev-5`,
      occurredAt: plusSec(start, 26),
      type: "approval_requested",
      title: "Held for human approval",
      detail: `Confidence ${confPct}% in the 70\u201390% band — draft queued for one-click approval.`,
    });
  } else {
    events.push({
      id: `${t.id}-ev-5`,
      occurredAt: plusSec(start, 26),
      type: "escalated_to_owner",
      title: t.assignedTo
        ? `Escalated to ${t.assignedTo.name}`
        : "Escalated to human owner",
      detail:
        t.escalationReason ??
        `Confidence ${confPct}% below threshold — routed to owner with full AI context.`,
    });
  }

  // For in_progress tickets, surface that the human is actively handling it
  // by emitting a follow-up queued event for any already-queued action.
  if (t.status === "in_progress") {
    const queued = t.followUpActions.find((a) => a.status === "queued");
    if (queued) {
      events.push({
        id: `${t.id}-ev-6`,
        occurredAt: plusSec(start, 60),
        type: "follow_up_queued",
        title: `${queued.team} action queued`,
        detail: queued.action,
      });
    }
  }

  return events;
}

export const supportTickets: SupportTicket[] = supportTicketsBase.map((t) => ({
  ...t,
  currentStage: getInitialStage(t.status),
  lifecycleEvents: buildLifecycleEvents(t),
}));

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
