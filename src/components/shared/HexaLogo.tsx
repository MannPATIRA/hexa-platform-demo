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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/hexa-logo-new.png"
        alt="Hexa"
        style={{ width: size, height: size }}
        className="object-contain"
      />
      {showText && (
        <span className={cn("font-semibold tracking-tight", textClassName)}>Hexa</span>
      )}
    </div>
  );
}
