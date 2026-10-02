/**
 * Cronograma semanal: cada clase (o turno de sala) se repite todas las semanas
 * el mismo día y horario, en una sede y con un profesor asignado.
 * Las fechas concretas y los reemplazos se calculan en `domain/schedule.ts`.
 */
export interface ClassSlot {
  id: string;
  activityId: string;
  branchId: string;
  teacherId: string;
  /** 1 = lunes … 7 = domingo */
  weekday: number;
  start: string; // "HH:MM"
  durationMin: number;
  capacity: number;
}

export const scheduleMock: ClassSlot[] = [
  // ── Sede Centro (br_001) ──
  { id: "sl_c01", activityId: "ac_musc", branchId: "br_001", teacherId: "tc_001", weekday: 1, start: "08:00", durationMin: 120, capacity: 25 },
  { id: "sl_c02", activityId: "ac_cross", branchId: "br_001", teacherId: "tc_002", weekday: 1, start: "18:00", durationMin: 60, capacity: 15 },
  { id: "sl_c03", activityId: "ac_spin", branchId: "br_001", teacherId: "tc_004", weekday: 1, start: "19:15", durationMin: 45, capacity: 18 },
  { id: "sl_c04", activityId: "ac_func", branchId: "br_001", teacherId: "tc_002", weekday: 2, start: "07:00", durationMin: 60, capacity: 15 },
  { id: "sl_c05", activityId: "ac_zumba", branchId: "br_001", teacherId: "tc_004", weekday: 2, start: "19:00", durationMin: 60, capacity: 20 },
  { id: "sl_c06", activityId: "ac_musc", branchId: "br_001", teacherId: "tc_001", weekday: 3, start: "08:00", durationMin: 120, capacity: 25 },
  { id: "sl_c07", activityId: "ac_cross", branchId: "br_001", teacherId: "tc_002", weekday: 3, start: "18:00", durationMin: 60, capacity: 15 },
  { id: "sl_c08", activityId: "ac_hiit", branchId: "br_001", teacherId: "tc_001", weekday: 4, start: "07:00", durationMin: 45, capacity: 15 },
  { id: "sl_c09", activityId: "ac_zumba", branchId: "br_001", teacherId: "tc_004", weekday: 4, start: "19:00", durationMin: 60, capacity: 20 },
  { id: "sl_c10", activityId: "ac_musc", branchId: "br_001", teacherId: "tc_001", weekday: 5, start: "08:00", durationMin: 120, capacity: 25 },
  { id: "sl_c11", activityId: "ac_yoga", branchId: "br_001", teacherId: "tc_002", weekday: 5, start: "18:00", durationMin: 60, capacity: 15 },
  { id: "sl_c12", activityId: "ac_func", branchId: "br_001", teacherId: "tc_002", weekday: 6, start: "10:00", durationMin: 60, capacity: 15 },

  // ── Sede Zona Norte (br_002) ──
  { id: "sl_n01", activityId: "ac_musc", branchId: "br_002", teacherId: "tc_007", weekday: 1, start: "09:00", durationMin: 120, capacity: 25 },
  { id: "sl_n02", activityId: "ac_kick", branchId: "br_002", teacherId: "tc_003", weekday: 1, start: "20:00", durationMin: 60, capacity: 15 },
  { id: "sl_n03", activityId: "ac_musc", branchId: "br_002", teacherId: "tc_001", weekday: 2, start: "18:00", durationMin: 120, capacity: 25 },
  { id: "sl_n04", activityId: "ac_zumba", branchId: "br_002", teacherId: "tc_006", weekday: 2, start: "20:00", durationMin: 60, capacity: 20 },
  { id: "sl_n05", activityId: "ac_musc", branchId: "br_002", teacherId: "tc_007", weekday: 3, start: "09:00", durationMin: 120, capacity: 25 },
  { id: "sl_n06", activityId: "ac_kick", branchId: "br_002", teacherId: "tc_003", weekday: 3, start: "20:00", durationMin: 60, capacity: 15 },
  { id: "sl_n07", activityId: "ac_func", branchId: "br_002", teacherId: "tc_003", weekday: 4, start: "18:00", durationMin: 60, capacity: 15 },
  { id: "sl_n08", activityId: "ac_yoga", branchId: "br_002", teacherId: "tc_006", weekday: 4, start: "19:30", durationMin: 60, capacity: 15 },
  { id: "sl_n09", activityId: "ac_hiit", branchId: "br_002", teacherId: "tc_007", weekday: 5, start: "09:00", durationMin: 45, capacity: 15 },
  { id: "sl_n10", activityId: "ac_zumba", branchId: "br_002", teacherId: "tc_006", weekday: 6, start: "11:00", durationMin: 60, capacity: 20 },
];

export function getSlot(slotId: string): ClassSlot | undefined {
  return scheduleMock.find((s) => s.id === slotId);
}
