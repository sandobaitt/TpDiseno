export type TeacherStatus = "active" | "inactive";

/** Todo el personal docente son profesores, empleados o contratados (escenario). */
export type ContractType = "employee" | "contractor";

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  employee: "Empleado",
  contractor: "Contratado",
};

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  dni: string;
  phone?: string;
  contractType: ContractType;
  /** Actividades que puede dictar. */
  activityIds: string[];
  branchIds: string[];
  status: TeacherStatus;
  /** Usuario del sistema, si tiene. */
  userId?: string;
  hiredAt: string; // AAAA-MM-DD
}

export const teachersMock: Teacher[] = [
  {
    id: "tc_001",
    fullName: "Tomás Ibáñez",
    email: "tomas.ibanez@squatgym.com",
    dni: "33.300.001",
    phone: "+54 11 5555-0301",
    contractType: "employee",
    activityIds: ["ac_musc", "ac_hiit"],
    branchIds: ["br_001", "br_002"],
    status: "active",
    userId: "us_pr_001",
    hiredAt: "2025-05-01",
  },
  {
    id: "tc_002",
    fullName: "Micaela Sosa",
    email: "micaela.sosa@squatgym.com",
    dni: "33.300.002",
    phone: "+54 11 5555-0302",
    contractType: "employee",
    activityIds: ["ac_cross", "ac_func", "ac_yoga"],
    branchIds: ["br_001"],
    status: "active",
    userId: "us_pr_002",
    hiredAt: "2026-01-22",
  },
  {
    id: "tc_003",
    fullName: "Lautaro Roldán",
    email: "lautaro.roldan@squatgym.com",
    dni: "31.500.789",
    phone: "+54 11 5555-0303",
    contractType: "contractor",
    activityIds: ["ac_kick", "ac_func"],
    branchIds: ["br_002"],
    status: "active",
    hiredAt: "2025-11-10",
  },
  {
    id: "tc_004",
    fullName: "Valentina Méndez",
    email: "valentina.mendez@squatgym.com",
    dni: "34.888.222",
    phone: "+54 11 5555-0304",
    contractType: "contractor",
    activityIds: ["ac_spin", "ac_zumba"],
    branchIds: ["br_001"],
    status: "active",
    hiredAt: "2026-03-05",
  },
  {
    id: "tc_005",
    fullName: "Gonzalo Paz",
    email: "gonzalo.paz@squatgym.com",
    dni: "30.111.444",
    contractType: "employee",
    activityIds: ["ac_musc", "ac_cross"],
    branchIds: ["br_002"],
    status: "inactive",
    hiredAt: "2024-08-20",
  },
  {
    id: "tc_006",
    fullName: "Carla Benítez",
    email: "carla.benitez@squatgym.com",
    dni: "35.210.640",
    phone: "+54 11 5555-0306",
    contractType: "contractor",
    activityIds: ["ac_zumba", "ac_yoga"],
    branchIds: ["br_002"],
    status: "active",
    hiredAt: "2025-09-15",
  },
  {
    id: "tc_007",
    fullName: "Diego Ferraro",
    email: "diego.ferraro@squatgym.com",
    dni: "29.654.321",
    phone: "+54 11 5555-0307",
    contractType: "employee",
    activityIds: ["ac_musc", "ac_hiit"],
    branchIds: ["br_002"],
    status: "active",
    hiredAt: "2024-03-01",
  },
];

export function getTeacher(teacherId?: string): Teacher | undefined {
  return teachersMock.find((t) => t.id === teacherId);
}
