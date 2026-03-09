"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Download, Sparkles } from "lucide-react";
import { useSpeed } from "@/hooks/useSpeedControl";
import { extractedItems, type ExtractedItem } from "@/data/extractedItems";
import ItemCard from "./ItemCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExtractedItemsPanelProps {
  elapsedSeconds: number;
  isReview: boolean;
  onItemCountChange: (count: number) => void;
  onSync: () => void;
}

export default function ExtractedItemsPanel({
  elapsedSeconds,
  isReview,
  onItemCountChange,
  onSync,
}: ExtractedItemsPanelProps) {
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const { speed } = useSpeed();
  const visibleItems = useMemo<ExtractedItem[]>(
    () => extractedItems.filter((i) => elapsedSeconds >= i.appearAfterSeconds + 1),
    [elapsedSeconds]
  );

  useEffect(() => {
    onItemCountChange(visibleItems.length);
  }, [onItemCountChange, visibleItems.length]);

  const handleSync = useCallback(() => {
    setSyncLoading(true);
    setSyncProgress(0);
    const iv = setInterval(() => {
      setSyncProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setSyncLoading(false);
          onSync();
          return 100;
        }
        return p + 4;
      });
    }, 100 / speed);
  }, [speed, onSync]);

  return (
    <div className="flex h-full flex-col bg-background/40">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Sparkles size={13} className="text-primary/80" />
          <span className="text-[12px] font-semibold text-muted-foreground">Extracted Items</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={visibleItems.length}
              className="tabular-nums"
              initial={{ scale: 1.4, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <Badge variant="secondary">{visibleItems.length}</Badge>
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="text-[11px] text-muted-foreground">AI-detected procurement items</p>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-3">
        <AnimatePresence>
          {visibleItems.map((item, i) => (
            <ItemCard key={item.id} item={item} isReview={isReview} index={i} />
          ))}
        </AnimatePresence>

        {visibleItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center border border-dashed border-border bg-card">
              <Database size={20} className="text-muted-foreground" />
            </div>
            <p className="text-[12px] font-medium text-muted-foreground">Listening for items...</p>
            <p className="mt-1 text-[11px] text-muted-foreground">AI will extract procurement details</p>
          </div>
        )}

        {isReview && visibleItems.length > 0 && (
          <div className="mt-4 space-y-2 pb-4">
            <Button
              onClick={handleSync}
              disabled={syncLoading}
              className="relative h-12 w-full overflow-hidden text-[13px] font-semibold"
            >
              {syncLoading && (
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ width: "0%" }}
                  animate={{ width: `${syncProgress}%` }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {syncLoading ? (
                  <>
                    <motion.div
                      className="h-3.5 w-3.5 border-2 border-black/20 border-t-black/70"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Syncing with SAP...
                  </>
                ) : (
                  <>
                    <Database size={14} />
                    Confirm & Push to ERP
                  </>
                )}
              </span>
            </Button>
            <Button
              variant="secondary"
              className="h-11 w-full text-[12px] font-medium text-muted-foreground"
            >
              <Download size={13} />
              Export as CSV
            </Button>
          </div>
        )}
        </div>
      </ScrollArea>
    </div>
  );
}
