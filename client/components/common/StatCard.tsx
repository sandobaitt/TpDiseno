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
}

/** Tarjeta de indicador (número + rótulo). */
export function StatCard({
  icon,
  value,
  label,
  tone = "primary",
  hint,
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "flex items-center gap-4 rounded-2xl bg-neutral-900 p-4 shadow-card glass-border sm:p-5",
        className,
      )}
    >
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
    </article>
  );
}
