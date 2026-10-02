import { clientsMock } from "./clients";
import { getPlan } from "./plans";
import { scheduleMock } from "./schedule";
import { replacementsMock } from "./replacements";
import { getTeacher } from "./teachers";
import { BRANCH_SECRETARY, daysAgo, seededPercent } from "./seed";
import { sessionsBetween } from "@/domain/schedule";

export type StudentAttendanceStatus = "present" | "absent";

/** Asistencia de un alumno a una clase concreta (lista por clase y sede). */
export interface StudentAttendance {
  id: string;
  clientId: string;
  slotId: string;
  date: string; // AAAA-MM-DD
  branchId: string;
  status: StudentAttendanceStatus;
  /** Solo para ausencias: si presentó justificación. */
  justified?: boolean;
  recordedBy: string;
  recordedAt: string; // ISO con hora
}

/** Alumnos que dejaron de venir (bloqueados por deuda o con restricción) desde esa fecha. */
const STOPPED_SINCE: Record<string, string> = {
  cl_002: daysAgo(26),
  cl_008: daysAgo(24),
  cl_016: daysAgo(6),
};

/** Últimas 5 semanas, solo en clases que el plan de cada alumno habilita. */
function buildAttendance(): StudentAttendance[] {
  const sessions = sessionsBetween(
    daysAgo(35),
    daysAgo(1),
    scheduleMock,
    replacementsMock,
  );
  const records: StudentAttendance[] = [];
  for (const client of clientsMock) {
    const plan = getPlan(client.planId);
    if (client.status !== "active" || !plan) continue;
    for (const s of sessions) {
      if (
        s.date < client.enrolledAt ||
        !plan.activityIds.includes(s.activityId)
      )
        continue;
      const otherBranch = s.branchId !== client.branchId;
      if (otherBranch && seededPercent(client.id, s.slotId) >= 12) continue; // a veces entrena en otra sede
      const pick = seededPercent("as", client.id, s.slotId, s.date);
      const stopped =
        STOPPED_SINCE[client.id] && s.date >= STOPPED_SINCE[client.id];
      let status: StudentAttendanceStatus;
      let justified: boolean | undefined;
      if (pick < 30 && !stopped) status = "present";
      else if (pick >= 30 && pick < 36) {
        status = "absent";
        justified = false;
      } else if (pick >= 36 && pick < 39) {
        status = "absent";
        justified = true;
      } else continue;
      const teacherUser = getTeacher(s.teacherId)?.userId;
      records.push({
        id: `at_${client.id}_${s.slotId}_${s.date}`,
        clientId: client.id,
        slotId: s.slotId,
        date: s.date,
        branchId: s.branchId,
        status,
        justified,
        recordedBy: teacherUser ?? BRANCH_SECRETARY[s.branchId],
        recordedAt: `${s.date}T${s.start}:00`,
      });
    }
  }
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export const attendanceMock: StudentAttendance[] = buildAttendance();

/** Fecha y hora del último ingreso registrado del alumno. */
export function getLastAccess(
  clientId: string,
  records: StudentAttendance[] = attendanceMock,
): string | undefined {
  return records.find((r) => r.clientId === clientId && r.status === "present")
    ?.recordedAt;
}
