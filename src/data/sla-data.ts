// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskTier = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Metric = "ON_TIME_DELIVERY" | "FILL_RATE" | "QUALITY_PPM" | "RESPONSE_TIME_HOURS";
export type Recommendation = "CLAIM" | "DO_NOT_CLAIM" | "REVIEW";
export type Status = "OPEN" | "SENT" | "ACKNOWLEDGED" | "CREDITED" | "CLOSED";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";
export type EventType = "PO_CREATED" | "CONFIRMED" | "CHANGE_REQUEST" | "DELAY_NOTICE" | "DELIVERED" | "NCR_RAISED";

export interface Supplier {
  id: string;
  name: string;
  category: string;
  accountOwner: string;
  riskTier: RiskTier;
  email: string;
}

export interface SlaRule {
  id: string;
  supplierId: string;
  metric: Metric;
  threshold: number;
  unit: string;
  graceDays: number;
  creditType: "PERCENT_INVOICE" | "FIXED_AMOUNT";
  creditValue: number;
  description: string;
}

export interface OrderEvent {
  id: string;
  type: EventType;
  occurredAt: string;
  source: "ERP" | "EMAIL" | "MANUAL";
  note: string;
  evidenceUrl: string | null;
}

export interface CreditOpportunity {
  id: string;
  supplierId: string;
  supplierName: string;
  poNumber: string;
  item: string;
  invoiceValue: number;
  qtyOrdered: number;
  qtyReceived: number;
  metric: Metric;
  threshold: number;
  actualValue: number;
  breachMargin: string;
  breachSummary: string;
  creditAmount: number;
  recommendation: Recommendation;
  rationale: string[];
  confidence: Confidence;
  status: Status;
  createdAt: string;
  ruleDescription: string;
  timeline: OrderEvent[];
}

export interface SupplierPerformance {
  month: string;
  onTimeDelivery: number;
  fillRate: number;
  qualityPpm: number;
  avgResponseHours: number;
  totalShipments: number;
  totalUnits: number;
  totalValue: number;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const slaSuppliers: Supplier[] = [
  {
    id: "sup-apex",
    name: "Brighton-Best International",
    category: "Master Distributor",
    accountOwner: "Sarah Chen",
    riskTier: "LOW",
    email: "ar@brightonbest.com",
  },
  {
    id: "sup-novapack",
    name: "Earnest Machine Products",
    category: "Master Distributor",
    accountOwner: "James Wilson",
    riskTier: "LOW",
    email: "billing@earnestmachine.com",
  },
  {
    id: "sup-steelcore",
    name: "TR Fastenings UK Ltd",
    category: "Offshore Mill",
    accountOwner: "Maria Rodriguez",
    riskTier: "HIGH",
    email: "ar@trfastenings.com",
  },
  {
    id: "sup-quickship",
    name: "Pacific Rim Fasteners",
    category: "Asian Importer",
    accountOwner: "David Kim",
    riskTier: "CRITICAL",
    email: "ar@pacificrimfasteners.com",
  },
  {
    id: "sup-precisiontech",
    name: "Würth Industrial Network",
    category: "Specialty Distributor",
    accountOwner: "Anna Mueller",
    riskTier: "MEDIUM",
    email: "ar@wurthindustry.com",
  },
];

// ─── SLA Rules ────────────────────────────────────────────────────────────────

export const slaRules: SlaRule[] = [
  { id: "rule-1", supplierId: "sup-apex", metric: "ON_TIME_DELIVERY", threshold: 95, unit: "%", graceDays: 2, creditType: "PERCENT_INVOICE", creditValue: 5, description: "OTIF ≥ 95% with 2-day grace period" },
  { id: "rule-2", supplierId: "sup-apex", metric: "QUALITY_PPM", threshold: 500, unit: "PPM", graceDays: 0, creditType: "PERCENT_INVOICE", creditValue: 8, description: "Defect rate must not exceed 500 PPM" },
  { id: "rule-3", supplierId: "sup-apex", metric: "FILL_RATE", threshold: 98, unit: "%", graceDays: 0, creditType: "PERCENT_INVOICE", creditValue: 3, description: "Order fill rate ≥ 98%" },
  { id: "rule-4", supplierId: "sup-novapack", metric: "ON_TIME_DELIVERY", threshold: 90, unit: "%", graceDays: 1, creditType: "PERCENT_INVOICE", creditValue: 4, description: "OTIF ≥ 90% with 1-day grace" },
  { id: "rule-5", supplierId: "sup-novapack", metric: "FILL_RATE", threshold: 95, unit: "%", graceDays: 0, creditType: "FIXED_AMOUNT", creditValue: 500, description: "Fill rate ≥ 95%, £500 fixed penalty" },
  { id: "rule-6", supplierId: "sup-novapack", metric: "RESPONSE_TIME_HOURS", threshold: 48, unit: "hrs", graceDays: 0, creditType: "FIXED_AMOUNT", creditValue: 200, description: "Supplier must respond within 48 hours" },
  { id: "rule-7", supplierId: "sup-steelcore", metric: "ON_TIME_DELIVERY", threshold: 92, unit: "%", graceDays: 3, creditType: "PERCENT_INVOICE", creditValue: 6, description: "OTIF ≥ 92% with 3-day grace" },
  { id: "rule-8", supplierId: "sup-steelcore", metric: "QUALITY_PPM", threshold: 300, unit: "PPM", graceDays: 0, creditType: "PERCENT_INVOICE", creditValue: 10, description: "Strict quality: defect rate ≤ 300 PPM" },
  { id: "rule-9", supplierId: "sup-steelcore", metric: "FILL_RATE", threshold: 97, unit: "%", graceDays: 0, creditType: "PERCENT_INVOICE", creditValue: 5, description: "Order fill rate ≥ 97%" },
  { id: "rule-10", supplierId: "sup-quickship", metric: "ON_TIME_DELIVERY", threshold: 98, unit: "%", graceDays: 0, creditType: "PERCENT_INVOICE", creditValue: 10, description: "OTIF ≥ 98%, no grace period" },
  { id: "rule-11", supplierId: "sup-quickship", metric: "RESPONSE_TIME_HOURS", threshold: 24, unit: "hrs", graceDays: 0, creditType: "FIXED_AMOUNT", creditValue: 300, description: "Must respond within 24 hours" },
  { id: "rule-12", supplierId: "sup-quickship", metric: "FILL_RATE", threshold: 99, unit: "%", graceDays: 0, creditType: "PERCENT_INVOICE", creditValue: 7, description: "Fill rate ≥ 99%" },
  { id: "rule-13", supplierId: "sup-precisiontech", metric: "ON_TIME_DELIVERY", threshold: 93, unit: "%", graceDays: 2, creditType: "PERCENT_INVOICE", creditValue: 5, description: "OTIF ≥ 93% with 2-day grace" },
  { id: "rule-14", supplierId: "sup-precisiontech", metric: "QUALITY_PPM", threshold: 200, unit: "PPM", graceDays: 0, creditType: "PERCENT_INVOICE", creditValue: 12, description: "Ultra-strict quality: ≤ 200 PPM" },
  { id: "rule-15", supplierId: "sup-precisiontech", metric: "RESPONSE_TIME_HOURS", threshold: 36, unit: "hrs", graceDays: 0, creditType: "FIXED_AMOUNT", creditValue: 250, description: "Must respond within 36 hours" },
];

// ─── Credit Opportunities (10 total) ─────────────────────────────────────────

export const creditOpportunities: CreditOpportunity[] = [
  {
    id: "opp-1",
    supplierId: "sup-apex",
    supplierName: "Brighton-Best International",
    poNumber: "PO-2024-1847",
    item: "M8x25 Grade 10.9 Flange Bolt — Zinc (FB-M8X25-1090-ZN)",
    invoiceValue: 25000,
    qtyOrdered: 200000,
    qtyReceived: 200000,
    metric: "ON_TIME_DELIVERY",
    threshold: 95,
    actualValue: 0,
    breachMargin: "12 days late",
    breachSummary: "M8 flange-bolt blanket release delivered 12 days late (grace: 2 days). Apex Wabash line-side stockout risk; emergency air freight backup required.",
    creditAmount: 1250,
    recommendation: "CLAIM",
    rationale: [
      "Delivered 12 days late (promised 15 Nov, actual 27 Nov, 2-day grace exceeded by 10 days)",
      "Credit: $1,250.00 (5% of $25,000 invoice)",
      "No mitigating events — supplier sent delay notice but did not offer remediation",
      "High confidence: clear breach with strong evidence trail",
    ],
    confidence: "HIGH",
    status: "OPEN",
    createdAt: "2025-11-28",
    ruleDescription: "OTIF ≥ 95% with 2-day grace period — 5% credit on invoice",
    timeline: [
      { id: "ev-1", type: "PO_CREATED", occurredAt: "2025-11-01T09:00:00Z", source: "ERP", note: "Purchase order PO-2024-1847 created for 200,000 M8x25 Grade 10.9 flange bolts", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-1847" },
      { id: "ev-2", type: "CONFIRMED", occurredAt: "2025-11-02T14:30:00Z", source: "EMAIL", note: "Supplier confirmed order. Promised delivery: 15 Nov 2025", evidenceUrl: "https://erp.hexa.com/emails/PO-2024-1847-confirm" },
      { id: "ev-3", type: "DELAY_NOTICE", occurredAt: "2025-11-13T10:15:00Z", source: "EMAIL", note: "Supplier notified of expected 7-day delay due to coil-stock shortage at heading partner", evidenceUrl: "https://erp.hexa.com/emails/PO-2024-1847-delay" },
      { id: "ev-4", type: "DELIVERED", occurredAt: "2025-11-27T16:00:00Z", source: "ERP", note: "Order delivered. Qty received: 200,000/200,000. 12 days past promised date.", evidenceUrl: "https://erp.hexa.com/receiving/PO-2024-1847" },
    ],
  },
  {
    id: "opp-2",
    supplierId: "sup-apex",
    supplierName: "Brighton-Best International",
    poNumber: "PO-2024-1903",
    item: "M10 Nylock Nut Grade 8 — Zinc (NUT-NYL-M10-ZN)",
    invoiceValue: 8000,
    qtyOrdered: 150,
    qtyReceived: 150,
    metric: "ON_TIME_DELIVERY",
    threshold: 95,
    actualValue: 0,
    breachMargin: "6 days late",
    breachSummary: "Delivered 6 days after promised date, but buyer issued a change request 1 day before the promised date (head-marking spec change).",
    creditAmount: 400,
    recommendation: "DO_NOT_CLAIM",
    rationale: [
      "Delivered 6 days late (promised 20 Dec, actual 26 Dec)",
      "However: buyer issued CHANGE_REQUEST on 19 Dec (1 day before promised date) requiring different head marking",
      "Change request required supplier to rerun heading dies and re-stamp",
      "Credit would be $400.00 but claim is not recommended due to buyer-caused delay",
    ],
    confidence: "HIGH",
    status: "OPEN",
    createdAt: "2025-12-27",
    ruleDescription: "OTIF ≥ 95% with 2-day grace period — 5% credit on invoice",
    timeline: [
      { id: "ev-5", type: "PO_CREATED", occurredAt: "2025-12-10T09:00:00Z", source: "ERP", note: "Purchase order PO-2024-1903 created for 80,000 M10 nylock nuts", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-1903" },
      { id: "ev-6", type: "CONFIRMED", occurredAt: "2025-12-11T11:00:00Z", source: "EMAIL", note: "Supplier confirmed order. Promised delivery: 20 Dec 2025", evidenceUrl: "https://erp.hexa.com/emails/PO-2024-1903-confirm" },
      { id: "ev-7", type: "CHANGE_REQUEST", occurredAt: "2025-12-19T15:30:00Z", source: "EMAIL", note: "Buyer requested head-marking spec change — different manufacturer ID for OEM traceability", evidenceUrl: "https://erp.hexa.com/changes/PO-2024-1903-CR1" },
      { id: "ev-8", type: "DELIVERED", occurredAt: "2025-12-26T14:00:00Z", source: "ERP", note: "Order delivered. Qty received: 80,000/80,000. 6 days past original promised date.", evidenceUrl: "https://erp.hexa.com/receiving/PO-2024-1903" },
    ],
  },
  {
    id: "opp-3",
    supplierId: "sup-steelcore",
    supplierName: "TR Fastenings UK Ltd",
    poNumber: "PO-2024-2010",
    item: "M10x40 Hex Bolt Grade 10.9 — Zinc (HEX-M10X40-1090-ZN)",
    invoiceValue: 45000,
    qtyOrdered: 100000,
    qtyReceived: 100000,
    metric: "QUALITY_PPM",
    threshold: 300,
    actualValue: 380,
    breachMargin: "80 PPM over threshold",
    breachSummary: "Defect rate of 380 PPM (cracked heads in heading process) exceeds the 300 PPM threshold by 80 PPM. Borderline breach — first occurrence for this supplier.",
    creditAmount: 4500,
    recommendation: "REVIEW",
    rationale: [
      "Defect PPM: 380 vs threshold of 300 (27% over limit) — cracked-head defects from heading die wear",
      "Credit: £4,500.00 (10% of £45,000 invoice)",
      "First quality breach for TR Fastenings UK in 12 months",
      "Supplier has proactively offered corrective action plan + new heading dies",
      "Recommend manual review: high credit value but relationship considerations apply",
    ],
    confidence: "MEDIUM",
    status: "OPEN",
    createdAt: "2025-12-15",
    ruleDescription: "Strict quality control: defect rate must not exceed 300 PPM — 10% credit on invoice",
    timeline: [
      { id: "ev-9", type: "PO_CREATED", occurredAt: "2025-11-20T09:00:00Z", source: "ERP", note: "Purchase order PO-2024-2010 created for 100,000 M10x40 Grade 10.9 hex bolts", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-2010" },
      { id: "ev-10", type: "CONFIRMED", occurredAt: "2025-11-21T10:00:00Z", source: "EMAIL", note: "Supplier confirmed order. Promised delivery: 5 Dec 2025", evidenceUrl: null },
      { id: "ev-11", type: "DELIVERED", occurredAt: "2025-12-04T15:00:00Z", source: "ERP", note: "Order delivered on time. Qty received: 100,000/100,000.", evidenceUrl: "https://erp.hexa.com/receiving/PO-2024-2010" },
      { id: "ev-12", type: "NCR_RAISED", occurredAt: "2025-12-10T09:30:00Z", source: "ERP", note: "Non-conformance report raised. Incoming inspection found 380 PPM cracked-head defects.", evidenceUrl: "https://erp.hexa.com/ncr/PO-2024-2010-NCR1" },
    ],
  },
  {
    id: "opp-4",
    supplierId: "sup-quickship",
    supplierName: "Pacific Rim Fasteners",
    poNumber: "PO-2024-1955",
    item: 'Huck BOM 5/16" Blind Rivet (HUCK-BOM-516-300) — Container Load',
    invoiceValue: 12000,
    qtyOrdered: 18000,
    qtyReceived: 18000,
    metric: "ON_TIME_DELIVERY",
    threshold: 98,
    actualValue: 0,
    breachMargin: "12 days late",
    breachSummary: "Container of Huck BOM rivets arrived 12 days late with no grace period. Caused $48k air-freight backup shipment to keep customer line running.",
    creditAmount: 1200,
    recommendation: "CLAIM",
    rationale: [
      "Delivered 12 days late (promised 3 Dec, actual 15 Dec, no grace period)",
      "Credit: $1,200.00 (10% of $12,000 invoice)",
      "Caused $48k air-freight backup shipment from Kanebridge — documented in internal report",
      "Third late container from Pacific Rim this quarter",
    ],
    confidence: "HIGH",
    status: "SENT",
    createdAt: "2025-12-12",
    ruleDescription: "OTIF ≥ 98%, no grace period — 10% credit on invoice",
    timeline: [
      { id: "ev-13", type: "PO_CREATED", occurredAt: "2025-09-25T09:00:00Z", source: "ERP", note: "Purchase order PO-2024-1955 created for 18,000x Huck BOM 5/16 rivets — container load", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-1955" },
      { id: "ev-14", type: "CONFIRMED", occurredAt: "2025-09-25T12:00:00Z", source: "EMAIL", note: "Supplier confirmed. Promised delivery: 3 Dec 2025 (10-week container lead time)", evidenceUrl: "https://erp.hexa.com/emails/PO-2024-1955-confirm" },
      { id: "ev-15", type: "DELAY_NOTICE", occurredAt: "2025-11-25T08:00:00Z", source: "EMAIL", note: "Supplier cited port congestion + vessel routing change. Estimated 7-day delay.", evidenceUrl: "https://erp.hexa.com/emails/PO-2024-1955-delay" },
      { id: "ev-16", type: "DELIVERED", occurredAt: "2025-12-15T17:00:00Z", source: "ERP", note: "Container delivered 12 days late. Contents intact, qty matches manifest.", evidenceUrl: "https://erp.hexa.com/receiving/PO-2024-1955" },
    ],
  },
  {
    id: "opp-5",
    supplierId: "sup-novapack",
    supplierName: "Earnest Machine Products",
    poNumber: "PO-2024-1888",
    item: "M6 Zinc-Plated Flat Washer (WSH-M6-ZP) — Bulk Box",
    invoiceValue: 15000,
    qtyOrdered: 500,
    qtyReceived: 410,
    metric: "FILL_RATE",
    threshold: 95,
    actualValue: 82,
    breachMargin: "13% under threshold",
    breachSummary: "Only 82% of ordered washer boxes delivered. 410 of 500 boxes received (4.1M of 5M washers).",
    creditAmount: 500,
    recommendation: "CLAIM",
    rationale: [
      "Fill rate: 82% vs 95% threshold (13 percentage points below)",
      "Credit: $500.00 (fixed penalty per SLA contract)",
      "Supplier acknowledged shortfall, cited cold-heading wire-rod shortage",
      "No buyer-caused contributing factors identified",
    ],
    confidence: "HIGH",
    status: "OPEN",
    createdAt: "2025-12-08",
    ruleDescription: "Order fill rate ≥ 95% — $500 fixed penalty per breach",
    timeline: [
      { id: "ev-17", type: "PO_CREATED", occurredAt: "2025-11-18T09:00:00Z", source: "ERP", note: "Purchase order PO-2024-1888 for 500 boxes M6 zinc washers (10,000/box)", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-1888" },
      { id: "ev-18", type: "CONFIRMED", occurredAt: "2025-11-19T10:30:00Z", source: "EMAIL", note: "Order confirmed. Delivery promised: 2 Dec 2025", evidenceUrl: null },
      { id: "ev-19", type: "DELIVERED", occurredAt: "2025-12-02T14:00:00Z", source: "ERP", note: "Partial delivery: 410 of 500 boxes received (82% fill rate)", evidenceUrl: "https://erp.hexa.com/receiving/PO-2024-1888" },
    ],
  },
  {
    id: "opp-6",
    supplierId: "sup-precisiontech",
    supplierName: "Würth Industrial Network",
    poNumber: "PO-2024-2045",
    item: "Custom Shoulder Bolt 4mm x 12mm — PPAP (PPAP-CSB-4MMX12)",
    invoiceValue: 32000,
    qtyOrdered: 25000,
    qtyReceived: 25000,
    metric: "QUALITY_PPM",
    threshold: 200,
    actualValue: 850,
    breachMargin: "650 PPM over threshold",
    breachSummary: "Defect rate of 850 PPM on PPAP-required custom shoulder bolt — shoulder Ø out of h7 tolerance on 850/M units. Customer Apex rejected the lot during incoming inspection.",
    creditAmount: 3840,
    recommendation: "CLAIM",
    rationale: [
      "Defect PPM: 850 vs threshold of 200 (325% over limit)",
      "Credit: $3,840.00 (12% of $32,000 invoice)",
      "PPAP-rejected at customer — full lot quarantined and returned",
      "NCR raised with full inspection report + Cpk data as evidence",
    ],
    confidence: "HIGH",
    status: "OPEN",
    createdAt: "2026-01-05",
    ruleDescription: "Ultra-strict quality: defect rate ≤ 200 PPM — 12% credit on invoice",
    timeline: [
      { id: "ev-20", type: "PO_CREATED", occurredAt: "2025-12-15T09:00:00Z", source: "ERP", note: "Purchase order PO-2024-2045 for 25,000x PPAP custom shoulder bolts", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-2045" },
      { id: "ev-21", type: "CONFIRMED", occurredAt: "2025-12-16T09:30:00Z", source: "EMAIL", note: "Order confirmed. Delivery promised: 30 Dec 2025. PPAP package included.", evidenceUrl: "https://erp.hexa.com/emails/PO-2024-2045-confirm" },
      { id: "ev-22", type: "DELIVERED", occurredAt: "2025-12-29T14:00:00Z", source: "ERP", note: "Order delivered on time. Qty: 25,000/25,000", evidenceUrl: "https://erp.hexa.com/receiving/PO-2024-2045" },
      { id: "ev-23", type: "NCR_RAISED", occurredAt: "2026-01-03T11:00:00Z", source: "ERP", note: "NCR raised: customer Apex incoming inspection measured 850 PPM (shoulder-Ø out of h7 tol). Full batch quarantined.", evidenceUrl: "https://erp.hexa.com/ncr/PO-2024-2045-NCR1" },
    ],
  },
  {
    id: "opp-7",
    supplierId: "sup-quickship",
    supplierName: "Pacific Rim Fasteners",
    poNumber: "PO-2024-2088",
    item: "M5 K-Lock (Keps) Nut — Zinc (NUT-KEPS-M5-ZN)",
    invoiceValue: 800,
    qtyOrdered: 1,
    qtyReceived: 1,
    metric: "ON_TIME_DELIVERY",
    threshold: 98,
    actualValue: 0,
    breachMargin: "3 days late",
    breachSummary: "3-day delay on low-value delivery. Credit amount below minimum claim threshold.",
    creditAmount: 80,
    recommendation: "DO_NOT_CLAIM",
    rationale: [
      "Delivered 3 days late (promised 10 Jan, actual 13 Jan)",
      "Credit: £80.00 (10% of £800 invoice)",
      "Below minimum claim threshold of £100",
      "Administrative cost of claim exceeds credit value",
    ],
    confidence: "HIGH",
    status: "CLOSED",
    createdAt: "2026-01-14",
    ruleDescription: "OTIF ≥ 98%, no grace period — 10% credit on invoice",
    timeline: [
      { id: "ev-24", type: "PO_CREATED", occurredAt: "2026-01-05T09:00:00Z", source: "ERP", note: "PO created for 4,000x M5 K-Lock nuts", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-2088" },
      { id: "ev-25", type: "CONFIRMED", occurredAt: "2026-01-05T10:00:00Z", source: "EMAIL", note: "Confirmed. Delivery: 10 Jan 2026", evidenceUrl: null },
      { id: "ev-26", type: "DELIVERED", occurredAt: "2026-01-13T16:00:00Z", source: "ERP", note: "Delivered 3 days late.", evidenceUrl: "https://erp.hexa.com/receiving/PO-2024-2088" },
    ],
  },
  {
    id: "opp-8",
    supplierId: "sup-steelcore",
    supplierName: "TR Fastenings UK Ltd",
    poNumber: "PO-2024-2102",
    item: "M12x40 Hex Bolt Grade 8.8 — Zinc (HEX-M12X40-88-ZN)",
    invoiceValue: 18500,
    qtyOrdered: 2000,
    qtyReceived: 2000,
    metric: "ON_TIME_DELIVERY",
    threshold: 92,
    actualValue: 0,
    breachMargin: "9 days late (grace: 3 days)",
    breachSummary: "Delivery arrived 9 days late. Even with 3-day grace, breach exceeded by 6 days.",
    creditAmount: 1110,
    recommendation: "CLAIM",
    rationale: [
      "Delivered 9 days late (promised 5 Jan, actual 14 Jan, 3-day grace exceeded by 6 days)",
      "Credit: £1,110.00 (6% of £18,500 invoice)",
      "Second consecutive late delivery from TR Fastenings UK",
      "Pattern of delays suggests systemic capacity issue",
    ],
    confidence: "HIGH",
    status: "OPEN",
    createdAt: "2026-01-15",
    ruleDescription: "OTIF ≥ 92% with 3-day grace period — 6% credit on invoice",
    timeline: [
      { id: "ev-27", type: "PO_CREATED", occurredAt: "2025-12-20T09:00:00Z", source: "ERP", note: "PO created for 60,000x M12x40 Grade 8.8 hex bolts", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-2102" },
      { id: "ev-28", type: "CONFIRMED", occurredAt: "2025-12-21T11:00:00Z", source: "EMAIL", note: "Confirmed. Delivery: 5 Jan 2026", evidenceUrl: "https://erp.hexa.com/emails/PO-2024-2102-confirm" },
      { id: "ev-29", type: "DELAY_NOTICE", occurredAt: "2026-01-04T09:00:00Z", source: "EMAIL", note: "Supplier notified of production delay. New ETA: 12 Jan", evidenceUrl: "https://erp.hexa.com/emails/PO-2024-2102-delay" },
      { id: "ev-30", type: "DELIVERED", occurredAt: "2026-01-14T15:30:00Z", source: "ERP", note: "Delivered 9 days late. Full qty received.", evidenceUrl: "https://erp.hexa.com/receiving/PO-2024-2102" },
    ],
  },
  {
    id: "opp-9",
    supplierId: "sup-novapack",
    supplierName: "Earnest Machine Products",
    poNumber: "PO-2024-2067",
    item: "F436 1/2\" Structural Flat Washer — HDG (WS-F436-12-HDG)",
    invoiceValue: 5000,
    qtyOrdered: 2000,
    qtyReceived: 0,
    metric: "RESPONSE_TIME_HOURS",
    threshold: 48,
    actualValue: 72,
    breachMargin: "24 hours over threshold",
    breachSummary: "Supplier took 72 hours to respond to urgent PPAP-package question — 24 hours over the 48-hour SLA.",
    creditAmount: 200,
    recommendation: "REVIEW",
    rationale: [
      "Response time: 72 hours vs 48-hour SLA (50% over threshold)",
      "Credit: $200.00 (fixed penalty)",
      "Occurred during holiday period — supplier staffing may have been reduced",
      "First response time breach for Earnest Machine — consider issuing warning instead",
    ],
    confidence: "LOW",
    status: "OPEN",
    createdAt: "2026-01-20",
    ruleDescription: "Supplier must respond within 48 hours — £200 fixed penalty",
    timeline: [
      { id: "ev-31", type: "PO_CREATED", occurredAt: "2026-01-10T09:00:00Z", source: "ERP", note: "PO created for 8,000x F436 1/2\" structural washers", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-2067" },
      { id: "ev-32", type: "CONFIRMED", occurredAt: "2026-01-11T14:00:00Z", source: "EMAIL", note: "Order confirmed. Delivery: 25 Jan 2026", evidenceUrl: null },
    ],
  },
  {
    id: "opp-10",
    supplierId: "sup-precisiontech",
    supplierName: "Würth Industrial Network",
    poNumber: "PO-2024-1790",
    item: "Helicoil M10x1.5 Tangless Insert (HEL-M10X150-TL)",
    invoiceValue: 9800,
    qtyOrdered: 500,
    qtyReceived: 500,
    metric: "ON_TIME_DELIVERY",
    threshold: 93,
    actualValue: 0,
    breachMargin: "7 days late",
    breachSummary: "Delivery was 7 days late. Claim submitted and credit received.",
    creditAmount: 490,
    recommendation: "CLAIM",
    rationale: [
      "Delivered 7 days late (promised 10 Nov, actual 17 Nov, 2-day grace exceeded by 5 days)",
      "Credit: £490.00 (5% of £9,800 invoice)",
      "Claim submitted on 20 Nov, credit note received 5 Dec",
    ],
    confidence: "HIGH",
    status: "CREDITED",
    createdAt: "2025-11-18",
    ruleDescription: "OTIF ≥ 93% with 2-day grace — 5% credit on invoice",
    timeline: [
      { id: "ev-33", type: "PO_CREATED", occurredAt: "2025-10-28T09:00:00Z", source: "ERP", note: "PO created for 3,500x Helicoil M10x1.5 tangless inserts", evidenceUrl: "https://erp.hexa.com/docs/PO-2024-1790" },
      { id: "ev-34", type: "CONFIRMED", occurredAt: "2025-10-29T10:00:00Z", source: "EMAIL", note: "Confirmed. Delivery: 10 Nov 2025", evidenceUrl: null },
      { id: "ev-35", type: "DELIVERED", occurredAt: "2025-11-17T14:00:00Z", source: "ERP", note: "Delivered 7 days late. Full qty.", evidenceUrl: "https://erp.hexa.com/receiving/PO-2024-1790" },
    ],
  },
];

// ─── Supplier Performance (precomputed monthly) ─────────────────────────────

export const supplierPerformance: Record<string, SupplierPerformance[]> = {
  "sup-apex": [
    { month: "Nov 2025", onTimeDelivery: 83, fillRate: 100, qualityPpm: 180, avgResponseHours: 12, totalShipments: 6, totalUnits: 1240, totalValue: 25000 },
    { month: "Dec 2025", onTimeDelivery: 75, fillRate: 98, qualityPpm: 210, avgResponseHours: 18, totalShipments: 4, totalUnits: 680, totalValue: 33000 },
    { month: "Jan 2026", onTimeDelivery: 92, fillRate: 100, qualityPpm: 150, avgResponseHours: 8, totalShipments: 18, totalUnits: 4750, totalValue: 91500 },
  ],
  "sup-novapack": [
    { month: "Nov 2025", onTimeDelivery: 95, fillRate: 88, qualityPpm: 90, avgResponseHours: 22, totalShipments: 22, totalUnits: 48500, totalValue: 67000 },
    { month: "Dec 2025", onTimeDelivery: 92, fillRate: 82, qualityPpm: 75, avgResponseHours: 45, totalShipments: 15, totalUnits: 32000, totalValue: 42000 },
    { month: "Jan 2026", onTimeDelivery: 98, fillRate: 96, qualityPpm: 60, avgResponseHours: 72, totalShipments: 31, totalUnits: 71000, totalValue: 85000 },
  ],
  "sup-steelcore": [
    { month: "Nov 2025", onTimeDelivery: 88, fillRate: 97, qualityPpm: 380, avgResponseHours: 16, totalShipments: 9, totalUnits: 6800, totalValue: 112000 },
    { month: "Dec 2025", onTimeDelivery: 85, fillRate: 95, qualityPpm: 290, avgResponseHours: 20, totalShipments: 7, totalUnits: 4200, totalValue: 78000 },
    { month: "Jan 2026", onTimeDelivery: 78, fillRate: 99, qualityPpm: 250, avgResponseHours: 14, totalShipments: 14, totalUnits: 11500, totalValue: 156000 },
  ],
  "sup-quickship": [
    { month: "Nov 2025", onTimeDelivery: 90, fillRate: 99, qualityPpm: 0, avgResponseHours: 8, totalShipments: 45, totalUnits: 45, totalValue: 38000 },
    { month: "Dec 2025", onTimeDelivery: 82, fillRate: 100, qualityPpm: 0, avgResponseHours: 12, totalShipments: 52, totalUnits: 52, totalValue: 41000 },
    { month: "Jan 2026", onTimeDelivery: 88, fillRate: 98, qualityPpm: 0, avgResponseHours: 28, totalShipments: 38, totalUnits: 38, totalValue: 29500 },
  ],
  "sup-precisiontech": [
    { month: "Nov 2025", onTimeDelivery: 86, fillRate: 100, qualityPpm: 120, avgResponseHours: 10, totalShipments: 3, totalUnits: 820, totalValue: 18700 },
    { month: "Dec 2025", onTimeDelivery: 93, fillRate: 100, qualityPpm: 850, avgResponseHours: 15, totalShipments: 5, totalUnits: 1450, totalValue: 41800 },
    { month: "Jan 2026", onTimeDelivery: 95, fillRate: 100, qualityPpm: 180, avgResponseHours: 12, totalShipments: 8, totalUnits: 2600, totalValue: 62000 },
  ],
};

// ─── Helper functions ────────────────────────────────────────────────────────

export function getSupplier(id: string): Supplier | undefined {
  return slaSuppliers.find((s) => s.id === id);
}

export function getOpportunity(id: string): CreditOpportunity | undefined {
  return creditOpportunities.find((o) => o.id === id);
}

export function getSupplierOpportunities(supplierId: string): CreditOpportunity[] {
  return creditOpportunities.filter((o) => o.supplierId === supplierId);
}

export function getSupplierRules(supplierId: string): SlaRule[] {
  return slaRules.filter((r) => r.supplierId === supplierId);
}

export function getSupplierPerformance(supplierId: string): SupplierPerformance[] {
  return supplierPerformance[supplierId] || [];
}

// ─── Metric display helpers ─────────────────────────────────────────────────

export const metricLabels: Record<Metric, string> = {
  ON_TIME_DELIVERY: "OTIF",
  FILL_RATE: "Fill Rate",
  QUALITY_PPM: "Quality (PPM)",
  RESPONSE_TIME_HOURS: "Response Time",
};

export const eventTypeLabels: Record<EventType, string> = {
  PO_CREATED: "PO Created",
  CONFIRMED: "Order Confirmed",
  CHANGE_REQUEST: "Change Request",
  DELAY_NOTICE: "Delay Notice",
  DELIVERED: "Delivered",
  NCR_RAISED: "NCR Raised",
};
