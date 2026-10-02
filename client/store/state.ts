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
  };
}

/**
 * Estado de solo lectura que usan las pantallas hasta que se conecten al store
 * central (etapa E4).
 */
export const seedState: AppState = createSeedState();
