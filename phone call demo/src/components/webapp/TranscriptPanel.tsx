"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeed } from "@/hooks/useSpeedControl";
import { transcript } from "@/data/transcript";

interface TranscriptPanelProps {
  elapsedSeconds: number;
  onCallEnd: () => void;
  isTimerRunning: boolean;
}

export default function TranscriptPanel({ elapsedSeconds, onCallEnd, isTimerRunning }: TranscriptPanelProps) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const [typedTexts, setTypedTexts] = useState<Record<number, string>>({});
  const [highlightedMessages, setHighlightedMessages] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speed } = useSpeed();
  const lastRef = useRef(-1);
  const endedRef = useRef(false);
  const intervalsRef = useRef<Set<ReturnType<typeof setInterval>>>(new Set());
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => () => { intervalsRef.current.forEach(clearInterval); }, []);

  const catchUpMessages = useCallback(() => {
    if (!isTimerRunning) return;

    // 1) Repair any message that should already be fully typed (fixes empty bubble when returning to tab)
    const repairedTyped: Record<number, string> = {};
    const repairedVisible: number[] = [];
    let repairedHighlighted = new Set<number>();
    for (let i = 0; i < transcript.length; i++) {
      const msg = transcript[i];
      const text = msg.text;
      const typingDurationSec = text.length / (50 * speedRef.current);
      const shouldBeComplete = elapsedSeconds >= msg.appearAfterSeconds + typingDurationSec + 0.3;
      if (shouldBeComplete) {
        repairedVisible.push(i);
        repairedTyped[i] = text;
        if (msg.highlights?.length) repairedHighlighted.add(i);
        if (i === transcript.length - 1 && !endedRef.current) {
          endedRef.current = true;
          setTimeout(() => onCallEnd(), 500 / speedRef.current);
        }
      }
    }
    if (Object.keys(repairedTyped).length > 0) {
      setVisibleMessages((prev) => {
        const merged = new Set(prev);
        repairedVisible.forEach((i) => merged.add(i));
        return [...merged].sort((a, b) => a - b);
      });
      setTypedTexts((prev) => ({ ...prev, ...repairedTyped }));
      setTypingIndex((prev) => (prev !== null && repairedVisible.includes(prev) ? null : prev));
      if (repairedHighlighted.size > 0) {
        setHighlightedMessages((prev) => new Set([...prev, ...repairedHighlighted]));
      }
    }

    // 2) Add and animate new messages that just became due
    for (let i = 0; i < transcript.length; i++) {
      if (i > lastRef.current && elapsedSeconds >= transcript[i].appearAfterSeconds) {
        lastRef.current = i;
        const mi = i;
        const msg = transcript[i];
        const text = msg.text;
        const secondsSinceAppear = elapsedSeconds - msg.appearAfterSeconds;
        const typingDurationSec = text.length / (50 * speedRef.current);
        const isLate = secondsSinceAppear > typingDurationSec + 0.5;

        setVisibleMessages((prev) => (prev.includes(mi) ? prev : [...prev, mi]));

        if (isLate) {
          setTypedTexts((prev) => ({ ...prev, [mi]: text }));
          setTypingIndex((prev) => (prev === mi ? null : prev));
          if (msg.highlights?.length) {
            setHighlightedMessages((prev) => new Set(prev).add(mi));
          }
          if (mi === transcript.length - 1 && !endedRef.current) {
            endedRef.current = true;
            setTimeout(() => onCallEnd(), 500 / speedRef.current);
          }
        } else {
          let ci = 0;
          setTypingIndex(mi);
          setTypedTexts((prev) => ({ ...prev, [mi]: "" }));
          const iv = setInterval(() => {
            ci++;
            if (ci >= text.length) {
              setTypedTexts((prev) => ({ ...prev, [mi]: text }));
              setTypingIndex((prev) => (prev === mi ? null : prev));
              clearInterval(iv);
              intervalsRef.current.delete(iv);
              if (msg.highlights?.length) {
                setTimeout(
                  () => setHighlightedMessages((prev) => new Set(prev).add(mi)),
                  300 / speedRef.current
                );
              }
              if (mi === transcript.length - 1 && !endedRef.current) {
                endedRef.current = true;
                setTimeout(() => onCallEnd(), 1000 / speedRef.current);
              }
            } else {
              setTypedTexts((prev) => ({ ...prev, [mi]: text.slice(0, ci) }));
            }
          }, 1000 / (50 * speedRef.current));
          intervalsRef.current.add(iv);
        }
      }
    }
  }, [elapsedSeconds, isTimerRunning, onCallEnd]);

  useEffect(() => {
    catchUpMessages();
  }, [catchUpMessages]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        catchUpMessages();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [catchUpMessages]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleMessages, typedTexts]);

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
        <span className="text-[12px] font-semibold text-muted-foreground">Transcript</span>
        {isTimerRunning && (
          <motion.div
            className="h-[6px] w-[6px] rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          <AnimatePresence>
            {visibleMessages.map((idx) => {
              const msg = transcript[idx];
              const isSales = msg.role === "sales";
              const text = typedTexts[idx] || "";
              const done = text === msg.text;
              const hl = highlightedMessages.has(idx);
              return (
                <motion.div
                  key={idx}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex flex-col gap-1 ${isSales ? "items-end" : "items-start"}`}
                >
                  <span className={`px-1 text-[11px] font-medium ${isSales ? "text-primary/80" : "text-muted-foreground"}`}>
                    {msg.speaker}
                  </span>
                  <div
                    className={`max-w-[84%] border px-4 py-2.5 ${isSales ? "border-primary/30 bg-primary/10" : "border-border bg-background/60"}`}
                  >
                    <p className="text-[13px] leading-[1.65] text-foreground/85">
                      {done && hl ? renderHighlighted(text, msg.highlights || []) : text}
                      {typingIndex === idx && (
                        <motion.span
                          className="ml-0.5 inline-block h-[14px] w-[2px] align-middle bg-indigo-400"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function renderHighlighted(text: string, highlights: string[]) {
  if (!highlights?.length) return text;
  const sorted = [...highlights].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${sorted.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isHL = sorted.some((h) => h.toLowerCase() === part.toLowerCase());
    if (isHL) {
      return (
        <motion.span
          key={i}
          className="px-[3px] py-[1px]"
          style={{ backgroundColor: "rgba(250,204,21,0.25)", color: "#B45309" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.7, 1] }}
          transition={{ duration: 0.8 }}
        >
          {part}
        </motion.span>
      );
    }
    return part;
  });
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
