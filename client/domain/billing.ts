import {
  DEBT_BLOCK_DAYS,
  ENROLLMENT_GRACE_DAYS,
  PAYMENT_DUE_DAY,
} from "@/data/rules";
import type { Client } from "@/data/clients";
import type { Payment } from "@/data/payments";
import type { Plan } from "@/data/plans";
import {
  addDays,
  addMonths,
  dateInPeriod,
  daysInPeriod,
  diffDays,
  formatDate,
  periodRange,
  toPeriod,
} from "@/lib/dates";
import { formatARS } from "@/lib/format";

/**
 * Estado de cuenta de un alumno. Reglas del escenario:
 * - la cuota vence el día 5 (la de alta, 5 días después de inscribirse);
 * - el mes de alta se cobra proporcional a los días que quedan;
 * - no hay intereses ni recargos por mora;
 * - con DEBT_BLOCK_DAYS días de atraso queda bloqueado y no puede ingresar.
 */
export type AccountStatus =
  | "al_dia"
  | "por_vencer"
  | "deudor"
  | "bloqueado"
  | "inactivo";

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  al_dia: "Al día",
  por_vencer: "Por vencer",
  deudor: "Deudor",
  bloqueado: "Bloqueado",
  inactivo: "Inactivo",
};

export interface MonthlyCharge {
  period: string; // "AAAA-MM"
  amount: number;
  prorated: boolean;
  dueDate: string; // AAAA-MM-DD
  paid: boolean;
  paymentId?: string;
}

export interface AccountSummary {
  status: AccountStatus;
  /** Una cuota por mes, desde el alta hasta el mes actual (o el de la baja). */
  charges: MonthlyCharge[];
  /** Cuotas sin pagar (vencidas y por vencer), de la más vieja a la más nueva. */
  unpaid: MonthlyCharge[];
  /** Total adeudado (todas las cuotas sin pagar). */
  owedAmount: number;
  /** Solo lo vencido. */
  overdueAmount: number;
  /** Días de atraso de la cuota impaga más vieja (0 si no hay cuotas vencidas). */
  overdueDays: number;
  /** Fecha límite: la de la cuota impaga más vieja, o la del mes que viene si está al día. */
  nextDueDate: string;
  /** Día en que queda bloqueado, si tiene cuotas impagas. */
  blockDate?: string;
}

/** Cuota proporcional del mes de alta: precio × días que quedan (incluido el de alta) / días del mes. */
export function proratedAmount(
  monthlyPrice: number,
  enrolledAt: string,
): number {
  const day = Number(enrolledAt.slice(8, 10));
  const total = daysInPeriod(toPeriod(enrolledAt));
  if (day <= 1) return monthlyPrice;
  return Math.round((monthlyPrice * (total - day + 1)) / total);
}

/** Vencimiento de la cuota de un mes. La de alta vence ENROLLMENT_GRACE_DAYS días después de inscribirse. */
export function dueDateFor(period: string, enrolledAt: string): string {
  const regular = dateInPeriod(period, PAYMENT_DUE_DAY);
  if (period !== toPeriod(enrolledAt)) return regular;
  const enrollmentDue = addDays(enrolledAt, ENROLLMENT_GRACE_DAYS);
  return enrollmentDue > regular ? enrollmentDue : regular;
}

export function getAccountSummary(
  client: Client,
  payments: Payment[],
  plan: Plan | undefined,
  today: string,
): AccountSummary {
  const firstPeriod = toPeriod(client.enrolledAt);
  const currentPeriod = toPeriod(today);
  const lastPeriod =
    client.status === "inactive" &&
    client.deactivatedAt &&
    toPeriod(client.deactivatedAt) < currentPeriod
      ? toPeriod(client.deactivatedAt)
      : currentPeriod;

  const approved = payments.filter(
    (p) =>
      p.clientId === client.id &&
      p.status === "approved" &&
      p.concept === "membership",
  );

  const enrolledDay = Number(client.enrolledAt.slice(8, 10));
  const charges: MonthlyCharge[] =
    !plan || firstPeriod > lastPeriod
      ? []
      : periodRange(firstPeriod, lastPeriod).map((period) => {
          const prorated = period === firstPeriod && enrolledDay > 1;
          const payment = approved.find((p) => p.periods.includes(period));
          return {
            period,
            amount: prorated
              ? proratedAmount(plan.monthlyPriceArs, client.enrolledAt)
              : plan.monthlyPriceArs,
            prorated,
            dueDate: dueDateFor(period, client.enrolledAt),
            paid: !!payment,
            paymentId: payment?.id,
          };
        });

  const unpaid = charges.filter((c) => !c.paid);
  const overdue = unpaid.filter((c) => diffDays(c.dueDate, today) > 0);
  const overdueDays =
    overdue.length > 0 ? diffDays(overdue[0].dueDate, today) : 0;

  let status: AccountStatus;
  if (client.status === "inactive") status = "inactivo";
  else if (overdueDays >= DEBT_BLOCK_DAYS) status = "bloqueado";
  else if (overdueDays > 0) status = "deudor";
  else if (unpaid.length > 0) status = "por_vencer";
  else status = "al_dia";

  return {
    status,
    charges,
    unpaid,
    owedAmount: unpaid.reduce((sum, c) => sum + c.amount, 0),
    overdueAmount: overdue.reduce((sum, c) => sum + c.amount, 0),
    overdueDays,
    nextDueDate:
      unpaid[0]?.dueDate ??
      dateInPeriod(addMonths(currentPeriod, 1), PAYMENT_DUE_DAY),
    blockDate: unpaid[0]
      ? addDays(unpaid[0].dueDate, DEBT_BLOCK_DAYS)
      : undefined,
  };
}

/** Frase corta para mostrar junto al estado ("Debe $27.990 · 12 días de atraso"). */
export function describeAccount(summary: AccountSummary): string {
  switch (summary.status) {
    case "al_dia":
      return `Al día. Próximo vencimiento: ${formatDate(summary.nextDueDate)}`;
    case "por_vencer":
      return `Cuota por vencer: ${formatARS(summary.owedAmount)} hasta el ${formatDate(summary.nextDueDate)}`;
    case "deudor":
      return `Debe ${formatARS(summary.owedAmount)} · ${summary.overdueDays} ${summary.overdueDays === 1 ? "día" : "días"} de atraso. Se bloquea el ${formatDate(summary.blockDate!)}`;
    case "bloqueado":
      return `Bloqueado: debe ${formatARS(summary.owedAmount)} con ${summary.overdueDays} días de atraso`;
    case "inactivo":
      return "Dado de baja";
  }
}
