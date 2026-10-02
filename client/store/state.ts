import { clientsMock, type Client } from "@/data/clients";
import { paymentsMock, type Payment } from "@/data/payments";
import { attendanceMock, type StudentAttendance } from "@/data/attendance";
import {
  teacherAttendanceMock,
  type TeacherAttendance,
} from "@/data/teacherAttendance";
import { replacementsMock, type Replacement } from "@/data/replacements";
import { novedadesMock, type Novedad } from "@/data/novedades";
import { bitacorasMock, type Bitacora } from "@/data/bitacoras";
import { communicationsMock, type Communication } from "@/data/communications";
import type { ActivityEntry } from "./actions";
import { activityText } from "./activityText";

/**
 * Datos que cambian mientras se usa la app (los catálogos fijos, como planes,
 * sedes, profesores o el cronograma, se leen directo de `client/data/`).
 */
export interface AppState {
  clients: Client[];
  payments: Payment[];
  attendance: StudentAttendance[];
  teacherAttendance: TeacherAttendance[];
  replacements: Replacement[];
  novedades: Novedad[];
  bitacoras: Bitacora[];
  communications: Communication[];
  /** Avisos que cada usuario ya marcó como leídos (id de usuario → ids de aviso). */
  notificationReads: Record<string, string[]>;
  /** Registro de actividad: quién hizo qué y cuándo (en memoria). */
  activity: ActivityEntry[];
}

/**
 * Registro de actividad de los datos semilla (inscripciones, documentos,
 * restricciones, bajas y pagos), para que cada ficha muestre su historia.
 */
function seedActivity(
  clients: Client[],
  payments: Payment[],
  communications: Communication[],
): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const add = (entry: Omit<ActivityEntry, "id">, key: string) =>
    entries.push({ id: `act_seed_${key}`, ...entry });

  for (const client of clients) {
    const base = { entity: "alumno" as const, entityId: client.id };
    add(
      {
        ...base,
        at: client.createdAt,
        userId: client.createdBy ?? "sistema",
        summary: activityText.registerClient(client.fullName),
      },
      client.id,
    );
    for (const doc of client.attachments ?? []) {
      // Si se adjuntó al inscribirse, queda justo después de la inscripción.
      const at =
        doc.uploadedAt === client.createdAt.slice(0, 10)
          ? client.createdAt.replace(/:\d\d$/, ":30")
          : `${doc.uploadedAt}T12:00:00`;
      add(
        {
          ...base,
          at,
          userId: doc.uploadedBy ?? "sistema",
          summary: activityText.addAttachment(doc, client.fullName),
        },
        doc.id,
      );
    }
    if (client.manualRestriction) {
      add(
        {
          ...base,
          at: `${client.manualRestriction.at}T11:00:00`,
          userId: client.manualRestriction.byUserId,
          summary: activityText.restrictClient(
            client.fullName,
            client.manualRestriction.reason,
          ),
        },
        `${client.id}_restriccion`,
      );
    }
    if (client.status === "inactive" && client.deactivatedAt) {
      add(
        {
          ...base,
          at: `${client.deactivatedAt}T18:00:00`,
          userId: client.deactivatedBy ?? "sistema",
          summary: activityText.deactivateClient(
            client.fullName,
            client.deactivationReason ?? "sin motivo",
          ),
        },
        `${client.id}_baja`,
      );
    }
  }

  const names = new Map(clients.map((c) => [c.id, c.fullName]));
  for (const payment of payments) {
    add(
      {
        at: payment.createdAt,
        userId: payment.processedBy,
        summary: activityText.payment(
          payment,
          names.get(payment.clientId) ?? "alumno",
        ),
        entity: "pago",
        entityId: payment.id,
      },
      payment.id,
    );
  }

  for (const message of communications) {
    add(
      {
        at: message.sentAt,
        userId: message.sentBy,
        summary: activityText.sendCommunication(
          message.subject,
          message.recipientIds.length,
        ),
        entity: "comunicacion",
        entityId: message.id,
      },
      message.id,
    );
  }

  return entries.sort((a, b) => b.at.localeCompare(a.at));
}

/** Estado inicial de la demo, armado con los mocks. */
export function createSeedState(): AppState {
  return {
    clients: [...clientsMock],
    payments: [...paymentsMock],
    attendance: [...attendanceMock],
    teacherAttendance: [...teacherAttendanceMock],
    replacements: [...replacementsMock],
    novedades: [...novedadesMock],
    bitacoras: [...bitacorasMock],
    communications: [...communicationsMock],
    notificationReads: {},
    activity: seedActivity(clientsMock, paymentsMock, communicationsMock),
  };
}
