"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import DynamicIsland from "@/components/phone/DynamicIsland";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hexaToggled?: boolean;
  dynamicIslandExpanded?: boolean;
  dynamicIslandResponded?: boolean;
  onDynamicIslandChoice?: (choice: "yes" | "no") => void;
}

export default function PhoneFrame({
  children,
  className = "",
  style,
  hexaToggled = false,
  dynamicIslandExpanded = false,
  dynamicIslandResponded = false,
  onDynamicIslandChoice,
}: PhoneFrameProps) {
  return (
    <div className={`relative ${className}`} style={style}>
      <div
        className="relative"
        style={{
          height: "min(88vh, 706px)",
          aspectRatio: "390/844",
          boxShadow: "0 44px 90px -30px rgba(0,0,0,0.82), 0 0 65px rgba(0,0,0,0.4)",
        }}
      >
        {/* Screen area — slightly larger than SVG screen rect so content tucks under the frame with no gap */}
        <div
          className="absolute z-10 overflow-hidden bg-black"
          style={{
            left: "8.2%",
            right: "8.2%",
            top: "2.6%",
            bottom: "4.5%",
            borderRadius: 46,
          }}
        >
          {/* Status bar row — centered vertically with the Dynamic Island pill */}
          <div
            className="absolute left-0 right-0 top-0 z-50 grid items-center"
            style={{
              height: 54,
              gridTemplateColumns: "1fr 105px 1fr",
            }}
          >
            {/* Left ear — time and Hexa logo */}
            <div className="flex items-center justify-center px-1">
              <div className="flex items-center gap-1.5">
                {hexaToggled && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor: "#FACC15",
                      boxShadow: "0 0 4px rgba(250, 204, 21, 0.5)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icons/hexa-logo.png"
                      alt=""
                      className="h-[9px] w-[9px] object-contain mix-blend-screen"
                    />
                  </motion.div>
                )}
                <span
                  className="text-[11px] font-semibold text-white"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  2:06
                </span>
              </div>
            </div>

            {/* Center — Dynamic Island spacer (matches compact DI width) */}
            <div className="relative flex-shrink-0" style={{ width: 105 }} />

            {/* Right ear — signal, 5G, battery */}
            <div className="flex items-center justify-center px-1">
              <div className="flex items-center gap-[3px]">
                <svg width="12" height="9" viewBox="0 0 17 12" fill="none" aria-hidden>
                  <rect x="0" y="6.5" width="2.6" height="5.5" rx="0.7" fill="white" opacity="0.45" />
                  <rect x="3.6" y="4.8" width="2.6" height="7.2" rx="0.7" fill="white" opacity="0.62" />
                  <rect x="7.2" y="2.8" width="2.6" height="9.2" rx="0.7" fill="white" opacity="0.78" />
                  <rect x="10.8" y="0.8" width="2.6" height="11.2" rx="0.7" fill="white" />
                </svg>
                <span
                  className="text-[9px] font-semibold text-white"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  5G
                </span>
                <svg width="18" height="9" viewBox="0 0 27 13" fill="none" className="ml-px" aria-hidden>
                  <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="white" strokeOpacity="0.55" />
                  <rect x="2.1" y="2.1" width="15.6" height="8.8" rx="1.8" fill="white" />
                  <path d="M24 4.6V8.4C24.95 8.05 26 7.05 26 6.5C26 5.95 24.95 4.95 24 4.6Z" fill="white" opacity="0.55" />
                </svg>
              </div>
            </div>
          </div>

          {/* Dynamic Island (above all content, centered) */}
          <DynamicIsland
            expanded={dynamicIslandExpanded}
            hasResponded={dynamicIslandResponded}
            onChoice={onDynamicIslandChoice ?? (() => {})}
          />

          {children}
        </div>

        <Image
          src="/device/iphone15pro-frame.svg?v=2"
          alt="iPhone 15 Pro frame"
          fill
          priority
          unoptimized
          className="pointer-events-none select-none"
          sizes="(max-width: 768px) 280px, 330px"
        />
      </div>
    </div>
  );
}
