import type { Attachment, Client, HealthDeclaration } from "@/data/clients";
import type { Payment } from "@/data/payments";
import type { StudentAttendance } from "@/data/attendance";
import type {
  TeacherAttendance,
  TeacherAttendanceStatus,
} from "@/data/teacherAttendance";
import type { Novedad } from "@/data/novedades";
import type { Bitacora } from "@/data/bitacoras";
import type { Communication } from "@/data/communications";

/** Tipo de registro afectado (para el registro de actividad). */
export type ActivityEntity =
  | "alumno"
  | "pago"
  | "asistencia"
  | "asistencia_profesor"
  | "reemplazo"
  | "novedad"
  | "observacion"
  | "comunicacion";

/** Una línea del registro de actividad: quién, qué y cuándo. */
export interface ActivityEntry {
  id: string;
  at: string; // ISO con hora local
  userId: string;
  summary: string;
  entity: ActivityEntity;
  entityId: string;
}

/** Datos de quién hace la acción y cuándo (los completa el store). */
export interface ActionMeta {
  userId: string;
  at: string;
  summary: string;
  entity: ActivityEntity;
  entityId: string;
}

export type StoreAction = { meta: ActionMeta } & (
  | { type: "client/register"; client: Client }
  | { type: "client/update"; clientId: string; changes: Partial<Client> }
  | { type: "client/deactivate"; clientId: string; reason: string }
  | { type: "client/reactivate"; clientId: string }
  | { type: "client/restrict"; clientId: string; reason: string }
  | { type: "client/unrestrict"; clientId: string }
  | { type: "client/saveHealth"; clientId: string; health: HealthDeclaration }
  | { type: "client/addAttachment"; clientId: string; attachment: Attachment }
  | { type: "client/reviewAttachment"; clientId: string; attachmentId: string }
  | { type: "payment/register"; payment: Payment }
  | { type: "attendance/save"; records: StudentAttendance[] }
  | { type: "teacherAttendance/save"; records: TeacherAttendance[] }
  | { type: "teacherAttendance/confirm"; id: string }
  | { type: "teacherAttendance/confirmMany"; ids: string[] }
  | {
      type: "teacherAttendance/correct";
      id: string;
      status: TeacherAttendanceStatus;
      reason: string;
    }
  | { type: "replacement/respond"; id: string; accept: boolean }
  | { type: "novedad/add"; novedad: Novedad }
  | { type: "novedad/resolve"; id: string }
  | { type: "novedad/remove"; id: string }
  | { type: "bitacora/add"; bitacora: Bitacora }
  | { type: "communication/send"; communication: Communication }
  | { type: "notification/markRead"; userId: string; ids: string[] }
);
