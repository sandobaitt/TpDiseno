export type PaymentMethod = "cash" | "debit" | "credit" | "transfer" | "mp";
export type PaymentStatus = "approved" | "pending" | "rejected" | "refunded";

/**
 * Pago de un cliente, procesado/cargado por un empleado (caja / recepción).
 */
export interface Payment {
  id: string;
  branchId: string;
  clientId: string;
  processedByEmployeeId: string;
  createdAt: string; // ISO
  period?: {
    from: string; // ISO date
    to: string; // ISO date
  };
  concept: "membership" | "product" | "fee" | "other";
  description?: string;
  amountArs: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string; // nro operación / comprobante
}

export const paymentsMock: Payment[] = [
  {
    id: "pay_001",
    branchId: "br_001",
    clientId: "cl_001",
    processedByEmployeeId: "em_002",
    createdAt: "2026-05-01T14:05:00.000Z",
    period: { from: "2026-05-01", to: "2026-05-31" },
    concept: "membership",
    description: "Renovación Pase Libre",
    amountArs: 34990,
    method: "debit",
    status: "approved",
    reference: "POS-104455",
  },
  {
    id: "pay_002",
    branchId: "br_002",
    clientId: "cl_002",
    processedByEmployeeId: "em_003",
    createdAt: "2026-04-02T12:40:00.000Z",
    period: { from: "2026-04-01", to: "2026-04-30" },
    concept: "membership",
    description: "Renovación Musculación",
    amountArs: 27990,
    method: "cash",
    status: "rejected",
    reference: "CAJA-000221",
  },
  {
    id: "pay_003",
    branchId: "br_001",
    clientId: "cl_003",
    processedByEmployeeId: "em_001",
    createdAt: "2026-04-15T09:10:00.000Z",
    period: { from: "2026-04-15", to: "2026-05-14" },
    concept: "membership",
    description: "Alta Crossfit",
    amountArs: 39990,
    method: "transfer",
    status: "approved",
    reference: "TRX-993821",
  },
  {
    id: "pay_004",
    branchId: "br_001",
    clientId: "cl_001",
    processedByEmployeeId: "em_002",
    createdAt: "2026-05-06T19:22:00.000Z",
    concept: "product",
    description: "Venta de agua + barra",
    amountArs: 4500,
    method: "mp",
    status: "approved",
    reference: "MP-551201",
  },
  {
    id: "pay_005",
    branchId: "br_003",
    clientId: "cl_004",
    processedByEmployeeId: "em_002",
    createdAt: "2026-03-10T11:00:00.000Z",
    concept: "other",
    description: "Reactivación / cargo administrativo",
    amountArs: 5000,
    method: "cash",
    status: "refunded",
    reference: "CAJA-000198",
  },
];

