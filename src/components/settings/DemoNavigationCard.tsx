"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, Mail, PhoneCall, Send, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const demoSections = [
  { name: "Ecommerce", href: "/storefront", icon: Store },
  { name: "Outlook", href: "https://outlook.office.com", icon: Mail },
  { name: "Phone call demo", href: "/demo", icon: PhoneCall },
] as const;

export default function DemoNavigationCard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const handleSendEmails = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/send-demo-emails", { method: "POST" });
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
        <CardTitle className="text-[13px] font-medium">Demo Navigation</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {demoSections.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {name}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendEmails}
              disabled={loading}
              className="w-fit"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? "Sending…" : "Send demo emails"}
            </Button>
            {message && (
              <p
                className={`text-[13px] ${
                  message.type === "success" ? "text-primary" : "text-destructive"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>

          {message?.type === "error" && (
            <p className="text-xs text-muted-foreground">
              Add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to .env or .env.local.
              Emails are sent to supplier-hexa@outlook.com.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
