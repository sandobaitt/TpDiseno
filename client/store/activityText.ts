import type { Attachment } from "@/data/clients";
import { PAYMENT_METHOD_LABELS, type Payment } from "@/data/payments";
import { formatARS } from "@/lib/format";

const docWithArticle = (kind: Attachment["kind"], definite: boolean) =>
  kind === "certificado"
    ? `${definite ? "el" : "un"} certificado médico`
    : `${definite ? "la" : "una"} autorización`;

/**
 * Textos del registro de actividad ("quién hizo qué"). Los usan las acciones
 * del store y la semilla, así una misma operación siempre se describe igual.
 */
export const activityText = {
  registerClient: (name: string) => `Inscribió a ${name}`,
  updateClient: (name: string) => `Modificó los datos de ${name}`,
  deactivateClient: (name: string, reason: string) =>
    `Dio de baja a ${name}: ${reason}`,
  reactivateClient: (name: string) => `Reactivó a ${name}`,
  restrictClient: (name: string, reason: string) =>
    `Restringió el acceso de ${name}: ${reason}`,
  unrestrictClient: (name: string) =>
    `Quitó la restricción de acceso de ${name}`,
  saveHealth: (name: string) =>
    `Actualizó la declaración jurada de salud de ${name}`,
  addAttachment: (doc: Attachment, name: string) =>
    `Adjuntó ${docWithArticle(doc.kind, false)} (${doc.fileName}) a la ficha de ${name}`,
  reviewAttachment: (doc: Attachment, name: string) =>
    `Revisó ${docWithArticle(doc.kind, true)} (${doc.fileName}) de ${name}`,
  saveAttendance: (count: number, classLabel: string, correction: boolean) =>
    `${correction ? "Corrigió" : "Registró"} la asistencia de ${count} ${count === 1 ? "alumno" : "alumnos"} en ${classLabel}`,
  payment: (payment: Payment, name: string) =>
    `${payment.status === "approved" ? "Registró el pago" : "Pago rechazado"} ${payment.receiptNumber} de ${name}: ${formatARS(payment.amountArs)} (${PAYMENT_METHOD_LABELS[payment.method]})`,
};
