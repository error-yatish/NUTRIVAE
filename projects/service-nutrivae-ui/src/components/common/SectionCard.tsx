import { clsx } from "clsx";
import type { ReactNode } from "react";

export interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName
}: SectionCardProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <section className={clsx("section-card", className)}>
      {hasHeader && (
        <header className="section-card__header">
          <div>
            {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
            {description && <p className="mt-1 text-xs text-muted">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={clsx(hasHeader && "section-card__body", bodyClassName)}>{children}</div>
    </section>
  );
}
