"use client";

import { useMemo } from "react";
import type { ProcurementItem } from "@/lib/procurement-types";
import { getStockColor, getDaysOfStockRemaining } from "@/data/procurement-data";

const STROKE_COLORS = { red: "#ef4444", amber: "#f59e0b", green: "#10b981" } as const;

const SPARK_W = 800;
const SPARK_H = 200;
const SPARK_PAD = { top: 12, right: 12, bottom: 28, left: 12 };
const SPARK_IW = SPARK_W - SPARK_PAD.left - SPARK_PAD.right;
const SPARK_IH = SPARK_H - SPARK_PAD.top - SPARK_PAD.bottom;

export default function StockTrendChart({ item }: { item: ProcurementItem }) {
  const hasHistory = item.stockHistory.length > 1;
  const daysRemaining = getDaysOfStockRemaining(item);
  const stockColor = getStockColor(daysRemaining);

  if (!hasHistory) {
    return (
      <div className="border border-border bg-card p-5 shadow-sm">
        <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          90-Day Stock Trend
        </h4>
        <div className="flex items-center justify-center py-10 text-[12px] text-muted-foreground">
          No history available
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card p-5 shadow-sm">
      <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        90-Day Stock Trend
      </h4>
      <div className="min-h-[160px]">
        <Sparkline
          stockHistory={item.stockHistory}
          reorderPoint={item.reorderPoint}
          stockColor={stockColor}
        />
      </div>
    </div>
  );
}

function Sparkline({
  stockHistory,
  reorderPoint,
  stockColor,
}: {
  stockHistory: ProcurementItem["stockHistory"];
  reorderPoint: number;
  stockColor: "red" | "amber" | "green";
}) {
  const { linePath, areaPath, reorderY, endPt, xLabels } = useMemo(() => {
    const levels = stockHistory.map((p) => p.level);
    const yMax = Math.ceil(Math.max(...levels, reorderPoint) * 1.1) || 1;
    const pts = stockHistory.map((p, i) => ({
      x: SPARK_PAD.left + (i / Math.max(stockHistory.length - 1, 1)) * SPARK_IW,
      y: SPARK_PAD.top + (1 - p.level / yMax) * SPARK_IH,
    }));
    const rY = SPARK_PAD.top + (1 - reorderPoint / yMax) * SPARK_IH;
    const line = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
    const area =
      `M ${pts[0].x} ${SPARK_PAD.top + SPARK_IH} ` +
      pts.map((p) => `L ${p.x} ${p.y}`).join(" ") +
      ` L ${pts[pts.length - 1].x} ${SPARK_PAD.top + SPARK_IH} Z`;
    const first = new Date(stockHistory[0].date + "T00:00:00");
    const last = new Date(stockHistory[stockHistory.length - 1].date + "T00:00:00");
    const xl = [
      {
        x: SPARK_PAD.left,
        label: first.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      },
      {
        x: SPARK_PAD.left + SPARK_IW,
        label: last.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      },
    ];
    return {
      linePath: line,
      areaPath: area,
      reorderY: rY,
      endPt: pts[pts.length - 1],
      xLabels: xl,
    };
  }, [stockHistory, reorderPoint]);

  const stroke = STROKE_COLORS[stockColor];
  const fill =
    stockColor === "red"
      ? "rgba(239,68,68,0.04)"
      : stockColor === "amber"
        ? "rgba(245,158,11,0.04)"
        : "rgba(16,185,129,0.04)";

  return (
    <svg
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={areaPath} fill={fill} />
      {reorderPoint > 0 && (
        <line
          x1={SPARK_PAD.left}
          x2={SPARK_PAD.left + SPARK_IW}
          y1={reorderY}
          y2={reorderY}
          stroke="currentColor"
          strokeWidth={0.5}
          strokeDasharray="3 2"
          strokeOpacity={0.15}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {endPt && <circle cx={endPt.x} cy={endPt.y} r={3} fill={stroke} />}
      {xLabels.map((t, i) => (
        <text
          key={i}
          x={t.x}
          y={SPARK_H - 2}
          textAnchor={i === 0 ? "start" : "end"}
          className="fill-muted-foreground/50"
          fontSize={8}
        >
          {t.label}
        </text>
      ))}
    </svg>
  );
}
