"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check } from "lucide-react";
import type { ExtractedItem } from "@/data/extractedItems";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: ExtractedItem;
  isReview: boolean;
  index: number;
}

export default function ItemCard({ item, isReview, index }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [editValues, setEditValues] = useState({ ...item });

  const fields: { label: string; key: keyof ExtractedItem }[] = [
    { label: "SKU", key: "sku" },
    { label: "Qty", key: "qty" },
    { label: "Unit Price", key: "unitPrice" },
    { label: "Delivery By", key: "deliveryBy" },
    { label: "Delivery To", key: "deliveryTo" },
    { label: "Specs", key: "specs" },
    { label: "Payment Terms", key: "paymentTerms" },
  ];

  const handleSave = () => {
    setIsEditing(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 900);
  };

  return (
    <motion.div
      layout
      initial={isReview ? {} : { x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={
        isReview
          ? { layout: { duration: 0.3 } }
          : { type: "spring", stiffness: 300, damping: 25 }
      }
    >
      <Card
        className={cn(
          "relative overflow-hidden",
          isEditing ? "border-primary/40 bg-primary/5" : "bg-card",
          isReview && !isEditing && "border-l-2 border-l-primary"
        )}
      >
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center bg-emerald-500"
          >
            <Check size={13} color="white" strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>

      <CardContent className="p-4">
        <div className="mb-3.5 flex items-start justify-between">
          <div>
            <h4 className="text-[13px] font-semibold leading-tight tracking-tight text-foreground">
              {item.name}
            </h4>
            <Badge variant="secondary" className="mt-1.5 px-2 py-[3px] text-[10px] uppercase tracking-wide">
              {item.category}
            </Badge>
          </div>
          {isReview && !isEditing && !showSaved && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {fields.map((f) => (
            <div key={f.key} className="flex items-baseline justify-between gap-4">
              <span className="min-w-[88px] flex-shrink-0 text-[11px] font-medium text-muted-foreground">
                {f.label}
              </span>
              {isEditing ? (
                <Input
                  className="h-8 min-w-0 flex-1 border-border bg-background text-[12px]"
                  value={String(editValues[f.key])}
                  onChange={(e) =>
                    setEditValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                />
              ) : (
                <span className="text-right text-[12px] text-foreground/75">{String(item[f.key])}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="text-[11px] font-medium text-muted-foreground">AI Confidence</span>
          <div className="flex items-center gap-2">
            <div className="h-[4px] w-16 overflow-hidden bg-muted">
              <motion.div
                className="h-full"
                style={{ background: "linear-gradient(90deg, #34D399, #10B981)", width: `${item.confidence}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${item.confidence}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
              />
            </div>
            <span className={cn("text-[11px] font-bold tabular-nums", item.confidence >= 90 ? "text-emerald-600" : "text-muted-foreground")}>
              {item.confidence}%
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 flex items-center gap-2 overflow-hidden"
            >
              <Button
                onClick={handleSave}
                className="h-8 flex-1 text-xs"
              >
                Save
              </Button>
              <Button
                onClick={() => { setIsEditing(false); setEditValues({ ...item }); }}
                variant="secondary"
                className="h-8 flex-1 text-xs"
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      </Card>
    </motion.div>
  );
}
