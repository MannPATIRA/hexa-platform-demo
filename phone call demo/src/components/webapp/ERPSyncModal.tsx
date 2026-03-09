"use client";

import { motion } from "framer-motion";
import { Check, CheckCircle2 } from "lucide-react";
import { extractedItems } from "@/data/extractedItems";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ERPSyncModalProps {
  onClose: () => void;
}

export default function ERPSyncModal({ onClose }: ERPSyncModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[460px] border-border bg-card p-7">
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
          <DialogTitle className="font-display text-center text-[28px] font-medium leading-none">Successfully synced to SAP</DialogTitle>
          <DialogDescription className="text-center text-[13px]">
            4 line items created as{" "}
            <span className="bg-muted px-2 py-0.5 font-mono text-[12px] text-foreground/80">
              PR-2025-0847
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
                Synced
              </span>
            </motion.div>
          ))}
        </div>

        <Button onClick={onClose} variant="secondary" className="w-full">
          Back to Call Tracker
        </Button>
      </DialogContent>
    </Dialog>
  );
}
