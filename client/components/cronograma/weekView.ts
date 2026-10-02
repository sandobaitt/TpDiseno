import { getActivityName } from "@/data/activities";
import { branchesMock } from "@/data/branches";
import { getTeacher } from "@/data/teachers";
import type { Session } from "@/domain/schedule";
import { weekDates } from "@/domain/schedule";
import { parseISODate } from "@/lib/dates";
import type { ClassCardData } from "./ClassCard";

const DAY_ABBRS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export interface WeekDay {
  iso: string;
  dayAbbr: string;
  date: number;
  month: string;
  isActive: boolean;
}

/** Columnas de la semana para `UnifiedCalendar`. */
export function buildWeekDays(
  weekStart: string,
  activeDate: string,
): WeekDay[] {
  return weekDates(weekStart).map((iso, i) => {
    const d = parseISODate(iso);
    return {
      iso,
      dayAbbr: DAY_ABBRS[i],
      date: d.getDate(),
      month: d
        .toLocaleDateString("es-AR", { month: "short" })
        .replace(".", "")
        .toUpperCase(),
      isActive: iso === activeDate,
    };
  });
}

/** "28 sep – 4 oct" */
export function weekLabel(weekStart: string): string {
  const [first, , , , , , last] = weekDates(weekStart);
  const fmt = (iso: string) =>
    parseISODate(iso)
      .toLocaleDateString("es-AR", { day: "numeric", month: "short" })
      .replace(".", "");
  return `${fmt(first)} – ${fmt(last)}`;
}

export function branchName(branchId: string): string {
  return (
    branchesMock
      .find((b) => b.id === branchId)
      ?.name.replace("SquatGym ", "") ?? "Sede"
  );
}

/** Datos que muestra la tarjeta de una clase. */
export function toClassCard(session: Session): ClassCardData {
  return {
    id: `${session.slotId}_${session.date}`,
    start: session.start,
    end: session.end,
    durationMin: session.durationMin,
    title: getActivityName(session.activityId),
    teacherName: getTeacher(session.teacherId)?.fullName ?? "Sin asignar",
    branchName: branchName(session.branchId),
    capacity: session.capacity,
    replacementNote: session.replacementId
      ? `Reemplaza a ${getTeacher(session.originalTeacherId)?.fullName ?? "el titular"}`
      : undefined,
  };
}
