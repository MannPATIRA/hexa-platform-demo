"use client";

import { motion, AnimatePresence } from "framer-motion";

const SF_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const IOS_GREEN = "#34C759";

interface DynamicIslandProps {
  expanded: boolean;
  hasResponded: boolean;
  onChoice: (choice: "yes" | "no") => void;
}

const COMPACT_WIDTH = 105;
const COMPACT_HEIGHT = 30;
const EXPANDED_WIDTH = 260;
const EXPANDED_WITH_BUTTONS_HEIGHT = 120;

export default function DynamicIsland({
  expanded,
  hasResponded,
  onChoice,
}: DynamicIslandProps) {
  const showButtons = expanded && !hasResponded;
  const isExpanded = expanded && !hasResponded;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ top: 12, zIndex: 60 }}
    >
      <motion.div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#000" }}
        animate={{
          width: isExpanded ? EXPANDED_WIDTH : COMPACT_WIDTH,
          height: isExpanded ? EXPANDED_WITH_BUTTONS_HEIGHT : COMPACT_HEIGHT,
          borderRadius: isExpanded ? 28 : COMPACT_HEIGHT / 2,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 0.8,
        }}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.1 }}
            >
              {/* Icon + text row */}
              <div
                className="flex items-center justify-between"
                style={{ padding: "12px 20px 0 20px" }}
              >
                <div className="min-w-0">
                  <p
                    style={{
                      fontFamily: SF_FONT,
                      fontWeight: 600,
                      fontSize: 13,
                      color: "white",
                      lineHeight: 1.15,
                      letterSpacing: -0.1,
                    }}
                  >
                    Hexa
                  </p>
                  <p
                    style={{
                      fontFamily: SF_FONT,
                      fontWeight: 400,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.65)",
                      lineHeight: 1.2,
                      marginTop: 2,
                    }}
                  >
                    Track this call?
                  </p>
                </div>
                <div
                  className="flex-shrink-0 overflow-hidden bg-white"
                  style={{ width: 28, height: 28, borderRadius: 7 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/hexa.png"
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Spacer pushes buttons to bottom */}
              <div className="flex-1" />

              {/* Action buttons */}
              {showButtons && (
                <div
                  className="flex gap-[7px]"
                  style={{ padding: "0 16px 12px 16px" }}
                >
                  <button
                    onClick={() => onChoice("yes")}
                    className="flex-1 flex items-center justify-center transition-colors active:brightness-125"
                    style={{
                      height: 34,
                      borderRadius: 14,
                      backgroundColor: "rgba(255,255,255,0.12)",
                      fontFamily: SF_FONT,
                      fontWeight: 600,
                      fontSize: 13,
                      color: IOS_GREEN,
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => onChoice("no")}
                    className="flex-1 flex items-center justify-center transition-colors active:brightness-125"
                    style={{
                      height: 34,
                      borderRadius: 14,
                      backgroundColor: "rgba(255,255,255,0.12)",
                      fontFamily: SF_FONT,
                      fontWeight: 600,
                      fontSize: 13,
                      color: "white",
                    }}
                  >
                    No
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
