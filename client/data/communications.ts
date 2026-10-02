import { clientsMock } from "./clients";
import { BRANCH_SECRETARY, daysAgo } from "./seed";

/**
 * Comunicaciones de secretaría a los alumnos (CU 14): masivas o
 * personalizadas, con plantillas. Le llegan a cada alumno a su campana de
 * avisos (y por email, simulado).
 */

export type CommunicationTemplateId =
  | "vencimiento"
  | "cambio_clase"
  | "promocion"
  | "libre";

export const COMMUNICATION_TEMPLATES: {
  id: CommunicationTemplateId;
  label: string;
  icon: string;
  subject: string;
  body: string;
}[] = [
  {
    id: "vencimiento",
    label: "Vencimiento de cuota",
    icon: "ti-calendar-due",
    subject: "Tu cuota vence pronto",
    body: "Hola {nombre}: te recordamos que la cuota vence el día 5. Podés pagarla en recepción o desde la app, sin recargos.",
  },
  {
    id: "cambio_clase",
    label: "Cambio de clase",
    icon: "ti-calendar-event",
    subject: "Cambio de horario",
    body: "Hola {nombre}: te avisamos que hay un cambio en el horario de una de tus clases. Revisá el cronograma en la app.",
  },
  {
    id: "promocion",
    label: "Promoción",
    icon: "ti-discount",
    subject: "Promoción para vos",
    body: "Hola {nombre}: este mes tenemos una promoción especial. Consultá en recepción.",
  },
  {
    id: "libre",
    label: "Mensaje libre",
    icon: "ti-message",
    subject: "",
    body: "Hola {nombre}: ",
  },
];

/** A quiénes se manda. */
export type AudienceKind =
  | "todos"
  | "sede"
  | "plan"
  | "por_vencer"
  | "deudores"
  | "alumno";

export interface Audience {
  kind: AudienceKind;
  branchId?: string;
  planId?: string;
  clientId?: string;
}

export interface Communication {
  id: string;
  templateId: CommunicationTemplateId;
  subject: string;
  /** Texto con {nombre}: se personaliza para cada alumno. */
  body: string;
  audience: Audience;
  /** Descripción legible de los destinatarios ("Con cuota vencida", "Sede Centro"…). */
  audienceLabel: string;
  recipientIds: string[];
  /** Siempre llega a la app; el email es opcional (simulado). */
  byEmail: boolean;
  sentBy: string;
  sentAt: string; // ISO con hora local
}

const SENT_TO_CENTRO = daysAgo(6);
/** Alumnos activos de Centro que ya estaban inscriptos cuando se mandó el aviso. */
const centroRecipients = clientsMock
  .filter(
    (c) =>
      c.status === "active" &&
      c.branchId === "br_001" &&
      c.enrolledAt <= SENT_TO_CENTRO,
  )
  .map((c) => c.id);

export const communicationsMock: Communication[] = [
  {
    id: "com_001",
    templateId: "cambio_clase",
    subject: "Yoga de los viernes con nueva profesora",
    body: "Hola {nombre}: desde esta semana la clase de Yoga de los viernes a las 18 la da Micaela Sosa. El horario no cambia.",
    audience: { kind: "sede", branchId: "br_001" },
    audienceLabel: "Sede Centro",
    recipientIds: centroRecipients,
    byEmail: true,
    sentBy: BRANCH_SECRETARY.br_001,
    sentAt: `${SENT_TO_CENTRO}T10:15:00`,
  },
  {
    id: "com_002",
    templateId: "vencimiento",
    subject: "Tenés una cuota vencida",
    body: "Hola {nombre}: tu cuota está vencida. Regularizala para no perder el acceso. No hay recargos.",
    audience: { kind: "deudores" },
    audienceLabel: "Con cuota vencida o bloqueados",
    recipientIds: ["cl_002", "cl_008"],
    byEmail: false,
    sentBy: BRANCH_SECRETARY.br_002,
    sentAt: `${daysAgo(3)}T09:00:00`,
  },
];
