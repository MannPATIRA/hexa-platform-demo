"use client";

import { useSpeed } from "@/hooks/useSpeedControl";
import { cn } from "@/lib/utils";

const speeds = [1, 2, 4];

export default function SpeedControl() {
  const { speed, setSpeed } = useSpeed();

  return (
    <div className="fixed right-4 top-4 z-[9999] flex items-center gap-1 border border-border bg-card/90 p-1 shadow-md backdrop-blur">
      {speeds.map((s) => (
        <button
          key={s}
          onClick={() => setSpeed(s)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium transition-colors",
            speed === s
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {s}×
        </button>
      ))}
    </div>
  );
}
