import {
  Shield,
  Bell,
  Mail,
  MessageSquare,
  CalendarClock,
  Server,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DemoNavigationCard from "@/components/settings/DemoNavigationCard";

const recommendations = [
  {
    label: "Claim",
    color: "text-emerald-600",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-500/5",
    description:
      "Credit ≥ £250, HIGH confidence, clear breach with no buyer-caused issues",
  },
  {
    label: "Review",
    color: "text-amber-600",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/5",
    description:
      "Credit between £100–£250, or MEDIUM/LOW confidence, or first offence for supplier",
  },
  {
    label: "Do Not Claim",
    color: "text-muted-foreground",
    dotColor: "bg-muted-foreground/60",
    bgColor: "bg-muted/30",
    description:
      "Credit < £100, buyer-caused delay, or waiver/force majeure noted",
  },
] as const;

const channels = [
  {
    name: "Email",
    icon: Mail,
    description: "Primary channel — generates claim email with evidence pack",
    status: "Active" as const,
  },
  {
    name: "WhatsApp",
    icon: MessageSquare,
    description:
      "Secondary channel — instant notifications for urgent claims",
    status: "Coming soon" as const,
  },
  {
    name: "Scheduled Reports",
    icon: CalendarClock,
    description: "Weekly SLA summary email to account owners",
    status: "Coming soon" as const,
  },
] as const;

const systemInfo = [
  { label: "Environment", value: "Demo" },
  { label: "Data Range", value: "90 days" },
  { label: "Suppliers Tracked", value: "5" },
  { label: "Active SLA Rules", value: "15" },
] as const;

export default function SettingsPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-[28px] font-normal text-foreground leading-tight">
              Policy &amp; Settings
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Manage claim rules, notification preferences, and system
              configuration
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-6 space-y-6 max-w-4xl">
        {/* ── Claim Policy Rules ────────────────────────────── */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-[13px] font-medium">
                Claim Policy Rules
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600/80">
                  Auto-Claim Minimum
                </p>
                <p className="text-2xl font-semibold text-emerald-700 mt-1">
                  £250
                </p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Credits ≥ £250 with HIGH confidence are automatically
                  recommended as &quot;Claim&quot;
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Do-Not-Claim Ceiling
                </p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  £100
                </p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Credits below £100 are recommended as &quot;Do Not Claim&quot;
                  — admin cost exceeds value
                </p>
              </div>
            </div>

            <Separator className="my-5" />

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Recommendation Logic
              </p>
              <div className="space-y-0">
                {recommendations.map((rec, i) => (
                  <div
                    key={rec.label}
                    className={`flex items-start gap-3 px-3 py-3 rounded-md ${rec.bgColor} ${
                      i < recommendations.length - 1
                        ? "border-b border-border/50"
                        : ""
                    }`}
                  >
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${rec.dotColor}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13px] font-medium ${rec.color}`}
                      >
                        {rec.label}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Notification Channels ────────────────────────── */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-[13px] font-medium">
                Notification Channels
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {channels.map((ch, i) => (
              <div
                key={ch.name}
                className={`flex items-center gap-4 px-6 py-4 ${
                  i < channels.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    ch.status === "Active"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <ch.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground">
                    {ch.name}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {ch.description}
                  </p>
                </div>
                <Badge
                  variant={
                    ch.status === "Active" ? "success" : "secondary"
                  }
                  className="shrink-0 text-[11px]"
                >
                  {ch.status === "Active" ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : null}
                  {ch.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Demo Navigation ──────────────────────────────── */}
        <DemoNavigationCard />

        {/* ── System Information ────────────────────────────── */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-[13px] font-medium">
                System Information
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {systemInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3"
                >
                  <span className="text-[12px] text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-[13px] font-semibold text-foreground tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
