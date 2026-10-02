import type { Client } from "@/data/clients";
import type { Plan } from "@/data/plans";
import type { AccountSummary } from "./billing";
import { formatDate } from "@/lib/dates";
import { formatARS } from "@/lib/format";

export type AccessReason =
  | "ok"
  | "inactivo"
  | "sin_plan"
  | "restriccion_manual"
  | "deuda"
  | "plan_no_incluye";

export interface AccessCheck {
  allowed: boolean;
  reason: AccessReason;
  /** Título corto para mostrar grande ("Habilitado", "Bloqueado por deuda"…). */
  title: string;
  detail: string;
  /** Aviso cuando puede ingresar pero hay algo para avisarle (cuota vencida o por vencer). */
  warning?: string;
}

interface AccessInput {
  client: Client;
  account: AccountSummary;
  plan: Plan | undefined;
  /** Actividad de la clase a la que quiere entrar (opcional). */
  activityId?: string;
  activityName?: string;
}

/**
 * ¿Puede el alumno ingresar (y a esta clase)? Combina la baja, la restricción
 * manual, el bloqueo automático por deuda y las actividades que habilita el plan.
 */
export function checkAccess({
  client,
  account,
  plan,
  activityId,
  activityName,
}: AccessInput): AccessCheck {
  if (client.status === "inactive") {
    return {
      allowed: false,
      reason: "inactivo",
      title: "Alumno dado de baja",
      detail: "No tiene una membresía activa.",
    };
  }
  if (!plan) {
    return {
      allowed: false,
      reason: "sin_plan",
      title: "Sin plan contratado",
      detail: "Hay que asignarle un plan antes de que pueda ingresar.",
    };
  }
  if (client.manualRestriction) {
    return {
      allowed: false,
      reason: "restriccion_manual",
      title: "Acceso restringido",
      detail: client.manualRestriction.reason,
    };
  }
  if (account.status === "bloqueado") {
    return {
      allowed: false,
      reason: "deuda",
      title: "Bloqueado por deuda",
      detail: `Tiene ${account.overdueDays} días de atraso y debe ${formatARS(account.owedAmount)}. Puede volver a ingresar en cuanto pague.`,
    };
  }
  if (activityId && !plan.activityIds.includes(activityId)) {
    return {
      allowed: false,
      reason: "plan_no_incluye",
      title: "Clase no incluida en su plan",
      detail: `Su plan ${plan.name} no incluye ${activityName ?? "esta actividad"}.`,
    };
  }

  let warning: string | undefined;
  if (account.status === "deudor") {
    warning = `Tiene una cuota vencida hace ${account.overdueDays} ${account.overdueDays === 1 ? "día" : "días"}. Si no paga, se bloquea el ${formatDate(account.blockDate!)}.`;
  } else if (account.status === "por_vencer") {
    warning = `Su cuota vence el ${formatDate(account.nextDueDate)}.`;
  }

  return {
    allowed: true,
    reason: "ok",
    title: "Habilitado",
    detail: `Plan ${plan.name}`,
    warning,
  };
}
