import { lastWeekday } from "./seed";

/** Turno de la observación que carga secretaría (requisito 3.1.16). */
export type ObservationShift = "manana" | "tarde" | "noche";

export const SHIFT_LABELS: Record<ObservationShift, string> = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
};

/** Áreas del gimnasio a las que se puede asociar una observación de turno. */
export const OBSERVATION_AREAS = [
  "Recepción",
  "Sala de musculación",
  "Salón de clases",
  "Vestuarios",
  "Limpieza y mantenimiento",
  "Otra",
];

/**
 * Observación que ve el encargado de la sede (y el admin). Hay dos tipos:
 * - de jornada, escrita por un profesor sobre su clase o un alumno (CU 9 de Personal);
 * - de turno, escrita por secretaría sobre un área o una persona (requisito 3.1.16).
 */
export interface Bitacora {
  id: string;
  /** Profesor que la escribió (observación de jornada). */
  teacherId?: string;
  /** Usuario de secretaría que la escribió (observación de turno). */
  authorUserId?: string;
  branchId: string;
  slotId?: string;
  /** Fecha de la clase o del turno al que se refiere (AAAA-MM-DD). */
  date?: string;
  title: string;
  content: string;
  clientId?: string;
  studentName?: string;
  /** Solo las de secretaría: turno, área y profesor al que se refiere. */
  shift?: ObservationShift;
  area?: string;
  aboutTeacherId?: string;
  /** Además del encargado de la sede, le llega al administrador. */
  notifyAdmin?: boolean;
  createdAt: string; // ISO con hora local
}

export const bitacorasMock: Bitacora[] = [
  {
    id: "bit_001",
    teacherId: "tc_001",
    branchId: "br_001",
    slotId: "sl_c06",
    title: "Progresión en sentadilla",
    content:
      "Martín ya hace la sentadilla con buena técnica. Se le subió la carga. Hay que revisar la movilidad de tobillo de dos alumnos nuevos.",
    clientId: "cl_001",
    studentName: "Martín Rodríguez",
    createdAt: `${lastWeekday(3)}T10:05:00`,
  },
  {
    id: "bit_002",
    teacherId: "tc_002",
    branchId: "br_001",
    slotId: "sl_c07",
    title: "Molestia en la rodilla",
    content:
      "Carlos comentó molestias en la rodilla operada. Se reemplazaron los saltos por bicicleta y se le recomendó consultar a su médico.",
    clientId: "cl_003",
    studentName: "Carlos Silva",
    createdAt: `${lastWeekday(3)}T19:10:00`,
  },
  {
    id: "bit_003",
    teacherId: "tc_002",
    branchId: "br_001",
    slotId: "sl_c04",
    title: "Clase completa",
    content:
      "La clase de Funcional de las 7:00 se llenó (15/15). Conviene evaluar abrir otro horario temprano.",
    createdAt: `${lastWeekday(2)}T08:10:00`,
  },
  {
    id: "bit_004",
    authorUserId: "us_se_001",
    branchId: "br_001",
    date: lastWeekday(1),
    shift: "tarde",
    area: "Vestuarios",
    title: "Ducha del vestuario de hombres sin agua caliente",
    content:
      "Varios alumnos avisaron que la segunda ducha sale fría. Se puso un cartel. Hay que llamar al técnico.",
    notifyAdmin: true,
    createdAt: `${lastWeekday(1)}T17:40:00`,
  },
];
