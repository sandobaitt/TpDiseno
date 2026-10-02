import type { Client } from "@/data/clients";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/data/payments";
import type { Promotion } from "@/data/promotions";
import { formatDate, monthsBetween, toPeriod } from "@/lib/dates";
import { normalizeText } from "@/lib/format";

/**
 * Promociones al cobrar (CU 9): vigencia, cupones, plan familiar y
 * condiciones (medio de pago, antigüedad, cantidad de cuotas). Se aplica
 * una sola promoción por cobro (no se acumulan).
 */

export interface PromotionContext {
  client: Client;
  clients: Client[];
  method: PaymentMethod;
  /** Meses que se están cobrando ("AAAA-MM"). */
  periods: string[];
  today: string;
}

export interface PromotionCheck {
  ok: boolean;
  /** Por qué no se puede aplicar (en lenguaje simple). */
  reason?: string;
  /** Aclaración cuando sí se puede (ej. con qué familiar). */
  detail?: string;
}

/** Activa y dentro de sus fechas. */
export function isPromotionCurrent(promo: Promotion, today: string): boolean {
  return (
    promo.active &&
    (!promo.validFrom || today >= promo.validFrom) &&
    (!promo.validTo || today <= promo.validTo)
  );
}

/** ¿Se puede aplicar a este cobro? Si no, explica por qué. */
export function checkPromotion(
  promo: Promotion,
  ctx: PromotionContext,
): PromotionCheck {
  if (!promo.active) return { ok: false, reason: "No está activa." };
  if (promo.validFrom && ctx.today < promo.validFrom)
    return { ok: false, reason: `Empieza el ${formatDate(promo.validFrom)}.` };
  if (promo.validTo && ctx.today > promo.validTo)
    return { ok: false, reason: `Venció el ${formatDate(promo.validTo)}.` };
  if (promo.method && ctx.method !== promo.method)
    return {
      ok: false,
      reason: `Solo pagando en ${PAYMENT_METHOD_LABELS[promo.method].toLowerCase()}.`,
    };
  if (promo.minMonthsEnrolled) {
    const months = monthsBetween(ctx.client.enrolledAt, ctx.today);
    if (months < promo.minMonthsEnrolled)
      return {
        ok: false,
        reason: `Pide ${promo.minMonthsEnrolled} meses de antigüedad (tiene ${months}).`,
      };
  }
  if (promo.minPeriods && ctx.periods.length < promo.minPeriods)
    return {
      ok: false,
      reason: `Hay que cobrar ${promo.minPeriods} cuotas juntas.`,
    };
  if (
    promo.enrollmentOnly &&
    !ctx.periods.includes(toPeriod(ctx.client.enrolledAt))
  )
    return { ok: false, reason: "Solo para la cuota de alta." };
  if (promo.family) {
    const relatives = ctx.client.familyGroupId
      ? ctx.clients.filter(
          (c) =>
            c.id !== ctx.client.id &&
            c.status === "active" &&
            c.familyGroupId === ctx.client.familyGroupId,
        )
      : [];
    if (relatives.length === 0)
      return {
        ok: false,
        reason: "No tiene otro familiar activo en el gimnasio.",
      };
    return {
      ok: true,
      detail: `Familia: ${relatives.map((r) => r.fullName).join(", ")}`,
    };
  }
  return { ok: true };
}

/** Descuento en pesos, redondeado. */
export function promotionDiscount(promo: Promotion, subtotal: number): number {
  return Math.round((subtotal * promo.percent) / 100);
}

/** Cupón por código, sin importar mayúsculas ni espacios. */
export function findCoupon(
  promotions: Promotion[],
  code: string,
): Promotion | undefined {
  const wanted = normalizeText(code).replace(/\s+/g, "");
  if (!wanted) return undefined;
  return promotions.find(
    (p) => p.code && normalizeText(p.code).replace(/\s+/g, "") === wanted,
  );
}

/** Las que se muestran para elegir: vigentes y sin código (los cupones se escriben). */
export function listedPromotions(
  promotions: Promotion[],
  today: string,
): Promotion[] {
  return promotions.filter((p) => !p.code && isPromotionCurrent(p, today));
}
