"use client";

import React from "react";
import { Lock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface BrowserChromeProps {
  children: React.ReactNode;
}

export default function BrowserChrome({ children }: BrowserChromeProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden border border-border bg-card shadow-2xl">
      <div className="h-px w-full bg-gradient-to-r from-primary/30 via-primary/70 to-primary/30" />
      <div className="flex h-12 items-center gap-4 px-5">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              value="app.hexa.ai/calls"
              className="h-8 border-border bg-black/5 pl-8 pr-8 text-xs text-muted-foreground"
            />
            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="w-[52px]" />
      </div>
      <Separator />
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
