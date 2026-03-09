"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { extractedItems } from "@/data/extractedItems";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LineItem, Customer, Order } from "@/lib/types";

interface OrderCreateModalProps {
  onOrderCreated: (orderId: string) => void;
  onClose: () => void;
}

function mapExtractedToLineItems(): LineItem[] {
  return extractedItems.map((item, index) => ({
    id: item.id,
    lineNumber: index + 1,
    rawText: `${item.qty} ${item.name} – ${item.specs}`,
    parsedSku: item.sku,
    parsedProductName: item.name,
    parsedQuantity: parseFloat(item.qty.replace(/[^0-9.]/g, "")),
    parsedUom: item.qty.replace(/[0-9.]/g, "").trim(),
    parsedUnitPrice: parseFloat(item.unitPrice.replace(/[^0-9.]/g, "")),
    matchStatus: "confirmed" as const,
    confidence: item.confidence / 100,
    matchedCatalogItems: [],
    issues: [],
  }));
}

const customer: Customer = {
  id: "cust-sheffield",
  name: "David Patterson",
  email: "d.patterson@sheffieldprecision.co.uk",
  phone: "+44 114 276 8400",
  company: "Sheffield Precision Mfg.",
  billingAddress: "Unit 3, Attercliffe Road, Sheffield S4 7WZ",
  shippingAddress: "Unit 3, Attercliffe Road, Sheffield S4 7WZ",
};

export default function OrderCreateModal({ onOrderCreated, onClose }: OrderCreateModalProps) {
  const [creating, setCreating] = useState(true);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function create() {
      try {
        const lineItems = mapExtractedToLineItems();
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer,
            lineItems,
            emailSubject: "Phone Order – David Patterson (Sheffield Precision)",
            attachments: [],
          }),
        });
        if (!res.ok) throw new Error("Failed to create order");
        const order: Order = await res.json();
        if (!cancelled) {
          setCreatedOrder(order);
          setCreating(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setCreating(false);
        }
      }
    }
    create();
    return () => { cancelled = true; };
  }, []);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[460px] border-border bg-card p-7">
        {creating ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Creating order...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-8">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={onClose} variant="secondary" className="mt-4">
              Close
            </Button>
          </div>
        ) : createdOrder ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center border border-emerald-500/30 bg-emerald-500/10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 18 }}
                >
                  <Check size={26} className="text-emerald-400" strokeWidth={2.5} />
                </motion.div>
              </div>
              <DialogTitle className="font-display text-center text-[28px] font-medium leading-none">
                Order Created
              </DialogTitle>
              <DialogDescription className="text-center text-[13px]">
                {extractedItems.length} line items added as{" "}
                <span className="bg-muted px-2 py-0.5 font-mono text-[12px] text-foreground/80">
                  {createdOrder.orderNumber}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="mb-1 overflow-hidden border border-border">
              <div className="grid grid-cols-3 gap-4 border-b border-border bg-secondary px-4 py-2.5">
                <span className="text-[11px] font-semibold text-muted-foreground">Item</span>
                <span className="text-[11px] font-semibold text-muted-foreground">SKU</span>
                <span className="text-right text-[11px] font-semibold text-muted-foreground">Status</span>
              </div>
              {extractedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="grid grid-cols-3 gap-4 px-4 py-3"
                  style={{ borderTop: i > 0 ? "1px solid hsl(var(--border))" : undefined }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                >
                  <span className="truncate text-[12px] font-medium text-foreground/85">{item.name}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{item.sku}</span>
                  <span className="flex items-center justify-end gap-1.5 text-[12px] font-medium text-emerald-600">
                    <CheckCircle2 size={12} strokeWidth={2} />
                    Added
                  </span>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => onOrderCreated(createdOrder.id)}
              className="w-full"
            >
              View Order →
            </Button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
