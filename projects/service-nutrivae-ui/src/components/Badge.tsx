import { type ReactNode } from "react";
import { clsx } from "clsx";

type BadgeProps = {
  children: ReactNode;
  tone?: "green" | "amber" | "red" | "violet" | "neutral";
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    violet: "bg-violet-50 text-violet-700",
    neutral: "bg-slate-100 text-slate-600"
  };

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
        styles[tone]
      )}
    >
      {children}
    </span>
  );
}
