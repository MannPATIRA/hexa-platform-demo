"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Phone } from "lucide-react";

const IOS_GREEN = "#34C759";
const SF_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

const TRACK_WIDTH = 230;
const TRACK_HEIGHT = 50;
const THUMB_SIZE = 46;
const TRACK_PADDING = 2;
const INNER_WIDTH = TRACK_WIDTH - TRACK_PADDING * 2;
const MAX_DRAG = INNER_WIDTH - THUMB_SIZE - TRACK_PADDING;
const DRAG_THRESHOLD = MAX_DRAG * 0.7;

interface SlideToAnswerProps {
  onAnswer: () => void;
  disabled?: boolean;
}

export default function SlideToAnswer({ onAnswer, disabled }: SlideToAnswerProps) {
  const x = useMotionValue(0);
  const hasAnswered = useRef(false);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent) => {
      if (disabled || hasAnswered.current) return;
      const currentX = x.get();
      if (currentX >= DRAG_THRESHOLD) {
        hasAnswered.current = true;
        animate(x, MAX_DRAG, { type: "spring", stiffness: 320, damping: 28 }).then(() =>
          onAnswer()
        );
      } else {
        animate(x, 0, { type: "spring", stiffness: 380, damping: 28 });
      }
    },
    [onAnswer, disabled, x]
  );

  return (
    <div
      className="relative flex items-center overflow-hidden touch-none"
      style={{
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        padding: TRACK_PADDING,
        borderRadius: TRACK_HEIGHT / 2,
        background: "rgba(255,255,255,0.15)",
        boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.1)",
      }}
    >
      <div className="relative flex items-center" style={{ width: INNER_WIDTH, height: THUMB_SIZE }}>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: MAX_DRAG }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{
            x,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15), 0 0.5px 2px rgba(0,0,0,0.1)",
          }}
          className="absolute left-0 top-0 z-10 flex cursor-grab items-center justify-center rounded-full active:cursor-grabbing touch-none flex-shrink-0"
          whileTap={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <Phone
            size={22}
            strokeWidth={2.2}
            className="flex-shrink-0"
            style={{ color: IOS_GREEN, transform: "rotate(-15deg)" }}
          />
        </motion.div>

        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center pl-[54px] pr-3"
          style={{
            fontFamily: SF_FONT,
            fontWeight: 500,
            fontSize: 15,
            color: "white",
            WebkitMaskImage:
              "linear-gradient(110deg, #000 35%, rgba(0,0,0,0.25) 50%, #000 65%)",
            maskImage:
              "linear-gradient(110deg, #000 35%, rgba(0,0,0,0.25) 50%, #000 65%)",
            WebkitMaskSize: "250% 100%",
            maskSize: "250% 100%",
            animation: "ios-shimmer 2.5s ease-in-out infinite",
          }}
        >
          slide to answer
        </span>
      </div>
    </div>
  );
}
