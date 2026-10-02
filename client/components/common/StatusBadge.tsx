import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary";

const TONES: Record<StatusTone, string> = {
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  info: "border-info/30 bg-info/10 text-info",
  neutral: "border-white/10 bg-white/[0.04] text-gray-300",
  primary: "border-primary/30 bg-primary/10 text-primary",
};

interface StatusBadgeProps {
  tone: StatusTone;
  /** Clase de ícono Tabler, por ejemplo "ti-lock". El estado nunca se indica solo con color. */
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({
  tone,
  icon,
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      {icon && <i className={cn("ti text-sm", icon)} aria-hidden="true" />}
      {children}
    </span>
  );
}
