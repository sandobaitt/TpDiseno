import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Botones o controles a la derecha (en celular quedan debajo). */
  actions?: React.ReactNode;
  className?: string;
}

/** Encabezado único para todas las pantallas (mismo tamaño y espaciado). */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-5",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
