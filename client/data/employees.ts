export type EmployeeRole =
  | "reception"
  | "manager"
  | "trainer"
  | "accounting"
  | "admin";

export type EmployeeStatus = "active" | "inactive";

/**
 * Personal administrativo de las sedes (secretaría y encargados). Los
 * profesores están en `teachers.ts`. Coincide con los usuarios de `users.ts`.
 */
export interface Employee {
  id: string;
  branchId: string;
  fullName: string;
  email: string;
  dni?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  createdAt: string; // ISO
}

export const employeesMock: Employee[] = [
  {
    id: "em_001",
    branchId: "br_001",
    fullName: "Adrián López",
    email: "encargado1@squatgym.com",
    dni: "28.400.001",
    role: "manager",
    status: "active",
    createdAt: "2025-08-01T09:00:00.000Z",
  },
  {
    id: "em_002",
    branchId: "br_001",
    fullName: "Nicolás Ferreyra",
    email: "secre1@squatgym.com",
    dni: "33.210.987",
    role: "reception",
    status: "active",
    createdAt: "2026-01-05T12:00:00.000Z",
  },
  {
    id: "em_003",
    branchId: "br_002",
    fullName: "Camila Suárez",
    email: "secre2@squatgym.com",
    dni: "31.222.111",
    role: "reception",
    status: "active",
    createdAt: "2026-02-20T15:30:00.000Z",
  },
  {
    id: "em_004",
    branchId: "br_002",
    fullName: "Susana García",
    email: "encargado2@squatgym.com",
    dni: "28.400.002",
    role: "manager",
    status: "active",
    createdAt: "2025-08-01T09:00:00.000Z",
  },
];
