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

  // Alumno (2)
  {
    id: "us_al_001",
    fullName: "Martín Rodríguez",
    email: "alumno1@email.com",
    dni: "34.567.890",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2026-02-12T14:20:00.000Z",
  },
  {
    id: "us_al_002",
    fullName: "Laura Gómez",
    email: "alumno2@email.com",
    dni: "38.123.456",
    role: "alumno",
    status: "active",
    password: "alumno123",
    createdAt: "2025-11-20T09:05:00.000Z",
  },

  // Profesor (2)
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
