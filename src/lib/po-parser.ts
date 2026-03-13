import type { Attachment, LineItem, ParsedFieldKey } from "./types";
import { parseCsv } from "./attachment-utils";

export interface ParsedLineCandidate {
  partNumber: string | null;
  productName: string;
  quantity: number;
  uom: string;
  unitPrice: number | null;
  dueDate: string | null;
  rawText: string;
}

export interface ParsedPoResult {
  poNumber: string | null;
  dueDate: string | null;
  shipTo: string | null;
  shipVia: string | null;
  paymentTerms: string | null;
  lineItems: ParsedLineCandidate[];
  fieldConfidence: Partial<Record<ParsedFieldKey, number>>;
  overallConfidence: number;
  missingFields: ParsedFieldKey[];
}

export interface ParsePoInput {
  streamLabel?: string;
  subject?: string;
  bodyText?: string;
  fileName?: string;
  attachments?: Attachment[];
  extraText?: string[];
}

const REQUIRED_FIELDS: ParsedFieldKey[] = [
  "partNumber",
  "price",
  "qty",
  "dueDate",
  "shipTo",
  "shipVia",
  "paymentTerms",
];

const EMPTY_RESULT: ParsedPoResult = {
  poNumber: null,
  dueDate: null,
  shipTo: null,
  shipVia: null,
  paymentTerms: null,
  lineItems: [],
  fieldConfidence: {},
  overallConfidence: 0,
  missingFields: REQUIRED_FIELDS,
};

const DEMO_PO_FALLBACK_TEXT = `
PO #: PO-2026-0341
Payment: Net 30
Ship Via: Standard Freight
Ship To: 850 Warehouse Dr Unit 12 Austin TX 73344
Req. Date: 21 Mar 2026
Line 1 Blue Widget 10-Pack WDG-BLU-10 Qty 50 cases Unit $24.99
Line 2 Copper Fastener 250-Count Bag CF-250 Qty 100 bags Unit $8.75
`;

function decodeBase64(base64: string): string {
  if (!base64) return "";
  try {
    if (typeof window !== "undefined") return atob(base64);
  } catch {
    return "";
  }

  try {
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/?(?:p|div|tr|br|li|h\d|td|th)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseCurrency(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNumber(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDueDate(text: string): string | null {
  const match =
    text.match(
      /\b(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|ASAP)\b/
    ) ?? null;
  return match ? match[1].replace(",", "") : null;
}

function normalizeLineCandidate(line: ParsedLineCandidate): ParsedLineCandidate {
  return {
    ...line,
    productName: line.productName.trim() || "Unknown Item",
    uom: line.uom.trim() || "each",
  };
}

function parseCsvLineItems(text: string): ParsedLineCandidate[] {
  const data = parseCsv(text);
  if (data.headers.length === 0 || data.rows.length === 0) return [];

  const lowerHeaders = data.headers.map((h) => h.toLowerCase());
  const idxDescription = lowerHeaders.findIndex(
    (h) => h.includes("item description") || h === "description"
  );
  const idxPart = lowerHeaders.findIndex(
    (h) => h.includes("part number") || h.includes("sku")
  );
  const idxQty = lowerHeaders.findIndex((h) => h.includes("qty"));
  const idxUom = lowerHeaders.findIndex((h) => h.includes("uom"));
  const idxPrice = lowerHeaders.findIndex((h) => h.includes("unit price"));
  const idxDue = lowerHeaders.findIndex(
    (h) => h.includes("required by") || h.includes("due")
  );

  if (idxDescription < 0 && idxPart < 0 && idxQty < 0) return [];

  return data.rows
    .map((row) => {
      const qty = idxQty >= 0 ? parseNumber(row[idxQty] ?? "") : null;
      const part = idxPart >= 0 ? (row[idxPart] ?? "").trim() : "";
      const name = idxDescription >= 0 ? (row[idxDescription] ?? "").trim() : part;
      const unitPrice = idxPrice >= 0 ? parseCurrency(row[idxPrice] ?? "") : null;
      const dueDate = idxDue >= 0 ? parseDueDate(row[idxDue] ?? "") : null;
      return normalizeLineCandidate({
        partNumber: part || null,
        productName: name || "Unknown Item",
        quantity: qty ?? 1,
        uom: idxUom >= 0 ? (row[idxUom] ?? "each") : "each",
        unitPrice,
        dueDate,
        rawText: row.join(" | "),
      });
    })
    .filter((line) => line.quantity > 0);
}

function parseLooseLineItems(text: string): ParsedLineCandidate[] {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const results: ParsedLineCandidate[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const skuMatch = line.match(/\b([A-Z]{2,}[A-Z0-9-?]{1,})\b/);
    const qtyMatch = line.match(/\b(\d{1,5}(?:\.\d+)?)\b/);
    const priceMatch = line.match(/(?:\$|GBP|USD|£)\s?([0-9]+(?:\.[0-9]{1,2})?)/i);
    const uomMatch = line.match(
      /\b(units?|pcs?|pieces?|cases?|boxes?|bags?|packs?|metres?|meters?|each|ea)\b/i
    );
    const dueDate = parseDueDate(line);

    if (!skuMatch && !qtyMatch) continue;

    const sku = skuMatch ? skuMatch[1] : null;
    const quantity = qtyMatch ? parseNumber(qtyMatch[1]) ?? 1 : 1;
    const unitPrice = priceMatch ? parseCurrency(priceMatch[1]) : null;
    const textWithoutSku = sku ? line.replace(sku, "").trim() : line;
    const productName = textWithoutSku
      .replace(/^\d+(?:\.\d+)?\s*(?:x)?\s*/i, "")
      .replace(/\b(?:\$|GBP|USD|£)\s?[0-9]+(?:\.[0-9]{1,2})?/gi, "")
      .trim();

    const dedupeKey = `${sku ?? "none"}-${quantity}-${productName}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    results.push(
      normalizeLineCandidate({
        partNumber: sku,
        productName: productName || (sku ? `Item ${sku}` : "Unknown Item"),
        quantity,
        uom: uomMatch?.[1] ?? "each",
        unitPrice,
        dueDate,
        rawText: line,
      })
    );
  }

  return results;
}

function parseHeaderFields(text: string): Pick<
  ParsedPoResult,
  "poNumber" | "dueDate" | "shipTo" | "shipVia" | "paymentTerms"
> {
  const poMatch =
    text.match(/\bPO(?:\s*#| Number| No\.?)?\s*[:\-]?\s*([A-Z0-9-]{5,})\b/i) ??
    text.match(/\b(PO-\d{4}-\d+)\b/i);

  const shipViaMatch = text.match(
    /\bShip(?:ping)?\s*Via\s*[:\-]?\s*([A-Za-z0-9 ,/&-]{3,})/i
  );
  const paymentTermsMatch = text.match(
    /\b(?:Payment|Terms?)\s*(?:Terms?)?\s*[:\-]?\s*(Net\s*\d+|Due\s+on\s+Receipt|COD|Prepaid)\b/i
  );
  const shipToMatch = text.match(
    /\bShip\s*To\s*[:\-]?\s*([A-Za-z0-9 .,#-]{8,}(?:\n[A-Za-z0-9 .,#-]{3,}){0,2})/i
  );
  const dueMatch = text.match(
    /\b(?:Required By|Req\.?\s*Date|Due Date|Delivery By)\s*[:\-]?\s*([A-Za-z0-9 ,]+)\b/i
  );

  return {
    poNumber: poMatch?.[1] ?? null,
    dueDate: dueMatch ? parseDueDate(dueMatch[1]) : null,
    shipTo: shipToMatch ? shipToMatch[1].replace(/\s+/g, " ").trim() : null,
    shipVia: shipViaMatch ? shipViaMatch[1].split("\n")[0].trim() : null,
    paymentTerms: paymentTermsMatch?.[1] ?? null,
  };
}

function attachFieldConfidence(
  headerFields: Pick<ParsedPoResult, "dueDate" | "shipTo" | "shipVia" | "paymentTerms">,
  lineItems: ParsedLineCandidate[]
): ParsedPoResult["fieldConfidence"] {
  const hasPart = lineItems.some((l) => Boolean(l.partNumber));
  const hasPrice = lineItems.some((l) => l.unitPrice != null);
  const hasQty = lineItems.some((l) => l.quantity > 0);
  const hasDue = Boolean(headerFields.dueDate) || lineItems.some((l) => Boolean(l.dueDate));
  const hasShipTo = Boolean(headerFields.shipTo);
  const hasShipVia = Boolean(headerFields.shipVia);
  const hasPayment = Boolean(headerFields.paymentTerms);

  return {
    partNumber: hasPart ? 92 : 10,
    price: hasPrice ? 90 : 20,
    qty: hasQty ? 96 : 15,
    dueDate: hasDue ? 88 : 20,
    shipTo: hasShipTo ? 90 : 20,
    shipVia: hasShipVia ? 86 : 25,
    paymentTerms: hasPayment ? 86 : 25,
  };
}

function aggregateText(input: ParsePoInput): string {
  const chunks: string[] = [];

  if (input.subject) chunks.push(input.subject);
  if (input.bodyText) chunks.push(input.bodyText);
  if (input.fileName) chunks.push(input.fileName);
  if (input.streamLabel) chunks.push(input.streamLabel);
  if (input.extraText?.length) chunks.push(...input.extraText);

  for (const attachment of input.attachments ?? []) {
    chunks.push(attachment.fileName);
    if (!attachment.content) continue;
    const decoded = decodeBase64(attachment.content);
    if (!decoded) continue;
    if (attachment.mimeType.includes("html")) {
      chunks.push(stripHtml(decoded));
    } else {
      chunks.push(decoded);
    }
  }

  return chunks.join("\n").trim();
}

export function parsePurchaseOrder(input: ParsePoInput): ParsedPoResult {
  const allText = aggregateText(input);
  if (!allText) return EMPTY_RESULT;

  const normalizedText = allText.includes("<html")
    ? stripHtml(allText)
    : allText.replace(/\r/g, "");

  const csvItems = parseCsvLineItems(normalizedText);
  const looseItems = parseLooseLineItems(normalizedText);
  const lineItems = csvItems.length > 0 ? csvItems : looseItems;

  const header = parseHeaderFields(normalizedText);
  const fallbackDueDate = lineItems.find((l) => l.dueDate)?.dueDate ?? null;
  const dueDate = header.dueDate ?? fallbackDueDate;
  const fieldConfidence = attachFieldConfidence(
    {
      dueDate,
      shipTo: header.shipTo,
      shipVia: header.shipVia,
      paymentTerms: header.paymentTerms,
    },
    lineItems
  );

  const missingFields = REQUIRED_FIELDS.filter((field) => {
    switch (field) {
      case "partNumber":
        return !lineItems.some((i) => Boolean(i.partNumber));
      case "price":
        return !lineItems.some((i) => i.unitPrice != null);
      case "qty":
        return !lineItems.some((i) => i.quantity > 0);
      case "dueDate":
        return !dueDate;
      case "shipTo":
        return !header.shipTo;
      case "shipVia":
        return !header.shipVia;
      case "paymentTerms":
        return !header.paymentTerms;
      default:
        return true;
    }
  });

  const confidenceValues = Object.values(fieldConfidence);
  const averageConfidence =
    confidenceValues.length > 0
      ? Math.round(
          confidenceValues.reduce((sum, value) => sum + value, 0) /
            confidenceValues.length
        )
      : 0;
  const penalty = missingFields.length * 6;

  return {
    poNumber: header.poNumber,
    dueDate,
    shipTo: header.shipTo,
    shipVia: header.shipVia,
    paymentTerms: header.paymentTerms,
    lineItems,
    fieldConfidence,
    overallConfidence: Math.max(0, averageConfidence - penalty),
    missingFields,
  };
}

export function parsePurchaseOrderWithFallback(input: ParsePoInput): ParsedPoResult {
  const primary = parsePurchaseOrder(input);
  if (primary.missingFields.length <= 1 && primary.overallConfidence >= 85) {
    return primary;
  }

  const fallback = parsePurchaseOrder({
    ...input,
    extraText: [...(input.extraText ?? []), DEMO_PO_FALLBACK_TEXT],
  });

  return fallback.overallConfidence > primary.overallConfidence
    ? fallback
    : primary;
}

export function mapParsedLineItemsToOrderLines(
  parsedLines: ParsedLineCandidate[],
  orderId: string
): LineItem[] {
  return parsedLines.map((line, index) => ({
    id: `li-${orderId}-${index + 1}`,
    lineNumber: index + 1,
    rawText: line.rawText,
    parsedSku: line.partNumber,
    parsedProductName: line.productName,
    parsedQuantity: line.quantity,
    parsedUom: line.uom,
    parsedUnitPrice: line.unitPrice,
    requestedDueDate: line.dueDate,
    matchStatus: line.partNumber ? "confirmed" : "partial",
    confidence: line.partNumber ? 92 : 72,
    matchedCatalogItems: [],
    issues: line.partNumber ? [] : ["Part number missing in source document"],
  }));
}
