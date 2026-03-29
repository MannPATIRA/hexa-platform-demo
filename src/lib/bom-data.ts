import type { BomComponent, InventoryStatus, LineItem } from "./types";
import { skuCatalog, SkuCatalogEntry } from "./sku-catalog";

export const bomMappings: Record<string, BomComponent[]> = {
  "VA-300": [
    { id: "bom-va300-1", catalogSku: "SF-3-150", name: 'SS Flange 3" 150lb', quantity: 2, uom: "each", unitCost: 18.75, isCustom: false },
    { id: "bom-va300-2", catalogSku: "GK-FL-3", name: 'Flange Gasket Kit 3"', quantity: 2, uom: "set", unitCost: 3.50, isCustom: false },
    { id: "bom-va300-3", catalogSku: "HB-M10-40", name: "Hex Bolt M10x40mm 25-Pack", quantity: 1, uom: "pack", unitCost: 4.50, isCustom: false },
    { id: "bom-va300-4", catalogSku: "RS-HD-10", name: "Rubber Seal Heavy Duty 10-Pack", quantity: 1, uom: "pack", unitCost: 22.00, isCustom: false },
    { id: "bom-va300-5", catalogSku: null, name: "Valve Body Casting 3\" SS", quantity: 1, uom: "each", unitCost: 85.00, isCustom: true },
  ],
  "VA-200": [
    { id: "bom-va200-1", catalogSku: "BF-2-SO", name: 'Brass Flange 2" Slip-On', quantity: 2, uom: "each", unitCost: 15.50, isCustom: false },
    { id: "bom-va200-2", catalogSku: "GK-FL-2", name: 'Flange Gasket Kit 2"', quantity: 2, uom: "set", unitCost: 2.75, isCustom: false },
    { id: "bom-va200-3", catalogSku: "HB-M8-30", name: "Hex Bolt M8x30mm 25-Pack", quantity: 1, uom: "pack", unitCost: 3.80, isCustom: false },
    { id: "bom-va200-4", catalogSku: null, name: "Valve Body Casting 2\" Brass", quantity: 1, uom: "each", unitCost: 42.00, isCustom: true },
  ],
  "PM-CEN-2HP": [
    { id: "bom-pm2-1", catalogSku: "BB-6205", name: "Ball Bearing 6205-2RS", quantity: 2, uom: "each", unitCost: 5.10, isCustom: false },
    { id: "bom-pm2-2", catalogSku: "PS-KIT-STD", name: "Pump Seal Kit Standard", quantity: 1, uom: "kit", unitCost: 28.00, isCustom: false },
    { id: "bom-pm2-3", catalogSku: "EW-12-100", name: "Electrical Wire 12AWG 100ft", quantity: 1, uom: "roll", unitCost: 35.00, isCustom: false },
    { id: "bom-pm2-4", catalogSku: null, name: "Motor Housing Cast Iron 2HP", quantity: 1, uom: "each", unitCost: 180.00, isCustom: true },
    { id: "bom-pm2-5", catalogSku: null, name: "Stator Winding Assembly 2HP", quantity: 1, uom: "each", unitCost: 120.00, isCustom: true },
  ],
  "PI-CEN-4": [
    { id: "bom-pi4-1", catalogSku: null, name: 'Impeller Casting 4" CI', quantity: 1, uom: "each", unitCost: 55.00, isCustom: true },
    { id: "bom-pi4-2", catalogSku: "LN-M10-50", name: "Lock Nut M10 50-Pack", quantity: 1, uom: "pack", unitCost: 5.60, isCustom: false },
    { id: "bom-pi4-3", catalogSku: "FW-M10-100", name: "Flat Washer M10 100-Pack", quantity: 1, uom: "pack", unitCost: 3.90, isCustom: false },
  ],
  "GV-3-BR": [
    { id: "bom-gv3-1", catalogSku: "BF-3-SO", name: 'Brass Flange 3" Slip-On', quantity: 2, uom: "each", unitCost: 21.00, isCustom: false },
    { id: "bom-gv3-2", catalogSku: "GK-FL-3", name: 'Flange Gasket Kit 3"', quantity: 1, uom: "set", unitCost: 3.50, isCustom: false },
    { id: "bom-gv3-3", catalogSku: "PTFE-TAPE-12", name: "PTFE Thread Seal Tape 12-Roll", quantity: 1, uom: "pack", unitCost: 8.50, isCustom: false },
    { id: "bom-gv3-4", catalogSku: null, name: "Gate Valve Body 3\" Brass Cast", quantity: 1, uom: "each", unitCost: 28.00, isCustom: true },
  ],
};

function getCatalogEntry(sku: string): SkuCatalogEntry | undefined {
  return skuCatalog.find((e) => e.catalogSku === sku);
}

export function explodeBom(lineItems: LineItem[]): LineItem[] {
  return lineItems.map((item) => {
    const sku = item.parsedSku ?? item.matchedCatalogItems[0]?.catalogSku;
    if (!sku) return item;

    const mapping = bomMappings[sku];
    if (mapping) {
      const components: BomComponent[] = mapping.map((c, idx) => ({
        ...c,
        id: `${item.id}-bom-${idx}`,
      }));
      return { ...item, bomComponents: components };
    }

    const catalogEntry = getCatalogEntry(sku);
    return {
      ...item,
      bomComponents: [
        {
          id: `${item.id}-bom-0`,
          catalogSku: sku,
          name: catalogEntry?.catalogName ?? item.parsedProductName,
          quantity: 1,
          uom: catalogEntry?.catalogUom ?? item.parsedUom,
          unitCost: catalogEntry?.catalogPrice ?? item.parsedUnitPrice,
          isCustom: false,
        },
      ],
    };
  });
}

export function checkInventory(lineItems: LineItem[]): InventoryStatus[] {
  const aggregated = new Map<string, { name: string; required: number }>();

  for (const item of lineItems) {
    if (!item.bomComponents) continue;
    for (const comp of item.bomComponents) {
      if (comp.isCustom || !comp.catalogSku) continue;
      const key = comp.catalogSku;
      const existing = aggregated.get(key);
      const needed = comp.quantity * item.parsedQuantity;
      if (existing) {
        existing.required += needed;
      } else {
        aggregated.set(key, { name: comp.name, required: needed });
      }
    }
  }

  const results: InventoryStatus[] = [];
  for (const [sku, { name, required }] of aggregated) {
    const entry = getCatalogEntry(sku);
    const inStock = entry?.currentStock ?? 0;
    const shortfall = Math.max(0, required - inStock);
    let status: InventoryStatus["status"] = "in_stock";
    if (inStock === 0) {
      status = "out_of_stock";
    } else if (inStock < required || inStock <= (entry?.reorderPoint ?? 0)) {
      status = "low";
    }

    results.push({
      catalogSku: sku,
      componentName: name,
      required,
      inStock,
      shortfall,
      status,
      leadTimeDays: entry?.leadTimeDays,
    });
  }

  for (const item of lineItems) {
    if (!item.bomComponents) continue;
    for (const comp of item.bomComponents) {
      if (!comp.isCustom) continue;
      const existing = results.find((r) => r.catalogSku === comp.id);
      if (!existing) {
        results.push({
          catalogSku: comp.id,
          componentName: comp.name,
          required: comp.quantity * item.parsedQuantity,
          inStock: 0,
          shortfall: comp.quantity * item.parsedQuantity,
          status: "custom",
        });
      }
    }
  }

  return results;
}
