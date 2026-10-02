import { cn } from "@/lib/utils";
import { ACCOUNT_STATUS_LABELS, type AccountStatus } from "@/domain/billing";

const STYLES: Record<AccountStatus, { icon: string; classes: string }> = {
  al_dia: {
    icon: "ti-circle-check",
    classes: "bg-green-500/10 border-green-500/25 text-green-400",
  },
  por_vencer: {
    icon: "ti-clock",
    classes: "bg-amber-500/10 border-amber-500/25 text-amber-300",
  },
  deudor: {
    icon: "ti-alert-triangle",
    classes: "bg-orange-500/10 border-orange-500/25 text-orange-300",
  },
  bloqueado: {
    icon: "ti-lock",
    classes: "bg-red-500/10 border-red-500/30 text-red-400",
  },
  inactivo: {
    icon: "ti-circle-minus",
    classes: "bg-zinc-800 border-zinc-700 text-gray-300",
  },
};

interface AccountStatusBadgeProps {
  status: AccountStatus;
  className?: string;
}

/** Estado de cuenta del alumno con ícono y texto (nunca solo color). */
export function AccountStatusBadge({
  status,
  className,
}: AccountStatusBadgeProps) {
  const style = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold",
        style.classes,
        className,
      )}
    >
      <i className={cn("ti text-sm", style.icon)} aria-hidden="true" />
      {ACCOUNT_STATUS_LABELS[status]}
    </span>
  );
}
