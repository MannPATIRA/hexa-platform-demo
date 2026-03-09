"use client";

import { Phone } from "lucide-react";
import HexaLogo from "@/components/shared/HexaLogo";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function HexaApp() {
  return (
    <div className="flex h-full flex-col bg-card">
      <div style={{ height: 54, flexShrink: 0 }} />

      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <HexaLogo size={22} showText textClassName="text-[13px] text-foreground" />
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary text-[9px] font-semibold text-primary-foreground">JM</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-9 -mt-6">
        <div className="mb-4 flex items-center justify-center rounded-full border border-dashed border-border" style={{ width: 74, height: 74 }}>
          <Phone size={26} className="text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="mb-1.5 text-[15px] font-semibold tracking-tight text-foreground">No active call</h3>
        <p className="text-center text-[11px] leading-[1.6] text-muted-foreground">
          When you receive a call, you can track it with Hexa to automatically capture line items, pricing, and delivery details.
        </p>
      </div>

      <div className="px-5 pb-5">
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Recent Calls
        </p>
        <div className="space-y-[5px]">
          {[
            { name: "Acme Industrial Ltd.", items: 7 },
            { name: "Thornton Supplies", items: 4 },
          ].map((c) => (
            <Card key={c.name} className="flex items-center justify-between rounded-xl border-border bg-background px-3 py-[9px]">
              <div>
                <p className="text-[11px] font-medium text-foreground/85">{c.name}</p>
                <p className="mt-px text-[9px] text-muted-foreground">{c.items} items captured</p>
              </div>
              <Badge variant="secondary" className="text-[9px]">Done</Badge>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-center" style={{ paddingBottom: 5, paddingTop: 2 }}>
        <div style={{ width: 118, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.1)" }} />
      </div>
    </div>
  );
}
