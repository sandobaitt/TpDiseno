import { clientsMock } from "./clients";
import { getPlan } from "./plans";
import { BRANCH_SECRETARY, SEED_PERIOD, seededPercent } from "./seed";
import { proratedAmount } from "@/domain/billing";
import { addMonths, dateInPeriod, periodRange, toPeriod } from "@/lib/dates";

/** Medios de pago aceptados por SquatGym (regla de negocio). */
export type PaymentMethod = "cash" | "debit" | "transfer" | "qr";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  debit: "Débito",
  transfer: "Transferencia",
  qr: "QR",
};

export type PaymentStatus = "approved" | "rejected" | "refunded";

/** Un pago registrado (en recepción o desde la app del alumno). Cada uno tiene su recibo. */
export interface Payment {
  id: string;
  receiptNumber: string;
  clientId: string;
  branchId: string;
  createdAt: string; // ISO con hora local
  /** Meses que cubre ("AAAA-MM"). */
  periods: string[];
  concept: "membership" | "other";
  description?: string;
  subtotalArs: number;
  discountArs: number;
  promoId?: string;
  /** Total cobrado. */
  amountArs: number;
  method: PaymentMethod;
  status: PaymentStatus;
  /** Id del usuario que lo registró, u "online" si lo pagó el alumno desde la app. */
  processedBy: string;
}

/**
 * Hasta qué mes pagó cada alumno, relativo al mes actual (0 = pagó el mes
 * actual, -1 = debe el mes actual, -2 = debe desde el mes pasado).
 * `null` = recién inscripto, todavía no pagó nada.
 */
const PAID_THROUGH: Record<string, number | null> = {
  cl_001: 0,
  cl_002: -2,
  cl_003: 0,
  cl_004: -2,
  cl_005: -1,
  cl_006: 0,
  cl_007: -1,
  cl_008: -2,
  cl_009: 0,
  cl_010: 0,
  cl_011: 0,
  cl_012: null,
  cl_013: null,
  cl_014: 0,
  cl_015: 0,
  cl_016: 0,
  cl_017: -1,
  cl_018: 0,
};

const METHODS: PaymentMethod[] = ["cash", "debit", "transfer", "qr"];

function buildPayments(): Payment[] {
  const payments: Payment[] = [];
  let receipt = 1000;

  for (const client of clientsMock) {
    const offset = PAID_THROUGH[client.id];
    const plan = getPlan(client.planId);
    if (offset === null || offset === undefined || !plan) continue;

    const first = toPeriod(client.enrolledAt);
    const last = addMonths(SEED_PERIOD, offset);
    if (first > last) continue;

    for (const period of periodRange(first, last)) {
      const isFirst = period === first;
      const amount = isFirst
        ? proratedAmount(plan.monthlyPriceArs, client.enrolledAt)
        : plan.monthlyPriceArs;
      const pick = seededPercent(client.id, period);
      const method = METHODS[pick % METHODS.length];
      const paidOnline = method !== "cash" && pick % 3 === 0;
      const day = isFirst
        ? client.enrolledAt
        : dateInPeriod(period, 1 + (pick % 5));
      const time = isFirst
        ? "10:30"
        : `${17 + (pick % 4)}:${String(pick % 60).padStart(2, "0")}`;
      receipt += 1;
      payments.push({
        id: `pay_${client.id}_${period}`,
        receiptNumber: `R-${String(receipt).padStart(6, "0")}`,
        clientId: client.id,
        branchId: client.branchId,
        createdAt: `${day}T${time}:00`,
        periods: [period],
        concept: "membership",
        description: isFirst
          ? `Cuota de alta (proporcional) · ${plan.name}`
          : `Cuota mensual · ${plan.name}`,
        subtotalArs: amount,
        discountArs: 0,
        amountArs: amount,
        method,
        status: "approved",
        processedBy: paidOnline ? "online" : BRANCH_SECRETARY[client.branchId],
      });
    }
  }

  // Un intento rechazado (transferencia que no se acreditó) de una alumna que hoy está bloqueada.
  const laura = clientsMock.find((c) => c.id === "cl_002")!;
  const lauraPlan = getPlan(laura.planId)!;
  const rejectedPeriod = addMonths(SEED_PERIOD, -1);
  payments.push({
    id: "pay_cl_002_rechazado",
    receiptNumber: `R-${String(receipt + 1).padStart(6, "0")}`,
    clientId: laura.id,
    branchId: laura.branchId,
    createdAt: `${dateInPeriod(rejectedPeriod, 3)}T12:40:00`,
    periods: [rejectedPeriod],
    concept: "membership",
    description: `Cuota mensual · ${lauraPlan.name}`,
    subtotalArs: lauraPlan.monthlyPriceArs,
    discountArs: 0,
    amountArs: lauraPlan.monthlyPriceArs,
    method: "transfer",
    status: "rejected",
    processedBy: "online",
  });

  return payments;
}

export const paymentsMock: Payment[] = buildPayments();
