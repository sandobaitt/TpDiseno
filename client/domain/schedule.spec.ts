import { describe, expect, it } from "vitest";
import { sessionsBetween, weekDates } from "./schedule";
import type { ClassSlot } from "@/data/schedule";
import type { Replacement } from "@/data/replacements";

const slots: ClassSlot[] = [
  {
    id: "s_lun",
    activityId: "ac_zumba",
    branchId: "br_001",
    teacherId: "tc_a",
    weekday: 1,
    start: "19:00",
    durationMin: 60,
    capacity: 20,
  },
  {
    id: "s_mie",
    activityId: "ac_musc",
    branchId: "br_002",
    teacherId: "tc_b",
    weekday: 3,
    start: "08:00",
    durationMin: 120,
    capacity: 25,
  },
];

describe("cronograma semanal", () => {
  it("genera las clases de cada día en su fecha real", () => {
    // Semana del lunes 28/09/2026 al domingo 04/10/2026
    const sessions = sessionsBetween("2026-09-28", "2026-10-04", slots, []);
    expect(sessions.map((s) => `${s.date} ${s.start}-${s.end}`)).toEqual([
      "2026-09-28 19:00-20:00",
      "2026-09-30 08:00-10:00",
    ]);
  });

  it("aplica un reemplazo aceptado solo ese día", () => {
    const reemplazos: Replacement[] = [
      {
        id: "r1",
        slotId: "s_lun",
        date: "2026-09-28",
        originalTeacherId: "tc_a",
        candidateTeacherId: "tc_c",
        status: "accepted",
        reason: "",
        requestedBy: "u",
        requestedAt: "2026-09-25",
      },
    ];
    const sessions = sessionsBetween(
      "2026-09-28",
      "2026-10-05",
      slots,
      reemplazos,
    );
    const lunes = sessions.filter((s) => s.slotId === "s_lun");
    expect(lunes[0]).toMatchObject({
      date: "2026-09-28",
      teacherId: "tc_c",
      originalTeacherId: "tc_a",
      replacementId: "r1",
    });
    expect(lunes[1]).toMatchObject({ date: "2026-10-05", teacherId: "tc_a" });
  });

  it("un reemplazo pendiente no cambia al profesor, pero queda marcado", () => {
    const reemplazos: Replacement[] = [
      {
        id: "r2",
        slotId: "s_mie",
        date: "2026-09-30",
        originalTeacherId: "tc_b",
        candidateTeacherId: "tc_c",
        status: "pending",
        reason: "",
        requestedBy: "u",
        requestedAt: "2026-09-25",
      },
    ];
    const [miercoles] = sessionsBetween(
      "2026-09-30",
      "2026-09-30",
      slots,
      reemplazos,
    );
    expect(miercoles).toMatchObject({
      teacherId: "tc_b",
      pendingReplacementId: "r2",
    });
  });

  it("weekDates devuelve los 7 días desde el lunes", () => {
    expect(weekDates("2026-09-28")).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
  });
});
