export type CheckInMethod = "qr" | "manual" | "turnstile";

/**
 * Registro de asistencia. Útil para métricas y para probar tablas/listados.
 */
export interface CheckIn {
  id: string;
  branchId: string;
  clientId: string;
  method: CheckInMethod;
  createdAt: string; // ISO
  createdByEmployeeId?: string; // si fue manual
}

export const checkinsMock: CheckIn[] = [
  {
    id: "chk_001",
    branchId: "br_001",
    clientId: "cl_001",
    method: "qr",
    createdAt: "2026-05-07T11:30:00.000Z",
  },
  {
    id: "chk_002",
    branchId: "br_001",
    clientId: "cl_003",
    method: "turnstile",
    createdAt: "2026-05-06T22:15:00.000Z",
  },
  {
    id: "chk_003",
    branchId: "br_002",
    clientId: "cl_002",
    method: "manual",
    createdAt: "2026-05-04T16:10:00.000Z",
    createdByEmployeeId: "em_003",
  },
];

