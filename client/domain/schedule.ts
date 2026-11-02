import type { ClassSlot } from "@/data/schedule";
import type { Replacement } from "@/data/replacements";
import { addDays, addMinutesToTime, diffDays, weekdayOf } from "@/lib/dates";

/** Una clase concreta (un slot del cronograma en una fecha). */
export interface Session {
  slotId: string;
  date: string; // AAAA-MM-DD
  start: string;
  end: string;
  durationMin: number;
  activityId: string;
  branchId: string;
  capacity: number;
  /** Quién la dicta ese día: el titular o el reemplazante aceptado. */
  teacherId: string;
  /** Titular según el cronograma. */
  originalTeacherId: string;
  /** Reemplazo aceptado para ese día, si lo hay. */
  replacementId?: string;
  /** Reemplazo pendiente de respuesta, si lo hay. */
  pendingReplacementId?: string;
}

/** Clases entre dos fechas (inclusive), con los reemplazos aplicados. */
export function sessionsBetween(
  from: string,
  to: string,
  slots: ClassSlot[],
  replacements: Replacement[],
): Session[] {
  const sessions: Session[] = [];
  const days = diffDays(from, to);
  for (let i = 0; i <= days; i++) {
    const date = addDays(from, i);
    const weekday = weekdayOf(date);
    for (const slot of slots) {
      if (slot.weekday !== weekday) continue;
      const forDay = replacements.filter(
        (r) => r.slotId === slot.id && r.date === date,
      );
      const accepted = forDay.find((r) => r.status === "accepted");
      const pending = forDay.find((r) => r.status === "pending");
      sessions.push({
        slotId: slot.id,
        date,
        start: slot.start,
        end: addMinutesToTime(slot.start, slot.durationMin),
        durationMin: slot.durationMin,
        activityId: slot.activityId,
        branchId: slot.branchId,
        capacity: slot.capacity,
        teacherId: accepted ? accepted.candidateTeacherId : slot.teacherId,
        originalTeacherId: slot.teacherId,
        replacementId: accepted?.id,
        pendingReplacementId: pending?.id,
      });
    }
  }
  return sessions.sort((a, b) =>
    (a.date + a.start).localeCompare(b.date + b.start),
  );
}

/** Las 7 fechas de la semana que empieza en `weekStart` (lunes). */
export function weekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Superposiciones del cronograma: un mismo profesor con dos clases que se pisan
 * el mismo día (por ejemplo, al aceptar un reemplazo en el horario de una clase
 * propia). Devuelve cada par una sola vez.
 */
export function findOverlaps(sessions: Session[]): [Session, Session][] {
  const sorted = [...sessions].sort((a, b) =>
    (a.date + a.start).localeCompare(b.date + b.start),
  );
  const pairs: [Session, Session][] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      if (b.date !== a.date) break;
      if (a.teacherId === b.teacherId && b.start < a.end && a.start < b.end)
        pairs.push([a, b]);
    }
  }
  return pairs;
}
