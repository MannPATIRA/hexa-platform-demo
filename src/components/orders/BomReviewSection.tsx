"use client";

import { useState, useMemo, useCallback } from "react";
import { Order, BomComponent } from "@/lib/types";
import type { StageChangeHandler } from "@/components/OrderWorkspace";
import { explodeBom } from "@/lib/bom-data";
import { ChevronDown, Plus, Package, FileText, ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  order: Order;
  mode: "active" | "completed";
  onStageChange?: StageChangeHandler;
}

export function BomReviewSection({ order, mode, onStageChange }: Props) {
  const explodedItems = useMemo(() => explodeBom(order.lineItems), [order.lineItems]);

  const [lineItems, setLineItems] = useState(explodedItems);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(explodedItems.filter((li) => (li.bomComponents?.length ?? 0) > 1).map((li) => li.id))
  );
  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [newPartName, setNewPartName] = useState("");
  const [newPartQty, setNewPartQty] = useState(1);
  const [advancing, setAdvancing] = useState(false);

  const totalComponents = lineItems.reduce((sum, li) => sum + (li.bomComponents?.length ?? 0), 0);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleAddComponent = useCallback((lineItemId: string) => {
    if (!newPartName.trim()) return;
    const comp: BomComponent = {
      id: `${lineItemId}-custom-${Date.now()}`,
      catalogSku: null,
      name: newPartName.trim(),
      quantity: newPartQty,
      uom: "each",
      unitCost: null,
      isCustom: true,
    };
    setLineItems((prev) =>
      prev.map((li) =>
        li.id === lineItemId
          ? { ...li, bomComponents: [...(li.bomComponents ?? []), comp] }
          : li
      )
    );
    setNewPartName("");
    setNewPartQty(1);
    setAddingToId(null);
  }, [newPartName, newPartQty]);

  const handleRemoveComponent = useCallback((lineItemId: string, compId: string) => {
    setLineItems((prev) =>
      prev.map((li) =>
        li.id === lineItemId
          ? { ...li, bomComponents: (li.bomComponents ?? []).filter((c) => c.id !== compId) }
          : li
      )
    );
  }, []);

  const handleContinue = useCallback(async () => {
    setAdvancing(true);
    try {
      if (onStageChange) {
        await onStageChange("inventory_check", {
          orderType: "quote_builder",
          lineItems: lineItems.map((li) => ({ ...li, bomComponents: li.bomComponents })),
        });
      }
    } catch {
      setAdvancing(false);
    }
  }, [lineItems, onStageChange]);

  if (mode === "completed") {
    return (
      <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-emerald-500/40 bg-emerald-500/10">
          <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
        </div>
        <p className="text-[12px] font-medium text-emerald-700">
          {order.lineItems.length} items exploded into {totalComponents} components
          {(order.drawings?.length ?? 0) > 0 && `, ${order.drawings!.length} drawings linked`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-muted-foreground mb-1">
        Review the component breakdown for each line item. Add custom parts or link drawings before continuing.
      </p>

      <div className="flex items-center gap-4 border border-border bg-card px-4 py-3">
        <div className="h-1.5 flex-1 overflow-hidden bg-muted">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: "100%" }}
          />
        </div>
        <span className="shrink-0 text-[12px] font-medium text-muted-foreground">
          {lineItems.length} items → {totalComponents} components
        </span>
      </div>

      <div className="space-y-3">
        {lineItems.map((item) => {
          const components = item.bomComponents ?? [];
          const isExpanded = expandedIds.has(item.id);
          const isAssembly = components.length > 1;

          return (
            <div key={item.id} className="border border-border bg-background/30">
              <button
                type="button"
                onClick={() => toggleExpanded(item.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-[11px] font-medium text-muted-foreground">
                  {item.lineNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground/85 truncate">
                    {item.parsedProductName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.parsedSku ?? "No SKU"} · {item.parsedQuantity} {item.parsedUom}
                    {isAssembly && (
                      <span className="ml-2 text-blue-700 font-medium">
                        {components.length} components
                      </span>
                    )}
                  </p>
                </div>
                {isAssembly && (
                  <span className="inline-flex items-center border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    Assembly
                  </span>
                )}
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">#</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Component</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">SKU</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty / unit</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Unit Cost</th>
                        <th className="px-3 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((comp, idx) => (
                        <tr key={comp.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <span className="font-medium text-foreground/85">{comp.name}</span>
                            {comp.isCustom && (
                              <span className="ml-2 inline-flex items-center border border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[9px] font-semibold text-amber-700">
                                Custom
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-mono text-foreground/70">
                            {comp.catalogSku ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-foreground/70">
                            {comp.quantity} {comp.uom}
                          </td>
                          <td className="px-3 py-2 text-right text-foreground/70">
                            {comp.unitCost != null ? `$${comp.unitCost.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-3 py-2">
                            {comp.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleRemoveComponent(item.id, comp.id)}
                                className="text-muted-foreground hover:text-red-600 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {addingToId === item.id ? (
                    <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 bg-muted/20">
                      <input
                        type="text"
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        placeholder="Part name..."
                        className="flex-1 border border-border bg-background px-2.5 py-1.5 text-[12px]"
                        autoFocus
                      />
                      <input
                        type="number"
                        value={newPartQty}
                        onChange={(e) => setNewPartQty(Number(e.target.value) || 1)}
                        min={1}
                        className="w-16 border border-border bg-background px-2.5 py-1.5 text-[12px] text-right"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComponent(item.id)}
                        className="inline-flex items-center gap-1 bg-foreground px-2.5 py-1.5 text-[11px] font-medium text-background hover:opacity-90"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddingToId(null); setNewPartName(""); setNewPartQty(1); }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingToId(item.id)}
                      className="flex w-full items-center gap-1.5 border-t border-border px-4 py-2 text-[11px] font-medium text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add Component
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {order.attachments?.length > 0 && (
        <div className="border border-border bg-muted/20 p-4 space-y-2">
          <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Drawings & Attachments
          </h4>
          <div className="space-y-1.5">
            {order.attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2.5 border border-border bg-background px-3 py-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-[12px] font-medium text-foreground/85 flex-1 truncate">{att.fileName}</span>
                <span className="text-[11px] text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={advancing}
        className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Package className="h-3.5 w-3.5" />
        {advancing ? "Processing..." : "Continue to Inventory Check"}
        {!advancing && <ArrowRight className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
