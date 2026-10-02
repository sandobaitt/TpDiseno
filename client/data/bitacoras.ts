import { lastWeekday } from "./seed";

/** Observación de jornada de un profesor sobre su clase o un alumno (la ve el encargado). */
export interface Bitacora {
  id: string;
  teacherId: string;
  branchId: string;
  slotId?: string;
  title: string;
  content: string;
  clientId?: string;
  studentName?: string;
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
];
