export interface ExtractedItem {
  id: string;
  name: string;
  category:
    | "BOLT"
    | "SCREW"
    | "NUT"
    | "WASHER"
    | "STRUCTURAL"
    | "SPECIALTY"
    | "FASTENER"
    | "RAW MATERIAL"
    | "SEALING"
    | "TOOLING";
  sku: string;
  qty: string;
  unitPrice: string;
  deliveryBy: string;
  deliveryTo: string;
  specs: string;
  paymentTerms: string;
  confidence: number;
  appearAfterSeconds: number;
}

export const extractedItems: ExtractedItem[] = [
  {
    id: "item-1",
    name: "M8x25 Grade 10.9 Flange Bolt — Zinc",
    category: "BOLT",
    sku: "FB-M8X25-1090-ZN",
    qty: "5,000 units",
    unitPrice: "$0.18 – $0.22",
    deliveryBy: "14 Mar 2026",
    deliveryTo: "Apex Wabash Plant",
    specs: "Grade 10.9, Zinc Plated, JIS B 1189 Flange Head",
    paymentTerms: "Net 30",
    confidence: 97,
    appearAfterSeconds: 3,
  },
  {
    id: "item-2",
    name: "M8 Conical Spring Washer",
    category: "WASHER",
    sku: "WS-M8-CON-ZN",
    qty: "5,000 units",
    unitPrice: "$0.04",
    deliveryBy: "14 Mar 2026",
    deliveryTo: "Apex Wabash Plant",
    specs: "DIN 6796, Zinc Plated",
    paymentTerms: "Net 30",
    confidence: 95,
    appearAfterSeconds: 8,
  },
  {
    id: "item-3",
    name: "M10x40 Socket Head Cap Screw Grade 12.9",
    category: "SCREW",
    sku: "SHCS-M10X40-1290-BO",
    qty: "2,500 units",
    unitPrice: "$0.42",
    deliveryBy: "14 Mar 2026",
    deliveryTo: "Apex Detroit Plant",
    specs: "Grade 12.9, Black Oxide, ISO 4762 — PPAP package + EN 10204 3.1 mill cert required",
    paymentTerms: "Net 30",
    confidence: 96,
    appearAfterSeconds: 13,
  },
  {
    id: "item-4",
    name: 'F436 1/2" Structural Flat Washer',
    category: "STRUCTURAL",
    sku: "WS-F436-12-HDG",
    qty: "1,000 units",
    unitPrice: "$0.32",
    deliveryBy: "14 Mar 2026",
    deliveryTo: "Apex Wabash Plant",
    specs: "ASTM F436 Type 1, Hot-Dip Galvanized",
    paymentTerms: "Net 30",
    confidence: 98,
    appearAfterSeconds: 14,
  },
  {
    id: "item-5",
    name: 'A325 TC-Bolt Assembly 3/4"x2"',
    category: "STRUCTURAL",
    sku: "TC-A325-34X2-ASM",
    qty: "200 units",
    unitPrice: "$1.85",
    deliveryBy: "14 Mar 2026",
    deliveryTo: "Apex Wabash Plant",
    specs: "ASTM F1852/A325, 3-piece set (bolt + heavy hex + F436), HDG",
    paymentTerms: "Net 30",
    confidence: 96,
    appearAfterSeconds: 16,
  },
];
