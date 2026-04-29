import type {
  ProcurementItem,
  Supplier,
  SupplierItemHistory,
  CoOrderPattern,
  EngineeringRequest,
  DraftRFQ,
  StockHistoryPoint,
  ERPScanConfig,
  OpenPO,
  SupplierQuote,
  PurchaseOrder,
  RFQSupplierEntry,
} from "@/lib/procurement-types";

function generateStockHistory(currentStock: number, avgDaily: number, days: number): StockHistoryPoint[] {
  const points: StockHistoryPoint[] = [];
  const now = new Date("2026-03-09");
  let level = currentStock;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    points.push({ date: date.toISOString().split("T")[0], level: Math.max(0, Math.round(level)) });

    if (i > 0) {
      const randomRestock = Math.random() > 0.92;
      if (randomRestock && level < currentStock * 0.4) {
        level += currentStock * (0.6 + Math.random() * 0.4);
      }
      level -= avgDaily * (0.7 + Math.random() * 0.6);
      level = Math.max(0, level);
    }
  }

  points[points.length - 1].level = currentStock;
  return points;
}

// --- Suppliers ---
// Fastener master distributors, domestic mills, and offshore importers.

export const suppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "Brighton-Best International",
    contactEmail: "orders@brightonbest.com",
    contactPhone: "(310) 555-0142",
    paymentTerms: "Net 30",
    address: "6701 W Imperial Hwy, Los Angeles, CA 90045",
    notes: "Primary master distributor — broadest catalog of imperial and metric standard fasteners. Reliable, deep stock.",
  },
  {
    id: "sup-002",
    name: "Earnest Machine Products",
    contactEmail: "sales@earnestmachine.com",
    contactPhone: "(216) 555-0298",
    paymentTerms: "Net 45",
    address: "12701 Berea Rd, Cleveland, OH 44111",
    notes: "Secondary master — strong on agricultural and heavy-equipment fasteners. Good for backup sourcing.",
  },
  {
    id: "sup-003",
    name: "Würth Industrial Network",
    contactEmail: "orders@wurthindustry.com",
    contactPhone: "(800) 555-0376",
    paymentTerms: "Net 30",
    address: "93 Grant St, Ramsey, NJ 07446",
    notes: "Premium VMI/Kanban supplier. Deep aerospace and auto-grade catalog. Higher pricing but unmatched service.",
  },
  {
    id: "sup-004",
    name: "Kanebridge International",
    contactEmail: "rfq@kanebridge.com",
    contactPhone: "(973) 555-0511",
    paymentTerms: "Net 60",
    address: "300 Roundhill Dr, Rockaway, NJ 07866",
    notes: "Specialty distributor — Huck rivets, security fasteners, anchors. Strong on construction-grade structural products.",
  },
  {
    id: "sup-005",
    name: "Bossard Inc.",
    contactEmail: "orders@bossard.com",
    contactPhone: "(847) 555-0187",
    paymentTerms: "Net 30",
    address: "6521 Production Dr, Cedarburg, WI 53012",
    notes: "European master distributor with strong North American presence. Good metric DIN/ISO catalog and PPAP support.",
  },
  {
    id: "sup-006",
    name: "TR Fastenings UK Ltd",
    contactEmail: "export@trfastenings.com",
    contactPhone: "+44 1825 555-0234",
    paymentTerms: "Net 60",
    address: "Trifast House, Uckfield, East Sussex TN22 1QF, UK",
    notes: "UK mill — strong on automotive cold-formed parts. Currency exposure (GBP) and longer lead times. Quality consistent.",
  },
  {
    id: "sup-007",
    name: "Lake Erie Screw",
    contactEmail: "sales@lakeeriescrew.com",
    contactPhone: "(440) 555-0443",
    paymentTerms: "Net 30",
    address: "29800 Solon Rd, Solon, OH 44139",
    notes: "Domestic US mill — Made-in-USA documentation, DFARS-compliant. Cold-headed standards in volume.",
  },
  {
    id: "sup-008",
    name: "Pacific Rim Fasteners",
    contactEmail: "info@pacificrimfasteners.com",
    contactPhone: "(562) 555-0672",
    paymentTerms: "Net 45",
    address: "3850 Container Way, Long Beach, CA 90802",
    notes: "Asian importer (Taiwan/Vietnam mills) — best pricing in volume but known counterfeit risk on Grade 8 markings. Container-load minimums.",
  },
];

// --- Procurement Items ---

export const procurementItems: ProcurementItem[] = [
  {
    id: "pi-001",
    sku: "FB-M8X25-1090-ZN",
    name: "M8x25 Grade 10.9 Flange Bolt — Zinc",
    description: "Grade 10.9 metric flange bolt, M8 thread, 25mm length, zinc plated. JIS B 1189 head profile. Line-side fastener for Apex Seating frame assembly.",
    source: "erp_alert",
    status: "flagged",
    priority: "critical",
    currentStock: 8500,
    reorderPoint: 25000,
    maxStock: 200000,
    avgDailyConsumption: 1850,
    avgDailyConsumption30d: 2100,
    avgDailyConsumption90d: 1850,
    flaggedAt: "2026-03-08T14:22:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-001",
    stockHistory: generateStockHistory(8500, 1850, 90),
  }, // flagged — line-side critical, single preferred supplier
  {
    id: "pi-002",
    sku: "SHCS-M10X40-1290-BO",
    name: "M10x40 Socket Head Cap Screw Grade 12.9",
    description: "Grade 12.9 socket head cap screw, M10x40, black oxide. ISO 4762. Used on Apex Detroit program with PPAP package + EN 10204 3.1 mill cert.",
    source: "erp_alert",
    status: "quotes_received",
    priority: "high",
    currentStock: 3400,
    reorderPoint: 5000,
    maxStock: 60000,
    avgDailyConsumption: 380,
    avgDailyConsumption30d: 460,
    avgDailyConsumption90d: 380,
    flaggedAt: "2026-03-06T16:45:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-005",
    stockHistory: generateStockHistory(3400, 380, 90),
    activeRfqId: "rfq-004",
  }, // quotes_received — RFQ out, two quotes back, evaluating
  {
    id: "pi-003",
    sku: "WS-F436-12-HDG",
    name: 'F436 1/2" Structural Flat Washer — HDG',
    description: "ASTM F436 Type 1 structural flat washer, 1/2 inch, hot-dip galvanized. Pairs with A325/A490 structural bolts.",
    source: "erp_alert",
    status: "flagged",
    priority: "medium",
    currentStock: 2800,
    reorderPoint: 4000,
    maxStock: 40000,
    avgDailyConsumption: 280,
    avgDailyConsumption30d: 320,
    avgDailyConsumption90d: 280,
    flaggedAt: "2026-03-10T11:30:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-001",
    stockHistory: generateStockHistory(2800, 280, 90),
  }, // flagged — multi-supplier
  {
    id: "pi-004",
    sku: "NUT-NYL-M8-ZN",
    name: "M8 Nylock Nut Grade 8 — Zinc",
    description: "Grade 8 nylon-insert lock nut, M8, zinc plated. DIN 985. Co-orders frequently with M8x25 flange bolts and M8 conical washers.",
    source: "erp_alert",
    status: "flagged",
    priority: "high",
    currentStock: 4200,
    reorderPoint: 8000,
    maxStock: 100000,
    avgDailyConsumption: 920,
    avgDailyConsumption30d: 1100,
    avgDailyConsumption90d: 920,
    flaggedAt: "2026-03-07T09:15:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-001",
    stockHistory: generateStockHistory(4200, 920, 90),
  }, // flagged — paired with M8 bolt blanket
  {
    id: "pi-005",
    sku: "HEX-38X4-G8-YZ",
    name: '3/8"-16 x 4" Grade 8 Hex Bolt — Yellow Zinc',
    description: "Grade 8 imperial hex bolt, 3/8-16 thread, 4 inch length, yellow zinc-chromate finish. SAE J429.",
    source: "erp_alert",
    status: "rfq_sent",
    priority: "low",
    currentStock: 750,
    reorderPoint: 1000,
    maxStock: 8000,
    avgDailyConsumption: 35,
    avgDailyConsumption30d: 42,
    avgDailyConsumption90d: 35,
    flaggedAt: "2026-03-01T08:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-007",
    stockHistory: generateStockHistory(750, 35, 90),
  },
  {
    id: "pi-006",
    sku: "FN-M8-G8-ZN",
    name: "M8 Hex Flange Nut Grade 8 — Zinc",
    description: "Grade 8 metric serrated flange nut, M8, zinc plated. DIN 6923. Pairs with M8x25 flange bolts on auto seating program.",
    source: "erp_alert",
    status: "delivered",
    priority: "medium",
    currentStock: 28000,
    reorderPoint: 8000,
    maxStock: 100000,
    avgDailyConsumption: 850,
    avgDailyConsumption30d: 920,
    avgDailyConsumption90d: 850,
    flaggedAt: "2026-02-25T10:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-001",
    stockHistory: generateStockHistory(28000, 850, 90),
    activeRfqId: "rfq-006",
    selectedQuoteId: "sq-006-a",
    purchaseOrderId: "pur-006",
  },
  {
    id: "pi-007",
    sku: "PPAP-CSB-4MMX12",
    name: "Custom Shoulder Bolt 4mm x 12mm — PPAP Launch",
    description: "Custom-spec shoulder bolt for Apex Detroit seating frame program. Tight tolerance on shoulder diameter. Full PPAP package and EN 10204 3.1 mill cert required.",
    source: "engineering_request",
    status: "po_sent",
    priority: "high",
    currentStock: 0,
    reorderPoint: 0,
    maxStock: 50000,
    avgDailyConsumption: 0,
    avgDailyConsumption30d: 0,
    avgDailyConsumption90d: 0,
    flaggedAt: "2026-03-02T10:30:00Z",
    requestedBy: "Tom Nakamura",
    category: "custom_part",
    technicalSpecs: {
      material: "Grade 12.9 Alloy Steel, Black Oxide",
      dimensions: "Shoulder Ø8.0mm ±0.013, Length 12mm ±0.05, Thread M5x0.8",
      tolerances: "h7 on shoulder Ø, ±0.05 on length",
      finish: "Black Oxide per MIL-DTL-13924",
      compliance: "PPAP Level 3 + EN 10204 3.1 mill cert + IMDS submission",
    },
    attachments: [
      { id: "att-e1", fileName: "shoulder-bolt-rev-c-drawing.pdf", fileType: "pdf", fileSize: 2_450_000, url: "#" },
      { id: "att-e2", fileName: "ppap-package-template.pdf", fileType: "pdf", fileSize: 890_000, url: "#" },
      { id: "att-e3", fileName: "apex-detroit-program-spec.pdf", fileType: "pdf", fileSize: 1_200_000, url: "#" },
    ],
    preferredSupplierId: "sup-007",
    stockHistory: [],
    purchaseOrderId: "pur-001",
  }, // po_sent — awaiting supplier shipment
  {
    id: "pi-008",
    sku: "TC-A325-34X2-ASM",
    name: 'A325 TC-Bolt Assembly 3/4"x2"',
    description: "ASTM F1852/A325 tension-control bolt assembly, 3-piece (TC bolt + heavy hex nut + F436 washer), 3/4 inch x 2 inch, hot-dip galvanized. Apex Wabash structural launch.",
    source: "engineering_request",
    status: "shipped",
    priority: "critical",
    currentStock: 0,
    reorderPoint: 0,
    maxStock: 5000,
    avgDailyConsumption: 0,
    avgDailyConsumption30d: 0,
    avgDailyConsumption90d: 0,
    flaggedAt: "2026-02-20T15:20:00Z",
    requestedBy: "Rachel Kim",
    category: "custom_part",
    technicalSpecs: {
      material: "Medium Carbon Steel, Heat Treated",
      dimensions: "3/4-10 x 2 inch overall length",
      tolerances: "Per ASTM F1852/A325",
      grade: "ASTM A325 Type 1",
      finish: "Hot-Dip Galvanized per ASTM A153",
      compliance: "ASTM F1852 + A325 + RCSC tension verification",
    },
    attachments: [
      { id: "att-e4", fileName: "tc-bolt-assembly-spec-sheet.pdf", fileType: "pdf", fileSize: 3_100_000, url: "#" },
      { id: "att-e5", fileName: "tension-test-protocol.pdf", fileType: "pdf", fileSize: 1_400_000, url: "#" },
    ],
    preferredSupplierId: "sup-004",
    stockHistory: [],
    purchaseOrderId: "pur-002",
  }, // shipped — in transit, tracking active
  {
    id: "pi-009",
    sku: "WSH-M6-ZP",
    name: "M6 Zinc-Plated Flat Washer — DIN 125",
    description: "DIN 125 Form A flat washer, M6, zinc plated. High-volume kit-pack consumable for HVAC and ag programs.",
    source: "erp_alert",
    status: "flagged",
    priority: "medium",
    currentStock: 14000,
    reorderPoint: 20000,
    maxStock: 250000,
    avgDailyConsumption: 1100,
    avgDailyConsumption30d: 1280,
    avgDailyConsumption90d: 1100,
    flaggedAt: "2026-03-08T07:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-001",
    stockHistory: generateStockHistory(14000, 1100, 90),
  },
  {
    id: "pi-010",
    sku: "HEL-M10X150-TL",
    name: "Helicoil M10x1.5 Tangless Insert",
    description: "Tangless screw thread insert, M10x1.5, 1.5D length, 304 stainless steel. Engineering-requested specialty for Apex repair-pulls program.",
    source: "engineering_request",
    status: "flagged",
    priority: "medium",
    currentStock: 80,
    reorderPoint: 200,
    maxStock: 2000,
    avgDailyConsumption: 12,
    avgDailyConsumption30d: 14,
    avgDailyConsumption90d: 12,
    flaggedAt: "2026-03-09T08:15:00Z",
    requestedBy: "Derek Patel",
    category: "custom_part",
    technicalSpecs: {
      material: "304 Stainless Steel",
      dimensions: "M10x1.5 thread, 15mm (1.5D) length",
      tolerances: "STI per MIL-S-7742",
      finish: "Passivated",
      compliance: "MIL-I-8846 / NASM 21209",
    },
    attachments: [
      { id: "att-e6", fileName: "helicoil-installation-spec.pdf", fileType: "pdf", fileSize: 340_000, url: "#" },
    ],
    preferredSupplierId: "sup-003",
    stockHistory: generateStockHistory(80, 12, 90),
  },
  {
    id: "pi-011",
    sku: "HEX-M12X40-88-ZN",
    name: "M12x40 Hex Bolt Grade 8.8 — Zinc",
    description: "Grade 8.8 metric hex bolt, M12 thread, 40mm length, zinc plated. DIN 933. Top-volume Kuhn ag MRO blanket SKU.",
    source: "erp_alert",
    status: "po_sent",
    priority: "low",
    currentStock: 18000,
    reorderPoint: 12000,
    maxStock: 120000,
    avgDailyConsumption: 540,
    avgDailyConsumption30d: 480,
    avgDailyConsumption90d: 540,
    flaggedAt: "2026-03-07T13:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-002",
    stockHistory: generateStockHistory(18000, 540, 90),
    purchaseOrderId: "pur-011",
  },
  {
    id: "pi-012",
    sku: "HUCK-BOM-516-300",
    name: 'Huck BOM 5/16" Blind Rivet — Sole Source',
    description: 'Huck BOM (Blind, Oversize, Magna-Lok) 5/16" structural blind rivet, 0.300 grip. Sole-source from Arconic Fastening Systems. 12-week container lead time.',
    source: "erp_alert",
    status: "flagged",
    priority: "critical",
    currentStock: 1850,
    reorderPoint: 4000,
    maxStock: 25000,
    avgDailyConsumption: 280,
    avgDailyConsumption30d: 320,
    avgDailyConsumption90d: 280,
    flaggedAt: "2026-03-09T06:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-004",
    stockHistory: generateStockHistory(1850, 280, 90),
  },
  {
    id: "pi-013",
    sku: "SHCS-14-20X1-PL",
    name: '1/4"-20 x 1" Socket Head Cap Screw — Plain',
    description: "Grade 8 socket head cap screw, 1/4-20 thread, 1 inch length, plain (uncoated) finish. ASME B18.3.",
    source: "erp_alert",
    status: "rfq_sent",
    priority: "high",
    currentStock: 320,
    reorderPoint: 1500,
    maxStock: 12000,
    avgDailyConsumption: 165,
    avgDailyConsumption30d: 180,
    avgDailyConsumption90d: 165,
    flaggedAt: "2026-03-09T09:35:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-002",
    stockHistory: generateStockHistory(320, 165, 90),
    activeRfqId: "rfq-003",
  }, // rfq_sent — waiting for supplier quotes
  {
    id: "pi-015",
    sku: "DTI-SQT-12",
    name: 'DTI Squirter Direct Tension Indicator 1/2"',
    description: 'TurnaSure Squirter direct tension indicator, 1/2 inch, for use with A325/A490 structural bolts. Specialty item — manual restock request from Apex QA.',
    source: "manual_request",
    status: "flagged",
    priority: "high",
    currentStock: 120,
    reorderPoint: 400,
    maxStock: 3000,
    avgDailyConsumption: 18,
    avgDailyConsumption30d: 22,
    avgDailyConsumption90d: 18,
    flaggedAt: "2026-03-12T09:45:00Z",
    requestedBy: "Sarah Chen",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-004",
    stockHistory: generateStockHistory(120, 18, 90),
  },
  {
    id: "pi-014",
    sku: "TR-58-11X6-B7",
    name: '5/8"-11 x 6 ft Threaded Rod — Grade B7',
    description: "ASTM A193 Grade B7 alloy steel threaded rod, 5/8-11, 6 ft length, plain. Used on Kuhn structural mounting kits.",
    source: "erp_alert",
    status: "flagged",
    priority: "high",
    currentStock: 90,
    reorderPoint: 250,
    maxStock: 1500,
    avgDailyConsumption: 12,
    avgDailyConsumption30d: 16,
    avgDailyConsumption90d: 12,
    flaggedAt: "2026-03-10T07:00:00Z",
    requestedBy: "System (ERP Scan)",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-003",
    stockHistory: generateStockHistory(90, 12, 90),
  },
  {
    id: "pi-016",
    sku: "HEX-516-18X1-G8-ZN",
    name: '5/16"-18 x 1" Grade 8 Hex Bolt — Zinc (suspect batch)',
    description: 'Grade 8 hex bolt, 5/16-18 x 1 inch, zinc plated. SAE J429. Last shipment from Pacific Rim flagged by QA with non-conforming Grade 8 head markings — pending counterfeit investigation.',
    source: "erp_alert",
    status: "flagged",
    priority: "critical",
    currentStock: 0,
    reorderPoint: 5000,
    maxStock: 60000,
    avgDailyConsumption: 380,
    avgDailyConsumption30d: 420,
    avgDailyConsumption90d: 380,
    flaggedAt: "2026-03-27T10:00:00Z",
    requestedBy: "QA / BOM Quote Builder",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-001",
    stockHistory: generateStockHistory(0, 380, 90),
  },
  {
    id: "pi-017",
    sku: "HEX-M5X16-88-ZN",
    name: "M5x16 Hex Bolt Grade 8.8 — Zinc",
    description: "Grade 8.8 hex bolt, M5x16, zinc plated. Low stock alert from BOM analysis on HVAC line restock.",
    source: "erp_alert",
    status: "flagged",
    priority: "high",
    currentStock: 1800,
    reorderPoint: 6000,
    maxStock: 80000,
    avgDailyConsumption: 410,
    avgDailyConsumption30d: 480,
    avgDailyConsumption90d: 410,
    flaggedAt: "2026-03-27T10:00:00Z",
    requestedBy: "BOM Quote Builder",
    category: "standard_component",
    attachments: [],
    preferredSupplierId: "sup-002",
    stockHistory: generateStockHistory(1800, 410, 90),
  },
];

// --- Supplier Item Histories ---

export const supplierItemHistories: SupplierItemHistory[] = [
  // pi-001: M8x25 flange bolt — Brighton-Best primary, Earnest backup
  { id: "sih-001", supplierId: "sup-001", itemId: "pi-001", lastOrderDate: "2026-02-15", totalOrders12mo: 22, avgUnitPrice: 0.18, lastUnitPrice: 0.18, previousUnitPrice: 0.17, avgLeadTimeDays: 5, onTimeDeliveryRate: 97, defectRate: 0.3, reliabilityScore: 95, moq: 5000, paymentTerms: "Net 30", notes: "Primary blanket source. Consistent quality on JIS B 1189 head profile." },
  { id: "sih-002", supplierId: "sup-002", itemId: "pi-001", lastOrderDate: "2025-11-20", totalOrders12mo: 4, avgUnitPrice: 0.21, lastUnitPrice: 0.22, previousUnitPrice: 0.20, avgLeadTimeDays: 8, onTimeDeliveryRate: 88, defectRate: 1.2, reliabilityScore: 72, moq: 2500, paymentTerms: "Net 45", notes: "Secondary source. Higher pricing but lower MOQ." },

  // pi-002: M10x40 SHCS Grade 12.9 — Bossard primary (PPAP-capable), Würth backup
  { id: "sih-003", supplierId: "sup-005", itemId: "pi-002", lastOrderDate: "2026-01-28", totalOrders12mo: 8, avgUnitPrice: 0.40, lastUnitPrice: 0.42, previousUnitPrice: 0.39, avgLeadTimeDays: 14, onTimeDeliveryRate: 98, defectRate: 0.1, reliabilityScore: 97, moq: 1000, paymentTerms: "Net 30", notes: "Premium quality. PPAP-ready supplier with EN 10204 3.1 docs included." },
  { id: "sih-004", supplierId: "sup-003", itemId: "pi-002", lastOrderDate: "2026-02-10", totalOrders12mo: 5, avgUnitPrice: 0.45, lastUnitPrice: 0.46, previousUnitPrice: 0.44, avgLeadTimeDays: 7, onTimeDeliveryRate: 91, defectRate: 0.4, reliabilityScore: 86, moq: 500, paymentTerms: "Net 30", notes: "Higher unit cost, faster lead time. Good for top-up orders." },
  { id: "sih-005", supplierId: "sup-002", itemId: "pi-002", lastOrderDate: "2025-08-05", totalOrders12mo: 2, avgUnitPrice: 0.43, lastUnitPrice: 0.44, previousUnitPrice: 0.42, avgLeadTimeDays: 10, onTimeDeliveryRate: 85, defectRate: 0.8, reliabilityScore: 74, moq: 2500, paymentTerms: "Net 45", notes: "Acceptable for non-PPAP runs only — won't supply IMDS submission." },

  // pi-003: F436 1/2" structural washer
  { id: "sih-006", supplierId: "sup-001", itemId: "pi-003", lastOrderDate: "2026-02-20", totalOrders12mo: 11, avgUnitPrice: 0.30, lastUnitPrice: 0.32, previousUnitPrice: 0.29, avgLeadTimeDays: 6, onTimeDeliveryRate: 94, defectRate: 0.2, reliabilityScore: 91, moq: 1000, paymentTerms: "Net 30", notes: "Standard structural washer. Consistent HDG dip quality." },
  { id: "sih-007", supplierId: "sup-004", itemId: "pi-003", lastOrderDate: "2025-09-14", totalOrders12mo: 3, avgUnitPrice: 0.34, lastUnitPrice: 0.36, previousUnitPrice: 0.33, avgLeadTimeDays: 10, onTimeDeliveryRate: 82, defectRate: 0.5, reliabilityScore: 78, moq: 500, paymentTerms: "Net 60", notes: "Use when Brighton-Best out of stock." },

  // pi-004: M8 Nylock — Brighton-Best primary
  { id: "sih-008", supplierId: "sup-001", itemId: "pi-004", lastOrderDate: "2026-03-01", totalOrders12mo: 18, avgUnitPrice: 0.06, lastUnitPrice: 0.06, previousUnitPrice: 0.06, avgLeadTimeDays: 4, onTimeDeliveryRate: 96, defectRate: 0.2, reliabilityScore: 96, moq: 5000, paymentTerms: "Net 30", notes: "Best price for M8 nylocs in volume." },
  { id: "sih-009", supplierId: "sup-002", itemId: "pi-004", lastOrderDate: "2026-02-15", totalOrders12mo: 6, avgUnitPrice: 0.07, lastUnitPrice: 0.07, previousUnitPrice: 0.08, avgLeadTimeDays: 3, onTimeDeliveryRate: 93, defectRate: 0.5, reliabilityScore: 89, moq: 1000, paymentTerms: "Net 45", notes: "Quick delivery. Good for urgent small orders." },

  // pi-005: 3/8-16 x 4 Grade 8 yellow zinc — Lake Erie primary (DFARS US-mill)
  { id: "sih-010", supplierId: "sup-007", itemId: "pi-005", lastOrderDate: "2026-01-10", totalOrders12mo: 6, avgUnitPrice: 0.34, lastUnitPrice: 0.36, previousUnitPrice: 0.33, avgLeadTimeDays: 7, onTimeDeliveryRate: 95, defectRate: 0.2, reliabilityScore: 94, moq: 500, paymentTerms: "Net 30", notes: "DFARS-compliant US-mill source. Consistent yellow zinc dip." },
  { id: "sih-011", supplierId: "sup-001", itemId: "pi-005", lastOrderDate: "2025-07-22", totalOrders12mo: 1, avgUnitPrice: 0.40, lastUnitPrice: 0.40, previousUnitPrice: 0.40, avgLeadTimeDays: 12, onTimeDeliveryRate: 78, defectRate: 1.0, reliabilityScore: 64, moq: 1000, paymentTerms: "Net 30", notes: "Emergency backup only. Not DFARS-traceable." },

  // pi-006: M8 flange nut
  { id: "sih-012", supplierId: "sup-001", itemId: "pi-006", lastOrderDate: "2026-02-28", totalOrders12mo: 14, avgUnitPrice: 0.05, lastUnitPrice: 0.05, previousUnitPrice: 0.05, avgLeadTimeDays: 3, onTimeDeliveryRate: 99, defectRate: 0.4, reliabilityScore: 97, moq: 2500, paymentTerms: "Net 30", notes: "Co-orders with M8x25 flange bolts at 87% rate." },

  // pi-007: Custom shoulder bolt PPAP — Lake Erie primary (US-mill PPAP-capable)
  { id: "sih-013", supplierId: "sup-007", itemId: "pi-007", lastOrderDate: "2025-12-18", totalOrders12mo: 4, avgUnitPrice: 1.85, lastUnitPrice: 1.92, previousUnitPrice: 1.78, avgLeadTimeDays: 18, onTimeDeliveryRate: 92, defectRate: 0.5, reliabilityScore: 88, moq: 5000, paymentTerms: "Net 30", notes: "PPAP-capable US mill. Includes EN 10204 3.1 mill cert at no extra charge." },

  // pi-008: A325 TC-bolt assembly — Kanebridge specialty
  { id: "sih-014", supplierId: "sup-004", itemId: "pi-008", lastOrderDate: "2025-10-22", totalOrders12mo: 3, avgUnitPrice: 1.78, lastUnitPrice: 1.85, previousUnitPrice: 1.72, avgLeadTimeDays: 25, onTimeDeliveryRate: 90, defectRate: 0.4, reliabilityScore: 84, moq: 200, paymentTerms: "Net 60", notes: "Specialty distributor for structural products. Limited stock — capacity-constrained." },
  { id: "sih-015", supplierId: "sup-001", itemId: "pi-008", lastOrderDate: "2025-06-15", totalOrders12mo: 1, avgUnitPrice: 1.95, lastUnitPrice: 1.95, previousUnitPrice: 1.95, avgLeadTimeDays: 30, onTimeDeliveryRate: 85, defectRate: 0.8, reliabilityScore: 70, moq: 500, paymentTerms: "Net 30", notes: "Carries A325 TC-sets but at higher unit cost." },

  // pi-009: M6 zinc washer — high-volume
  { id: "sih-016", supplierId: "sup-001", itemId: "pi-009", lastOrderDate: "2026-02-05", totalOrders12mo: 12, avgUnitPrice: 0.012, lastUnitPrice: 0.013, previousUnitPrice: 0.012, avgLeadTimeDays: 5, onTimeDeliveryRate: 97, defectRate: 0.2, reliabilityScore: 96, moq: 25000, paymentTerms: "Net 30", notes: "High-volume kit-pack. Always in stock." },

  // pi-010: Helicoil M10x1.5 tangless
  { id: "sih-017", supplierId: "sup-003", itemId: "pi-010", lastOrderDate: "2025-11-01", totalOrders12mo: 3, avgUnitPrice: 0.85, lastUnitPrice: 0.88, previousUnitPrice: 0.82, avgLeadTimeDays: 10, onTimeDeliveryRate: 93, defectRate: 0.1, reliabilityScore: 90, moq: 100, paymentTerms: "Net 30", notes: "Authorized Helicoil distributor. Genuine product, not knock-off." },

  // pi-011: M12x40 Grade 8.8
  { id: "sih-018", supplierId: "sup-002", itemId: "pi-011", lastOrderDate: "2026-02-22", totalOrders12mo: 11, avgUnitPrice: 0.40, lastUnitPrice: 0.42, previousUnitPrice: 0.39, avgLeadTimeDays: 4, onTimeDeliveryRate: 97, defectRate: 0.3, reliabilityScore: 96, moq: 5000, paymentTerms: "Net 45", notes: "Top-volume Kuhn ag MRO line. Earnest holds VMI stock." },

  // pi-012: Huck BOM rivet — sole source Kanebridge / Arconic
  { id: "sih-019", supplierId: "sup-004", itemId: "pi-012", lastOrderDate: "2026-02-18", totalOrders12mo: 8, avgUnitPrice: 0.95, lastUnitPrice: 0.98, previousUnitPrice: 0.92, avgLeadTimeDays: 84, onTimeDeliveryRate: 88, defectRate: 0.05, reliabilityScore: 89, moq: 5000, paymentTerms: "Net 60", notes: "Sole-source from Arconic via Kanebridge. 12-week container lead time. Cannot dual-source." },

  // pi-013: 1/4-20 x 1 SHCS — Earnest primary, Bossard backup
  { id: "sih-020", supplierId: "sup-002", itemId: "pi-013", lastOrderDate: "2025-12-01", totalOrders12mo: 9, avgUnitPrice: 0.14, lastUnitPrice: 0.15, previousUnitPrice: 0.13, avgLeadTimeDays: 4, onTimeDeliveryRate: 95, defectRate: 0.4, reliabilityScore: 92, moq: 1000, paymentTerms: "Net 45", notes: "Standard SHCS in volume. No PPAP needed." },

  // pi-014: Threaded rod B7
  { id: "sih-021", supplierId: "sup-003", itemId: "pi-014", lastOrderDate: "2026-01-22", totalOrders12mo: 5, avgUnitPrice: 18.50, lastUnitPrice: 19.20, previousUnitPrice: 17.80, avgLeadTimeDays: 8, onTimeDeliveryRate: 96, defectRate: 0.2, reliabilityScore: 94, moq: 100, paymentTerms: "Net 30", notes: "Würth holds B7 in 6 ft random lengths. Mill cert per shipment." },
  { id: "sih-022", supplierId: "sup-002", itemId: "pi-014", lastOrderDate: "2025-10-15", totalOrders12mo: 2, avgUnitPrice: 19.80, lastUnitPrice: 20.40, previousUnitPrice: 19.20, avgLeadTimeDays: 12, onTimeDeliveryRate: 85, defectRate: 0.6, reliabilityScore: 78, moq: 50, paymentTerms: "Net 45", notes: "Backup source. Lower MOQ but longer lead time." },

  // pi-015: DTI Squirter
  { id: "sih-023", supplierId: "sup-004", itemId: "pi-015", lastOrderDate: "2025-08-01", totalOrders12mo: 2, avgUnitPrice: 1.10, lastUnitPrice: 1.15, previousUnitPrice: 1.08, avgLeadTimeDays: 15, onTimeDeliveryRate: 90, defectRate: 0.0, reliabilityScore: 85, moq: 250, paymentTerms: "Net 60", notes: "Authorized TurnaSure distributor. Specialty item — limited demand." },

  // pi-016: Counterfeit-suspect Grade 8 hex bolt
  { id: "sih-024", supplierId: "sup-008", itemId: "pi-016", lastOrderDate: "2026-02-12", totalOrders12mo: 6, avgUnitPrice: 0.06, lastUnitPrice: 0.06, previousUnitPrice: 0.06, avgLeadTimeDays: 84, onTimeDeliveryRate: 92, defectRate: 8.5, reliabilityScore: 42, moq: 50000, paymentTerms: "Net 45", notes: "FLAGGED — last 2 batches had non-conforming Grade 8 head markings. Counterfeit investigation open. Do not reorder until QA clears." },
  { id: "sih-025", supplierId: "sup-001", itemId: "pi-016", lastOrderDate: "2025-09-10", totalOrders12mo: 1, avgUnitPrice: 0.09, lastUnitPrice: 0.09, previousUnitPrice: 0.09, avgLeadTimeDays: 6, onTimeDeliveryRate: 96, defectRate: 0.3, reliabilityScore: 93, moq: 5000, paymentTerms: "Net 30", notes: "Verified-domestic alternative to Pacific Rim. Higher unit cost ($0.09 vs $0.06) but US-mill traceable." },

  // pi-017: M5x16 hex bolt
  { id: "sih-026", supplierId: "sup-002", itemId: "pi-017", lastOrderDate: "2026-02-01", totalOrders12mo: 7, avgUnitPrice: 0.04, lastUnitPrice: 0.04, previousUnitPrice: 0.04, avgLeadTimeDays: 4, onTimeDeliveryRate: 95, defectRate: 0.3, reliabilityScore: 93, moq: 5000, paymentTerms: "Net 45", notes: "Standard SKU on Modine HVAC line. Earnest holds VMI." },
];

// --- Co-Order Patterns ---
// Classic fastener kit groupings: bolt + matching nut + flat washer.

export const coOrderPatterns: CoOrderPattern[] = [
  { id: "cop-001", itemId: "pi-001", coItemId: "pi-006", coOrderFrequencyPct: 87 }, // M8 flange bolt + M8 flange nut
  { id: "cop-002", itemId: "pi-001", coItemId: "pi-004", coOrderFrequencyPct: 62 }, // M8 flange bolt + M8 nylock
  { id: "cop-003", itemId: "pi-002", coItemId: "pi-010", coOrderFrequencyPct: 48 }, // M10 SHCS + M10 helicoil
  { id: "cop-004", itemId: "pi-003", coItemId: "pi-008", coOrderFrequencyPct: 91 }, // F436 + A325 TC-bolt
  { id: "cop-005", itemId: "pi-003", coItemId: "pi-015", coOrderFrequencyPct: 38 }, // F436 + DTI Squirter
  { id: "cop-006", itemId: "pi-004", coItemId: "pi-001", coOrderFrequencyPct: 62 }, // M8 nylock + M8 flange bolt
  { id: "cop-007", itemId: "pi-005", coItemId: "pi-009", coOrderFrequencyPct: 55 }, // 3/8 hex bolt + M6 washer (kit)
  { id: "cop-008", itemId: "pi-006", coItemId: "pi-001", coOrderFrequencyPct: 87 }, // M8 flange nut + M8 flange bolt
  { id: "cop-009", itemId: "pi-008", coItemId: "pi-003", coOrderFrequencyPct: 91 }, // A325 + F436 washer
  { id: "cop-010", itemId: "pi-008", coItemId: "pi-015", coOrderFrequencyPct: 64 }, // A325 + DTI Squirter
  { id: "cop-011", itemId: "pi-011", coItemId: "pi-006", coOrderFrequencyPct: 71 }, // M12x40 + flange nut
  { id: "cop-012", itemId: "pi-013", coItemId: "pi-002", coOrderFrequencyPct: 45 }, // 1/4 SHCS + M10 SHCS
  { id: "cop-013", itemId: "pi-014", coItemId: "pi-008", coOrderFrequencyPct: 38 }, // Threaded rod + A325 (anchor systems)
  { id: "cop-014", itemId: "pi-017", coItemId: "pi-009", coOrderFrequencyPct: 76 }, // M5 bolt + M6 washer (HVAC kit)
];

// --- Engineering Requests ---

export const engineeringRequests: EngineeringRequest[] = [
  {
    id: "er-001",
    itemId: "pi-007",
    requesterName: "Tom Nakamura",
    requesterTeam: "OEM Quality Engineering",
    description: "Need a custom 4mm shoulder bolt for the new Apex Detroit seating frame program. Tight tolerance on the shoulder diameter (h7) — this is the load-bearing pivot for the recliner mechanism. Critical-path item — Apex needs first PPAP article by end of March, line ramp end of April. Full PPAP Level 3 + EN 10204 3.1 + IMDS required.",
    urgency: "urgent",
    specs: {
      material: "Grade 12.9 Alloy Steel, Black Oxide",
      dimensions: "Shoulder Ø8.0mm ±0.013, Length 12mm ±0.05, Thread M5x0.8",
      tolerances: "h7 on shoulder Ø, ±0.05 on length",
      finish: "Black Oxide per MIL-DTL-13924",
      compliance: "PPAP Level 3 + EN 10204 3.1 mill cert + IMDS submission",
    },
    attachments: [
      { id: "att-e1", fileName: "shoulder-bolt-rev-c-drawing.pdf", fileType: "pdf", fileSize: 2_450_000, url: "#" },
      { id: "att-e2", fileName: "ppap-package-template.pdf", fileType: "pdf", fileSize: 890_000, url: "#" },
      { id: "att-e3", fileName: "apex-detroit-program-spec.pdf", fileType: "pdf", fileSize: 1_200_000, url: "#" },
    ],
    submittedAt: "2026-03-08T10:30:00Z",
    classificationTags: ["Custom Fastener", "PPAP", "Auto OEM Launch"],
  },
  {
    id: "er-002",
    itemId: "pi-008",
    requesterName: "Rachel Kim",
    requesterTeam: "Structural Programs",
    description: "Replacement A325 TC-bolt assemblies for the Apex Wabash structural frame upgrade. Needs to ship to the Wabash steel-erection contractor before the scheduled lift window (March 20-22). Direct replacement of standard A325 — confirming tension verification protocol with the iron-worker crew chief.",
    urgency: "critical",
    specs: {
      material: "Medium Carbon Steel, Heat Treated",
      dimensions: "3/4-10 x 2 inch overall length",
      tolerances: "Per ASTM F1852/A325",
      grade: "ASTM A325 Type 1",
      finish: "Hot-Dip Galvanized per ASTM A153",
      compliance: "ASTM F1852 + A325 + RCSC tension verification",
    },
    attachments: [
      { id: "att-e4", fileName: "tc-bolt-assembly-spec-sheet.pdf", fileType: "pdf", fileSize: 3_100_000, url: "#" },
      { id: "att-e5", fileName: "tension-test-protocol.pdf", fileType: "pdf", fileSize: 1_400_000, url: "#" },
    ],
    submittedAt: "2026-03-06T15:20:00Z",
    classificationTags: ["Structural Fastener", "Time-Critical", "Field Install"],
  },
  {
    id: "er-003",
    itemId: "pi-010",
    requesterName: "Derek Patel",
    requesterTeam: "Production Repair",
    description: "Stripped-thread repair inserts (Helicoil M10x1.5 tangless) for the Apex repair-pulls program. Currently using standard tanged inserts but Apex switched their assembly torque tooling and they want tangless to avoid tang-removal step. Routine restock — usage is up 30% with the new tooling.",
    urgency: "routine",
    specs: {
      material: "304 Stainless Steel",
      dimensions: "M10x1.5 thread, 15mm (1.5D) length",
      tolerances: "STI per MIL-S-7742",
      finish: "Passivated",
      compliance: "MIL-I-8846 / NASM 21209",
    },
    attachments: [
      { id: "att-e6", fileName: "helicoil-installation-spec.pdf", fileType: "pdf", fileSize: 340_000, url: "#" },
    ],
    submittedAt: "2026-03-09T08:15:00Z",
    classificationTags: ["Specialty Insert", "Tooling-Driven Spec Change"],
  },
];

// --- Draft RFQs ---

export const draftRFQs: DraftRFQ[] = [
  {
    id: "rfq-001",
    itemId: "pi-003",
    supplierIds: ["sup-001"],
    quantity: 12000,
    deliveryDate: "2026-03-25",
    specs: {},
    attachments: [],
    status: "draft",
    createdAt: "2026-03-06T09:00:00Z",
    sentAt: null,
    buyerCompany: "Hexa Industrial Fasteners Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexafasteners.com",
    deliveryAddress: "1500 Distribution Way, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 30",
    validityDays: 14,
    notes: "Confirm HDG dip per ASTM A153. Partial shipments OK.",
  },
  {
    id: "rfq-002",
    itemId: "pi-005",
    supplierIds: ["sup-007"],
    quantity: 4000,
    deliveryDate: "2026-03-20",
    specs: {},
    attachments: [],
    status: "sent",
    createdAt: "2026-03-02T14:00:00Z",
    sentAt: "2026-03-02T16:30:00Z",
    buyerCompany: "Hexa Industrial Fasteners Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexafasteners.com",
    deliveryAddress: "1500 Distribution Way, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 30",
    validityDays: 14,
    notes: "DFARS-compliant US-mill source preferred — customer is auto OEM with traceability requirement.",
  },
  {
    id: "rfq-003",
    itemId: "pi-013",
    supplierIds: ["sup-002", "sup-005"],
    quantity: 8000,
    deliveryDate: "2026-03-25",
    specs: {},
    attachments: [],
    status: "sent",
    createdAt: "2026-03-09T13:00:00Z",
    sentAt: "2026-03-09T14:00:00Z",
    buyerCompany: "Hexa Industrial Fasteners Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexafasteners.com",
    deliveryAddress: "1500 Distribution Way, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 30",
    validityDays: 14,
    notes: "Urgent — current stock critically low. 1/4-20 SHCS in plain finish.",
  },
  {
    id: "rfq-006",
    itemId: "pi-006",
    supplierIds: ["sup-001", "sup-002"],
    quantity: 50000,
    deliveryDate: "2026-03-08",
    specs: {},
    attachments: [],
    status: "sent",
    createdAt: "2026-02-25T11:00:00Z",
    sentAt: "2026-02-25T14:00:00Z",
    buyerCompany: "Hexa Industrial Fasteners Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexafasteners.com",
    deliveryAddress: "1500 Distribution Way, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 45",
    validityDays: 14,
    notes: "Restock — pairs with M8x25 flange bolt blanket release. Confirm DIN 6923 head profile.",
  },
  {
    id: "rfq-004",
    itemId: "pi-002",
    supplierIds: ["sup-005", "sup-003"],
    quantity: 25000,
    deliveryDate: "2026-03-20",
    specs: {},
    attachments: [],
    status: "sent",
    createdAt: "2026-03-06T18:00:00Z",
    sentAt: "2026-03-07T10:00:00Z",
    buyerCompany: "Hexa Industrial Fasteners Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexafasteners.com",
    deliveryAddress: "1500 Distribution Way, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 30",
    validityDays: 14,
    notes: "Apex Detroit program launch — PPAP package + EN 10204 3.1 mill cert REQUIRED. IMDS submission required.",
  },
];

// --- RFQ Supplier Entries (tracking per-supplier RFQ status) ---

export const rfqSupplierEntries: Record<string, RFQSupplierEntry[]> = {
  "rfq-006": [
    { supplierId: "sup-001", sentAt: "2026-02-25T14:00:00Z", responseStatus: "quote_received", quoteId: "sq-006-a" },
    { supplierId: "sup-002", sentAt: "2026-02-25T14:00:00Z", responseStatus: "quote_received", quoteId: "sq-006-b" },
  ],
  "rfq-003": [
    { supplierId: "sup-002", sentAt: "2026-03-09T14:00:00Z", responseStatus: "no_response" },
    { supplierId: "sup-005", sentAt: "2026-03-09T14:00:00Z", responseStatus: "no_response" },
  ],
  "rfq-004": [
    { supplierId: "sup-005", sentAt: "2026-03-07T10:00:00Z", responseStatus: "quote_received", quoteId: "sq-001" },
    { supplierId: "sup-003", sentAt: "2026-03-07T10:00:00Z", responseStatus: "quote_received", quoteId: "sq-002" },
  ],
};

// --- Supplier Quotes ---

export const supplierQuotes: SupplierQuote[] = [
  {
    id: "sq-006-a",
    rfqId: "rfq-006",
    supplierId: "sup-001",
    unitPrice: 0.05,
    totalPrice: 2500,
    leadTimeDays: 3,
    moq: 5000,
    paymentTerms: "Net 30",
    deliveryTerms: "FOB Origin",
    validUntil: "2026-03-11",
    receivedAt: "2026-02-26T10:30:00Z",
    notes: "50,000 units in stock. Same-day ship on PO receipt.",
  },
  {
    id: "sq-006-b",
    rfqId: "rfq-006",
    supplierId: "sup-002",
    unitPrice: 0.058,
    totalPrice: 2900,
    leadTimeDays: 5,
    moq: 2500,
    paymentTerms: "Net 45",
    deliveryTerms: "Delivered",
    validUntil: "2026-03-11",
    receivedAt: "2026-02-27T09:00:00Z",
    notes: "Lower MOQ, delivered pricing. Slightly higher unit cost.",
  },
  {
    id: "sq-001",
    rfqId: "rfq-004",
    supplierId: "sup-005",
    unitPrice: 0.42,
    totalPrice: 10500,
    leadTimeDays: 14,
    moq: 5000,
    paymentTerms: "Net 30",
    deliveryTerms: "FOB Origin",
    validUntil: "2026-03-21",
    receivedAt: "2026-03-08T16:30:00Z",
    notes: "PPAP Level 3 package + EN 10204 3.1 mill cert + IMDS submission included at quoted price. 14-day lead time.",
  },
  {
    id: "sq-002",
    rfqId: "rfq-004",
    supplierId: "sup-003",
    unitPrice: 0.46,
    totalPrice: 11500,
    leadTimeDays: 7,
    moq: 1000,
    paymentTerms: "Net 30",
    deliveryTerms: "Delivered",
    validUntil: "2026-03-21",
    receivedAt: "2026-03-09T09:15:00Z",
    notes: "Faster delivery, lower MOQ. PPAP available but adds $1,200 doc-prep fee. Delivered pricing includes freight.",
  },
];

// --- Purchase Orders ---

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "pur-006",
    itemId: "pi-006",
    supplierId: "sup-001",
    quoteId: "sq-006-a",
    quantity: 50000,
    unitPrice: 0.05,
    totalPrice: 2500,
    paymentTerms: "Net 30",
    deliveryAddress: "1500 Distribution Way, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: "2026-03-04",
    status: "sent",
    createdAt: "2026-02-27T14:00:00Z",
    sentAt: "2026-02-27T16:00:00Z",
    shipmentId: "shp-proc-006",
  },
  {
    id: "pur-011",
    itemId: "pi-011",
    supplierId: "sup-002",
    quantity: 30000,
    unitPrice: 0.40,
    totalPrice: 12000,
    paymentTerms: "Net 45",
    deliveryAddress: "1500 Distribution Way, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: "2026-03-17",
    status: "sent",
    createdAt: "2026-03-10T09:00:00Z",
    sentAt: "2026-03-10T09:15:00Z",
  },
  {
    id: "pur-001",
    itemId: "pi-007",
    supplierId: "sup-007",
    quantity: 25000,
    unitPrice: 1.92,
    totalPrice: 48000,
    paymentTerms: "Net 30",
    deliveryAddress: "1500 Distribution Way, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: "2026-03-22",
    status: "sent",
    createdAt: "2026-03-04T10:00:00Z",
    sentAt: "2026-03-04T14:30:00Z",
  },
  {
    id: "pur-002",
    itemId: "pi-008",
    supplierId: "sup-004",
    quantity: 2500,
    unitPrice: 1.85,
    totalPrice: 4625,
    paymentTerms: "Net 60",
    deliveryAddress: "1500 Distribution Way, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: "2026-03-18",
    status: "sent",
    createdAt: "2026-02-24T09:00:00Z",
    sentAt: "2026-02-24T11:00:00Z",
    shipmentId: "shp-proc-001",
  },
];

// --- Open POs ---

export const openPOs: OpenPO[] = [
  {
    id: "po-001",
    itemId: "pi-005",
    supplierId: "sup-007",
    quantity: 4000,
    orderDate: "2026-03-03",
    expectedDelivery: "2026-03-14",
    status: "shipped",
    trackingRef: "LES-2026-4418",
  },
  {
    id: "po-002",
    itemId: "pi-006",
    supplierId: "sup-001",
    quantity: 50000,
    orderDate: "2026-03-01",
    expectedDelivery: "2026-03-10",
    status: "in_transit",
    trackingRef: "BBI-INV-88721",
  },
  {
    id: "po-003",
    itemId: "pi-012",
    supplierId: "sup-004",
    quantity: 18000,
    orderDate: "2026-01-07",
    expectedDelivery: "2026-04-04",
    status: "confirmed",
    trackingRef: "KBI-CTR-2026-001",
  },
];

// --- ERP Scan Config ---

export const defaultERPScanConfig: ERPScanConfig = {
  scanFrequency: "1hr",
  reorderPointSource: "erp",
  alertInApp: true,
  alertEmail: false,
  watchedItemIds: ["pi-001", "pi-002", "pi-003", "pi-004", "pi-005", "pi-006", "pi-009", "pi-011", "pi-012", "pi-013"],
  customReorderPoints: {},
};

// --- Helper functions ---

export function getSupplier(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function getSupplierHistoriesForItem(itemId: string): (SupplierItemHistory & { supplier: Supplier })[] {
  return supplierItemHistories
    .filter((h) => h.itemId === itemId)
    .map((h) => ({ ...h, supplier: suppliers.find((s) => s.id === h.supplierId)! }))
    .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
}

export function getCoOrderItems(itemId: string): (CoOrderPattern & { item: ProcurementItem })[] {
  return coOrderPatterns
    .filter((p) => p.itemId === itemId)
    .map((p) => ({ ...p, item: procurementItems.find((i) => i.id === p.coItemId)! }))
    .filter((p) => p.item)
    .sort((a, b) => b.coOrderFrequencyPct - a.coOrderFrequencyPct);
}

export function getEngineeringRequest(itemId: string): EngineeringRequest | undefined {
  return engineeringRequests.find((r) => r.itemId === itemId);
}

export function getDraftRFQ(rfqId: string): DraftRFQ | undefined {
  return draftRFQs.find((r) => r.id === rfqId);
}

export function getDaysOfStockRemaining(item: ProcurementItem): number {
  if (item.avgDailyConsumption === 0) return Infinity;
  return Math.round(item.currentStock / item.avgDailyConsumption);
}

export function getStockColor(days: number): "red" | "amber" | "green" {
  if (days <= 7) return "red";
  if (days <= 14) return "amber";
  return "green";
}

export function getItemsForSameSupplier(itemId: string, supplierId: string): ProcurementItem[] {
  return procurementItems.filter(
    (i) => i.id !== itemId && i.preferredSupplierId === supplierId && i.status === "flagged"
  );
}

export function getOpenPOsForItem(itemId: string): (OpenPO & { supplier: Supplier })[] {
  return openPOs
    .filter((po) => po.itemId === itemId)
    .map((po) => ({ ...po, supplier: suppliers.find((s) => s.id === po.supplierId)! }))
    .filter((po) => po.supplier);
}

export function getBestLeadTime(itemId: string): number {
  const histories = supplierItemHistories.filter((h) => h.itemId === itemId);
  if (histories.length === 0) return Infinity;
  return Math.min(...histories.map((h) => h.avgLeadTimeDays));
}

export function hasSupplierHistory(itemId: string): boolean {
  return supplierItemHistories.some((h) => h.itemId === itemId);
}

export function getRFQSupplierEntries(rfqId: string): (RFQSupplierEntry & { supplier: Supplier })[] {
  const entries = rfqSupplierEntries[rfqId] ?? [];
  return entries
    .map((e) => ({ ...e, supplier: suppliers.find((s) => s.id === e.supplierId)! }))
    .filter((e) => e.supplier);
}

export function getQuotesForRFQ(rfqId: string): (SupplierQuote & { supplier: Supplier })[] {
  return supplierQuotes
    .filter((q) => q.rfqId === rfqId)
    .map((q) => ({ ...q, supplier: suppliers.find((s) => s.id === q.supplierId)! }))
    .filter((q) => q.supplier);
}

export function getPurchaseOrder(poId: string): (PurchaseOrder & { supplier: Supplier }) | undefined {
  const po = purchaseOrders.find((p) => p.id === poId);
  if (!po) return undefined;
  const supplier = suppliers.find((s) => s.id === po.supplierId);
  if (!supplier) return undefined;
  return { ...po, supplier };
}

export function getDraftRFQForItem(itemId: string): DraftRFQ | undefined {
  return draftRFQs.find((r) => r.itemId === itemId);
}

export function getQuoteById(quoteId: string): (SupplierQuote & { supplier: Supplier }) | undefined {
  const q = supplierQuotes.find((sq) => sq.id === quoteId);
  if (!q) return undefined;
  const supplier = suppliers.find((s) => s.id === q.supplierId);
  if (!supplier) return undefined;
  return { ...q, supplier };
}
