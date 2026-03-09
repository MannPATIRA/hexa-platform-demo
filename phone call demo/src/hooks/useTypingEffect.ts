"use client";

import { useState, useEffect, useRef } from "react";
import { useSpeed } from "./useSpeedControl";

export function useTypingEffect(
  text: string,
  isActive: boolean,
  charsPerSecond: number = 50
) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const { speed } = useSpeed();

  useEffect(() => {
    if (!isActive) return;

    indexRef.current = 0;
    queueMicrotask(() => {
      setDisplayedText("");
      setIsComplete(false);
    });

    const intervalMs = 1000 / (charsPerSecond * speed);
    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayedText(text);
        setIsComplete(true);
        clearInterval(interval);
      } else {
        setDisplayedText(text.slice(0, indexRef.current));
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [text, isActive, charsPerSecond, speed]);

  return { displayedText, isComplete };
}
