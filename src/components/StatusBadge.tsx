import { cn } from "@/lib/utils";
import type { WarrantyStatus } from "@/db/types";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  status: WarrantyStatus;
  daysLeft?: number;
  className?: string;
}

export function StatusBadge({ status, daysLeft, className }: Props) {
  const config = {
    active: {
      label: typeof daysLeft === "number" ? `Active · ${daysLeft}d left` : "Active",
      Icon: CheckCircle2,
      cls: "bg-status-active-bg text-status-active",
    },
    soon: {
      label: typeof daysLeft === "number" ? `Expires in ${Math.max(daysLeft, 0)}d` : "Expiring soon",
      Icon: AlertTriangle,
      cls: "bg-status-soon-bg text-status-soon",
    },
    expired: {
      label: typeof daysLeft === "number" ? `Expired ${Math.abs(daysLeft)}d ago` : "Expired",
      Icon: XCircle,
      cls: "bg-status-expired-bg text-status-expired",
    },
  }[status];

  const { Icon } = config;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.cls,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
