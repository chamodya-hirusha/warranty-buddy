import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  tone?: "default" | "active" | "soon" | "expired";
  className?: string;
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-accent text-accent-foreground",
  active: "bg-status-active-bg text-status-active",
  soon: "bg-status-soon-bg text-status-soon",
  expired: "bg-status-expired-bg text-status-expired",
};

export function StatCard({ title, value, hint, icon, tone = "default", className }: Props) {
  return (
    <div className={cn("card-elevated p-4 sm:p-5 flex items-center gap-4 animate-fade-in", className)}>
      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", TONE[tone])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold leading-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5 truncate">{hint}</p>}
      </div>
    </div>
  );
}
