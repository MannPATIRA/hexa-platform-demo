"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { name: "Dashboard", icon: LayoutDashboard, href: "#" },
  { name: "Call Tracker", icon: PhoneCall, href: "/calls" },
  { name: "Orders", icon: ShoppingCart, href: "/orders" },
  { name: "Purchase Orders", icon: FileText, href: "#" },
  { name: "Suppliers", icon: Truck, href: "#" },
  { name: "Settings", icon: Settings, href: "#" },
];

interface AppSidebarProps {
  activeItem?: string;
}

export default function AppSidebar({ activeItem }: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[number]) => {
    if (activeItem) return item.name === activeItem;
    if (item.href === "#") return false;
    if (item.href === "/orders") return pathname === "/" || pathname.startsWith("/orders");
    if (item.href === "/calls") return pathname.startsWith("/calls") || pathname.startsWith("/demo");
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="flex h-full w-[248px] flex-shrink-0 flex-col border-r border-border bg-background/70">
      <div className="px-4 pb-6 pt-5">
        <HexaLogo size={24} showText textClassName="text-base text-foreground" />
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const isDisabled = item.href === "#";
          const Wrapper = isDisabled ? "div" : Link;
          return (
            <Wrapper
              key={item.name}
              href={isDisabled ? undefined! : item.href}
              className={cn(
                "relative flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                isDisabled && "cursor-default opacity-50"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 h-[18px] w-[2px] -translate-y-1/2 rounded-r bg-primary" />
              )}
              <item.icon size={15} strokeWidth={active ? 2 : 1.7} />
              <span>{item.name}</span>
            </Wrapper>
          );
        })}
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
