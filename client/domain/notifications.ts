import type { Client } from "@/data/clients";
import type { Communication } from "@/data/communications";
import type { Payment } from "@/data/payments";
import type { Novedad } from "@/data/novedades";
import type { Replacement } from "@/data/replacements";
import type { Promotion } from "@/data/promotions";
import {
  DEBT_BLOCK_DAYS,
  FREQUENT_ABSENCES,
  FREQUENT_ABSENCES_WINDOW_DAYS,
  PROMO_EXPIRED_ALERT_DAYS,
  PROMO_EXPIRING_ALERT_DAYS,
} from "@/data/rules";
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

/** Ordena avisos de distintas fuentes: el más nuevo primero. */
export function sortNotifications(list: AppNotification[]): AppNotification[] {
  return [...list].sort(byNewest);
}

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
  const pendingDocs = active.filter((c) =>
    c.attachments?.some((d) => d.status === "pending"),
  );

  list.push(
    ...debtNotifications({
      branchClients,
      statusOf,
      today,
      prefix: "sec",
      link: "/secretaria/cobros",
    }),
  );
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

/**
 * Alumnos con la cuota vencida o bloqueados de una sede (secretaría y, por el
 * requisito 3.1.8a, también el encargado).
 */
export function debtNotifications(input: {
  branchClients: Client[];
  statusOf: (client: Client) => AccountSummary["status"];
  today: string;
  /** Prefijo del id del aviso (cada rol lo marca como leído por separado). */
  prefix: string;
  link?: string;
}): AppNotification[] {
  const { branchClients, statusOf, today, prefix, link } = input;
  const active = branchClients.filter((c) => c.status === "active");
  const overdue = active.filter((c) => statusOf(c) === "deudor").length;
  const blocked = active.filter((c) => statusOf(c) === "bloqueado").length;
  const list: AppNotification[] = [];
  if (overdue > 0)
    list.push({
      id: `${prefix}-deudores-${today}-${overdue}`,
      tone: "warning",
      icon: "ti-alert-triangle",
      title: `${overdue} ${overdue === 1 ? "alumno con la cuota vencida" : "alumnos con la cuota vencida"} en tu sede`,
      detail: `Todavía pueden ingresar. Se bloquean a los ${DEBT_BLOCK_DAYS} días de atraso.`,
      date: today,
      link,
    });
  if (blocked > 0)
    list.push({
      id: `${prefix}-bloqueados-${today}-${blocked}`,
      tone: "danger",
      icon: "ti-lock",
      title: `${blocked} ${blocked === 1 ? "alumno bloqueado" : "alumnos bloqueados"} por deuda`,
      detail: "No pueden ingresar hasta que paguen.",
      date: today,
      link,
    });
  return list;
}

/**
 * Alumnos que faltan seguido sin justificar (requisito 3.1.20c): un solo aviso
 * con los nombres, para secretaría y el encargado de la sede.
 */
export function frequentAbsenceNotifications(input: {
  students: { clientId: string; name: string; count: number }[];
  today: string;
  prefix: string;
  link?: string;
}): AppNotification[] {
  const { students, today, prefix, link } = input;
  if (students.length === 0) return [];
  const names = students
    .slice(0, 4)
    .map((s) => `${s.name} (${s.count})`)
    .join(", ");
  const more = students.length > 4 ? ` y ${students.length - 4} más` : "";
  return [
    {
      id: `${prefix}-inasistencias-${today}-${students.map((s) => s.clientId).join("-")}`,
      tone: "warning",
      icon: "ti-user-exclamation",
      title: `${students.length} ${students.length === 1 ? "alumno con inasistencias frecuentes" : "alumnos con inasistencias frecuentes"}`,
      detail: `${names}${more}: faltaron sin justificar ${FREQUENT_ABSENCES} veces o más en los últimos ${FREQUENT_ABSENCES_WINDOW_DAYS} días.`,
      date: today,
      link,
    },
  ];
}

/**
 * Cambios en el cronograma (requisitos 3.1.8b y 3.1.17c): reemplazos
 * confirmados y superposiciones de horario de un profesor.
 */
export function scheduleNotifications(input: {
  /** Reemplazos confirmados de clases que todavía no se dieron. */
  changes: { id: string; detail: string; date: string }[];
  /** Un mismo profesor con dos clases a la vez. */
  overlaps: { id: string; detail: string }[];
  today: string;
  link?: string;
}): AppNotification[] {
  const { changes, overlaps, today, link } = input;
  return [
    ...overlaps.map((o) => ({
      id: `superposicion-${o.id}`,
      tone: "danger" as const,
      icon: "ti-alert-triangle",
      title: "Superposición en el cronograma",
      detail: o.detail,
      date: today,
      link,
    })),
    ...changes.map((c) => ({
      id: `cambio-${c.id}`,
      tone: "info" as const,
      icon: "ti-arrows-exchange",
      title: "Cambio en el cronograma: reemplazo confirmado",
      detail: c.detail,
      date: c.date,
      link,
    })),
  ].sort(byNewest);
}

/**
 * Promociones vencidas hace poco o por vencer (requisito 3.1.8a), para que el
 * encargado lo sepa antes de que la secretaría intente aplicarlas.
 */
export function promotionNotifications(input: {
  promotions: Promotion[];
  today: string;
  link?: string;
}): AppNotification[] {
  const { promotions, today, link } = input;
  const list: AppNotification[] = [];
  for (const p of promotions) {
    if (!p.active || !p.validTo) continue;
    const left = diffDays(today, p.validTo);
    const label = p.code ? `${p.name} (${p.code})` : p.name;
    if (left < 0 && -left <= PROMO_EXPIRED_ALERT_DAYS)
      list.push({
        id: `promo-vencida-${p.id}`,
        tone: "neutral",
        icon: "ti-discount-off",
        title: `Promoción vencida: ${label}`,
        detail: `Venció el ${formatDate(p.validTo)}. Ya no se ofrece al cobrar.`,
        date: p.validTo,
        link,
      });
    else if (left >= 0 && left <= PROMO_EXPIRING_ALERT_DAYS)
      list.push({
        id: `promo-por-vencer-${p.id}`,
        tone: "warning",
        icon: "ti-discount",
        title: `Promoción por vencer: ${label}`,
        detail: `Vence el ${formatDate(p.validTo)}.`,
        date: today,
        link,
      });
  }
  return list.sort(byNewest);
}

/** Inconsistencias o datos faltantes en inscripciones y pagos (requisito 3.1.6c). */
export function inconsistencyNotifications(input: {
  count: number;
  today: string;
  link?: string;
}): AppNotification[] {
  if (input.count === 0) return [];
  return [
    {
      id: `inconsistencias-${input.today}-${input.count}`,
      tone: "warning",
      icon: "ti-file-alert",
      title: `${input.count} ${input.count === 1 ? "dato para revisar" : "datos para revisar"} en inscripciones y pagos`,
      detail: "Fichas incompletas o pagos que no cierran en tu sede.",
      date: input.today,
      link: input.link,
    },
  ];
}

/** Ausencias de profesores sin justificar (requisito 3.1.7c), para el encargado. */
export function teacherAbsenceNotifications(input: {
  absences: { id: string; detail: string; date: string }[];
  link?: string;
}): AppNotification[] {
  return input.absences
    .map((a) => ({
      id: `ausencia-profe-${a.id}`,
      tone: "danger" as const,
      icon: "ti-user-off",
      title: "Ausencia de un profesor sin justificar",
      detail: a.detail,
      date: a.date,
      link: input.link,
    }))
    .sort(byNewest);
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

/** Días que se muestra un aviso de novedad u observación. */
const RECENT_DAYS = 7;

/**
 * Avisos del profesor (CU 7 de Personal): reemplazos que esperan su respuesta
 * y novedades que lo involucran (a él o a una de sus clases).
 */
export function teacherNotifications(input: {
  teacherId: string;
  replacements: Replacement[];
  describe: (replacement: Replacement) => string;
  novedades?: Novedad[];
  /** Profesor titular de una clase del cronograma. */
  teacherOfSlot?: (slotId: string) => string | undefined;
  today?: string;
}): AppNotification[] {
  const {
    teacherId,
    replacements,
    describe,
    novedades = [],
    teacherOfSlot,
    today,
  } = input;
  const list: AppNotification[] = replacements
    .filter((r) => r.candidateTeacherId === teacherId && r.status === "pending")
    .map((r) => ({
      id: `reemplazo-${r.id}`,
      tone: "warning" as const,
      icon: "ti-arrows-exchange",
      title: "Te pidieron un reemplazo",
      detail: describe(r),
      date: r.requestedAt,
      link: "/profesor/reemplazos",
    }));

  for (const n of novedades) {
    if (!n.notifyTeacher || n.annulled) continue;
    if (today && diffDays(n.timestamp.slice(0, 10), today) > RECENT_DAYS)
      continue;
    const involved =
      (n.entityType === "profesor" && n.entityId === teacherId) ||
      (n.entityType === "clase" &&
        !!n.entityId &&
        teacherOfSlot?.(n.entityId) === teacherId);
    if (!involved) continue;
    list.push({
      id: `novedad-profe-${n.id}`,
      tone: n.type === "incident" ? "danger" : "info",
      icon: n.type === "change" ? "ti-calendar-event" : "ti-speakerphone",
      title: `Novedad: ${n.entityName}`,
      detail: n.detail,
      date: n.timestamp,
      link: "/profesor/cronograma",
    });
  }
  return list.sort(byNewest);
}

/**
 * Observaciones recientes (de profesores o de secretaría) para el encargado de
 * la sede y, las que lo piden, para el administrador (requisito 3.1.16c).
 */
export function observationNotifications(input: {
  observations: {
    id: string;
    title: string;
    teacherName: string;
    date: string;
  }[];
  today: string;
  link: string;
}): AppNotification[] {
  return input.observations
    .filter((o) => diffDays(o.date.slice(0, 10), input.today) <= RECENT_DAYS)
    .map((o) => ({
      id: `observacion-${o.id}`,
      tone: "info" as const,
      icon: "ti-notes",
      title: `Observación de ${o.teacherName}`,
      detail: o.title,
      date: o.date,
      link: input.link,
    }))
    .sort(byNewest);
}

/**
 * Avisos del encargado de su sede: novedades en curso, reemplazos rechazados
 * (la clase quedó sin cubrir), observaciones nuevas y turnos para confirmar.
 */
export function managerNotifications(input: {
  novedades: Novedad[];
  rejectedReplacements: { id: string; detail: string; date: string }[];
  observations: {
    id: string;
    title: string;
    teacherName: string;
    date: string;
  }[];
  toConfirm: number;
  today: string;
}): AppNotification[] {
  const { novedades, rejectedReplacements, observations, toConfirm, today } =
    input;
  const list = novedadNotifications(novedades, "/encargado/novedades");
  for (const r of rejectedReplacements) {
    if (diffDays(r.date, today) > RECENT_DAYS) continue;
    list.push({
      id: `reemplazo-rechazado-${r.id}`,
      tone: "danger",
      icon: "ti-user-x",
      title: "Reemplazo rechazado: la clase quedó sin cubrir",
      detail: r.detail,
      date: r.date,
      link: "/encargado/asistencia",
    });
  }
  list.push(
    ...observationNotifications({
      observations,
      today,
      link: "/encargado/observaciones",
    }),
  );
  if (toConfirm > 0)
    list.push({
      id: `turnos-para-confirmar-${today}-${toConfirm}`,
      tone: "warning",
      icon: "ti-shield-check",
      title: `${toConfirm} ${toConfirm === 1 ? "turno de profesor para confirmar" : "turnos de profesores para confirmar"}`,
      detail: "Revisalos en Asistencia docente.",
      date: today,
      link: "/encargado/asistencia",
    });
  return list.sort(byNewest);
}
