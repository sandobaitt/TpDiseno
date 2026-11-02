import type { PaymentMethod } from "@/data/payments";

/**
 * Validación del pago con la Entidad Bancaria (actor externo de Registrar
 * Pagos, pasos 10 y 11). Participa cuando el medio de pago es digital; el
 * efectivo se cobra en recepción y no pasa por el banco.
 *
 * Es una simulación: no hay integración real. Para la demo se puede forzar el
 * rechazo (camino alternativo 11.b).
 */
export function needsBankValidation(method: PaymentMethod): boolean {
  return method !== "cash";
}

export interface BankResult {
  approved: boolean;
  /** Motivo informado por la entidad cuando rechaza el pago. */
  reason?: string;
}

export const BANK_REJECTION_REASON = "Fondos insuficientes";

export function validateWithBank(input: {
  method: PaymentMethod;
  amountArs: number;
  /** Solo para la demo: la entidad rechaza el pago. */
  simulateRejection?: boolean;
}): BankResult {
  if (!needsBankValidation(input.method)) return { approved: true };
  if (input.amountArs <= 0)
    return { approved: false, reason: "El monto no es válido" };
  if (input.simulateRejection)
    return { approved: false, reason: BANK_REJECTION_REASON };
  return { approved: true };
}
