import type { ClassSlot } from "@/data/schedule";
import type { Replacement } from "@/data/replacements";
import type { TeacherAttendance } from "@/data/teacherAttendance";
import { sessionsBetween, type Session } from "./schedule";

export type TeacherSessionState =
  | "dictada"
  | "ausente"
  | "sin_registro"
  | "programada";

export const TEACHER_SESSION_STATE_LABELS: Record<TeacherSessionState, string> =
  {
    dictada: "Dictada",
    ausente: "Ausente",
    sin_registro: "Sin registrar",
    programada: "Programada",
  };

export interface TeacherSessionRecord {
  session: Session;
  attendance?: TeacherAttendance;
  state: TeacherSessionState;
}

export interface HoursSummary {
  sessions: TeacherSessionRecord[];
  /** Minutos programados en clases ya pasadas del período. */
  scheduledMin: number;
  /** Minutos registrados como dictados. */
  workedMin: number;
  /** registrados − programados (negativo si faltan horas). */
  differenceMin: number;
  /** Minutos programados que todavía no ocurrieron (futuro). */
  upcomingMin: number;
  absences: number;
  unregistered: number;
}

/**
 * Horas de un profesor en un período: clases que le tocaban según el
 * cronograma (con reemplazos aceptados) contra lo registrado como asistencia.
 */
export function getTeacherHours(
  teacherId: string,
  from: string,
  to: string,
  today: string,
  slots: ClassSlot[],
  replacements: Replacement[],
  attendance: TeacherAttendance[],
): HoursSummary {
  const sessions = sessionsBetween(from, to, slots, replacements).filter(
    (s) => s.teacherId === teacherId,
  );
  const records: TeacherSessionRecord[] = sessions.map((session) => {
    const record = attendance.find(
      (a) =>
        a.slotId === session.slotId &&
        a.date === session.date &&
        a.teacherId === teacherId,
    );
    let state: TeacherSessionState;
    if (session.date >= today)
      state = record
        ? record.status === "present"
          ? "dictada"
          : "ausente"
        : "programada";
    else if (!record) state = "sin_registro";
    else state = record.status === "present" ? "dictada" : "ausente";
    return { session, attendance: record, state };
  });

  return summarizeTeacherSessions(records);
}

/** Totales de un conjunto de clases (sirve para filtrar por sede o actividad y volver a sumar). */
export function summarizeTeacherSessions(
  records: TeacherSessionRecord[],
): HoursSummary {
  const past = records.filter((r) => r.state !== "programada");
  const scheduledMin = past.reduce((sum, r) => sum + r.session.durationMin, 0);
  const workedMin = past
    .filter((r) => r.state === "dictada")
    .reduce((sum, r) => sum + r.session.durationMin, 0);

  return {
    sessions: records,
    scheduledMin,
    workedMin,
    differenceMin: workedMin - scheduledMin,
    upcomingMin: records
      .filter((r) => r.state === "programada")
      .reduce((sum, r) => sum + r.session.durationMin, 0),
    absences: past.filter((r) => r.state === "ausente").length,
    unregistered: past.filter((r) => r.state === "sin_registro").length,
  };
}
