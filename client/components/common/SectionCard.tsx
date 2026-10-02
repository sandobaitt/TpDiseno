import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  icon?: string;
  /** Botones a la derecha del título. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Tarjeta con título para agrupar una sección de una pantalla (por ejemplo, la ficha). */
export function SectionCard({
  title,
  icon,
  actions,
  children,
  className,
}: SectionCardProps) {
  const id = React.useId();
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-neutral-900 p-5 shadow-card glass-border max-sm:p-4",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id={id}
          className="flex items-center gap-2 text-base font-bold text-white"
        >
          {icon && (
            <i
              className={cn("ti text-lg text-gray-400", icon)}
              aria-hidden="true"
            />
          )}
          {title}
        </h2>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      {children}
    </section>
  );
}
