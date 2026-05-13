export type TeacherStatus = "active" | "inactive";

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  dni: string;
  phone?: string;
  specialties: string[];
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
    specialties: ["Musculación", "Powerlifting", "HIIT"],
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
    specialties: ["Crossfit", "Funcional", "Yoga"],
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
    specialties: ["Boxeo", "Funcional", "HIIT"],
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
    specialties: ["Spinning", "Zumba", "Funcional"],
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
    specialties: ["Musculación", "Crossfit"],
    branchIds: ["br_002"],
    status: "inactive",
    hiredAt: "2024-08-20",
    createdAt: "2024-08-20T11:00:00.000Z",
  },
];
