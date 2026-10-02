import * as React from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "./StatusBadge";

const ICON_TONES: Record<StatusTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
  neutral: "bg-white/[0.06] text-gray-300",
};

const VALUE_TONES: Partial<Record<StatusTone, string>> = {
  warning: "text-warning",
  danger: "text-danger",
};

interface StatCardProps {
  icon: string;
  value: React.ReactNode;
  label: string;
  tone?: StatusTone;
  hint?: React.ReactNode;
  className?: string;
  /** Si se pasa, la tarjeta funciona como filtro (botón que se activa y desactiva). */
  onClick?: () => void;
  pressed?: boolean;
}

/** Tarjeta de indicador (número + rótulo). Con `onClick`, sirve de filtro rápido. */
export function StatCard({
  icon,
  value,
  label,
  tone = "primary",
  hint,
  className,
  onClick,
  pressed = false,
}: StatCardProps) {
  // En el celular el ícono va arriba, así el rótulo tiene todo el ancho y no se corta.
  const classes = cn(
    "relative flex flex-col items-start gap-3 rounded-2xl bg-neutral-900 p-4 shadow-card glass-border sm:flex-row sm:items-center sm:gap-4 sm:p-5",
    onClick &&
      "w-full text-left transition-colors hover:bg-neutral-800/80 cursor-pointer",
    pressed && "ring-2 ring-primary/70",
    className,
  );
  const content = (
    <>
      {onClick && <span className="sr-only">Filtrar la lista: </span>}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          ICON_TONES[tone],
        )}
      >
        <i className={cn("ti text-lg", icon)} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-2xl font-extrabold leading-tight text-white",
            VALUE_TONES[tone],
          )}
        >
          {value}
        </p>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {onClick && (
        <i
          className={cn(
            "ti absolute right-3 top-3 text-base sm:static sm:ml-auto",
            pressed ? "ti-filter-off text-primary" : "ti-filter text-gray-500",
          )}
          aria-hidden="true"
        />
      )}
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={classes}
    >
      {content}
    </button>
  ) : (
    <article className={classes}>{content}</article>
  );
}
