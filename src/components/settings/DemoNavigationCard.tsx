"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  Mail,
  PhoneCall,
  Send,
  Loader2,
  ExternalLink,
  Compass,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-base";

const demoSections = [
  {
    name: "Ecommerce",
    href: "/storefront",
    icon: Store,
    description: "Browse storefront",
  },
  {
    name: "Outlook",
    href: "https://outlook.office.com",
    icon: Mail,
    description: "Email integration",
  },
  {
    name: "Phone call demo",
    href: "/demo",
    icon: PhoneCall,
    description: "Voice AI demo",
  },
] as const;

export default function DemoNavigationCard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSendEmails = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/send-demo-emails"), { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text:
            data.message ||
            data.error ||
            "Failed to send demo emails. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and RECIPIENT_EMAIL in .env",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Demo emails sent successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to send demo emails. Configure SMTP env vars in .env.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-[13px] font-medium">
            Demo Navigation
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {demoSections.map(({ name, href, icon: Icon, description }) => (
              <Link
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                    {name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {description}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 group-hover:text-primary/60 transition-colors" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/10 px-4 py-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendEmails}
              disabled={loading}
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {loading ? "Sending…" : "Send demo emails"}
            </Button>

            {message && (
              <div
                className={`flex items-center gap-1.5 text-[12px] ${
                  message.type === "success"
                    ? "text-emerald-600"
                    : "text-destructive"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                )}
                {message.text}
              </div>
            )}
          </div>

          {message?.type === "error" && (
            <p className="text-[11px] text-muted-foreground leading-relaxed pl-1">
              Add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to .env or
              .env.local. Emails are sent to supplier-hexa@outlook.com.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
