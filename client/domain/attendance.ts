import type { Client } from "@/data/clients";
import type { Plan } from "@/data/plans";
import type { StudentAttendance } from "@/data/attendance";
import type { Session } from "./schedule";

/**
 * Asistencia por clase (CU 6) e historial del alumno (CU 7). Funciones puras.
 */

/** Cuántos días para atrás se puede corregir una lista. */
export const ATTENDANCE_CORRECTION_DAYS = 30;

export type AttendanceMark = "present" | "absent_justified" | "absent";

export const ATTENDANCE_MARK_LABELS: Record<AttendanceMark, string> = {
  present: "Asistió",
  absent_justified: "Ausencia justificada",
  absent: "Ausencia sin justificar",
};

export function markOf(record: StudentAttendance): AttendanceMark {
  if (record.status === "present") return "present";
  return record.justified ? "absent_justified" : "absent";
}

/**
 * Alumnos de la lista de una clase: los activos cuyo plan incluye la actividad
 * (pueden venir de cualquier sede) y cualquiera que ya tenga un registro en esa
 * clase. Primero los de la sede de la clase y después por nombre.
 */
export function classRoster(
  session: Pick<Session, "slotId" | "date" | "activityId" | "branchId">,
  clients: Client[],
  attendance: StudentAttendance[],
  getPlan: (planId?: string) => Plan | undefined,
): Client[] {
  const withRecord = new Set(
    attendance
      .filter((a) => a.slotId === session.slotId && a.date === session.date)
      .map((a) => a.clientId),
  );
  return clients
    .filter(
      (c) =>
        withRecord.has(c.id) ||
        (c.status === "active" &&
          c.enrolledAt <= session.date &&
          !!getPlan(c.planId)?.activityIds.includes(session.activityId)),
    )
    .sort(
      (a, b) =>
        Number(b.branchId === session.branchId) -
          Number(a.branchId === session.branchId) ||
        a.fullName.localeCompare(b.fullName),
    );
}

export interface AttendanceSummary {
  present: number;
  justified: number;
  unjustified: number;
  /** % de clases a las que fue, sobre las registradas (0 si no hay). */
  rate: number;
}

export function summarizeAttendance(
  records: StudentAttendance[],
): AttendanceSummary {
  const present = records.filter((r) => r.status === "present").length;
  const justified = records.filter(
    (r) => r.status === "absent" && r.justified,
  ).length;
  const unjustified = records.length - present - justified;
  return {
    present,
    justified,
    unjustified,
    rate: records.length ? Math.round((present / records.length) * 100) : 0,
  };
}

/** Escapa un valor para CSV con ";" (el separador que abre bien Excel en español). */
function csvCell(value: string): string {
  return /[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Arma un CSV (con BOM para que Excel muestre bien las tildes). */
export function toCsv(header: string[], rows: string[][]): string {
  const lines = [header, ...rows].map((row) => row.map(csvCell).join(";"));
  return `\uFEFF${lines.join("\r\n")}`;
}
