import { clientsMock, type Client } from "@/data/clients";
import { paymentsMock, type Payment } from "@/data/payments";
import { attendanceMock, type StudentAttendance } from "@/data/attendance";
import {
  teacherAttendanceMock,
  type TeacherAttendance,
} from "@/data/teacherAttendance";
import { replacementsMock, type Replacement } from "@/data/replacements";
import { novedadesMock, type Novedad } from "@/data/novedades";
import { bitacorasMock, type Bitacora } from "@/data/bitacoras";
import type { ActivityEntry } from "./actions";

/**
 * Datos que cambian mientras se usa la app (los catálogos fijos, como planes,
 * sedes, profesores o el cronograma, se leen directo de `client/data/`).
 */
export interface AppState {
  clients: Client[];
  payments: Payment[];
  attendance: StudentAttendance[];
  teacherAttendance: TeacherAttendance[];
  replacements: Replacement[];
  novedades: Novedad[];
  bitacoras: Bitacora[];
  /** Registro de actividad: quién hizo qué y cuándo (en memoria). */
  activity: ActivityEntry[];
}

/** Estado inicial de la demo, armado con los mocks. */
export function createSeedState(): AppState {
  return {
    clients: [...clientsMock],
    payments: [...paymentsMock],
    attendance: [...attendanceMock],
    teacherAttendance: [...teacherAttendanceMock],
    replacements: [...replacementsMock],
    novedades: [...novedadesMock],
    bitacoras: [...bitacorasMock],
    activity: [],
  };
}
