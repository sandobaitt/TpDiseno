export type TeacherStatus = "active" | "inactive";

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  dni: string;
  phone?: string;
  /** IDs que referencian workoutTypesMock */
  specialtyIds: string[];
  branchIds: string[];
  status: TeacherStatus;
  hiredAt: string; // ISO
  createdAt: string; // ISO
}

export const teachersMock: Teacher[] = [
  {
    id: "tc_001",
    fullName: "Tomás Ibáñez",
    email: "tomas.ibanez@squatgym.com",
    dni: "33.300.001",
    phone: "+54 11 5555-0301",
    specialtyIds: ["wt_001", "wt_002", "wt_005"],
    branchIds: ["br_001", "br_002"],
    status: "active",
    hiredAt: "2025-05-01",
    createdAt: "2025-05-01T10:00:00.000Z",
  },
  {
    id: "tc_002",
    fullName: "Micaela Sosa",
    email: "micaela.sosa@squatgym.com",
    dni: "33.300.002",
    phone: "+54 11 5555-0302",
    specialtyIds: ["wt_003", "wt_004", "wt_006", "wt_011"],
    branchIds: ["br_001"],
    status: "active",
    hiredAt: "2026-01-22",
    createdAt: "2026-01-22T08:30:00.000Z",
  },
  {
    id: "tc_003",
    fullName: "Lautaro Roldán",
    email: "lautaro.roldan@squatgym.com",
    dni: "31.500.789",
    phone: "+54 11 5555-0303",
    specialtyIds: ["wt_008", "wt_006", "wt_005"],
    branchIds: ["br_002", "br_003"],
    status: "active",
    hiredAt: "2025-11-10",
    createdAt: "2025-11-10T14:00:00.000Z",
  },
  {
    id: "tc_004",
    fullName: "Valentina Méndez",
    email: "valentina.mendez@squatgym.com",
    dni: "34.888.222",
    phone: "+54 11 5555-0304",
    specialtyIds: ["wt_009", "wt_010", "wt_012", "wt_006"],
    branchIds: ["br_001", "br_003"],
    status: "active",
    hiredAt: "2026-03-05",
    createdAt: "2026-03-05T09:00:00.000Z",
  },
  {
    id: "tc_005",
    fullName: "Gonzalo Paz",
    email: "gonzalo.paz@squatgym.com",
    dni: "30.111.444",
    specialtyIds: ["wt_001", "wt_003"],
    branchIds: ["br_002"],
    status: "inactive",
    hiredAt: "2024-08-20",
    createdAt: "2024-08-20T11:00:00.000Z",
  },
];
