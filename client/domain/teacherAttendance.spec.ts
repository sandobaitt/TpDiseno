import { describe, expect, it } from "vitest";
import { shiftRows, shiftStats } from "./teacherAttendance";
import type { Session } from "./schedule";
import type { TeacherAttendance } from "@/data/teacherAttendance";

function clase(
  slotId: string,
  date: string,
  start = "08:00",
  end = "09:00",
): Session {
  return {
    slotId,
    date,
    start,
    end,
    durationMin: 60,
    activityId: "ac_musc",
    branchId: "br_001",
    capacity: 20,
    teacherId: "tc_001",
    originalTeacherId: "tc_001",
  };
}

function registro(
  slotId: string,
  date: string,
  status: "present" | "absent",
  confirmed = false,
): TeacherAttendance {
  return {
    id: `ta_${slotId}_${date}`,
    slotId,
    date,
    teacherId: "tc_001",
    status,
    recordedBy: "us_se_001",
    recordedAt: `${date}T08:00:00`,
    confirmedAt: confirmed ? date : undefined,
    confirmedBy: confirmed ? "us_en_001" : undefined,
  };
}

const NOW = { date: "2026-10-02", time: "12:00" };

describe("turnos de profesores", () => {
  const sesiones = [
    clase("a", "2026-10-01"),
    clase("b", "2026-10-01"),
    clase("c", "2026-10-02", "08:00", "10:00"),
    clase("d", "2026-10-02", "18:00", "19:00"),
    clase("e", "2026-10-01"),
  ];
  const registros = [
    registro("a", "2026-10-01", "present", true),
    registro("b", "2026-10-01", "absent"),
  ];

  it("marca presente, ausente, sin registrar (si ya pasó) o programada", () => {
    expect(shiftRows(sesiones, registros, NOW).map((r) => r.state)).toEqual([
      "presente",
      "ausente",
      "sin_registrar",
      "programada",
      "sin_registrar",
    ]);
  });

  it("resume la semana y lo que falta confirmar", () => {
    expect(shiftStats(shiftRows(sesiones, registros, NOW))).toEqual({
      due: 4,
      present: 1,
      absent: 1,
      unregistered: 2,
      toConfirm: 1,
    });
  });
});
