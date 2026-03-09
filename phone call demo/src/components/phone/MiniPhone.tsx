"use client";

import { motion } from "framer-motion";
import Timer from "@/components/shared/Timer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MiniPhoneProps {
  timerFormatted: string;
  callEnded: boolean;
  visible: boolean;
}

export default function MiniPhone({ timerFormatted, callEnded, visible }: MiniPhoneProps) {
  if (!visible) return null;

  return (
    <motion.div
      className="fixed z-[100]"
      style={{ bottom: 24, left: 24 }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: callEnded ? 0 : 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: callEnded ? 0.5 : 0 }}
    >
      <div
        className="relative overflow-hidden rounded-3xl border border-border bg-card"
        style={{
          width: 140,
          height: 280,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        }}
      >
        {/* Mini notch */}
        <div className="absolute left-1/2 top-[5px] z-10 -translate-x-1/2"
          style={{ width: 42, height: 12, borderRadius: 7, backgroundColor: "#000" }}
        />

        <div className="flex h-full flex-col items-center justify-center gap-3 px-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/30 text-[10px] font-semibold text-primary-foreground">DP</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-[10px] font-medium text-foreground">David Patterson</p>
            <p className="text-[8px] text-muted-foreground">Sheffield Precision</p>
          </div>
          <div className="flex items-center gap-1.5">
            {!callEnded ? (
              <>
                <motion.div className="h-[5px] w-[5px] rounded-full bg-green-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Timer formatted={timerFormatted} className="text-[10px] text-foreground/85" />
              </>
            ) : (
              <span className="text-[9px] text-muted-foreground">Call Ended</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
