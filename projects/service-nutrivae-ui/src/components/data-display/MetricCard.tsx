import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  note?: string;
  tone?: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone = "bg-brand-50 text-brand-700"
}: MetricCardProps) {
  return (
    <div className="card p-5">
      <span className={clsx("grid h-10 w-10 place-items-center rounded-xl", tone)}>
        <Icon size={19} />
      </span>
      <div className="mt-4 font-display text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-sm font-semibold">{label}</div>
      {note && <div className="mt-1 text-xs text-muted">{note}</div>}
    </div>
  );
}
