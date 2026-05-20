export type AppUserRole = "admin" | "alumno" | "profesor" | "secretario";

export type AppUserStatus = "active" | "inactive";

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  dni: string;
  role: AppUserRole;
  status: AppUserStatus;
  /**
   * Solo para desarrollo/mocks. No usar en producción.
   */
  password: string;
  createdAt: string; // ISO
}

export const appUsersMock: AppUser[] = [
  // Admin (2)
  {
    id: "us_ad_001",
    fullName: "Valeria Montes",
    email: "admin1@squatgym.com",
    dni: "27.100.001",
    role: "admin",
    status: "active",
    password: "admin123",
    createdAt: "2025-09-01T09:00:00.000Z",
  },
  {
    id: "us_ad_002",
    fullName: "Federico Rivas",
    email: "admin2@squatgym.com",
    dni: "27.100.002",
    role: "admin",
    status: "active",
    password: "admin123",
    createdAt: "2025-10-15T12:00:00.000Z",
  },

  // Alumno (22)
  {
    id: "us_al_001",
    fullName: "Martina Gómez",
    email: "martina.gomez@email.com",
    dni: "34.567.890",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-02-12T14:20:00.000Z",
  },
  {
    id: "us_al_002",
    fullName: "Lucas Ferrari",
    email: "lucas.ferrari@email.com",
    dni: "38.123.456",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2025-11-20T09:05:00.000Z",
  },
  {
    id: "us_al_003",
    fullName: "Valentina Costa",
    email: "valentina.costa@email.com",
    dni: "32.987.654",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-01-03T12:00:00.000Z",
  },
  {
    id: "us_al_004",
    fullName: "Mateo Silva",
    email: "mateo.silva@email.com",
    dni: "40.111.222",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-02-28T08:00:00.000Z",
  },
  {
    id: "us_al_005",
    fullName: "Sofía Rodríguez",
    email: "sofia.rodriguez@email.com",
    dni: "36.555.777",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2025-12-10T11:00:00.000Z",
  },
  {
    id: "us_al_006",
    fullName: "Julián Torres",
    email: "julian.torres@email.com",
    dni: "33.444.111",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-01-18T16:00:00.000Z",
  },
  {
    id: "us_al_007",
    fullName: "Camila Rivas",
    email: "camila.rivas@email.com",
    dni: "31.999.333",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2025-09-05T07:30:00.000Z",
  },
  {
    id: "us_al_008",
    fullName: "Facundo Luna",
    email: "facundo.luna@email.com",
    dni: "35.222.888",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-03-01T09:30:00.000Z",
  },
  {
    id: "us_al_009",
    fullName: "Agustín Herrera",
    email: "agustin.herrera@email.com",
    dni: "37.777.444",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-04-15T13:00:00.000Z",
  },
  {
    id: "us_al_010",
    fullName: "Malena Acosta",
    email: "malena.acosta@email.com",
    dni: "30.888.555",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2025-10-22T15:00:00.000Z",
  },
  {
    id: "us_al_011",
    fullName: "Thiago Medina",
    email: "thiago.medina@email.com",
    dni: "39.111.666",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "us_al_012",
    fullName: "Isabella Roldán",
    email: "isabella.roldan@email.com",
    dni: "34.555.999",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-04-01T12:00:00.000Z",
  },
  {
    id: "us_al_013",
    fullName: "Benjamín Paz",
    email: "benjamin.paz@email.com",
    dni: "32.666.333",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2025-11-30T08:15:00.000Z",
  },
  {
    id: "us_al_014",
    fullName: "Emilia Arias",
    email: "emilia.arias@email.com",
    dni: "37.444.111",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2025-12-05T09:00:00.000Z",
  },
  {
    id: "us_al_015",
    fullName: "Santiago Maldonado",
    email: "santiago.maldonado@email.com",
    dni: "35.777.222",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-03-15T14:30:00.000Z",
  },
  {
    id: "us_al_016",
    fullName: "Francesca Russo",
    email: "francesca.russo@email.com",
    dni: "33.111.888",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-02-01T11:00:00.000Z",
  },
  {
    id: "us_al_017",
    fullName: "Nicolás Ferreyra",
    email: "nicolas.ferreyra@alumno.com",
    dni: "31.333.777",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-04-28T10:00:00.000Z",
  },
  {
    id: "us_al_018",
    fullName: "Zoe Quiroga",
    email: "zoe.quiroga@email.com",
    dni: "38.999.444",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-03-10T13:15:00.000Z",
  },
  {
    id: "us_al_019",
    fullName: "Bautista Lescano",
    email: "bautista.lescano@email.com",
    dni: "36.222.555",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-04-10T15:30:00.000Z",
  },
  {
    id: "us_al_020",
    fullName: "Catalina Palacios",
    email: "catalina.palacios@email.com",
    dni: "30.555.666",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2025-08-20T08:00:00.000Z",
  },
  {
    id: "us_al_021",
    fullName: "Lautaro Navarro",
    email: "lautaro.navarro@email.com",
    dni: "39.444.888",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-01-28T09:00:00.000Z",
  },
  {
    id: "us_al_022",
    fullName: "Brunela Vargas",
    email: "brunela.vargas@email.com",
    dni: "34.777.111",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-03-05T11:45:00.000Z",
  },

  // Profesor (5)
  {
    id: "us_pr_001",
    fullName: "Tomás Ibáñez",
    email: "profe1@squatgym.com",
    dni: "33.300.001",
    role: "profesor",
    status: "active",
    password: "profe123",
    createdAt: "2025-05-01T10:00:00.000Z",
  },
  {
    id: "us_pr_002",
    fullName: "Micaela Sosa",
    email: "profe2@squatgym.com",
    dni: "33.300.002",
    role: "profesor",
    status: "active",
    password: "profe123",
    createdAt: "2026-01-22T08:30:00.000Z",
  },
  {
    id: "us_pr_003",
    fullName: "Lautaro Roldán",
    email: "profe3@squatgym.com",
    dni: "31.500.789",
    role: "profesor",
    status: "active",
    password: "profe123",
    createdAt: "2025-11-10T14:00:00.000Z",
  },
  {
    id: "us_pr_004",
    fullName: "Valentina Méndez",
    email: "profe4@squatgym.com",
    dni: "34.888.222",
    role: "profesor",
    status: "active",
    password: "profe123",
    createdAt: "2026-03-05T09:00:00.000Z",
  },
  {
    id: "us_pr_005",
    fullName: "Gonzalo Paz",
    email: "profe5@squatgym.com",
    dni: "30.111.444",
    role: "profesor",
    status: "active",
    password: "profe123",
    createdAt: "2024-08-20T11:00:00.000Z",
  },

  // Secretario (2)
  {
    id: "us_se_001",
    fullName: "Nicolás Ferreyra",
    email: "secre1@squatgym.com",
    dni: "33.210.987",
    role: "secretario",
    status: "active",
    password: "secre123",
    createdAt: "2026-01-05T12:00:00.000Z",
  },
  {
    id: "us_se_002",
    fullName: "Camila Suárez",
    email: "secre2@squatgym.com",
    dni: "31.222.111",
    role: "secretario",
    status: "active",
    password: "secre123",
    createdAt: "2026-02-20T15:30:00.000Z",
  },
];

function normalizeDniDigits(dni: string) {
  return dni.replace(/\D/g, "");
}

export function findMockUserByEmailOrDni(emailOrDni: string) {
  const q = emailOrDni.trim().toLowerCase();
  const qDigits = normalizeDniDigits(emailOrDni);
  return appUsersMock.find((u) => {
    if (u.email.toLowerCase() === q) return true;
    if (qDigits.length === 0) return false;
    return normalizeDniDigits(u.dni) === qDigits;
  });
}

export const MOCK_SESSION_STORAGE_KEY = "squatgym_mock_session";

export type MockSessionPayload = Pick<
  AppUser,
  "id" | "fullName" | "email" | "role"
>;

export function saveMockSession(user: AppUser) {
  const payload: MockSessionPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
  localStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(payload));
}

export function clearMockSession() {
  localStorage.removeItem(MOCK_SESSION_STORAGE_KEY);
}

export function getMockSession(): MockSessionPayload | null {
  const raw = localStorage.getItem(MOCK_SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockSessionPayload;
  } catch {
    return null;
  }
}

export function getPostLoginPath(role: AppUserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "alumno":
      return "/alumno";
    case "profesor":
      return "/profesor/asistencia";
    case "secretario":
      return "/secretaria";
  }
}
