"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSpeed } from "./useSpeedControl";

export function useCallTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const wallStartRef = useRef(0);
  const baseElapsedRef = useRef(0);
  const { speed } = useSpeed();
  const speedRef = useRef(speed);

  useEffect(() => {
    if (isRunning) {
      const wallMs = Date.now() - wallStartRef.current;
      baseElapsedRef.current += (wallMs * speedRef.current) / 1000;
      wallStartRef.current = Date.now();
    }
    speedRef.current = speed;
  }, [speed, isRunning]);

  const tick = useCallback(() => {
    const wallMs = Date.now() - wallStartRef.current;
    const simulated = baseElapsedRef.current + (wallMs * speedRef.current) / 1000;
    setElapsedSeconds(Math.floor(simulated));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    baseElapsedRef.current = 0;
    wallStartRef.current = Date.now();
    setElapsedSeconds(0);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      wallStartRef.current = Date.now();
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, tick]);

  useEffect(() => {
    if (!isRunning) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isRunning, tick]);

  const formatted = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(
    elapsedSeconds % 60
  ).padStart(2, "0")}`;

  return { elapsedSeconds, formatted, isRunning, start, stop };
}
