export type EmployeeRole =
  | "reception"
  | "manager"
  | "trainer"
  | "accounting"
  | "admin";

export type EmployeeStatus = "active" | "inactive";

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
    fullName: "Sofía López",
    email: "sofia.lopez@squatgym.com",
    dni: "29.876.543",
    role: "manager",
    status: "active",
    createdAt: "2025-08-10T09:00:00.000Z",
  },
  {
    id: "em_002",
    branchId: "br_001",
    fullName: "Nicolás Ferreyra",
    email: "nicolas.ferreyra@squatgym.com",
    dni: "33.210.987",
    role: "reception",
    status: "active",
    createdAt: "2026-01-05T12:00:00.000Z",
  },
  {
    id: "em_003",
    branchId: "br_002",
    fullName: "Camila Suárez",
    email: "camila.suarez@squatgym.com",
    dni: "31.222.111",
    role: "reception",
    status: "active",
    createdAt: "2026-02-20T15:30:00.000Z",
  },
  {
    id: "em_004",
    branchId: "br_002",
    fullName: "Tomás Ibáñez",
    email: "tomas.ibanez@squatgym.com",
    role: "trainer",
    status: "inactive",
    createdAt: "2025-05-01T10:00:00.000Z",
  },
];

