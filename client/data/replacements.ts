import { daysAgo, lastWeekday, nextWeekday, SEED_TODAY } from "./seed";
import { addDays, diffDays } from "@/lib/dates";

export type ReplacementStatus = "pending" | "accepted" | "rejected";

/**
 * Pedido para que un profesor cubra una clase puntual de otro.
 * Si se acepta, ese día la clase la dicta el reemplazante (y suma sus horas).
 */
export interface Replacement {
  id: string;
  slotId: string;
  date: string; // AAAA-MM-DD
  originalTeacherId: string;
  candidateTeacherId: string;
  status: ReplacementStatus;
  reason: string;
  requestedBy: string; // id de usuario
  requestedAt: string; // AAAA-MM-DD
  respondedAt?: string;
}

const hiitNorte = nextWeekday(5);
const muscNorte = nextWeekday(3, 1);
const yogaNorte = nextWeekday(4);

export const replacementsMock: Replacement[] = [
  // Pendientes (los ve el profesor candidato para aceptar o rechazar)
  {
    id: "rep_001",
    slotId: "sl_n09",
    date: hiitNorte,
    originalTeacherId: "tc_007",
    candidateTeacherId: "tc_001",
    status: "pending",
    reason: "Licencia por trámite personal del titular.",
    requestedBy: "us_en_002",
    requestedAt: daysAgo(2),
  },
  {
    id: "rep_002",
    slotId: "sl_n05",
    date: muscNorte,
    originalTeacherId: "tc_007",
    candidateTeacherId: "tc_001",
    status: "pending",
    reason: "Capacitación del titular.",
    requestedBy: "us_en_002",
    requestedAt: daysAgo(1),
  },
  {
    id: "rep_003",
    slotId: "sl_n08",
    date: yogaNorte,
    originalTeacherId: "tc_006",
    candidateTeacherId: "tc_002",
    status: "pending",
    reason: "Turno médico de la titular.",
    requestedBy: "us_en_002",
    requestedAt: daysAgo(1),
  },
  // Aceptados en semanas anteriores (ya impactan en cronograma y horas)
  {
    id: "rep_004",
    slotId: "sl_c05",
    date: lastWeekday(2, 2),
    originalTeacherId: "tc_004",
    candidateTeacherId: "tc_006",
    status: "accepted",
    reason: "Turno médico de la titular.",
    requestedBy: "us_en_001",
    requestedAt: addDays(lastWeekday(2, 2), -3),
    respondedAt: addDays(lastWeekday(2, 2), -2),
  },
  {
    id: "rep_005",
    slotId: "sl_n01",
    date: lastWeekday(1, 1),
    originalTeacherId: "tc_007",
    candidateTeacherId: "tc_001",
    status: "accepted",
    reason: "Vacaciones del titular.",
    requestedBy: "us_en_002",
    requestedAt: addDays(lastWeekday(1, 1), -5),
    respondedAt: addDays(lastWeekday(1, 1), -4),
  },
];

/** Un pedido es urgente si la clase es dentro de los próximos 3 días. */
export function isUrgent(
  replacement: Replacement,
  today = SEED_TODAY,
): boolean {
  return (
    replacement.status === "pending" && diffDays(today, replacement.date) <= 3
  );
}
