// Shared finance types for Accounts Payable + Accounts Receivable.

export type Currency = "GBP" | "USD" | "EUR";

// ─── Accounts Payable ─────────────────────────────────────────────────────────

export type APInvoiceStatus =
  | "received"
  | "matching"
  | "exception"
  | "awaiting_supplier"
  | "ready_to_approve"
  | "approved"
  | "paid"
  | "on_hold";

export type APMatchResult =
  | "exact"
  | "within_tolerance"
  | "qty_mismatch"
  | "price_mismatch"
  | "duplicate"
  | "missing_po"
  | "tax_mismatch"
  | "line_missing"
  | "freight_mismatch";

export interface APSupplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  paymentTerms: string;
  address: string;
}

export interface APMatchLine {
  id: string;
  sku: string;
  description: string;
  poQty: number;
  poUnitPrice: number;
  invoiceQty: number;
  invoiceUnitPrice: number;
  receivedQty: number;
  matches: boolean;
  diffNote?: string;
}

export interface APInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  poNumber: string;
  receivedAt: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  freightAmount: number;
  totalAmount: number;
  poTotalAmount: number;
  currency: Currency;
  status: APInvoiceStatus;
  matchResult: APMatchResult;
  matchConfidence: number;
  discrepancyAmount: number;
  discrepancySummary: string;
  matchLines: APMatchLine[];
  agentTimeline: AgentEvent[];
  emails: EmailRecord[];
  shipTo: string;
  billTo: string;
  // Demo flow position when the user opens the detail. The "Run next step" advances from here.
  initialDemoStage: APDemoStage;
}

// ─── Accounts Receivable ──────────────────────────────────────────────────────

export type ARInvoiceStatus =
  | "issued"
  | "viewed"
  | "approaching_due"
  | "overdue"
  | "promise_to_pay"
  | "in_dispute"
  | "partial_paid"
  | "paid"
  | "written_off"
  | "escalated";

export type FollowupChannel = "email" | "voice" | "chat";

export type FollowupOutcome =
  | "delivered"
  | "opened"
  | "no_response"
  | "promised"
  | "disputed"
  | "completed_call"
  | "voicemail"
  | "no_answer"
  | "bounced"
  | "paid";

export interface ARCustomer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  paymentTerms: string;
  agreedSlaDays: number;
  contractRef: string;
  avgDsoDays: number;
  lifetimeValue: number;
  paymentBehaviourScore: number; // 0-100, higher = better
}

export interface ARInvoiceLine {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface VoiceTranscriptLine {
  speaker: string;
  role: "agent" | "customer";
  text: string;
  highlights?: string[];
}

export interface FollowupAttempt {
  id: string;
  dayOffset: number; // days since invoice issued
  occurredAt: string;
  channel: FollowupChannel;
  outcome: FollowupOutcome;
  subject?: string;
  emailBody?: string;
  voiceTranscript?: VoiceTranscriptLine[];
  voiceDurationSeconds?: number;
  voiceSentiment?: "positive" | "neutral" | "negative";
  voiceOutcomeSummary?: string;
  notes?: string;
}

export interface ARInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  issuedAt: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  currency: Currency;
  paymentTerms: string;
  agreedSlaDays: number;
  daysOverdue: number;
  status: ARInvoiceStatus;
  lines: ARInvoiceLine[];
  followups: FollowupAttempt[];
  agentTimeline: AgentEvent[];
  promiseToPayDate?: string;
  disputeReason?: string;
  shipTo: string;
  billTo: string;
  initialDemoStage: ARDemoStage;
}

// ─── Shared timeline + email ──────────────────────────────────────────────────

export type AgentEventType =
  | "invoice_received"
  | "fields_extracted"
  | "po_linked"
  | "match_run"
  | "discrepancy_flagged"
  | "history_checked"
  | "email_drafted"
  | "email_sent"
  | "awaiting_reply"
  | "reply_received"
  | "rematch_clean"
  | "approved"
  | "paid"
  | "invoice_issued"
  | "reminder_drafted"
  | "reminder_sent"
  | "reminder_opened"
  | "reminder_bounced"
  | "voice_call_placed"
  | "voice_call_completed"
  | "promise_logged"
  | "promise_broken"
  | "dispute_raised"
  | "dispute_resolved"
  | "payment_received"
  | "escalated"
  | "info";

export interface AgentEvent {
  id: string;
  occurredAt: string;
  type: AgentEventType;
  title: string;
  detail: string;
  evidence?: { label: string; href?: string };
}

export interface EmailRecord {
  id: string;
  direction: "outgoing" | "incoming";
  from: string;
  to: string;
  sentAt: string;
  subject: string;
  body: string;
}

// ─── Demo flow stages ─────────────────────────────────────────────────────────

export const AP_DEMO_STAGES = [
  "received",
  "matching",
  "exception_flagged",
  "email_sent",
  "awaiting_reply",
  "reply_parsed",
  "rematch_clean",
  "approved",
  "paid",
] as const;

export type APDemoStage = (typeof AP_DEMO_STAGES)[number];

export const AR_DEMO_STAGES = [
  "issued",
  "approaching_due",
  "first_reminder",
  "second_reminder",
  "voice_call_1",
  "promise_logged",
  "promise_broken",
  "voice_call_2",
  "dispute_raised",
  "dispute_resolved",
  "paid",
] as const;

export type ARDemoStage = (typeof AR_DEMO_STAGES)[number];
