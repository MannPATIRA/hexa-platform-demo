"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Radio } from "lucide-react";
import Timer from "@/components/shared/Timer";
import TranscriptPanel from "./TranscriptPanel";
import ExtractedItemsPanel from "./ExtractedItemsPanel";
import ERPSyncModal from "./ERPSyncModal";
import { useSpeed } from "@/hooks/useSpeedControl";
import type { Screen5State } from "@/hooks/useDemoFlow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CallDetailProps {
  timerFormatted: string;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  onBack: () => void;
  screen5State: Screen5State;
  setScreen5State: (s: Screen5State) => void;
  onCallEnd: () => void;
}

export default function CallDetail({
  timerFormatted,
  elapsedSeconds,
  isTimerRunning,
  onBack,
  screen5State,
  setScreen5State,
  onCallEnd,
}: CallDetailProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const { speed } = useSpeed();
  const isReview = screen5State === "review" || screen5State === "edit";
  const isEnded = screen5State !== "live";

  const handleCallEnd = useCallback(() => {
    setScreen5State("ended");
    onCallEnd();
    setTimeout(() => setShowBanner(true), 800 / speed);
  }, [setScreen5State, onCallEnd, speed]);

  const handleReview = useCallback(() => setScreen5State("review"), [setScreen5State]);

  useEffect(() => {
    if (showBanner && screen5State === "ended") {
      const t = setTimeout(() => handleReview(), 1200 / speed);
      return () => clearTimeout(t);
    }
  }, [showBanner, screen5State, handleReview, speed]);

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="secondary"
            size="icon"
            className="h-8 w-8"
          >
            <ArrowLeft size={14} className="text-muted-foreground" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/30 text-xs font-semibold text-primary-foreground">DP</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-[22px] font-medium leading-none text-foreground">
                David Patterson
              </h2>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">Sheffield Precision Mfg.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEnded ? (
            <Badge className="gap-2 border-red-500/25 bg-red-500/10 px-3 py-1.5 text-red-600">
              <motion.div
                className="h-[6px] w-[6px] rounded-full bg-red-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <Radio size={12} className="text-red-400" strokeWidth={2} />
              <span className="text-[12px] font-semibold tracking-wide">LIVE</span>
            </Badge>
          ) : (
            <span className="border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground">
              Call Ended
            </span>
          )}
          <Timer
            formatted={timerFormatted}
            className="tabular-nums text-[14px] font-mono text-foreground/70"
          />
        </div>
      </div>

      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center justify-between px-5 py-2.5"
            style={{
              background: "rgba(79,70,229,0.08)",
              borderBottom: "1px solid rgba(79,70,229,0.24)",
            }}
          >
            <p className="text-[12px] text-foreground/80">
              {isReview
                ? "Review extracted items below. Click the edit icon to modify, then push to ERP."
                : `Call complete — ${itemCount} item${itemCount !== 1 ? "s" : ""} detected. Review and confirm to update your ERP.`}
            </p>
            {!isReview && (
              <Button
                onClick={handleReview}
                size="sm"
                className="ml-4 whitespace-nowrap text-[12px]"
              >
                Review Items →
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        <motion.div
          className="overflow-hidden"
          animate={{ width: isReview ? "40%" : "56%" }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{ borderRight: "1px solid hsl(var(--border))" }}
        >
          <TranscriptPanel
            elapsedSeconds={elapsedSeconds}
            onCallEnd={handleCallEnd}
            isTimerRunning={isTimerRunning}
          />
        </motion.div>
        <motion.div
          className="overflow-hidden"
          animate={{ width: isReview ? "60%" : "44%" }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <ExtractedItemsPanel
            elapsedSeconds={elapsedSeconds}
            isReview={isReview}
            onItemCountChange={setItemCount}
            onSync={() => setShowModal(true)}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <ERPSyncModal onClose={() => { setShowModal(false); onBack(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
