import { CatalogItem } from "./types";

export interface SkuCatalogEntry extends CatalogItem {
  category: string;
  tags: string[];
  currentStock: number;
  reorderPoint: number;
  leadTimeDays: number;
}

function e(
  catalogSku: string,
  catalogName: string,
  catalogDescription: string,
  catalogPrice: number,
  catalogUom: string,
  category: string,
  tags: string[],
  currentStock: number,
  reorderPoint: number,
  leadTimeDays: number,
): SkuCatalogEntry {
  return { catalogSku, catalogName, catalogDescription, catalogPrice, catalogUom, category, tags, currentStock, reorderPoint, leadTimeDays };
}

export const skuCatalog: SkuCatalogEntry[] = [
  // ── Bearings & Bearing Kits ──────────────────────────────────────────
  e("IBK-200", "Industrial Bearing Kit 200-Series", "Light-duty bearing set for small machinery. 4 bearings per kit.", 45.00, "kit", "Bearings", ["industrial", "precision", "light-duty", "machinery"], 180, 30, 7),
  e("IBK-300", "Industrial Bearing Kit 300-Series", "Medium-duty bearing set for general industrial use. 6 bearings per kit.", 67.50, "kit", "Bearings", ["industrial", "precision", "medium-duty", "machinery"], 120, 25, 7),
  e("IBK-400", "Industrial Bearing Kit 400-Series", "Precision bearing set for heavy-duty machinery. Includes 8 bearings per kit.", 89.50, "kit", "Bearings", ["industrial", "precision", "heavy-duty", "machinery"], 95, 20, 10),
  e("IBK-500", "Industrial Bearing Kit 500-Series", "High-performance bearing set for extreme load applications. 10 bearings per kit.", 112.00, "kit", "Bearings", ["industrial", "precision", "extreme-load", "machinery"], 60, 15, 10),
  e("IBK-600", "Industrial Bearing Kit 600-Series", "Premium bearing set for continuous-duty industrial equipment. 12 bearings per kit.", 145.00, "kit", "Bearings", ["industrial", "premium", "continuous-duty", "machinery"], 35, 10, 14),
  e("BB-6204", "Ball Bearing 6204-2RS", "Deep groove ball bearing, 20x47x14mm, double rubber sealed.", 4.25, "each", "Bearings", ["ball bearing", "sealed", "deep groove", "6204"], 500, 100, 5),
  e("BB-6205", "Ball Bearing 6205-2RS", "Deep groove ball bearing, 25x52x15mm, double rubber sealed.", 5.10, "each", "Bearings", ["ball bearing", "sealed", "deep groove", "6205"], 420, 80, 5),
  e("BB-6206", "Ball Bearing 6206-2RS", "Deep groove ball bearing, 30x62x16mm, double rubber sealed.", 6.75, "each", "Bearings", ["ball bearing", "sealed", "deep groove", "6206"], 350, 80, 5),
  e("RB-NJ-205", "Roller Bearing NJ 205", "Cylindrical roller bearing, 25x52x15mm, single row.", 18.50, "each", "Bearings", ["roller bearing", "cylindrical", "NJ205"], 150, 30, 8),
  e("RB-NJ-206", "Roller Bearing NJ 206", "Cylindrical roller bearing, 30x62x16mm, single row.", 22.00, "each", "Bearings", ["roller bearing", "cylindrical", "NJ206"], 120, 25, 8),
  e("TB-51105", "Thrust Bearing 51105", "Single direction thrust ball bearing, 25x42x11mm.", 8.90, "each", "Bearings", ["thrust bearing", "axial", "51105"], 200, 40, 7),

  // ── Flanges & Fittings ───────────────────────────────────────────────
  e("SF-2-150", 'SS Flange 2" 150lb', "2-inch stainless steel flange, 150 lb pressure class, ANSI B16.5.", 12.50, "each", "Flanges", ["stainless steel", "flange", "2-inch", "150lb", "ANSI"], 300, 50, 5),
  e("SF-2-300", 'SS Flange 2" 300lb', "2-inch stainless steel flange, 300 lb pressure class, ANSI B16.5.", 24.00, "each", "Flanges", ["stainless steel", "flange", "2-inch", "300lb", "ANSI"], 180, 30, 7),
  e("SF-3-150", 'SS Flange 3" 150lb', "3-inch stainless steel flange, 150 lb pressure class.", 18.75, "each", "Flanges", ["stainless steel", "flange", "3-inch", "150lb"], 25, 50, 5),
  e("SF-3-300", 'SS Flange 3" 300lb', "3-inch stainless steel flange, 300 lb pressure class.", 34.00, "each", "Flanges", ["stainless steel", "flange", "3-inch", "300lb"], 120, 25, 7),
  e("SF-4-150", 'SS Flange 4" 150lb', "4-inch stainless steel flange, 150 lb pressure class.", 28.00, "each", "Flanges", ["stainless steel", "flange", "4-inch", "150lb"], 200, 40, 5),
  e("SF-4-300", 'SS Flange 4" 300lb', "4-inch stainless steel flange, 300 lb pressure class.", 48.00, "each", "Flanges", ["stainless steel", "flange", "4-inch", "300lb"], 80, 20, 7),
  e("CF-3-WN", 'Carbon Flange 3" Weld-Neck', "3-inch carbon steel weld-neck flange, schedule 40.", 22.00, "each", "Flanges", ["carbon steel", "flange", "3-inch", "weld-neck"], 150, 30, 6),
  e("CF-4-WN", 'Carbon Flange 4" Weld-Neck', "4-inch carbon steel weld-neck flange, schedule 40.", 35.00, "each", "Flanges", ["carbon steel", "flange", "4-inch", "weld-neck"], 100, 20, 6),
  e("BF-2-SO", 'Brass Flange 2" Slip-On', "2-inch brass slip-on flange for low-pressure systems.", 15.50, "each", "Flanges", ["brass", "flange", "2-inch", "slip-on"], 200, 40, 5),
  e("BF-3-SO", 'Brass Flange 3" Slip-On', "3-inch brass slip-on flange for low-pressure systems.", 21.00, "each", "Flanges", ["brass", "flange", "3-inch", "slip-on"], 140, 30, 5),
  e("GK-FL-2", 'Flange Gasket Kit 2"', "Complete gasket kit for 2-inch flanges, includes bolts and nuts.", 2.75, "set", "Flanges", ["gasket", "flange", "2-inch", "kit"], 400, 80, 3),
  e("GK-FL-3", 'Flange Gasket Kit 3"', "Complete gasket kit for 3-inch flanges, includes bolts and nuts.", 3.50, "set", "Flanges", ["gasket", "flange", "3-inch", "kit"], 18, 60, 3),
  e("GK-FL-4", 'Flange Gasket Kit 4"', "Complete gasket kit for 4-inch flanges, includes bolts and nuts.", 4.25, "set", "Flanges", ["gasket", "flange", "4-inch", "kit"], 280, 50, 3),

  // ── Hex Bolts & Cap Screws ───────────────────────────────────────────
  e("HB-M8-30", "Hex Bolt M8x30mm 25-Pack", "Grade 8.8 hex bolt, M8 thread, 30mm length. 25 per pack.", 3.80, "pack", "Hex Bolts & Cap Screws", ["hex bolt", "M8", "grade 8.8", "30mm"], 500, 100, 3),
  e("HB-M10-40", "Hex Bolt M10x40mm 25-Pack", "Grade 8.8 hex bolt, M10 thread, 40mm length. 25 per pack.", 4.50, "pack", "Hex Bolts & Cap Screws", ["hex bolt", "M10", "grade 8.8", "40mm"], 0, 80, 3),
  e("HB-M12-50", "Hex Bolt M12x50mm 25-Pack", "Grade 8.8 hex bolt, M12 thread, 50mm length. 25 per pack.", 6.20, "pack", "Hex Bolts & Cap Screws", ["hex bolt", "M12", "grade 8.8", "50mm"], 350, 60, 3),
  e("HB-M16-60", "Hex Bolt M16x60mm 25-Pack", "Grade 8.8 hex bolt, M16 thread, 60mm length. 25 per pack.", 9.40, "pack", "Hex Bolts & Cap Screws", ["hex bolt", "M16", "grade 8.8", "60mm"], 200, 40, 5),
  e("SB-M8-200", "M8 Hex Bolt Grade 8 — 200-Pack", "Grade 8 metric hex bolts, M8 thread, 200 per box, plain finish.", 14.50, "pack", "Hex Bolts & Cap Screws", ["hex bolt", "M8", "grade 8", "bulk"], 300, 50, 3),
  e("FB-M8X25-1090-ZN", "M8x25 Grade 10.9 Flange Bolt — Zinc", "Grade 10.9 metric flange bolt, M8x25, zinc plated. JIS B 1189. Auto OEM line-side standard.", 0.18, "each", "Hex Bolts & Cap Screws", ["flange bolt", "M8", "grade 10.9", "zinc", "auto", "JIS B 1189"], 8500, 25000, 5),
  e("HEX-12-13X150-G5-PL", '1/2"-13 x 1-1/2" Grade 5 Hex Bolt — Plain', "Grade 5 imperial hex bolt, 1/2-13 x 1-1/2 inch, plain finish. SAE J429.", 0.24, "each", "Hex Bolts & Cap Screws", ["hex bolt", "1/2-13", "grade 5", "plain", "SAE J429"], 4200, 1000, 4),
  e("HEX-38X4-G8-YZ", '3/8"-16 x 4" Grade 8 Hex Bolt — Yellow Zinc', "Grade 8 imperial hex bolt, 3/8-16 x 4 inch, yellow zinc-chromate finish. SAE J429.", 0.34, "each", "Hex Bolts & Cap Screws", ["hex bolt", "3/8-16", "grade 8", "yellow zinc", "DFARS"], 750, 1000, 7),
  e("HEX-M10X30-88-ZN", "M10x30 Hex Bolt Grade 8.8 — Zinc", "Grade 8.8 metric hex bolt, M10x30, zinc plated. DIN 933.", 0.32, "each", "Hex Bolts & Cap Screws", ["hex bolt", "M10", "grade 8.8", "zinc", "DIN 933"], 12000, 8000, 4),
  e("HEX-M12X40-88-ZN", "M12x40 Hex Bolt Grade 8.8 — Zinc", "Grade 8.8 metric hex bolt, M12 thread, 40mm length, zinc plated. DIN 933. Top-volume ag MRO SKU.", 0.42, "each", "Hex Bolts & Cap Screws", ["hex bolt", "M12", "grade 8.8", "zinc", "DIN 933", "ag"], 18000, 12000, 4),
  e("HEX-M5X16-88-ZN", "M5x16 Hex Bolt Grade 8.8 — Zinc", "Grade 8.8 metric hex bolt, M5x16, zinc plated. HVAC-line consumable.", 0.04, "each", "Hex Bolts & Cap Screws", ["hex bolt", "M5", "grade 8.8", "zinc", "HVAC"], 1800, 6000, 4),
  e("HEX-M6X16-88-ZN", "M6x16 Hex Bolt Grade 8.8 — Zinc", "Grade 8.8 metric hex bolt, M6x16, zinc plated. HVAC-line consumable.", 0.08, "each", "Hex Bolts & Cap Screws", ["hex bolt", "M6", "grade 8.8", "zinc", "HVAC"], 22000, 8000, 4),

  // ── Socket Head Screws (SHCS / BHCS / FHCS) ──────────────────────────
  e("SHCS-M10X40-1290-BO", "M10x40 Socket Head Cap Screw Grade 12.9", "Grade 12.9 SHCS, M10x40, black oxide. ISO 4762. PPAP-capable on request.", 0.42, "each", "Socket Head Screws", ["SHCS", "M10", "grade 12.9", "black oxide", "ISO 4762", "PPAP"], 3400, 5000, 14),
  e("SHCS-M6X20-A2", "Socket Head Cap Screw M6x20 — A2", "A2-70 stainless socket head cap screw, M6x20. ISO 4762.", 0.22, "each", "Socket Head Screws", ["SHCS", "M6", "A2", "stainless", "ISO 4762"], 8500, 1000, 5),
  e("SHCS-14-20X1-PL", '1/4"-20 x 1" Socket Head Cap Screw — Plain', "Grade 8 SHCS, 1/4-20 x 1 inch, plain (uncoated). ASME B18.3.", 0.14, "each", "Socket Head Screws", ["SHCS", "1/4-20", "grade 8", "plain", "ASME B18.3"], 320, 1500, 4),
  e("BHCS-M6X16-BO", "Button Head Cap Screw M6x16 — Black Oxide", "Grade 10.9 button head cap screw, M6x16, black oxide. ISO 7380.", 0.18, "each", "Socket Head Screws", ["BHCS", "M6", "grade 10.9", "black oxide", "ISO 7380"], 2800, 600, 5),
  e("FHCS-M8X25-A2", "Flat Head Cap Screw M8x25 — A2", "A2 stainless flat head countersink cap screw, M8x25. ISO 10642.", 0.32, "each", "Socket Head Screws", ["FHCS", "M8", "A2", "stainless", "ISO 10642", "countersink"], 1900, 400, 6),
  e("SS-SCR-100", "Stainless Pan Head Phillips Screw 100-Pack", "18-8 stainless steel Phillips pan head screws, #8 x 1 inch. 100 per pack.", 7.20, "pack", "Socket Head Screws", ["stainless steel", "Phillips", "#8 x 1\"", "pan head"], 400, 80, 3),
  e("SS-SCR-200", "Stainless Pan Head Phillips Screw 200-Pack", "18-8 stainless steel Phillips pan head screws, #8 x 1 inch. 200 per pack.", 12.80, "pack", "Socket Head Screws", ["stainless steel", "Phillips", "#8 x 1\"", "pan head", "bulk"], 200, 40, 3),

  // ── Nuts ─────────────────────────────────────────────────────────────
  e("LN-M10-50", "Nylock Lock Nut M10 50-Pack", "Grade 8 nylon-insert lock nut, M10, zinc plated. DIN 985. 50 per pack.", 5.60, "pack", "Nuts", ["nylock", "lock nut", "M10", "grade 8", "zinc", "DIN 985"], 280, 50, 3),
  e("LN-M12-50", "Nylock Lock Nut M12 50-Pack", "Grade 8 nylon-insert lock nut, M12, zinc plated. DIN 985. 50 per pack.", 7.20, "pack", "Nuts", ["nylock", "lock nut", "M12", "grade 8", "zinc", "DIN 985"], 220, 40, 3),
  e("NUT-NYL-M8-ZN", "M8 Nylock Nut Grade 8 — Zinc", "Grade 8 nylon-insert lock nut, M8, zinc plated. DIN 985.", 0.06, "each", "Nuts", ["nylock", "M8", "grade 8", "zinc", "DIN 985"], 4200, 8000, 4),
  e("NUT-NYL-M10-ZN", "M10 Nylock Nut Grade 8 — Zinc", "Grade 8 nylon-insert lock nut, M10, zinc plated. DIN 985.", 0.14, "each", "Nuts", ["nylock", "M10", "grade 8", "zinc", "DIN 985"], 5200, 1500, 4),
  e("NUT-HEX-M6-ZN", "M6 Hex Nut Grade 8 — Zinc", "Grade 8 metric hex nut, M6, zinc plated. DIN 934.", 0.03, "each", "Nuts", ["hex nut", "M6", "grade 8", "zinc", "DIN 934"], 28000, 8000, 3),
  e("FN-M8-G8-ZN", "M8 Hex Flange Nut Grade 8 — Zinc", "Grade 8 metric serrated flange nut, M8, zinc plated. DIN 6923.", 0.05, "each", "Nuts", ["flange nut", "M8", "grade 8", "zinc", "DIN 6923", "serrated"], 28000, 8000, 3),
  e("NUT-HVY-12-13", '1/2"-13 Heavy Hex Nut — HDG', 'ASTM A563 Grade DH heavy hex nut, 1/2-13, hot-dip galvanized. Pairs with A325 structural bolts.', 0.18, "each", "Nuts", ["heavy hex", "1/2-13", "A563 DH", "HDG", "structural"], 3200, 800, 5),
  e("NUT-KEPS-M5-ZN", "M5 K-Lock (Keps) Nut — Zinc", "M5 free-spinning external-tooth lock washer nut, zinc plated.", 0.04, "each", "Nuts", ["K-lock", "Keps", "M5", "zinc", "lock washer"], 4500, 1500, 4),

  // ── Washers ──────────────────────────────────────────────────────────
  e("WS-F436-12-HDG", 'F436 1/2" Structural Flat Washer — HDG', "ASTM F436 Type 1 structural washer, 1/2 inch, hot-dip galvanized.", 0.32, "each", "Washers", ["F436", "structural", "1/2 inch", "HDG", "ASTM F436"], 2800, 4000, 6),
  e("WSH-FLT-M10-ZN", "M10 Flat Washer DIN 125 — Zinc", "DIN 125 Form A flat washer, M10, zinc plated.", 0.04, "each", "Washers", ["flat washer", "M10", "zinc", "DIN 125"], 12000, 3000, 3),
  e("WSH-M6-ZP", "M6 Zinc-Plated Flat Washer — DIN 125", "DIN 125 Form A flat washer, M6, zinc plated.", 0.012, "each", "Washers", ["flat washer", "M6", "zinc", "DIN 125"], 14000, 20000, 5),
  e("WSH-SPR-M12-SS", "M12 Stainless Spring Washer — A2", "A2 stainless steel spring washer, M12. DIN 127.", 0.18, "each", "Washers", ["spring washer", "M12", "A2", "stainless", "DIN 127"], 1400, 400, 4),
  e("FW-M10-100", "Flat Washer M10 100-Pack", "Zinc plated flat washers, M10. DIN 125. 100 per pack.", 3.90, "pack", "Washers", ["flat washer", "M10", "zinc", "DIN 125"], 400, 80, 3),
  e("SW-M10-100", "Spring Lock Washer M10 100-Pack", "Zinc plated spring lock washers, M10. DIN 127. 100 per pack.", 4.50, "pack", "Washers", ["spring washer", "M10", "zinc", "lock", "DIN 127"], 350, 70, 3),
  e("NW-100", "Nylon Washer 100-Count", "Insulating nylon washers, M6, 100 per bag.", 6.25, "bag", "Washers", ["nylon", "washer", "insulating", "M6"], 350, 60, 3),
  e("NW-200", "Nylon Washer 200-Count", "Insulating nylon washers, M6, 200 per bag.", 11.00, "bag", "Washers", ["nylon", "washer", "insulating", "M6", "bulk"], 150, 30, 3),
  e("WS-M8-CON-ZN", "M8 Conical Spring Washer — Zinc", "DIN 6796 conical spring washer, M8, zinc plated. Pairs with M8 flange bolts.", 0.04, "each", "Washers", ["conical", "spring washer", "M8", "zinc", "DIN 6796"], 6500, 4000, 4),

  // ── Anchors & Concrete Fasteners ─────────────────────────────────────
  e("LAG-38X4-HDG", '3/8" x 4" Hex Lag Screw — HDG', "Hex head lag screw, 3/8 inch x 4 inch, hot-dip galvanized.", 0.48, "each", "Anchors", ["lag screw", "3/8", "HDG", "hex head", "wood"], 1850, 500, 5),
  e("LAG-516X3-HDG", '5/16" x 3" Hex Lag Bolt — HDG', "Hex head lag bolt, 5/16 inch x 3 inch, hot-dip galvanized.", 0.32, "each", "Anchors", ["lag bolt", "5/16", "HDG", "hex head", "wood"], 5400, 1500, 5),
  e("LAG-516X3-ZN", '5/16" x 3" Hex Lag Bolt — Zinc', "Hex head lag bolt, 5/16 inch x 3 inch, zinc plated.", 0.24, "each", "Anchors", ["lag bolt", "5/16", "zinc", "hex head", "wood"], 8200, 1500, 4),
  e("ANC-WED-12-3", '1/2" x 3" Wedge Anchor — Zinc', "Heavy-duty wedge anchor for concrete, 1/2 inch x 3 inch, zinc plated. ICC-ES approved.", 0.95, "each", "Anchors", ["wedge anchor", "concrete", "1/2", "zinc", "ICC-ES"], 1200, 300, 6),
  e("ANC-DRP-38", '3/8" Drop-In Anchor — Zamak', "Drop-in anchor for concrete, 3/8 inch, zamak. ICC-ES approved.", 0.48, "each", "Anchors", ["drop-in anchor", "concrete", "3/8", "zamak", "ICC-ES"], 2400, 600, 6),
  e("UB-38-RND", '3/8"-16 U-Bolt Round Bend — HDG', "Round-bend U-bolt for pipe and tubing, 3/8-16 thread, HDG.", 1.65, "each", "Anchors", ["U-bolt", "round bend", "3/8-16", "HDG", "pipe"], 850, 250, 5),
  e("UB-38-SQR", '3/8"-16 U-Bolt Square Bend — HDG', "Square-bend U-bolt for square tubing, 3/8-16 thread, HDG.", 1.95, "each", "Anchors", ["U-bolt", "square bend", "3/8-16", "HDG", "tube"], 620, 200, 5),

  // ── Threaded Rod & Studs ─────────────────────────────────────────────
  e("TR-58-11X6-B7", '5/8"-11 x 6 ft Threaded Rod — Grade B7', "ASTM A193 Grade B7 alloy steel threaded rod, 5/8-11, 6 ft length, plain. Mill cert per shipment.", 18.50, "each", "Threaded Rod & Studs", ["threaded rod", "5/8-11", "B7", "A193", "6 ft", "mill cert"], 90, 250, 8),
  e("TR-12-13X3-ZN", '1/2"-13 x 3 ft Threaded Rod — Zinc', "Low-carbon steel threaded rod, 1/2-13, 3 ft length, zinc plated.", 4.20, "each", "Threaded Rod & Studs", ["threaded rod", "1/2-13", "zinc", "3 ft"], 320, 100, 5),
  e("TR-M10-1M-A2", "M10 x 1m Threaded Rod — A2 Stainless", "A2-70 stainless threaded rod, M10, 1 meter length. DIN 975.", 5.80, "each", "Threaded Rod & Studs", ["threaded rod", "M10", "A2", "stainless", "1m", "DIN 975"], 240, 80, 6),
  e("STUD-58-11X8-B7", '5/8"-11 x 8" Stud Bolt — B7', "ASTM A193 B7 stud bolt with 2 heavy hex nuts, 5/8-11 x 8 inch, plain. Mill cert per shipment.", 4.85, "each", "Threaded Rod & Studs", ["stud bolt", "5/8-11", "B7", "A193", "heavy hex", "mill cert"], 480, 120, 7),
  e("STUD-12-13X6-B7", '1/2"-13 x 6" Stud Bolt — B7', "ASTM A193 B7 stud bolt with 2 heavy hex nuts, 1/2-13 x 6 inch, plain.", 3.15, "each", "Threaded Rod & Studs", ["stud bolt", "1/2-13", "B7", "A193", "heavy hex"], 380, 100, 7),

  // ── Self-Tappers & Sheet-Metal Screws ────────────────────────────────
  e("ST-10X1-PAN-A2", "#10 x 1\" Pan Head Phillips Self-Tapper — A2", "A2 stainless self-tapping screw, #10 x 1 inch, pan head Phillips drive.", 0.11, "each", "Self-Tappers", ["self-tapper", "#10", "A2", "Phillips", "pan head"], 8400, 2000, 5),
  e("ST-12X075-HEX-ZN", "#12 x 3/4\" Hex Washer Head Self-Tapper — Zinc", "#12 x 3/4 inch hex washer head self-tapping screw, zinc plated.", 0.09, "each", "Self-Tappers", ["self-tapper", "#12", "zinc", "hex washer head"], 5200, 1500, 4),
  e("SD-14-PHL-ZN", "#14 Self-Drilling Screw 1\" Hex Head — Zinc", "Self-drilling sheet metal screw, #14 x 1 inch, hex head, zinc plated.", 0.13, "each", "Self-Tappers", ["self-drilling", "#14", "zinc", "hex head", "sheet metal"], 3800, 1000, 5),
  e("SMS-8X075-FLT-ZN", "#8 x 3/4\" Flat Head Sheet Metal Screw — Zinc", "#8 x 3/4 inch flat head Phillips sheet metal screw, zinc plated.", 0.04, "each", "Self-Tappers", ["sheet metal screw", "#8", "zinc", "flat head", "Phillips"], 12000, 3000, 3),
  e("SCR-ST-48x25-ZP", "Self-Tapping Screw 4.8x25mm — Zinc 200-Pack", "Pozi pan head self-tapping screw, 4.8x25mm, zinc plated. 200 per pack.", 16.00, "pack", "Self-Tappers", ["self-tapper", "4.8x25", "zinc", "Pozi", "pan head"], 480, 100, 3),

  // ── Specialty Fasteners ──────────────────────────────────────────────
  e("TC-A325-34X2-ASM", 'A325 TC-Bolt Assembly 3/4"x2"', "ASTM F1852/A325 tension-control bolt assembly, 3-piece (TC bolt + heavy hex nut + F436 washer), 3/4 inch x 2 inch, hot-dip galvanized.", 1.85, "each", "Specialty", ["TC bolt", "A325", "structural", "3/4", "HDG", "ASTM F1852", "F436"], 2500, 800, 18),
  e("HUCK-BOM-516-300", 'Huck BOM 5/16" Blind Rivet (0.300 grip)', 'Huck BOM (Blind, Oversize, Magna-Lok) 5/16" structural blind rivet, 0.300 grip. Sole-source from Arconic.', 0.95, "each", "Specialty", ["Huck", "blind rivet", "BOM", "5/16", "Arconic", "structural"], 1850, 4000, 84),
  e("HEL-M8X125-TL", "Helicoil M8x1.25 Tangless Insert", "Tangless screw thread insert, M8x1.25, 1.5D length, 304 stainless steel.", 0.85, "each", "Specialty", ["Helicoil", "thread insert", "M8x1.25", "tangless", "304 SS"], 920, 200, 8),
  e("HEL-M10X150-TL", "Helicoil M10x1.5 Tangless Insert", "Tangless screw thread insert, M10x1.5, 1.5D length, 304 stainless steel.", 0.95, "each", "Specialty", ["Helicoil", "thread insert", "M10x1.5", "tangless", "304 SS"], 80, 200, 10),
  e("DTI-SQT-12", 'DTI Squirter Direct Tension Indicator 1/2"', 'TurnaSure Squirter direct tension indicator, 1/2 inch, for use with A325/A490 structural bolts.', 1.10, "each", "Specialty", ["DTI", "Squirter", "TurnaSure", "1/2", "tension indicator", "A325"], 120, 400, 15),
  e("PPAP-CSB-4MMX12", "Custom Shoulder Bolt 4mm x 12mm — PPAP", "Custom-spec shoulder bolt, 4mm shoulder x 12mm length, M5 thread, Grade 12.9 black oxide. PPAP Level 3 + EN 10204 3.1 + IMDS included.", 1.92, "each", "Specialty", ["shoulder bolt", "custom", "PPAP", "grade 12.9", "EN 10204", "IMDS"], 0, 0, 18),
  e("CLEVIS-PIN-38X1", '3/8" x 1" Clevis Pin — Zinc', "Headed clevis pin with cotter-pin holes, 3/8 inch x 1 inch, zinc plated.", 0.32, "each", "Specialty", ["clevis pin", "3/8", "zinc"], 1800, 400, 5),
  e("RIVET-POP-316-AL", '3/16" x 1/2" Pop Rivet — Aluminum', "Standard open-end pop rivet, 3/16 inch x 1/2 inch, aluminum body / steel mandrel.", 0.04, "each", "Specialty", ["pop rivet", "3/16", "aluminum", "open-end"], 24000, 5000, 3),
  e("CF-250", "Brass Fastener Assortment 250-Count Bag", "Mixed brass corrosion-resistant fasteners, 250 per bag.", 8.75, "bag", "Specialty", ["brass", "corrosion resistant", "assortment"], 200, 40, 5),
  e("CF-500", "Brass Fastener Assortment 500-Count Bag", "Mixed brass corrosion-resistant fasteners, 500 per bag.", 15.50, "bag", "Specialty", ["brass", "corrosion resistant", "assortment", "bulk"], 100, 20, 5),

  // ── Valves & Assemblies ──────────────────────────────────────────────
  e("VA-200", "Check Valve Assembly 2-inch Brass", "2-inch brass check valve for low-pressure residential systems.", 95.00, "unit", "Valves", ["check valve", "brass", "2-inch", "residential"], 45, 10, 10),
  e("VA-250", "Check Valve Assembly 2.5-inch SS", "2.5-inch stainless steel check valve for industrial high-pressure systems.", 155.00, "unit", "Valves", ["check valve", "stainless steel", "2.5-inch", "industrial"], 30, 8, 12),
  e("VA-300", "Check Valve Assembly 3-inch SS", "3-inch stainless steel check valve for heavy industrial applications.", 210.00, "unit", "Valves", ["check valve", "stainless steel", "3-inch", "industrial"], 20, 5, 14),
  e("GV-2-BR", 'Gate Valve 2" Brass', "2-inch brass gate valve, 200 WOG rated.", 42.00, "unit", "Valves", ["gate valve", "brass", "2-inch"], 80, 15, 7),
  e("GV-3-BR", 'Gate Valve 3" Brass', "3-inch brass gate valve, 200 WOG rated.", 68.00, "unit", "Valves", ["gate valve", "brass", "3-inch"], 50, 10, 7),
  e("GV-2-SS", 'Gate Valve 2" Stainless', "2-inch stainless steel gate valve, 1000 WOG rated.", 78.00, "unit", "Valves", ["gate valve", "stainless steel", "2-inch"], 35, 8, 10),
  e("BV-1-BR", 'Ball Valve 1" Brass', "1-inch brass ball valve, full port, 600 WOG.", 18.50, "unit", "Valves", ["ball valve", "brass", "1-inch", "full port"], 200, 40, 5),
  e("BV-2-BR", 'Ball Valve 2" Brass', "2-inch brass ball valve, full port, 600 WOG.", 32.00, "unit", "Valves", ["ball valve", "brass", "2-inch", "full port"], 150, 30, 5),
  e("BV-2-SS", 'Ball Valve 2" Stainless', "2-inch stainless steel ball valve, full port, 1000 WOG.", 55.00, "unit", "Valves", ["ball valve", "stainless steel", "2-inch", "full port"], 60, 12, 8),
  e("PRV-2", 'Pressure Relief Valve 2"', "2-inch pressure relief valve, adjustable 25-150 PSI.", 125.00, "unit", "Valves", ["pressure relief", "safety", "2-inch", "adjustable"], 40, 8, 10),
  e("PRV-3", 'Pressure Relief Valve 3"', "3-inch pressure relief valve, adjustable 25-150 PSI.", 185.00, "unit", "Valves", ["pressure relief", "safety", "3-inch", "adjustable"], 25, 5, 12),
  e("SV-1-BR", 'Solenoid Valve 1" Brass 24V', "1-inch brass solenoid valve, 24V DC, normally closed.", 65.00, "unit", "Valves", ["solenoid", "brass", "1-inch", "24V", "electric"], 55, 10, 8),
  e("SV-2-SS", 'Solenoid Valve 2" SS 24V', "2-inch stainless steel solenoid valve, 24V DC, normally closed.", 120.00, "unit", "Valves", ["solenoid", "stainless steel", "2-inch", "24V", "electric"], 30, 6, 12),

  // ── Seals & Gaskets ──────────────────────────────────────────────────
  e("RS-STD-50", "Rubber Seal Standard 50-Pack", "Industrial rubber seals, 50 per pack.", 15.00, "pack", "Seals & Gaskets", ["rubber", "seal", "standard", "industrial"], 300, 60, 3),
  e("RS-HD-10", "Rubber Seal Heavy Duty 10-Pack", "Heavy duty rubber seals for high pressure, 10 per pack.", 22.00, "pack", "Seals & Gaskets", ["rubber", "seal", "heavy duty", "high pressure"], 150, 30, 5),
  e("RS-SM-100", "Rubber Seal Small 100-Pack", "Small profile rubber seals for compact fittings.", 12.00, "pack", "Seals & Gaskets", ["rubber", "seal", "small", "compact"], 250, 50, 3),
  e("GK-STD-25", "Gasket Kit Standard 25-Pack", "Assorted standard gaskets for general plumbing, 25 pieces.", 18.50, "pack", "Seals & Gaskets", ["gasket", "assorted", "plumbing"], 200, 40, 4),
  e("GK-HD-10", "Gasket Kit Heavy Duty 10-Pack", "Heavy duty gaskets for high-temp/high-pressure applications.", 28.00, "pack", "Seals & Gaskets", ["gasket", "heavy duty", "high temp", "high pressure"], 80, 15, 7),
  e("OR-KIT-200", "O-Ring Assortment Kit 200pc", "200-piece O-ring assortment in 18 popular sizes, nitrile rubber.", 14.00, "kit", "Seals & Gaskets", ["o-ring", "assortment", "nitrile", "rubber"], 180, 30, 4),
  e("OR-KIT-400", "O-Ring Assortment Kit 400pc", "400-piece O-ring assortment in 32 sizes, nitrile rubber.", 24.00, "kit", "Seals & Gaskets", ["o-ring", "assortment", "nitrile", "rubber", "large"], 90, 15, 4),
  e("PTFE-TAPE-12", "PTFE Thread Seal Tape 12-Roll", "Standard density PTFE tape, 1/2 inch x 260 inch, 12 rolls.", 8.50, "pack", "Seals & Gaskets", ["PTFE", "teflon", "thread seal", "tape"], 500, 100, 3),
  e("SR-VT-10", "Viton Seal Ring 10-Pack", "Fluoroelastomer seal rings for chemical and high-temp service.", 35.00, "pack", "Seals & Gaskets", ["viton", "fluoroelastomer", "high temp", "chemical resistant"], 60, 10, 10),
  e("MG-SHEET-1", "Gasket Sheet Material 12x12in", "Compressed non-asbestos gasket sheet, 1/16 inch thick.", 9.50, "sheet", "Seals & Gaskets", ["gasket sheet", "non-asbestos", "compressed fiber"], 200, 40, 5),

  // ── Pipe & Plumbing ──────────────────────────────────────────────────
  e("PE-90-300", "PVC Elbow 90° 300-Pack", '3/4" PVC 90-degree elbow fittings, 300 per case.', 0.45, "unit", "Pipe & Plumbing", ["PVC", "elbow", "90 degree", "3/4 inch"], 800, 150, 3),
  e("PE-45-100", "PVC Elbow 45° 100-Pack", '3/4" PVC 45-degree elbow fittings, 100 per case.', 0.55, "unit", "Pipe & Plumbing", ["PVC", "elbow", "45 degree", "3/4 inch"], 500, 100, 3),
  e("CT-HALF", 'Copper Tee 1/2" Fitting', "1/2-inch copper tee fitting for residential plumbing.", 2.10, "each", "Pipe & Plumbing", ["copper", "tee", "1/2 inch", "residential"], 400, 80, 4),
  e("CT-THREE-Q", 'Copper Tee 3/4" Fitting', "3/4-inch copper tee fitting for residential plumbing.", 3.25, "each", "Pipe & Plumbing", ["copper", "tee", "3/4 inch", "residential"], 350, 70, 4),
  e("PVC-P-10-1", 'PVC Pipe 1" Schedule 40 10ft', "1-inch schedule 40 PVC pipe, 10-foot length.", 4.50, "length", "Pipe & Plumbing", ["PVC", "pipe", "1 inch", "schedule 40"], 300, 50, 3),
  e("PVC-P-15-1", 'PVC Pipe 1.5" Schedule 40 10ft', "1.5-inch schedule 40 PVC pipe, 10-foot length.", 6.80, "length", "Pipe & Plumbing", ["PVC", "pipe", "1.5 inch", "schedule 40"], 200, 40, 3),
  e("PVC-P-20-2", 'PVC Pipe 2" Schedule 40 10ft', "2-inch schedule 40 PVC pipe, 10-foot length.", 9.20, "length", "Pipe & Plumbing", ["PVC", "pipe", "2 inch", "schedule 40"], 150, 30, 3),
  e("CP-HALF-10", 'Copper Pipe 1/2" Type L 10ft', "1/2-inch Type L copper pipe, 10-foot length, for potable water.", 22.00, "length", "Pipe & Plumbing", ["copper", "pipe", "1/2 inch", "Type L"], 100, 20, 5),
  e("CP-THREE-Q-10", 'Copper Pipe 3/4" Type L 10ft', "3/4-inch Type L copper pipe, 10-foot length, for potable water.", 32.00, "length", "Pipe & Plumbing", ["copper", "pipe", "3/4 inch", "Type L"], 80, 15, 5),
  e("PVC-U-2", 'PVC Union 2"', "2-inch PVC union for easy pipe disconnection.", 5.50, "each", "Pipe & Plumbing", ["PVC", "union", "2 inch"], 250, 50, 3),
  e("PVC-C-HALF", 'PVC Coupling 1/2"', "1/2-inch PVC slip coupling.", 0.35, "each", "Pipe & Plumbing", ["PVC", "coupling", "1/2 inch"], 600, 120, 3),
  e("PVC-C-THREE-Q", 'PVC Coupling 3/4"', "3/4-inch PVC slip coupling.", 0.45, "each", "Pipe & Plumbing", ["PVC", "coupling", "3/4 inch"], 500, 100, 3),

  // ── Hardware & Cabinet ────────────────────────────────────────────────
  e("BH-SM-500", "Brass Hinge Small - Bulk 500", "Small brass hinges for cabinet doors, bulk pack.", 0.85, "unit", "Hardware", ["brass", "hinge", "small", "cabinet"], 500, 100, 5),
  e("BH-MD-250", "Brass Hinge Medium 250-Pack", "Medium brass hinges for standard doors and cabinets.", 1.40, "unit", "Hardware", ["brass", "hinge", "medium", "cabinet"], 300, 60, 5),
  e("BH-LG-100", "Brass Hinge Large 100-Pack", "Large brass hinges for heavy doors and gates.", 2.50, "unit", "Hardware", ["brass", "hinge", "large", "gate"], 150, 30, 5),
  e("DS-18-PR", 'Drawer Slide 18" Pair', "18-inch full extension drawer slides, sold in pairs.", 11.00, "pair", "Hardware", ["drawer slide", "18 inch", "full extension"], 200, 40, 5),
  e("DS-22-PR", 'Drawer Slide 22" Pair', "22-inch full extension drawer slides, sold in pairs.", 13.50, "pair", "Hardware", ["drawer slide", "22 inch", "full extension"], 150, 30, 5),
  e("DS-24-PR", 'Drawer Slide 24" Pair', "24-inch full extension drawer slides, sold in pairs.", 15.00, "pair", "Hardware", ["drawer slide", "24 inch", "full extension"], 120, 25, 5),
  e("CK-RND", "Cabinet Knob Round - Brushed Nickel", "Round cabinet knob, brushed nickel finish.", 3.25, "each", "Hardware", ["cabinet", "knob", "round", "brushed nickel"], 400, 80, 4),
  e("CK-SQR", "Cabinet Knob Square - Matte Black", "Square cabinet knob, matte black finish.", 4.50, "each", "Hardware", ["cabinet", "knob", "square", "matte black"], 350, 70, 4),
  e("CK-BAR-4", 'Cabinet Bar Pull 4" Chrome', "4-inch cabinet bar pull, polished chrome finish.", 6.75, "each", "Hardware", ["cabinet", "bar pull", "4 inch", "chrome"], 250, 50, 4),
  e("CK-BAR-6", 'Cabinet Bar Pull 6" Chrome', "6-inch cabinet bar pull, polished chrome finish.", 8.25, "each", "Hardware", ["cabinet", "bar pull", "6 inch", "chrome"], 180, 35, 4),
  e("DH-SS-4", 'Door Hinge Stainless 4" Pair', "4-inch stainless steel door hinge, sold in pairs.", 12.00, "pair", "Hardware", ["door hinge", "stainless steel", "4 inch"], 200, 40, 5),
  e("DL-KW-STD", "Deadbolt Lock Kwikset Standard", "Standard deadbolt lock, Kwikset keyway, satin nickel.", 32.00, "each", "Hardware", ["deadbolt", "lock", "Kwikset", "satin nickel"], 100, 20, 7),

  // ── Automotive Parts ──────────────────────────────────────────────────
  e("OF-STD-10", "Oil Filter Standard 10-Pack", "Standard oil filter, fits most sedans. 10 per box.", 32.00, "pack", "Automotive", ["oil filter", "sedan", "standard"], 250, 50, 4),
  e("OF-PRM-5", "Oil Filter Premium 5-Pack", "Premium synthetic oil filter, extended life. 5 per box.", 28.00, "pack", "Automotive", ["oil filter", "premium", "synthetic"], 150, 30, 5),
  e("OF-HD-3", "Oil Filter Heavy Duty 3-Pack", "Heavy-duty oil filter for trucks and diesels. 3 per box.", 24.00, "pack", "Automotive", ["oil filter", "heavy duty", "truck", "diesel"], 100, 20, 5),
  e("BP-CRM-4", "Brake Pad Ceramic 4-Pack", "Ceramic brake pads, low dust. Set of 4.", 28.50, "set", "Automotive", ["brake pad", "ceramic", "low dust"], 180, 35, 5),
  e("BP-SEM-4", "Brake Pad Semi-Metallic 4-Pack", "Semi-metallic brake pads, all-weather performance. Set of 4.", 22.00, "set", "Automotive", ["brake pad", "semi-metallic", "all-weather"], 200, 40, 5),
  e("AF-STD-1", "Air Filter Standard Single", "Standard engine air filter, fits most 4-cylinder engines.", 12.00, "each", "Automotive", ["air filter", "engine", "standard"], 300, 60, 4),
  e("AF-PRM-1", "Air Filter Premium Single", "Premium high-flow engine air filter with extended life.", 18.50, "each", "Automotive", ["air filter", "engine", "premium", "high-flow"], 150, 30, 5),
  e("SP-IRD-4", "Spark Plug Iridium 4-Pack", "Iridium spark plugs, 100K mile rated. Set of 4.", 24.00, "set", "Automotive", ["spark plug", "iridium", "long life"], 200, 40, 5),
  e("SP-PLT-4", "Spark Plug Platinum 4-Pack", "Platinum spark plugs, 60K mile rated. Set of 4.", 18.00, "set", "Automotive", ["spark plug", "platinum"], 250, 50, 5),
  e("WB-STD-SET", "Wheel Bearing Standard Set", "Standard front wheel bearing and hub assembly.", 35.00, "set", "Automotive", ["wheel bearing", "hub", "front"], 100, 20, 7),
  e("TB-DRUM-PR", "Brake Drum Rear Pair", "Rear brake drums, cast iron, sold as pair.", 52.00, "pair", "Automotive", ["brake drum", "rear", "cast iron"], 60, 12, 7),
  e("WP-STD", "Water Pump Standard", "Engine water pump, fits most 4-cyl sedans.", 45.00, "each", "Automotive", ["water pump", "engine", "cooling"], 80, 15, 7),

  // ── Electrical & Wiring ───────────────────────────────────────────────
  e("EW-14-100", "Electrical Wire 14AWG 100ft", "THHN stranded copper wire, 14 AWG, 100-foot roll.", 28.00, "roll", "Electrical", ["wire", "14 AWG", "copper", "THHN"], 250, 50, 4),
  e("EW-12-100", "Electrical Wire 12AWG 100ft", "THHN stranded copper wire, 12 AWG, 100-foot roll.", 35.00, "roll", "Electrical", ["wire", "12 AWG", "copper", "THHN"], 200, 40, 4),
  e("EW-10-100", "Electrical Wire 10AWG 100ft", "THHN stranded copper wire, 10 AWG, 100-foot roll.", 45.00, "roll", "Electrical", ["wire", "10 AWG", "copper", "THHN"], 150, 30, 5),
  e("CB-20A-10", "Circuit Breaker 20A 10-Pack", "Single-pole 20A circuit breaker, plug-in type.", 42.00, "pack", "Electrical", ["circuit breaker", "20A", "single pole"], 120, 25, 5),
  e("CB-30A-10", "Circuit Breaker 30A 10-Pack", "Single-pole 30A circuit breaker, plug-in type.", 52.00, "pack", "Electrical", ["circuit breaker", "30A", "single pole"], 80, 15, 5),
  e("JB-STD", "Junction Box Standard", "Standard 4x4 electrical junction box, steel.", 4.50, "each", "Electrical", ["junction box", "steel", "4x4"], 400, 80, 3),
  e("JB-WP", "Junction Box Weatherproof", "Weatherproof junction box with gasket seal, PVC.", 8.75, "each", "Electrical", ["junction box", "weatherproof", "PVC", "outdoor"], 200, 40, 4),
  e("CT-100", "Cable Ties 100-Pack", "Standard nylon cable ties, 8 inch, 50lb tensile.", 3.20, "pack", "Electrical", ["cable ties", "nylon", "8 inch"], 500, 100, 3),
  e("CT-500", "Cable Ties 500-Pack", "Standard nylon cable ties, 8 inch, 50lb tensile, bulk.", 12.00, "pack", "Electrical", ["cable ties", "nylon", "8 inch", "bulk"], 200, 40, 3),
  e("EC-STD-50", "Electrical Connector Kit 50pc", "Assorted wire connectors: wire nuts, butt splices, ring terminals.", 15.00, "kit", "Electrical", ["connector", "wire nut", "terminal", "assorted"], 180, 35, 4),
  e("GFCI-15A", "GFCI Outlet 15A", "Ground-fault circuit interrupter outlet, 15A, tamper-resistant.", 14.50, "each", "Electrical", ["GFCI", "outlet", "15A", "tamper resistant"], 300, 60, 4),
  e("LED-TUBE-4", "LED Tube Light 4ft T8", "4-foot T8 LED tube, 18W, 4000K neutral white, ballast bypass.", 8.00, "each", "Electrical", ["LED", "tube light", "T8", "4 foot", "4000K"], 400, 80, 5),

  // ── Pumps & Impellers ─────────────────────────────────────────────────
  e("PI-CEN-4", 'Centrifugal Pump Impeller 4"', "4-inch cast iron centrifugal pump impeller, closed type.", 85.00, "unit", "Pumps", ["impeller", "centrifugal", "4 inch", "cast iron"], 40, 8, 10),
  e("PI-CEN-6", 'Centrifugal Pump Impeller 6"', "6-inch cast iron centrifugal pump impeller, closed type.", 125.00, "unit", "Pumps", ["impeller", "centrifugal", "6 inch", "cast iron"], 25, 5, 12),
  e("PI-CEN-8", 'Centrifugal Pump Impeller 8"', "8-inch cast iron centrifugal pump impeller, closed type.", 175.00, "unit", "Pumps", ["impeller", "centrifugal", "8 inch", "cast iron"], 15, 3, 14),
  e("PI-SUB-3", 'Submersible Pump Impeller 3"', "3-inch stainless steel submersible pump impeller.", 65.00, "unit", "Pumps", ["impeller", "submersible", "3 inch", "stainless steel"], 30, 6, 10),
  e("PI-SUB-4", 'Submersible Pump Impeller 4"', "4-inch stainless steel submersible pump impeller.", 90.00, "unit", "Pumps", ["impeller", "submersible", "4 inch", "stainless steel"], 20, 4, 10),
  e("PM-CEN-2HP", "Centrifugal Pump Motor 2HP", "2HP electric motor for centrifugal pumps, TEFC, 3450 RPM.", 450.00, "unit", "Pumps", ["pump motor", "2HP", "TEFC", "centrifugal"], 12, 3, 14),
  e("PM-CEN-5HP", "Centrifugal Pump Motor 5HP", "5HP electric motor for centrifugal pumps, TEFC, 3450 RPM.", 780.00, "unit", "Pumps", ["pump motor", "5HP", "TEFC", "centrifugal"], 8, 2, 18),
  e("PS-KIT-STD", "Pump Seal Kit Standard", "Standard mechanical seal kit for centrifugal pumps.", 28.00, "kit", "Pumps", ["pump seal", "mechanical seal", "kit"], 100, 20, 5),

  // ── Sprockets & Gears ─────────────────────────────────────────────────
  e("SPR-100", "Sprocket Standard (Silver)", "Standard sprocket, silver finish. 25 units per box.", 38.00, "box", "Power Transmission", ["sprocket", "silver", "standard"], 150, 30, 5),
  e("SPR-GRN-200", "Green Sprocket Premium", "Premium sprocket with green coating. 20 units per box.", 52.00, "box", "Power Transmission", ["sprocket", "green", "premium", "coated"], 80, 15, 7),
  e("SPR-BLU-300", "Blue Sprocket Heavy Duty", "Heavy-duty sprocket with blue coating. 15 units per box.", 68.00, "box", "Power Transmission", ["sprocket", "blue", "heavy duty", "coated"], 50, 10, 7),
  e("GR-STL-20T", "Steel Gear 20-Tooth", "20-tooth steel spur gear, 14.5° pressure angle, 1/2\" bore.", 15.00, "each", "Power Transmission", ["gear", "steel", "20 tooth", "spur"], 200, 40, 5),
  e("GR-STL-40T", "Steel Gear 40-Tooth", "40-tooth steel spur gear, 14.5° pressure angle, 3/4\" bore.", 28.00, "each", "Power Transmission", ["gear", "steel", "40 tooth", "spur"], 120, 25, 5),
  e("GR-BRZ-20T", "Bronze Gear 20-Tooth", "20-tooth bronze spur gear, quiet operation, 1/2\" bore.", 22.00, "each", "Power Transmission", ["gear", "bronze", "20 tooth", "spur", "quiet"], 100, 20, 7),
  e("CH-40-10", "Roller Chain #40 10ft", "#40 single strand roller chain, 1/2 inch pitch, 10-foot length.", 18.00, "length", "Power Transmission", ["roller chain", "#40", "1/2 inch"], 150, 30, 5),
  e("CH-60-10", "Roller Chain #60 10ft", "#60 single strand roller chain, 3/4 inch pitch, 10-foot length.", 32.00, "length", "Power Transmission", ["roller chain", "#60", "3/4 inch"], 100, 20, 5),

  // ── Adhesives & Chemicals ─────────────────────────────────────────────
  e("ADH-EP-8", "Epoxy Adhesive 8oz", "Two-part industrial epoxy, 5-minute set time, 3500 PSI bond.", 12.50, "tube", "Chemicals", ["epoxy", "adhesive", "two-part", "fast set"], 200, 40, 4),
  e("ADH-EP-32", "Epoxy Adhesive 32oz", "Two-part industrial epoxy, 5-minute set time, 3500 PSI bond, bulk.", 38.00, "bottle", "Chemicals", ["epoxy", "adhesive", "two-part", "bulk"], 80, 15, 5),
  e("LUB-ML-16", "Machine Lubricant 16oz", "Multi-purpose machine lubricant, anti-wear formula.", 9.50, "bottle", "Chemicals", ["lubricant", "machine", "anti-wear"], 300, 60, 3),
  e("LUB-ML-128", "Machine Lubricant 1 Gallon", "Multi-purpose machine lubricant, anti-wear formula, bulk.", 32.00, "gallon", "Chemicals", ["lubricant", "machine", "anti-wear", "bulk"], 100, 20, 4),
  e("CL-DGR-32", "Degreaser Concentrate 32oz", "Industrial degreaser concentrate, dilutes 10:1.", 14.00, "bottle", "Chemicals", ["degreaser", "concentrate", "industrial"], 150, 30, 4),
  e("TL-ANTI-16", "Anti-Seize Compound 16oz", "Nickel-based anti-seize compound for high-temp fasteners.", 18.00, "can", "Chemicals", ["anti-seize", "nickel", "high temp", "compound"], 120, 25, 5),

  // ── Safety & PPE ──────────────────────────────────────────────────────
  e("SG-CLR-12", "Safety Glasses Clear 12-Pack", "ANSI Z87.1 clear safety glasses with anti-scratch coating.", 24.00, "pack", "Safety", ["safety glasses", "clear", "ANSI", "anti-scratch"], 300, 60, 3),
  e("SG-TNT-12", "Safety Glasses Tinted 12-Pack", "ANSI Z87.1 tinted safety glasses, UV protection.", 28.00, "pack", "Safety", ["safety glasses", "tinted", "ANSI", "UV"], 200, 40, 3),
  e("WG-NIT-100", "Work Gloves Nitrile 100-Pack", "Disposable nitrile work gloves, powder-free, large.", 18.00, "box", "Safety", ["gloves", "nitrile", "disposable", "powder-free"], 400, 80, 3),
  e("WG-LTH-12", "Work Gloves Leather 12-Pack", "Premium cowhide leather work gloves, reinforced palm.", 45.00, "pack", "Safety", ["gloves", "leather", "cowhide", "reinforced"], 100, 20, 5),
  e("EP-FOM-50", "Ear Plugs Foam 50-Pair", "Disposable foam ear plugs, NRR 32dB, individually wrapped.", 8.50, "pack", "Safety", ["ear plugs", "foam", "NRR 32", "hearing protection"], 350, 70, 3),
  e("HR-STD", "Hard Hat Standard White", "ANSI Type I Class E hard hat, ratchet suspension, white.", 15.00, "each", "Safety", ["hard hat", "ANSI", "Type I", "white"], 200, 40, 4),
  e("HV-VEST-L", "Hi-Vis Safety Vest Large", "ANSI Class 2 high-visibility safety vest, mesh, large.", 9.00, "each", "Safety", ["hi-vis", "safety vest", "ANSI Class 2", "mesh"], 300, 60, 3),

  // ── Widgets & Gadgets (misc) ──────────────────────────────────────────
  e("WDG-BLU-10", "Blue Widget 10-Pack", "Premium blue widgets, 10 units per case. Industrial grade.", 24.99, "case", "General", ["widget", "blue", "industrial"], 150, 30, 5),
  e("WDG-RED-10", "Red Widget 10-Pack", "Premium red widgets, 10 units per case. Industrial grade.", 24.99, "case", "General", ["widget", "red", "industrial"], 120, 25, 5),
  e("WDG-GRN-10", "Green Widget 10-Pack", "Premium green widgets, 10 units per case. Industrial grade.", 24.99, "case", "General", ["widget", "green", "industrial"], 130, 25, 5),
  e("GDG-RED-01", "Red Gadget Standard", "Standard red gadget, individual unit. Consumer grade.", 12.50, "each", "General", ["gadget", "red", "consumer"], 250, 50, 4),
  e("GDG-BLU-01", "Blue Gadget Standard", "Standard blue gadget, individual unit. Consumer grade.", 12.50, "each", "General", ["gadget", "blue", "consumer"], 200, 40, 4),
  e("GDG-GRN-01", "Green Gadget Premium", "Premium green gadget, individual unit. Industrial grade.", 18.00, "each", "General", ["gadget", "green", "premium", "industrial"], 150, 30, 5),

  // ── Additional Stock ──────────────────────────────────────────────────
  e("TB-51107", "Thrust Bearing 51107", "Single direction thrust ball bearing, 35x52x12mm.", 11.50, "each", "Bearings", ["thrust bearing", "axial", "51107"], 160, 30, 7),
  e("SF-6-150", 'SS Flange 6" 150lb', "6-inch stainless steel flange, 150 lb pressure class.", 42.00, "each", "Flanges", ["stainless steel", "flange", "6-inch", "150lb"], 80, 15, 7),
  e("SF-6-300", 'SS Flange 6" 300lb', "6-inch stainless steel flange, 300 lb pressure class.", 72.00, "each", "Flanges", ["stainless steel", "flange", "6-inch", "300lb"], 40, 8, 10),
  e("HB-M20-80", "Hex Bolt M20x80mm 10-Pack", "Grade 10.9 hex bolt, M20 thread, 80mm length. 10 per pack.", 14.80, "pack", "Hex Bolts & Cap Screws", ["hex bolt", "M20", "grade 10.9", "80mm"], 120, 25, 5),
  e("BV-3-SS", 'Ball Valve 3" Stainless', "3-inch stainless steel ball valve, full port, 1000 WOG.", 85.00, "unit", "Valves", ["ball valve", "stainless steel", "3-inch", "full port"], 25, 5, 10),
  e("PI-CEN-10", 'Centrifugal Pump Impeller 10"', "10-inch cast iron centrifugal pump impeller, closed type.", 240.00, "unit", "Pumps", ["impeller", "centrifugal", "10 inch", "cast iron"], 8, 2, 18),
  e("EW-8-100", "Electrical Wire 8AWG 100ft", "THHN stranded copper wire, 8 AWG, 100-foot roll.", 58.00, "roll", "Electrical", ["wire", "8 AWG", "copper", "THHN"], 100, 20, 5),
  e("DS-16-PR", 'Drawer Slide 16" Pair', "16-inch full extension drawer slides, sold in pairs.", 9.50, "pair", "Hardware", ["drawer slide", "16 inch", "full extension"], 180, 35, 5),
  e("BP-ORG-4", "Brake Pad Organic 4-Pack", "Organic brake pads, quiet operation. Set of 4.", 18.00, "set", "Automotive", ["brake pad", "organic", "quiet"], 150, 30, 5),
  e("CH-80-10", "Roller Chain #80 10ft", "#80 single strand roller chain, 1 inch pitch, 10-foot length.", 48.00, "length", "Power Transmission", ["roller chain", "#80", "1 inch"], 60, 12, 7),
  e("ADH-CA-1", "Cyanoacrylate Adhesive 1oz", "Industrial cyanoacrylate (super glue), fast bond, 1 oz tube.", 6.50, "tube", "Chemicals", ["cyanoacrylate", "super glue", "fast bond", "adhesive"], 300, 60, 3),
  e("FR-EXTING-5", "Fire Extinguisher 5lb ABC", "5-pound ABC dry chemical fire extinguisher, wall-mountable.", 42.00, "each", "Safety", ["fire extinguisher", "ABC", "5 lb", "dry chemical"], 50, 10, 7),
];
