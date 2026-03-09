"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ArrowUpDown, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  AlertCircle 
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { creditOpportunities, suppliers, metricLabels } from "@/lib/mockData";
import type { Recommendation, Status } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function RecommendationBadge({ rec }: { rec: Recommendation }) {
  const label = rec === "CLAIM" ? "Claim" : rec === "DO_NOT_CLAIM" ? "Auto-Close" : "Review";
  return (
    <span className="text-[13px] text-muted-foreground">{label}</span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const labels: Record<Status, string> = {
    OPEN: "Open",
    SENT: "Sent",
    ACKNOWLEDGED: "Acknowledged",
    CREDITED: "Recovered",
    CLOSED: "Closed",
  };
  return (
    <span className={cn(
      "text-[13px]",
      status === "OPEN" ? "text-primary" : "text-muted-foreground"
    )}>
      {labels[status]}
    </span>
  );
}

function ClaimsContent() {
  const searchParams = useSearchParams();
  const [supplierFilter, setSupplierFilter] = useState(searchParams.get("supplier") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [recFilter, setRecFilter] = useState(searchParams.get("recommendation") || "all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = creditOpportunities
    .filter((o) => supplierFilter === "all" || o.supplierId === supplierFilter)
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) => recFilter === "all" || o.recommendation === recFilter)
    .sort((a, b) => {
      if (sortBy === "amount") {
        return sortDir === "desc"
          ? b.creditAmount - a.creditAmount
          : a.creditAmount - b.creditAmount;
      }
      return sortDir === "desc"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const toggleSort = (col: "date" | "amount") => {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const openCount = creditOpportunities.filter((o) => o.status === "OPEN").length;
  const totalCredits = creditOpportunities
    .filter((o) => o.status !== "CLOSED")
    .reduce((sum, o) => sum + o.creditAmount, 0);

  return (
    <div className="flex flex-col w-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-2">
        <div>
          <h1 className="text-[28px] font-normal text-foreground font-[family-name:var(--font-serif)]">Claims Queue</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Review and manage SLA credit claims</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 text-sm">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" className="h-9 text-sm">
            Create Claim
          </Button>
        </div>
      </div>

      <div className="px-8 pb-8 pt-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {creditOpportunities.length} claims
        </p>

        {/* Main Content Area */}
        <div className="rounded bg-card border overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b bg-muted/20">
          <div className="flex flex-1 items-center gap-2 md:max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PO number or supplier..."
                className="pl-9 h-9 bg-background"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="h-9 w-[160px] bg-background">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[140px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Action Required</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="CREDITED">Recovered</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={recFilter} onValueChange={setRecFilter}>
              <SelectTrigger className="h-9 w-[160px] bg-background">
                <SelectValue placeholder="Recommendation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recommendations</SelectItem>
                <SelectItem value="CLAIM">Claim</SelectItem>
                <SelectItem value="DO_NOT_CLAIM">Auto-Close</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
              </SelectContent>
            </Select>
            
            {(supplierFilter !== "all" || statusFilter !== "all" || recFilter !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSupplierFilter("all");
                  setStatusFilter("all");
                  setRecFilter("all");
                }}
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border text-[11px] uppercase tracking-wider">
                <TableHead className="w-[250px] font-medium text-muted-foreground pl-6">Supplier / PO</TableHead>
                <TableHead className="font-medium text-muted-foreground">Breach Details</TableHead>
                <TableHead
                  className="cursor-pointer select-none font-medium text-muted-foreground w-[150px]"
                  onClick={() => toggleSort("amount")}
                >
                  <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Credit Value
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">Recommendation</TableHead>
                <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                <TableHead
                  className="cursor-pointer select-none font-medium text-muted-foreground text-right pr-6"
                  onClick={() => toggleSort("date")}
                >
                  <div className="flex items-center justify-end gap-1 hover:text-foreground transition-colors">
                    Detected
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((opp) => (
                <TableRow 
                  key={opp.id} 
                  className="group cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/60"
                  onClick={() => window.location.href = `/claims/${opp.id}`}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {opp.supplierName}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono bg-muted/50 w-fit px-1.5 py-0.5 rounded">
                        {opp.poNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{metricLabels[opp.metric]}</span>
                      <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {opp.breachMargin}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm font-bold text-foreground">
                      £{opp.creditAmount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <RecommendationBadge rec={opp.recommendation} />
                  </TableCell>
                  <TableCell className="py-4">
                    <StatusBadge status={opp.status} />
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <span className="text-sm text-muted-foreground font-medium">
                      {new Date(opp.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.location.href = `/claims/${opp.id}`; }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="rounded bg-muted/50 p-3 mb-2">
                        <Search className="h-6 w-6 opacity-50" />
                      </div>
                      <p>No claims found matching your filters.</p>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSupplierFilter("all");
                          setStatusFilter("all");
                          setRecFilter("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <div>Showing {filtered.length} results</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 w-20 text-xs" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-7 w-20 text-xs" disabled>Next</Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function ClaimsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClaimsContent />
    </Suspense>
  );
}
