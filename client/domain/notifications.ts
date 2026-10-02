import type { Client } from "@/data/clients";
import type { Communication } from "@/data/communications";
import type { Payment } from "@/data/payments";
import type { Novedad } from "@/data/novedades";
import type { Replacement } from "@/data/replacements";
import type { AccountSummary } from "./billing";
import { personalize } from "./communications";
import { diffDays, formatDate, toPeriod } from "@/lib/dates";
import { formatARS } from "@/lib/format";

/**
 * Avisos de la campana (CU 10 y CU 7 de Personal). Se calculan con los datos:
 * nunca quedan desactualizados. Son resúmenes discretos, no ventanas que
 * bloqueen el trabajo.
 */

export type NotificationTone =
  | "danger"
  | "warning"
  | "info"
  | "success"
  | "neutral";

export interface AppNotification {
  /** Estable mientras la situación no cambie (para marcar como leído). */
  id: string;
  tone: NotificationTone;
  icon: string;
  title: string;
  detail: string;
  /** Fecha (y hora) para ordenar y mostrar. */
  date: string;
  link?: string;
}

/** Cuántos días se muestra el aviso de "pago registrado". */
const RECENT_PAYMENT_DAYS = 7;

const byNewest = (a: AppNotification, b: AppNotification) =>
  b.date.localeCompare(a.date);

/** Avisos del alumno: cuota (por vencer, vencida, acceso suspendido), legajo, pagos y comunicaciones. */
export function studentNotifications(input: {
  client: Client;
  account: AccountSummary;
  payments: Payment[];
  communications: Communication[];
  today: string;
}): AppNotification[] {
  const { client, account, payments, communications, today } = input;
  const list: AppNotification[] = [];
  const period = toPeriod(today);

  if (account.status === "por_vencer") {
    list.push({
      id: `cuota-por-vencer-${account.nextDueDate}`,
      tone: "info",
      icon: "ti-calendar-due",
      title: "Tu cuota vence pronto",
      detail: `Pagá ${formatARS(account.owedAmount)} hasta el ${formatDate(account.nextDueDate)}. No hay recargos.`,
      date: today,
      link: "/alumno/pagos",
    });
  } else if (account.status === "deudor") {
    list.push({
      id: `cuota-vencida-${period}`,
      tone: "warning",
      icon: "ti-alert-triangle",
      title: "Tenés una cuota vencida",
      detail: `Debés ${formatARS(account.owedAmount)}. Si no pagás, el acceso se suspende el ${formatDate(account.blockDate!)}.`,
      date: today,
      link: "/alumno/pagos",
    });
  } else if (account.status === "bloqueado") {
    list.push({
      id: `acceso-suspendido-${period}`,
      tone: "danger",
      icon: "ti-lock",
      title: "Acceso suspendido por deuda",
      detail: `Debés ${formatARS(account.owedAmount)} con ${account.overdueDays} días de atraso. Cuando pagues, volvés a entrenar.`,
      date: today,
      link: "/alumno/pagos",
    });
  }

  if (client.manualRestriction) {
    list.push({
      id: `restriccion-${client.manualRestriction.at}`,
      tone: "danger",
      icon: "ti-hand-stop",
      title: "Tu acceso está restringido",
      detail: `${client.manualRestriction.reason} Consultá en recepción.`,
      date: client.manualRestriction.at,
    });
  }

  if (client.status === "active" && !client.health?.signedAt) {
    list.push({
      id: "ddjj-pendiente",
      tone: "warning",
      icon: "ti-file-alert",
      title: "Completá tu declaración jurada de salud",
      detail: "Es obligatoria para entrenar. Te lleva un par de minutos.",
      date: today,
      link: "/alumno",
    });
  }

  for (const doc of client.attachments ?? []) {
    if (doc.status === "pending") {
      list.push({
        id: `documento-revision-${doc.id}`,
        tone: "info",
        icon: "ti-file-time",
        title: "Tu documento está en revisión",
        detail: `Recepción va a revisar ${doc.fileName}.`,
        date: doc.uploadedAt,
        link: "/alumno",
      });
    }
  }

  const lastPayment = payments
    .filter((p) => p.clientId === client.id && p.status === "approved")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (
    lastPayment &&
    diffDays(lastPayment.createdAt.slice(0, 10), today) <= RECENT_PAYMENT_DAYS
  ) {
    list.push({
      id: `pago-${lastPayment.id}`,
      tone: "success",
      icon: "ti-receipt",
      title: "Pago registrado",
      detail: `Recibo ${lastPayment.receiptNumber} por ${formatARS(lastPayment.amountArs)}.`,
      date: lastPayment.createdAt,
      link: "/alumno/pagos",
    });
  }

  for (const message of communications) {
    if (!message.recipientIds.includes(client.id)) continue;
    list.push({
      id: message.id,
      tone: "neutral",
      icon: "ti-message",
      title: message.subject,
      detail: personalize(message.body, client),
      date: message.sentAt,
    });
  }

  return list.sort(byNewest);
}

/** Avisos de secretaría (de su sede): cuotas vencidas, bloqueos, documentos y novedades. */
export function secretaryNotifications(input: {
  branchClients: Client[];
  statusOf: (client: Client) => AccountSummary["status"];
  novedades: Novedad[];
  today: string;
}): AppNotification[] {
  const { branchClients, statusOf, novedades, today } = input;
  const list: AppNotification[] = [];
  const active = branchClients.filter((c) => c.status === "active");
  const overdue = active.filter((c) => statusOf(c) === "deudor").length;
  const blocked = active.filter((c) => statusOf(c) === "bloqueado").length;
  const pendingDocs = active.filter((c) =>
    c.attachments?.some((d) => d.status === "pending"),
  );

  if (overdue > 0)
    list.push({
      id: `sec-deudores-${today}-${overdue}`,
      tone: "warning",
      icon: "ti-alert-triangle",
      title: `${overdue} ${overdue === 1 ? "alumno con la cuota vencida" : "alumnos con la cuota vencida"} en tu sede`,
      detail: "Todavía pueden ingresar. Se bloquean a los 15 días de atraso.",
      date: today,
      link: "/secretaria/cobros",
    });
  if (blocked > 0)
    list.push({
      id: `sec-bloqueados-${today}-${blocked}`,
      tone: "danger",
      icon: "ti-lock",
      title: `${blocked} ${blocked === 1 ? "alumno bloqueado" : "alumnos bloqueados"} por deuda`,
      detail: "No pueden ingresar hasta que paguen.",
      date: today,
      link: "/secretaria/cobros",
    });
  for (const client of pendingDocs) {
    list.push({
      id: `sec-documento-${client.id}`,
      tone: "info",
      icon: "ti-file-time",
      title: "Documento para revisar",
      detail: `${client.fullName} subió un documento desde la app.`,
      date: today,
      link: `/secretaria/alumnos/${client.id}?tab=salud`,
    });
  }
  list.push(...novedadNotifications(novedades, "/secretaria/novedades"));
  return list.sort(byNewest);
}

/** Novedades en curso (secretaría, encargado y admin). */
export function novedadNotifications(
  novedades: Novedad[],
  link: string,
): AppNotification[] {
  return novedades
    .filter((n) => n.status === "in_progress")
    .map((n) => ({
      id: `novedad-${n.id}`,
      tone: n.type === "incident" ? ("danger" as const) : ("warning" as const),
      icon: n.type === "incident" ? "ti-alert-octagon" : "ti-speakerphone",
      title: `Novedad en curso: ${n.entityName}`,
      detail: n.detail,
      date: n.timestamp,
      link,
    }))
    .sort(byNewest);
}

/** Avisos del profesor: reemplazos que esperan su respuesta (CU 7 de Personal). */
export function teacherNotifications(input: {
  teacherId: string;
  replacements: Replacement[];
  describe: (replacement: Replacement) => string;
}): AppNotification[] {
  const { teacherId, replacements, describe } = input;
  return replacements
    .filter((r) => r.candidateTeacherId === teacherId && r.status === "pending")
    .map((r) => ({
      id: `reemplazo-${r.id}`,
      tone: "warning" as const,
      icon: "ti-arrows-exchange",
      title: "Te pidieron un reemplazo",
      detail: describe(r),
      date: r.requestedAt,
      link: "/profesor/reemplazos",
    }))
    .sort(byNewest);
}
