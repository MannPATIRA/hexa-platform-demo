"use client";

interface TimerProps {
  formatted: string;
  className?: string;
}

export default function Timer({ formatted, className = "" }: TimerProps) {
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {formatted}
    </span>
  );
}
