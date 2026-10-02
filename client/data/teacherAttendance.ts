import { scheduleMock } from "./schedule";
import { replacementsMock } from "./replacements";
import {
  BRANCH_MANAGER,
  BRANCH_SECRETARY,
  daysAgo,
  seededPercent,
  SEED_TODAY,
} from "./seed";
import { sessionsBetween } from "@/domain/schedule";
import { addDays, diffDays } from "@/lib/dates";

export type TeacherAttendanceStatus = "present" | "absent";

export const TEACHER_ATTENDANCE_LABELS: Record<
  TeacherAttendanceStatus,
  string
> = {
  present: "Presente",
  absent: "Ausente",
};

/** Presencia o ausencia de un profesor en una clase/turno concreto. */
export interface TeacherAttendance {
  id: string;
  slotId: string;
  date: string; // AAAA-MM-DD
  /** Quién debía dictarla (titular o reemplazante aceptado). */
  teacherId: string;
  status: TeacherAttendanceStatus;
  reason?: string;
  recordedBy: string;
  recordedAt: string; // ISO con hora
  /** Validación del encargado. */
  confirmedBy?: string;
  confirmedAt?: string;
  /** Corrección hecha por el encargado (queda registro del valor anterior). */
  correction?: {
    by: string;
    at: string;
    reason: string;
    previousStatus: TeacherAttendanceStatus;
  };
}

const ABSENCE_REASONS = [
  "Enfermedad",
  "Trámite personal",
  "Problema de transporte",
];

/** Últimas 4 semanas: la mayoría presentes, algunas ausencias y algunas clases sin registrar. */
function buildTeacherAttendance(): TeacherAttendance[] {
  const sessions = sessionsBetween(
    daysAgo(28),
    daysAgo(1),
    scheduleMock,
    replacementsMock,
  );
  const records: TeacherAttendance[] = [];
  for (const s of sessions) {
    const pick = seededPercent("ta", s.slotId, s.date);
    if (!s.replacementId && pick >= 6 && pick < 11) continue; // sin registro: genera diferencia de horas
    const absent = !s.replacementId && pick < 6;
    const confirmed = diffDays(s.date, SEED_TODAY) >= 7;
    records.push({
      id: `ta_${s.slotId}_${s.date}`,
      slotId: s.slotId,
      date: s.date,
      teacherId: s.teacherId,
      status: absent ? "absent" : "present",
      reason: absent
        ? ABSENCE_REASONS[pick % ABSENCE_REASONS.length]
        : undefined,
      recordedBy: BRANCH_SECRETARY[s.branchId],
      recordedAt: `${s.date}T${s.start}:00`,
      confirmedBy: confirmed ? BRANCH_MANAGER[s.branchId] : undefined,
      confirmedAt: confirmed ? addDays(s.date, 2) : undefined,
    });
  }
  return records;
}

export const teacherAttendanceMock: TeacherAttendance[] =
  buildTeacherAttendance();
