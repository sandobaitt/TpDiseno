import { describe, expect, it } from "vitest";
import { getTeacherHours } from "./hours";
import type { ClassSlot } from "@/data/schedule";
import type { Replacement } from "@/data/replacements";
import type { TeacherAttendance } from "@/data/teacherAttendance";

const slots: ClassSlot[] = [
  {
    id: "s1",
    activityId: "ac_musc",
    branchId: "br_001",
    teacherId: "tc_a",
    weekday: 1,
    start: "08:00",
    durationMin: 120,
    capacity: 25,
  },
  {
    id: "s2",
    activityId: "ac_hiit",
    branchId: "br_001",
    teacherId: "tc_a",
    weekday: 3,
    start: "07:00",
    durationMin: 45,
    capacity: 15,
  },
];

function att(
  slotId: string,
  date: string,
  status: "present" | "absent",
  teacherId = "tc_a",
): TeacherAttendance {
  return {
    id: `${slotId}_${date}`,
    slotId,
    date,
    teacherId,
    status,
    recordedBy: "u",
    recordedAt: `${date}T08:00:00`,
  };
}

describe("horas trabajadas contra cronograma", () => {
  // Del lunes 07/09 al domingo 13/09/2026, consultado el lunes 14/09.
  const from = "2026-09-07";
  const to = "2026-09-13";
  const today = "2026-09-14";

  it("sin diferencias si dictó todo lo programado", () => {
    const h = getTeacherHours(
      "tc_a",
      from,
      to,
      today,
      slots,
      [],
      [att("s1", "2026-09-07", "present"), att("s2", "2026-09-09", "present")],
    );
    expect(h.scheduledMin).toBe(165);
    expect(h.workedMin).toBe(165);
    expect(h.differenceMin).toBe(0);
  });

  it("una ausencia y una clase sin registrar generan diferencia", () => {
    const h = getTeacherHours(
      "tc_a",
      from,
      to,
      today,
      slots,
      [],
      [att("s1", "2026-09-07", "absent")],
    );
    expect(h.workedMin).toBe(0);
    expect(h.differenceMin).toBe(-165);
    expect(h.absences).toBe(1);
    expect(h.unregistered).toBe(1);
  });

  it("un reemplazo aceptado suma las horas al reemplazante y se las quita al titular", () => {
    const reemplazo: Replacement[] = [
      {
        id: "r1",
        slotId: "s1",
        date: "2026-09-07",
        originalTeacherId: "tc_a",
        candidateTeacherId: "tc_b",
        status: "accepted",
        reason: "",
        requestedBy: "u",
        requestedAt: "2026-09-01",
      },
    ];
    const registros = [
      att("s1", "2026-09-07", "present", "tc_b"),
      att("s2", "2026-09-09", "present"),
    ];
    const titular = getTeacherHours(
      "tc_a",
      from,
      to,
      today,
      slots,
      reemplazo,
      registros,
    );
    const reemplazante = getTeacherHours(
      "tc_b",
      from,
      to,
      today,
      slots,
      reemplazo,
      registros,
    );
    expect(titular.scheduledMin).toBe(45);
    expect(reemplazante.workedMin).toBe(120);
  });

  it("las clases futuras no cuentan como faltantes", () => {
    const h = getTeacherHours(
      "tc_a",
      "2026-09-14",
      "2026-09-20",
      "2026-09-14",
      slots,
      [],
      [],
    );
    expect(h.scheduledMin).toBe(0);
    expect(h.upcomingMin).toBe(165);
    expect(h.differenceMin).toBe(0);
  });
});
