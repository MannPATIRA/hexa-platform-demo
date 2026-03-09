"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getOpportunity,
  getSupplier,
  getSupplierPerformance,
  metricLabels,
  eventTypeLabels,
} from "@/data/sla-data";
import type { Status } from "@/data/sla-data";
import {
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opp = getOpportunity(params.id as string);
  const supplier = opp ? getSupplier(opp.supplierId) : undefined;

  const [status, setStatus] = useState<Status>(opp?.status ?? "OPEN");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!opp || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Opportunity not found</p>
        <Button variant="outline" onClick={() => router.push("/claims")}>
          Return to Claims Queue
        </Button>
      </div>
    );
  }

  const statusLabels: Record<Status, string> = {
    OPEN: "Open",
    SENT: "Sent",
    ACKNOWLEDGED: "Acknowledged",
    CREDITED: "Recovered",
    CLOSED: "Closed",
  };

  const emailSubject = `SLA Credit Claim – ${supplier.name} – ${opp.poNumber} – ${metricLabels[opp.metric]}`;
  const emailBody = `Dear ${supplier.name} Team,

We are writing regarding a breach of SLA terms under our current supply agreement.

Order Reference: ${opp.poNumber}
Item: ${opp.item}
Invoice Value: £${opp.invoiceValue.toLocaleString()}

Breach Details:
${opp.breachSummary}

SLA Rule: ${opp.ruleDescription}

Credit Amount Claimed: £${opp.creditAmount.toLocaleString()}

Supporting Evidence:
${opp.timeline
  .filter((e) => e.evidenceUrl)
  .map((e) => `- ${eventTypeLabels[e.type]}: ${e.evidenceUrl}`)
  .join("\n")}

We request that a credit note for £${opp.creditAmount.toLocaleString()} be issued within 14 business days.

Please acknowledge receipt of this claim and advise on next steps.

Best regards,
Hexa Procurement Team`;

  const evidenceList = opp.timeline.filter((e) => e.evidenceUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoLink = `mailto:${supplier.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const performance = getSupplierPerformance(supplier.id);
  const oppMonth = new Date(opp.createdAt).toLocaleString('en-GB', { month: 'short', year: 'numeric' });
  const monthStats = performance.find(p => p.month === oppMonth);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between px-8 pt-8 pb-2">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/claims" className="hover:text-foreground">Claims</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{opp.poNumber}</span>
          </div>
          <h1 className="font-display text-[28px] font-normal text-foreground">{opp.poNumber}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <Link href={`/suppliers/${supplier.id}`} className="hover:text-foreground">
              {supplier.name}
            </Link>
            {" · "}
            {metricLabels[opp.metric]}
            {" · "}
            {new Date(opp.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <span className={cn(
            "text-sm font-medium",
            status === "OPEN" ? "text-foreground" : "text-muted-foreground"
          )}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      <div className="px-8 pb-8 pt-4 space-y-6">
        <div className="flex items-start justify-end">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Credit</p>
            <p className="text-2xl font-semibold text-foreground">£{opp.creditAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {opp.recommendation === "CLAIM" ? "Recommended" : opp.recommendation === "DO_NOT_CLAIM" ? "Not recommended" : "Needs review"}
              {" · "}
              {opp.confidence} confidence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {monthStats && (
              <Card className="bg-muted/30 border-dashed shadow-sm">
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Performance Context · {oppMonth}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Shipments</p>
                      <p className="font-medium text-foreground mt-0.5">{monthStats.totalShipments}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Units</p>
                      <p className="font-medium text-foreground mt-0.5">{monthStats.totalUnits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Value</p>
                      <p className="font-medium text-foreground mt-0.5">£{monthStats.totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly {metricLabels[opp.metric]}</p>
                      <p className={`font-mono font-medium mt-0.5 ${
                        opp.metric === "ON_TIME_DELIVERY" && monthStats.onTimeDelivery < 90 ? "text-destructive" :
                        opp.metric === "FILL_RATE" && monthStats.fillRate < 95 ? "text-destructive" : ""
                      }`}>
                        {opp.metric === "QUALITY_PPM"
                          ? `${monthStats.qualityPpm} PPM`
                          : opp.metric === "RESPONSE_TIME_HOURS"
                          ? `${monthStats.avgResponseHours}h`
                          : `${opp.metric === "ON_TIME_DELIVERY" ? monthStats.onTimeDelivery : monthStats.fillRate}%`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-[13px] font-medium">Breach Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Metric</p>
                    <p className="font-medium mt-0.5">{metricLabels[opp.metric]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Threshold</p>
                    <p className="font-mono mt-0.5">{opp.metric === "QUALITY_PPM" ? `≤${opp.threshold}` : `≥${opp.threshold}%`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actual</p>
                    <p className="font-mono mt-0.5">
                      {opp.actualValue > 0 ? (opp.metric === "QUALITY_PPM" ? opp.actualValue : `${opp.actualValue}%`) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Margin</p>
                    <p className="mt-0.5">{opp.breachMargin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Units Ordered</p>
                    <p className="font-mono mt-0.5">{opp.qtyOrdered.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Units Received</p>
                    <p className={`font-mono mt-0.5 ${opp.qtyReceived < opp.qtyOrdered ? "text-destructive" : ""}`}>
                      {opp.qtyReceived > 0 ? opp.qtyReceived.toLocaleString() : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Invoice Value</p>
                    <p className="font-mono mt-0.5">£{opp.invoiceValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Unit Price</p>
                    <p className="font-mono mt-0.5">
                      {opp.qtyOrdered > 1
                        ? `£${(opp.invoiceValue / opp.qtyOrdered).toFixed(2)}`
                        : "—"}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground leading-relaxed">{opp.breachSummary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-[13px] font-medium">Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {opp.rationale.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-muted-foreground/50 select-none">—</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <div className="text-sm">
                  <span className="text-xs text-muted-foreground">Rule: </span>
                  <span className="text-muted-foreground">{opp.ruleDescription}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-[13px] font-medium">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left font-medium py-2 pl-5 pr-4 w-20">Date</th>
                      <th className="text-left font-medium py-2 pr-4 w-36">Event</th>
                      <th className="text-left font-medium py-2 pr-5">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opp.timeline.map((event) => (
                      <tr key={event.id} className="border-b last:border-0">
                        <td className="py-2.5 pl-5 pr-4 text-[13px] text-muted-foreground whitespace-nowrap font-mono">
                          {new Date(event.occurredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </td>
                        <td className="py-2.5 pr-4 text-[13px] font-medium whitespace-nowrap">
                          {eventTypeLabels[event.type]}
                        </td>
                        <td className="py-2.5 pr-5 text-[13px] text-muted-foreground">
                          {event.note}
                          {event.evidenceUrl && (
                            <a
                              href={event.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                              Source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader className="border-b">
                <CardTitle className="text-[13px] font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  onClick={() => setEmailModalOpen(true)}
                  disabled={status === "CREDITED" || status === "CLOSED"}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Generate Claim
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStatus("SENT")}
                  disabled={status === "SENT" || status === "CREDITED" || status === "CLOSED"}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Mark Sent
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStatus("CREDITED")}
                  disabled={status === "CREDITED" || status === "CLOSED"}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Credited
                </Button>
                <Separator className="my-1" />
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setStatus("CLOSED")}
                  disabled={status === "CLOSED"}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">Compose Claim Email</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="text-sm space-y-2">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">To:</span>
                <span className="font-mono">{supplier.email}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">Subject:</span>
                <span>{emailSubject}</span>
              </div>
            </div>

            <textarea
              readOnly
              className="w-full h-[280px] p-4 text-sm leading-relaxed resize-none bg-muted/30 border focus:outline-none"
              value={emailBody}
            />

            {evidenceList.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {evidenceList.length} evidence document{evidenceList.length !== 1 ? "s" : ""} attached
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button asChild className="flex-1">
                <a href={mailtoLink}>
                  <Mail className="h-4 w-4 mr-2" />
                  Open in Email
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
