"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import TicketDetail from "@/components/support/TicketDetail";
import { getTicket } from "@/data/support-data";

export default function SupportTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticket = getTicket(params.id as string);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button variant="outline" onClick={() => router.push("/support")}>
          Return to Customer Service
        </Button>
      </div>
    );
  }

  return <TicketDetail ticket={ticket} />;
}
