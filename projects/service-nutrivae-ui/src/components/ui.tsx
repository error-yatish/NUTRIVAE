import { X, Users } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700",
        size === "sm" && "h-8 w-8 text-[11px]",
        size === "md" && "h-10 w-10 text-xs",
        size === "lg" && "h-12 w-12 text-sm"
      )}
    >
      {initials}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "red" | "violet" | "neutral";
}) {
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

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Users size={20} />
      </div>
      <h3 className="font-display font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-ink/45 backdrop-blur-sm"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="flex h-full w-full max-w-[560px] flex-col overflow-hidden border-l border-line bg-white shadow-float animate-in"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <h2 id="drawer-title" className="font-display text-xl font-bold">
            {title}
          </h2>
          <button
            aria-label="Close drawer"
            className="rounded-lg p-2 text-muted hover:bg-canvas"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export const Modal = Drawer;

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-xl bg-slate-200", className)} />;
}
