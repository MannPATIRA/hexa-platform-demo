"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PhoneCall,
  ShoppingCart,
  FileText,
  PackageSearch,
  Truck,
  Headphones,
  Plug,
  Settings,
  ChevronDown,
  ChevronRight,
  Wallet,
  FileInput,
  FileOutput,
  type LucideIcon,
} from "lucide-react";
import HexaLogo from "@/components/shared/HexaLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { slaSuppliers } from "@/data/sla-data";

interface NavChild {
  name: string;
  href: string;
  icon?: LucideIcon;
}

interface NavItem {
  name: string;
  icon: LucideIcon;
  href?: string;
  expandable?: boolean;
  // Static children (for Finance) — listed inline below the parent.
  children?: NavChild[];
  // Dynamic children — sourced at render time (Suppliers list).
  dynamicChildren?: "suppliers";
}

const navItems: NavItem[] = [
  { name: "Call Tracker", icon: PhoneCall, href: "/calls" },
  { name: "Sales", icon: ShoppingCart, href: "/orders" },
  { name: "Procurement", icon: PackageSearch, href: "/procurement" },
  { name: "Claims", icon: FileText, href: "/claims" },
  { name: "Suppliers", icon: Truck, href: "/suppliers", expandable: true, dynamicChildren: "suppliers" },
  {
    name: "Finance",
    icon: Wallet,
    expandable: true,
    children: [
      { name: "Accounts Payable", href: "/finance/payable", icon: FileInput },
      { name: "Accounts Receivable", href: "/finance/receivable", icon: FileOutput },
    ],
  },
  { name: "Customer Service", icon: Headphones, href: "/support" },
  { name: "Integrations", icon: Plug, href: "/integrations" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

interface AppSidebarProps {
  activeItem?: string;
}

export default function AppSidebar({ activeItem }: AppSidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Suppliers: pathname.startsWith("/suppliers"),
    Finance: pathname.startsWith("/finance"),
  });

  const toggleGroup = (name: string) =>
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));

  const isActive = (item: NavItem) => {
    if (activeItem) return item.name === activeItem;
    if (!item.href) return false;
    if (item.href === "/orders") return pathname === "/" || pathname.startsWith("/orders");
    if (item.href === "/calls") return pathname.startsWith("/calls") || pathname.startsWith("/demo");
    if (item.href === "/procurement") return pathname.startsWith("/procurement");
    if (item.href === "/claims") return pathname.startsWith("/claims");
    if (item.href === "/suppliers") return pathname.startsWith("/suppliers");
    if (item.href === "/support") return pathname.startsWith("/support");
    if (item.href === "/integrations") return pathname.startsWith("/integrations");
    if (item.href === "/settings") return pathname.startsWith("/settings");
    return pathname.startsWith(item.href);
  };

  // Finance is "active" only when no child is — child gets its own highlight.
  const isFinanceActive = pathname.startsWith("/finance");

  return (
    <aside className="side-pane-dark flex h-full w-[248px] flex-shrink-0 flex-col border-r border-white/15">
      <div className="px-4 pb-6 pt-5">
        <HexaLogo size={24} showText textClassName="text-base text-white" />
      </div>

      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            item.name === "Finance" ? isFinanceActive : isActive(item);
          const isExpandable = !!item.expandable;
          const isOpen = !!openGroups[item.name];

          return (
            <div key={item.name}>
              {isExpandable ? (
                <button
                  onClick={() => toggleGroup(item.name)}
                  className={cn(
                    "relative flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 h-[18px] w-[2px] -translate-y-1/2 rounded-r bg-white" />
                  )}
                  <item.icon size={15} strokeWidth={active ? 2 : 1.7} />
                  <span>{item.name}</span>
                  {isOpen ? (
                    <ChevronDown className="ml-auto h-3 w-3" />
                  ) : (
                    <ChevronRight className="ml-auto h-3 w-3" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href ?? "#"}
                  className={cn(
                    "relative flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 h-[18px] w-[2px] -translate-y-1/2 rounded-r bg-primary" />
                  )}
                  <item.icon size={15} strokeWidth={active ? 2 : 1.7} />
                  <span>{item.name}</span>
                </Link>
              )}

              {isExpandable && isOpen && item.dynamicChildren === "suppliers" && (
                <div className="space-y-0.5 mt-0.5">
                  {slaSuppliers.map((s) => {
                    const href = `/suppliers/${s.id}`;
                    const subActive = pathname === href;
                    return (
                      <Link
                        key={s.id}
                        href={href}
                        className={cn(
                          "flex items-center pl-10 pr-3 py-1.5 text-[13px] transition-colors",
                          subActive
                            ? "text-white font-medium"
                            : "text-white/75 hover:text-white"
                        )}
                      >
                        {s.name}
                      </Link>
                    );
                  })}
                </div>
              )}

              {isExpandable && isOpen && item.children && (
                <div className="space-y-0.5 mt-0.5">
                  {item.children.map((child) => {
                    const subActive = pathname.startsWith(child.href);
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 pl-10 pr-3 py-1.5 text-[13px] transition-colors",
                          subActive
                            ? "text-white font-medium"
                            : "text-white/75 hover:text-white"
                        )}
                      >
                        {ChildIcon && (
                          <ChildIcon size={13} strokeWidth={subActive ? 2 : 1.7} />
                        )}
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 flex items-center gap-3 border border-white/15 bg-white/5 p-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
            JM
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-white">James Morrison</p>
          <p className="mt-0.5 truncate text-xs text-white/75">Sales Manager</p>
        </div>
        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
      </div>
    </aside>
  );
}
