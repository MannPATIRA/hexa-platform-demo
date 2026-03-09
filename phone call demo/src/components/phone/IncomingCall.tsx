"use client";

import { motion, AnimatePresence } from "framer-motion";
import Timer from "@/components/shared/Timer";
import SlideToAnswer from "@/components/phone/SlideToAnswer";

const SF_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif";

const IOS_GREEN = "#34C759";

interface IncomingCallProps {
  callAccepted: boolean;
  timerFormatted: string;
  onAccept: () => void;
}

export default function IncomingCall({
  callAccepted,
  timerFormatted,
  onAccept,
}: IncomingCallProps) {
  const showIncomingUI = !callAccepted;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col overflow-hidden"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
    >
      {/* Teal gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #1a6b5a 0%, #105544 40%, #0d3d35 100%)",
        }}
      />

      {/* Bokeh overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 30% 20%, rgba(40,140,120,0.35) 0%, transparent 70%), " +
            "radial-gradient(ellipse 60% 40% at 75% 60%, rgba(20,100,85,0.3) 0%, transparent 65%), " +
            "radial-gradient(ellipse 50% 50% at 50% 45%, rgba(30,120,100,0.2) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 180,
          height: 180,
          top: "12%",
          left: "10%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(60,160,140,0.18) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 140,
          height: 140,
          top: "55%",
          right: "5%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(40,130,110,0.15) 0%, transparent 70%)",
          filter: "blur(25px)",
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Status bar spacer */}
        <div style={{ height: 54, flexShrink: 0 }} />

        {/* Caller info — positioned ~25% from top, not vertically centered */}
        <div className="flex flex-col items-center" style={{ paddingTop: "18%" }}>
          <h2
            className="text-center text-white"
            style={{
              fontFamily: SF_DISPLAY,
              fontWeight: 300,
              fontSize: 36,
              lineHeight: 1.1,
              letterSpacing: 0.2,
            }}
          >
            David Patterson
          </h2>
          <p
            className="mt-[8px]"
            style={{
              fontFamily: SF_FONT,
              fontWeight: 400,
              fontSize: 16,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            mobile
          </p>

          <div className="mt-[4px] flex items-center gap-2">
            {!callAccepted ? (
              <motion.p
                style={{
                  fontFamily: SF_FONT,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.40)",
                }}
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                incoming…
              </motion.p>
            ) : (
              <div className="flex items-center gap-2" style={{ fontFamily: SF_FONT }}>
                <motion.div
                  className="h-[7px] w-[7px] rounded-full"
                  style={{ backgroundColor: IOS_GREEN }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Timer
                  formatted={timerFormatted}
                  className="text-[15px] font-medium text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Spacer pushes bottom section down */}
        <div className="flex-1" />

        {/* Bottom action area */}
        <AnimatePresence>
          {showIncomingUI ? (
            <motion.div
              className="flex flex-col items-center px-5"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Remind Me + Message buttons */}
              <div className="mb-[20px] flex items-center justify-center gap-[60px]">
                <button
                  type="button"
                  className="flex flex-col items-center gap-[5px]"
                  aria-label="Remind Me"
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 52,
                      height: 52,
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="13" r="8" />
                      <path d="M12 9v4l2.5 1.5" />
                      <path d="M5 3L2 6" />
                      <path d="M22 6l-3-3" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontFamily: SF_FONT,
                      fontWeight: 400,
                      fontSize: 11,
                      color: "white",
                    }}
                  >
                    Remind Me
                  </span>
                </button>
                <button
                  type="button"
                  className="flex flex-col items-center gap-[5px]"
                  aria-label="Message"
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 52,
                      height: 52,
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontFamily: SF_FONT,
                      fontWeight: 400,
                      fontSize: 11,
                      color: "white",
                    }}
                  >
                    Message
                  </span>
                </button>
              </div>

              <div className="flex w-full justify-center">
                <SlideToAnswer onAnswer={onAccept} />
              </div>

              {/* Bottom spacing for home indicator */}
              <div style={{ height: 10 }} />
            </motion.div>
          ) : (
            <motion.div
              className="pb-11"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Home indicator */}
        <div className="flex justify-center" style={{ paddingBottom: 6, paddingTop: 2 }}>
          <div
            style={{
              width: 100,
              height: 5,
              borderRadius: 2.5,
              background: "rgba(255,255,255,0.18)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
