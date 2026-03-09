"use client";

import { cn } from "@/lib/utils";

interface HexaLogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export default function HexaLogo({ size = 32, showText = false, textClassName = "" }: HexaLogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center justify-center rounded-lg bg-primary overflow-hidden"
        style={{
          width: size,
          height: size,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/hexa-logo.png"
          alt="Hexa"
          style={{ width: size * 0.6, height: size * 0.6 }}
          className="object-contain"
        />
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight", textClassName)}>Hexa</span>
      )}
    </div>
  );
}
