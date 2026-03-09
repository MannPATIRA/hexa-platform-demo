"use client";

import {
  LayoutDashboard,
  PhoneCall,
  ShoppingCart,
  FileText,
  Truck,
  Settings,
} from "lucide-react";
import HexaLogo from "@/components/shared/HexaLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Call Tracker", icon: PhoneCall, active: true },
  { name: "Orders", icon: ShoppingCart },
  { name: "Purchase Orders", icon: FileText },
  { name: "Suppliers", icon: Truck },
  { name: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-[248px] flex-shrink-0 flex-col border-r border-border bg-background/70">
      <div className="px-4 pb-6 pt-5">
        <HexaLogo size={24} showText textClassName="text-base text-foreground" />
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <div
            key={item.name}
            className={cn(
              "relative flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
              item.active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            {item.active && (
              <div className="absolute left-0 top-1/2 h-[18px] w-[2px] -translate-y-1/2 rounded-r bg-primary" />
            )}
            <item.icon size={15} strokeWidth={item.active ? 2 : 1.7} />
            <span>{item.name}</span>
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-3 flex items-center gap-3 border border-border bg-card p-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
            JM
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">James Morrison</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">Sales Manager</p>
        </div>
        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
      </div>
    </aside>
  );
}
