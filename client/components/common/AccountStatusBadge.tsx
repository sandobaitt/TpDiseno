import { ACCOUNT_STATUS_LABELS, type AccountStatus } from "@/domain/billing";
import { StatusBadge, type StatusTone } from "./StatusBadge";

const STYLES: Record<AccountStatus, { icon: string; tone: StatusTone }> = {
  al_dia: { icon: "ti-circle-check", tone: "success" },
  por_vencer: { icon: "ti-clock", tone: "warning" },
  deudor: { icon: "ti-alert-triangle", tone: "warning" },
  bloqueado: { icon: "ti-lock", tone: "danger" },
  inactivo: { icon: "ti-circle-minus", tone: "neutral" },
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
    <StatusBadge tone={style.tone} icon={style.icon} className={className}>
      {ACCOUNT_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
