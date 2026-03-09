"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { creditOpportunities, suppliers } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// Compute credits by supplier
const creditsBySupplier = suppliers.map((s) => {
  const opps = creditOpportunities.filter(
    (o) => o.supplierId === s.id && o.status !== "CLOSED"
  );
  const total = opps.reduce((sum, o) => sum + o.creditAmount, 0);
  return { name: s.name, id: s.id, total, count: opps.length };
}).filter((s) => s.total > 0).sort((a, b) => b.total - a.total);

const maxCredit = Math.max(...creditsBySupplier.map((s) => s.total), 1);

// Recent opportunities
const recentOpps = [...creditOpportunities]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 8);

// Computed stats
const totalCredits = creditOpportunities
  .filter((o) => o.status !== "CLOSED")
  .reduce((sum, o) => sum + o.creditAmount, 0);
const openCount = creditOpportunities.filter((o) => o.status === "OPEN").length;
const recoveredCount = creditOpportunities.filter((o) => o.status === "CREDITED").length;
const atRiskCount = 4;

// Y-axis ticks helper
function getAxisTicks(max: number, count: number = 4) {
  const step = Math.ceil(max / count / 500) * 500;
  const ticks = [];
  for (let i = 0; i <= count; i++) {
    ticks.push(i * step);
  }
  return ticks;
}

function SupplierBarChart({ data, maxValue }: { data: typeof creditsBySupplier; maxValue: number }) {
  const ticks = getAxisTicks(maxValue);
  const axisMax = ticks[ticks.length - 1];
  const chartHeight = 300;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-sm font-medium text-foreground">Credits by Supplier</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-4 pb-3">
        <div className="flex">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between pr-2 shrink-0" style={{ height: chartHeight }}>
            {[...ticks].reverse().map((tick) => (
              <span key={tick} className="text-xs tabular-nums text-muted-foreground leading-none">
                £{tick.toLocaleString()}
              </span>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1 relative border-l border-b border-border" style={{ height: chartHeight }}>
            {/* Grid lines */}
            {ticks.map((tick) => {
              const bottom = (tick / axisMax) * 100;
              return (
                <div
                  key={tick}
                  className="absolute left-0 right-0 border-t border-border/50"
                  style={{ bottom: `${bottom}%` }}
                />
              );
            })}

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around px-2 gap-1">
              {data.map((s, i) => {
                const pct = (s.total / axisMax) * 100;
                return (
                  <Link
                    key={s.name}
                    href={`/suppliers/${s.id}`}
                    className="flex-1 flex flex-col items-center justify-end h-full group"
                  >
                    <div
                      className="w-full max-w-[52px] bg-primary group-hover:opacity-80 transition-opacity"
                      style={{ height: `${pct}%` }}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex ml-10 mt-2">
          <div className="flex-1 flex justify-around px-2 gap-1">
            {data.map((s) => (
              <div key={s.name} className="flex-1 text-center">
                <span className="text-xs text-muted-foreground leading-tight block" title={s.name}>
                  {s.name.split(/\s+/).map(w => w[0]).join("").toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [syncTime, setSyncTime] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [timeRange, setTimeRange] = useState("this_quarter");

  useEffect(() => {
    setSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-2">
        <div>
          <h1 className="text-[28px] font-normal text-foreground font-[family-name:var(--font-serif)]">SLA Recovery Overview</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Track supplier credits and claim status</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm gap-1.5"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
            {syncTime || "Sync"}
          </Button>
        </div>
      </div>

      <div className="px-8 pb-8 pt-4 space-y-6">
        {/* KPI row — GA4 style: colored label above, big number, small subtitle */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              <Link href="/claims" className="group">
                <p className="text-sm font-medium text-primary">Recoverable Credits</p>
                <p className="text-4xl font-normal mt-2 text-foreground group-hover:text-primary transition-colors">
                  £{totalCredits.toLocaleString()}
                </p>
              </Link>

              <Link href="/claims?status=OPEN" className="group">
                <p className="text-sm font-medium text-muted-foreground">Open Claims</p>
                <p className="text-4xl font-normal mt-2 text-foreground group-hover:text-primary transition-colors">
                  {openCount}
                </p>
              </Link>

              <Link href="/claims?status=CREDITED" className="group">
                <p className="text-sm font-medium text-muted-foreground">Recovered</p>
                <p className="text-4xl font-normal mt-2 text-foreground group-hover:text-primary transition-colors">
                  {recoveredCount}
                </p>
              </Link>

              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-4xl font-normal mt-2 text-foreground">
                  {atRiskCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column: Recent Claims left, Bar Chart right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 min-w-0">
          {/* Recent Claims */}
          <Card className="lg:col-span-2 min-w-0">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-sm font-medium text-foreground">Recent Claims</CardTitle>
              <Link
                href="/claims"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-medium px-6 py-3">Supplier</th>
                    <th className="text-left font-medium px-4 py-3">PO</th>
                    <th className="text-right font-medium px-4 py-3">Credit</th>
                    <th className="text-right font-medium px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOpps.map((opp) => (
                    <tr key={opp.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <Link href={`/claims/${opp.id}`} className="text-primary hover:underline text-sm">
                          {opp.supplierName}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground font-mono whitespace-nowrap">
                        {opp.poNumber}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium tabular-nums">
                        £{opp.creditAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="text-xs font-medium text-muted-foreground">
                          {opp.recommendation === "DO_NOT_CLAIM" ? "Skip" : opp.recommendation === "CLAIM" ? "Claim" : "Review"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Vertical Bar Chart */}
          <SupplierBarChart data={creditsBySupplier.slice(0, 5)} maxValue={maxCredit} />
        </div>
      </div>
    </div>
  );
}
