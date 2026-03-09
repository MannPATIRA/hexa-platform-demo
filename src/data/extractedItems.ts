export interface ExtractedItem {
  id: string;
  name: string;
  category: "FASTENER" | "RAW MATERIAL" | "SEALING" | "TOOLING";
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
    name: "M8 Stainless Steel Hex Bolt",
    category: "FASTENER",
    sku: "HEX-M8-A270-SS",
    qty: "500 units",
    unitPrice: "£0.38 – £0.42",
    deliveryBy: "14 Mar 2025",
    deliveryTo: "Attercliffe Site",
    specs: "A2-70 Grade, Stainless Steel",
    paymentTerms: "Net 30",
    confidence: 97,
    appearAfterSeconds: 3,
  },
  {
    id: "item-2",
    name: "EN24T Precision Ground Steel Bar",
    category: "RAW MATERIAL",
    sku: "STL-EN24T-50RD",
    qty: "200 metres",
    unitPrice: "£28.50/m",
    deliveryBy: "28 Mar 2025",
    deliveryTo: "Rotherham Unit",
    specs: "50mm diameter, BS EN 10204 3.1 Cert Required",
    paymentTerms: "Net 30",
    confidence: 94,
    appearAfterSeconds: 8,
  },
  {
    id: "item-3",
    name: "PTFE Gasket DN50 PN16",
    category: "SEALING",
    sku: "GSK-PTFE-DN50-PN16",
    qty: "150 pieces",
    unitPrice: "£3.20",
    deliveryBy: "14 Mar 2025",
    deliveryTo: "—",
    specs: "For valve overhaul application",
    paymentTerms: "Net 30",
    confidence: 95,
    appearAfterSeconds: 13,
  },
  {
    id: "item-4",
    name: "Dormer A002 HSS Drill Bit 10mm",
    category: "TOOLING",
    sku: "DRL-A002-HSS-10",
    qty: "50 pieces",
    unitPrice: "£4.85",
    deliveryBy: "14 Mar 2025",
    deliveryTo: "—",
    specs: "HSS (High Speed Steel)",
    paymentTerms: "Net 30",
    confidence: 98,
    appearAfterSeconds: 14,
  },
];
