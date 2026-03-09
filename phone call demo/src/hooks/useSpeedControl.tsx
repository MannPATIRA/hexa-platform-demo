"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface SpeedContextValue {
  speed: number;
  setSpeed: (s: number) => void;
  adjustedMs: (ms: number) => number;
  adjustedSeconds: (s: number) => number;
}

const SpeedContext = createContext<SpeedContextValue>({
  speed: 1,
  setSpeed: () => {},
  adjustedMs: (ms) => ms,
  adjustedSeconds: (s) => s,
});

export function SpeedProvider({ children }: { children: React.ReactNode }) {
  const [speed, setSpeed] = useState(1);

  const adjustedMs = useCallback((ms: number) => ms / speed, [speed]);
  const adjustedSeconds = useCallback((s: number) => s / speed, [speed]);

  return (
    <SpeedContext.Provider value={{ speed, setSpeed, adjustedMs, adjustedSeconds }}>
      {children}
    </SpeedContext.Provider>
  );
}

export function useSpeed() {
  return useContext(SpeedContext);
}
