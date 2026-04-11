"use client";

import type { SupportTicket } from "@/data/support-data";

interface EmailThreadProps {
  ticket: SupportTicket;
}

export default function EmailThread({ ticket }: EmailThreadProps) {
  return (
    <div className="space-y-4">
      {/* Customer message */}
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-2 px-1">
          <span className="inline-flex items-center gap-1.5 border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground">
            Customer
          </span>
          <span className="text-[11px] text-muted-foreground">{ticket.customer.email}</span>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {new Date(ticket.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {", "}
            {new Date(ticket.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
        <div className="w-full border border-border bg-background/60 px-4 py-3">
          <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-line">
            {ticket.customerMessage}
          </p>
        </div>
      </div>

      {/* AI response */}
      {ticket.aiResponse && (
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-2 px-1">
            <span className="inline-flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              Hexa AI
            </span>
            <span className="text-[11px] text-muted-foreground">support@hexa-demo.com</span>
            {ticket.resolvedAt && (
              <span className="ml-auto text-[11px] text-muted-foreground">
                {new Date(ticket.resolvedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                {", "}
                {new Date(ticket.resolvedAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            )}
          </div>
          <div className="w-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-line">
              {ticket.aiResponse}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
