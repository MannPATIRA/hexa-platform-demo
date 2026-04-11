// ─── Types ───────────────────────────────────────────────────────────────────

export type TicketPriority = "low" | "medium" | "high";
export type TicketStatus = "auto_resolved" | "escalated" | "pending" | "in_progress";
export type TicketCategory =
  | "order_status"
  | "technical"
  | "warranty"
  | "returns"
  | "pricing"
  | "shipping";

export interface DataSourceUsed {
  module: string;
  summary: string;
}

export interface AssignedTo {
  name: string;
  role: string;
  initials: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customer: {
    name: string;
    email: string;
    company: string;
  };
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  subject: string;
  customerMessage: string;
  aiResponse: string | null;
  escalationReason: string | null;
  aiContextSummary: string[] | null;
  assignedTo: AssignedTo | null;
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

// ─── Category / Priority / Status Labels ─────────────────────────────────────

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
  escalated: "Escalated",
  pending: "Pending",
  in_progress: "In Progress",
};

// ─── Mock Tickets ────────────────────────────────────────────────────────────

export const supportTickets: SupportTicket[] = [
  // ── Auto-Resolved ──────────────────────────────────────────────────────────
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
    subject: "Update on PO-2026-3847 delivery status",
    customerMessage:
      "Hi, I need an update on PO-2026-3847. We placed this order 3 weeks ago for 50 units of the GVS300 Sensor. When can we expect delivery? Our production line needs these by March 20.",
    aiResponse:
      "Hi John,\n\nI checked on PO-2026-3847 for 50x GVS300 Sensors. Here's the current status:\n\n- Production: Complete (finished Mar 4)\n- QC Inspection: Passed\n- Shipping: Dispatched via FedEx Freight\n- Tracking: 7489-2156-3847\n- ETA: March 12\n\nYou're on track to receive well before your March 20 deadline. Let me know if you need anything else!",
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    dataSources: [
      { module: "Orders", summary: "PO-2026-3847 — 50x GVS300, status: Shipped" },
      { module: "Production", summary: "Job complete Mar 4, QC passed" },
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
      name: "Tom Wagner",
      email: "tom.wagner@pacificindustrial.com",
      company: "Pacific Industrial Co.",
    },
    priority: "low",
    status: "auto_resolved",
    category: "shipping",
    subject: "Tracking info for ORD-2026-0052",
    customerMessage:
      "Hi, could you send me the tracking information for order ORD-2026-0052? I need to let our receiving dock know when to expect the shipment.",
    aiResponse:
      "Hi Tom,\n\nYour order ORD-2026-0052 is currently in the RFQ review stage. We're finalizing the quote for your CNC machining parts request and will have it to you shortly.\n\nOnce approved and shipped, tracking information will be sent automatically to this email. I'll also flag your receiving dock request in the order notes.\n\nBest regards,\nHexa Support",
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0052 — CNC machining parts, stage: RFQ Received" },
      { module: "Customer History", summary: "Pacific Industrial — 8 previous orders, preferred customer" },
    ],
    responseTimeSec: 31,
    createdAt: "2026-03-14T11:22:00Z",
    resolvedAt: "2026-03-14T11:23:00Z",
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
    subject: "Volume pricing for brass hinges — 5000+ units",
    customerMessage:
      "We're looking at increasing our order volume for brass hinges (BH-SM-500) to 5,000+ units per quarter. Can you provide updated volume pricing? Our current rate is $0.85 per unit.",
    aiResponse:
      "Hi Elena,\n\nGreat news on the volume increase! Based on our tiered pricing schedule for BH-SM-500 (Brass Hinge Small):\n\n- 500–2,499 units: $0.85/unit (your current rate)\n- 2,500–4,999 units: $0.78/unit\n- 5,000+ units: $0.72/unit\n\nAt 5,000 units/quarter, you'd save approximately $650 per order compared to your current rate.\n\nI've also attached our volume agreement template. Want me to have your account manager reach out to finalize terms?\n\nBest,\nHexa Support",
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
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
    ticketNumber: "TKT-2026-0146",
    customer: {
      name: "Raj Patel",
      email: "r.patel@thorntonsupplies.co.uk",
      company: "Thornton Supplies",
    },
    priority: "medium",
    status: "auto_resolved",
    category: "order_status",
    subject: "ORD-2026-0054 — missing 200 washers from delivery",
    customerMessage:
      "We received ORD-2026-0054 today but the M6 Zinc-Plated Flat Washers (WSH-M6-ZP) are short. We ordered 2,000 but only received 1,800. Can you look into this and ship the remaining 200?",
    aiResponse:
      "Hi Raj,\n\nThank you for flagging this. I've confirmed the discrepancy on ORD-2026-0054:\n\n- Ordered: 2,000x WSH-M6-ZP (M6 Zinc-Plated Flat Washer)\n- Shipped: 1,800 units (verified against packing slip)\n- Shortfall: 200 units\n\nI've raised a replacement shipment for the 200 missing washers. They're in stock and will ship today via your standard carrier. You should receive them within 2–3 business days.\n\nTracking will be emailed once dispatched.\n\nApologies for the inconvenience,\nHexa Support",
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0054 — 2,000x WSH-M6-ZP, status: Delivered" },
      { module: "Logistics", summary: "Packing slip confirmed 1,800 shipped, 200 short" },
      { module: "Inventory", summary: "WSH-M6-ZP — 12,400 in stock, replacement available" },
    ],
    responseTimeSec: 52,
    createdAt: "2026-03-18T14:30:00Z",
    resolvedAt: "2026-03-18T14:31:00Z",
  },
  {
    id: "tkt-005",
    ticketNumber: "TKT-2026-0148",
    customer: {
      name: "Marcus Rivera",
      email: "m.rivera@toplinehardware.com",
      company: "Topline Hardware LLC",
    },
    priority: "low",
    status: "auto_resolved",
    category: "shipping",
    subject: "ETA for ORD-2026-0045 — drawer slides and cabinet hardware",
    customerMessage:
      "Quick question — when is ORD-2026-0045 expected to arrive? We have a client installation scheduled for next week.",
    aiResponse:
      "Hi Marcus,\n\nORD-2026-0045 shipped on Feb 25, 2026 via FedEx Economy.\n\n- Tracking: 7834-9021-4456\n- Current status: In transit\n- Estimated delivery: Feb 28, 2026\n\nYou should be all set well ahead of your installation schedule. Let me know if you need a priority upgrade on the shipping.\n\nBest,\nHexa Support",
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0045 — Cabinet hardware, status: Shipped" },
      { module: "Logistics", summary: "FedEx Economy #7834-9021-4456, ETA Feb 28" },
    ],
    responseTimeSec: 28,
    createdAt: "2026-02-26T10:05:00Z",
    resolvedAt: "2026-02-26T10:06:00Z",
  },
  {
    id: "tkt-006",
    ticketNumber: "TKT-2026-0150",
    customer: {
      name: "Rachel Kim",
      email: "rachel.kim@meridianeng.com",
      company: "Meridian Engineering",
    },
    priority: "medium",
    status: "auto_resolved",
    category: "returns",
    subject: "RMA for damaged valve assemblies — ORD-2026-0060",
    customerMessage:
      "Two of the valve assemblies from ORD-2026-0060 arrived with cracked flanges. We need to return these and get replacements. The affected line items are the 3\" SS Gate Valves (line 1). Can you start the RMA process?",
    aiResponse:
      "Hi Rachel,\n\nI'm sorry to hear about the damage. I've initiated the RMA process:\n\n- RMA Number: RMA-2026-0089\n- Order: ORD-2026-0060, Line 1 — 3\" SS Gate Valve Assembly\n- Qty affected: 2 of 4 units\n- Reason: Cracked flanges (shipping damage)\n\nNext steps:\n1. A prepaid return label will be emailed to you within the hour\n2. Once we receive the units, replacements ship same day\n3. Estimated replacement delivery: 5–7 business days\n\nPer our warranty SOP, shipping damage claims are fully covered. No cost to you.\n\nBest,\nHexa Support",
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0060 — Pump station assembly + valves, BOM Review stage" },
      { module: "SOPs", summary: "Returns & RMA Process — shipping damage, full replacement" },
      { module: "Inventory", summary: "SF-3-150 (SS Flange 3\") — 14 in stock, replacement available" },
    ],
    responseTimeSec: 63,
    createdAt: "2026-03-28T16:10:00Z",
    resolvedAt: "2026-03-28T16:11:00Z",
  },
  {
    id: "tkt-007",
    ticketNumber: "TKT-2026-0152",
    customer: {
      name: "David Liu",
      email: "d.liu@coastalhydraulics.com",
      company: "Coastal Hydraulics",
    },
    priority: "low",
    status: "auto_resolved",
    category: "pricing",
    subject: "Current pricing for deep groove bearings — BB-6205",
    customerMessage:
      "We need updated pricing for BB-6205 (Deep Groove Bearing 6205-2RS). We're quoting a job that needs 200 units. What's your best price at that quantity?",
    aiResponse:
      "Hi David,\n\nHere's the current pricing for BB-6205 (Deep Groove Bearing 6205-2RS):\n\n- 1–99 units: $5.10/unit\n- 100–499 units: $4.80/unit\n- 500+ units: $4.55/unit\n\nAt 200 units, your rate would be $4.80/unit ($960 total).\n\nCurrent stock: 1,240 units — no lead time, ships within 24 hours.\n\nWant me to create a formal quote for your records?\n\nBest,\nHexa Support",
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    dataSources: [
      { module: "Product Catalog", summary: "BB-6205 — Deep Groove Bearing 6205-2RS, tiered pricing" },
      { module: "Inventory", summary: "BB-6205 — 1,240 in stock, ships within 24h" },
    ],
    responseTimeSec: 22,
    createdAt: "2026-03-20T09:30:00Z",
    resolvedAt: "2026-03-20T09:31:00Z",
  },

  // ── Escalated ──────────────────────────────────────────────────────────────
  {
    id: "tkt-008",
    ticketNumber: "TKT-2026-0139",
    customer: {
      name: "Sarah Chen",
      email: "s.chen@precisionparts.com",
      company: "Precision Parts Inc.",
    },
    priority: "high",
    status: "escalated",
    category: "technical",
    subject: "Custom brazing alloy not meeting tensile spec — requesting engineering review",
    customerMessage:
      "Custom brazing alloy not meeting tensile spec — requesting engineering review. Our QC found that batch #B2026-0891 of the BAg-24 custom alloy is testing at 82% of the specified tensile strength. We need an engineering review and potential replacement batch.",
    aiResponse: null,
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
    id: "tkt-009",
    ticketNumber: "TKT-2026-0151",
    customer: {
      name: "James Whitfield",
      email: "james.whitfield@acmedist.com",
      company: "Acme Distributors Inc.",
    },
    priority: "high",
    status: "escalated",
    category: "warranty",
    subject: "Hydraulic pump failure after 3 weeks — warranty claim",
    customerMessage:
      "One of the hydraulic pumps from our recent order (ORD-2026-0051) has failed after only 3 weeks of operation. The bearing assembly seized, causing the shaft seal to blow out. Our maintenance team says this is a manufacturing defect. We need a warranty replacement and compensation for our production downtime.",
    aiResponse: null,
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
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0051 — Hydraulic fittings & seals, Clarification Requested" },
      { module: "SOPs", summary: "Warranty Claim Handling — 90-day coverage, downtime claims need approval" },
      { module: "Customer History", summary: "Acme Distributors — $84K annual, 14 orders, priority account" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-21T08:15:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-010",
    ticketNumber: "TKT-2026-0153",
    customer: {
      name: "Emily Watson",
      email: "e.watson@bartonlogistics.co.uk",
      company: "Barton Logistics",
    },
    priority: "high",
    status: "escalated",
    category: "order_status",
    subject: "Urgent — ORD-2026-0055 stuck in production, client deadline at risk",
    customerMessage:
      "Our order ORD-2026-0055 was supposed to ship last week but we haven't received any update. This is a large structural steel order for a construction project with a hard deadline of April 1st. If we miss this delivery, we face liquidated damages. Please escalate immediately.",
    aiResponse: null,
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
    dataSources: [
      { module: "Orders", summary: "ORD-2026-0055 — Structural steel + fasteners, Quote Sent stage" },
      { module: "Production", summary: "Not yet scheduled — needs expedited queue entry" },
      { module: "Customer History", summary: "Barton Logistics — 6 orders in 12mo, UK-based" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-22T07:00:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-011",
    ticketNumber: "TKT-2026-0155",
    customer: {
      name: "Marcus O'Brien",
      email: "m.obrien@greenfieldparts.co.uk",
      company: "Greenfield Parts Co.",
    },
    priority: "medium",
    status: "escalated",
    category: "technical",
    subject: "Cutting fluid concentrate causing corrosion on CNC tooling",
    customerMessage:
      "We've been using the Cutting Fluid Concentrate (FLD-CUT-CONC) from order ORD-2026-0056, and it's causing visible corrosion on our carbide end mills after 48 hours. This has never happened with the previous formulation. Has the supplier changed the formula? We need a technical review urgently.",
    aiResponse: null,
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
    dataSources: [
      { module: "Product Specs", summary: "FLD-CUT-CONC — Cutting Fluid Concentrate, carbide-safe rated" },
      { module: "Orders", summary: "ORD-2026-0056 — 20x FLD-CUT-CONC, delivered Mar 10" },
      { module: "Supplier Records", summary: "New formulation batch received Jan 2026, supplier: ChemTech" },
    ],
    responseTimeSec: null,
    createdAt: "2026-03-25T11:20:00Z",
    resolvedAt: null,
  },

  // ── Pending / In Progress ──────────────────────────────────────────────────
  {
    id: "tkt-012",
    ticketNumber: "TKT-2026-0156",
    customer: {
      name: "Lisa Park",
      email: "l.park@summitfab.com",
      company: "Summit Fabrication",
    },
    priority: "medium",
    status: "pending",
    category: "returns",
    subject: "Return request — wrong gasket kit shipped",
    customerMessage:
      "We received gasket kits from our last order but they're the wrong size. We ordered GK-FL-3 (3\" Flange Gasket Kit) but received GK-FL-2 (2\" kits) instead. Need to arrange a return and get the correct ones shipped ASAP.",
    aiResponse: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    dataSources: [],
    responseTimeSec: null,
    createdAt: "2026-03-29T15:40:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-013",
    ticketNumber: "TKT-2026-0157",
    customer: {
      name: "Kevin Brooks",
      email: "k.brooks@deltamanufacturing.com",
      company: "Delta Manufacturing",
    },
    priority: "low",
    status: "pending",
    category: "order_status",
    subject: "When will Q-2026-0049 quote be ready?",
    customerMessage:
      "Hi, just checking in on the quote we requested (Q-2026-0049). We submitted the RFQ last week for shaft collars, bearings, and gasket packs. When can we expect the formal quote? We'd like to place the PO this week if possible.",
    aiResponse: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
    dataSources: [],
    responseTimeSec: null,
    createdAt: "2026-03-30T09:15:00Z",
    resolvedAt: null,
  },
  {
    id: "tkt-014",
    ticketNumber: "TKT-2026-0158",
    customer: {
      name: "Amanda Foster",
      email: "a.foster@precisiontools.com",
      company: "Precision Tools Inc.",
    },
    priority: "medium",
    status: "in_progress",
    category: "warranty",
    subject: "Anti-vibration mounts degrading prematurely",
    customerMessage:
      "We purchased 200 Rubber Anti-Vibration Mounts (MNT-AVB-M8-RBR) about 6 weeks ago. Around 15% of them are showing significant rubber degradation and have lost their damping properties. These are rated for 12+ months in our operating environment. Is this covered under warranty?",
    aiResponse: null,
    escalationReason: null,
    aiContextSummary: null,
    assignedTo: null,
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
