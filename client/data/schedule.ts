export interface GymClass {
  id: string;
  time: string;
  durationMin: number;
  title: string;
  coach: string;
  capacity: number;
  booked: number;
  enrolledStudentIds: string[];
  isPro?: boolean;
  isFull?: boolean;
}

export interface DaySchedule {
  dayAbbr: string;
  dayFull: string;
  date: number;
  month: string;
  isActive?: boolean;
  classes: GymClass[];
}

export const DAY_NAMES = [
  { abbr: "LUN", full: "Lunes" },
  { abbr: "MAR", full: "Martes" },
  { abbr: "MIE", full: "Miércoles" },
  { abbr: "JUE", full: "Jueves" },
  { abbr: "VIE", full: "Viernes" },
  { abbr: "SAB", full: "Sábado" },
  { abbr: "DOM", full: "Domingo" },
];

export function assignStudentsToClass(
  classTitle: string,
  classTime: string,
  classDayIdx: number,
  classCapacity: number,
  students: { id: string; name: string; plan: string; weekSession: string }[],
  studentBusyAt: Map<string, Set<string>>,
): { enrolledIds: string[]; presentCount: number } {
  const isMusculacion = classTitle === "MUSCULACIÓN";

  const candidates = students.filter((s) => {
    if (isMusculacion) return s.plan === "Musculación";
    return s.plan === "Pase Libre";
  });

  const enrolled: string[] = [];
  for (const s of candidates) {
    if (enrolled.length >= classCapacity) break;
    const busy = studentBusyAt.get(s.id);
    if (busy?.has(`${classDayIdx}_${classTime}`)) continue;
    if (!busy) studentBusyAt.set(s.id, new Set());
    studentBusyAt.get(s.id)!.add(`${classDayIdx}_${classTime}`);
    enrolled.push(s.id);
  }

  const presentCount = Math.floor(enrolled.length * (0.5 + Math.random() * 0.4));
  return { enrolledIds: enrolled, presentCount: Math.max(1, presentCount) };
}

export function buildWeekFromWorkoutTypes(
  baseDate: Date,
  workoutTypes: { id: string; name: string; isProOnly: boolean; weeklySlots: { days: number[]; time: string; durationMin: number; capacity: number }[] }[],
  teachers: { fullName: string; specialtyIds: string[]; status: string }[],
  students?: { id: string; name: string; plan: string; weekSession: string }[],
): DaySchedule[] {
  const activeTeachers = teachers.filter((t) => t.status === "active");
  let classCounter = 0;

  return DAY_NAMES.map((day, dayIdx) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + dayIdx);
    const classes: GymClass[] = [];
    const teacherBusyAt = new Set<string>();
    const studentBusyAt = new Map<string, Set<string>>();

    for (const wt of workoutTypes) {
      const slots = wt.weeklySlots.filter((s) => s.days.includes(dayIdx));
      if (slots.length === 0) continue;

      const candidates = activeTeachers.filter((t) => t.specialtyIds.includes(wt.id));
      if (candidates.length === 0) continue;

      for (const slot of slots) {
        const freeTeacher = candidates.find((t) => !teacherBusyAt.has(`${t.fullName}_${slot.time}`));
        if (!freeTeacher) continue;

        teacherBusyAt.add(`${freeTeacher.fullName}_${slot.time}`);

        let enrolledIds: string[] = [];
        let presentCount = 0;
        if (students) {
          const result = assignStudentsToClass(
            wt.name.toUpperCase(), slot.time, dayIdx, slot.capacity, students, studentBusyAt,
          );
          enrolledIds = result.enrolledIds;
          presentCount = result.presentCount;
        }

        classCounter++;
        classes.push({
          id: `cls_${String(classCounter).padStart(3, "0")}`,
          time: slot.time,
          durationMin: slot.durationMin,
          title: wt.name.toUpperCase(),
          coach: freeTeacher.fullName,
          capacity: slot.capacity,
          booked: enrolledIds.length,
          enrolledStudentIds: enrolledIds,
          isPro: wt.isProOnly || undefined,
          isFull: enrolledIds.length >= slot.capacity || undefined,
        });
      }
    }

    classes.sort((a, b) => a.time.localeCompare(b.time));

    return {
      dayAbbr: day.abbr,
      dayFull: day.full,
      date: d.getDate(),
      month: d.toLocaleDateString("es-AR", { month: "short" }).replace(".", "").toUpperCase(),
      isActive: dayIdx === 1,
      classes,
    };
  });
}

import { workoutTypesMock } from "./workoutTypes";
import { teachersMock } from "./teachers";
import { classStudentsMock } from "./classStudents";

const _BASE_DATE = new Date(2025, 4, 12);

export const weekMock: DaySchedule[] = buildWeekFromWorkoutTypes(
  _BASE_DATE,
  workoutTypesMock,
  teachersMock,
  classStudentsMock,
);
