"use client";

import { cn } from "@/lib/utils";
import type { CategoryId } from "@/data/integrations-data";

interface CategoryFilterProps {
  selected: CategoryId | "all";
  onSelect: (category: CategoryId | "all") => void;
}

const categories: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "erp", label: "ERP" },
  { id: "crm", label: "CRM" },
  { id: "wms", label: "WMS" },
  { id: "mrp", label: "MRP" },
  { id: "accounting", label: "Accounting" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "communication", label: "Communication" },
  { id: "shipping", label: "Shipping" },
  { id: "data", label: "Data" },
];

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
            selected === cat.id
              ? "bg-foreground text-background"
              : "border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
