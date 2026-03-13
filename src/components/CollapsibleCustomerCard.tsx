"use client";

import { useState } from "react";
import { Customer } from "@/lib/types";
import { CustomerCard } from "./CustomerCard";
import { ChevronDown, Building2 } from "lucide-react";

export function CollapsibleCustomerCard({
  customer,
}: {
  customer: Customer;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-accent/30"
      >
        <div className="flex items-center gap-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground/85">
            {customer.name}
          </span>
          <span className="text-[12px] text-muted-foreground">
            {customer.company}
          </span>
          <span className="text-[12px] text-muted-foreground">
            &middot; {customer.email}
          </span>
          <span className="text-[12px] text-muted-foreground">
            &middot; Ship-to: {customer.shippingAddress}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border px-5 py-4">
          <CustomerCard customer={customer} />
        </div>
      )}
    </div>
  );
}
