"use client";

import { Mail, Phone, Globe, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TicketChannel } from "@/data/support-data";
import { channelLabels } from "@/data/support-data";

const CHANNEL_STYLE: Record<
  TicketChannel,
  { icon: typeof Mail; color: string }
> = {
  email:    { icon: Mail,     color: "text-slate-500" },
  phone:    { icon: Phone,    color: "text-blue-600" },
  web_form: { icon: Globe,    color: "text-violet-600" },
  portal:   { icon: Database, color: "text-amber-600" },
};

interface ChannelBadgeProps {
  channel: TicketChannel;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export default function ChannelBadge({
  channel,
  size = "sm",
  showLabel = false,
  className,
}: ChannelBadgeProps) {
  const { icon: Icon, color } = CHANNEL_STYLE[channel];
  const iconSize = size === "sm" ? 13 : 15;

  if (!showLabel) {
    return (
      <span
        className={cn("inline-flex items-center", color, className)}
        title={channelLabels[channel]}
        aria-label={channelLabels[channel]}
      >
        <Icon size={iconSize} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border border-border bg-muted/30 px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      <Icon size={iconSize} className={color} />
      <span className="text-foreground/80">{channelLabels[channel]}</span>
    </span>
  );
}
