import { type ReactNode } from "react";
import { clsx } from "clsx";

type BadgeProps = {
  children: ReactNode;
  tone?: "green" | "amber" | "red" | "violet" | "neutral";
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  const styles = {
    green: "bg-success text-success-content",
    amber: "bg-warning text-warning-content",
    red: "bg-error text-error-content",
    violet: "bg-secondary text-secondary-content",
    neutral: "bg-base-200 text-base-content"
  };

  return <span className={clsx("badge capitalize", styles[tone])}>{children}</span>;
}
