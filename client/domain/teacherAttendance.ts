import type { TeacherAttendance } from "@/data/teacherAttendance";
import type { Session } from "./schedule";
import { TEACHER_ABSENCE_ALERT_DAYS } from "@/data/rules";
import { diffDays } from "@/lib/dates";

/**
 * Asistencia de profesores por turno (CU 1 a 3 de Personal): lo programado en
 * el cronograma contra lo registrado, y su confirmación. Funciones puras.
 */

export type ShiftState =
  | "presente"
  | "ausente"
  | "sin_registrar"
  | "programada";

export const SHIFT_STATE_LABELS: Record<ShiftState, string> = {
  presente: "Presente",
  ausente: "Ausente",
  sin_registrar: "Sin registrar",
  programada: "Programada",
};

/** Motivo que queda cuando se marca una ausencia sin decir por qué (ausencia sin justificar). */
export const NO_REASON = "Sin motivo";

export const ABSENCE_REASONS = [
  "Enfermedad",
  "Trámite personal",
  "Problema de transporte",
  "Otro motivo",
];

export interface ShiftRow {
  session: Session;
  record?: TeacherAttendance;
  state: ShiftState;
}

/** Cada clase con su registro. Si no tiene y ya terminó, queda "sin registrar". */
export function shiftRows(
  sessions: Session[],
  attendance: TeacherAttendance[],
  now: { date: string; time: string },
): ShiftRow[] {
  return sessions.map((session) => {
    const record = attendance.find(
      (a) => a.slotId === session.slotId && a.date === session.date,
    );
    let state: ShiftState;
    if (record) state = record.status === "present" ? "presente" : "ausente";
    else if (
      session.date < now.date ||
      (session.date === now.date && session.end <= now.time)
    )
      state = "sin_registrar";
    else state = "programada";
    return { session, record, state };
  });
}

export interface ShiftStats {
  /** Clases que ya pasaron (o ya están registradas). */
  due: number;
  present: number;
  absent: number;
  unregistered: number;
  /** Registradas pero todavía sin confirmar por el encargado. */
  toConfirm: number;
}

export function shiftStats(rows: ShiftRow[]): ShiftStats {
  return {
    due: rows.filter((r) => r.state !== "programada").length,
    present: rows.filter((r) => r.state === "presente").length,
    absent: rows.filter((r) => r.state === "ausente").length,
    unregistered: rows.filter((r) => r.state === "sin_registrar").length,
    toConfirm: rows.filter((r) => r.record && !r.record.confirmedAt).length,
  };
}

/**
 * Ausencias de profesores sin justificar de los últimos días (requisito
 * 3.1.7c): se le avisan al encargado de la sede.
 */
export function unjustifiedTeacherAbsences(
  records: TeacherAttendance[],
  today: string,
  days = TEACHER_ABSENCE_ALERT_DAYS,
): TeacherAttendance[] {
  return records.filter((r) => {
    if (r.status !== "absent") return false;
    if (r.reason && r.reason !== NO_REASON) return false;
    const ago = diffDays(r.date, today);
    return ago >= 0 && ago <= days;
  });
}
