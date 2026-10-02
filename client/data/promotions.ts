import type { PaymentMethod } from "./payments";
import { daysAgo, daysAhead } from "./seed";

/**
 * Promociones y descuentos que se pueden aplicar al cobrar (CU 9).
 * La configuración (alta, baja y modificación) es del módulo de otro grupo
 * (Admin → Finanzas): por eso los ids dc1…dc5 coinciden con su lista. Este
 * archivo es la única fuente que lee el cobro.
 */
export interface Promotion {
  id: string;
  name: string;
  description: string;
  /** Descuento sobre el subtotal, en %. */
  percent: number;
  active: boolean;
  /** Vigencia (AAAA-MM-DD, inclusive). Sin fechas: vale mientras esté activa. */
  validFrom?: string;
  validTo?: string;
  /** Cupón: se aplica escribiendo este código. */
  code?: string;
  /** Solo pagando con este medio. */
  method?: PaymentMethod;
  /** Antigüedad mínima del alumno, en meses. */
  minMonthsEnrolled?: number;
  /** Cantidad mínima de cuotas en el mismo pago (ej. semestral). */
  minPeriods?: number;
  /** Plan familiar: otro integrante de la familia tiene que estar activo. */
  family?: boolean;
  /** Solo para la cuota de alta (el mes de inscripción). */
  enrollmentOnly?: boolean;
}

export const promotionsMock: Promotion[] = [
  {
    id: "dc1",
    name: "Pago en efectivo",
    description: "10% abonando en efectivo en recepción.",
    percent: 10,
    active: true,
    method: "cash",
  },
  {
    id: "dc2",
    name: "Referido",
    description: "5% para quien viene recomendado por otro alumno.",
    percent: 5,
    active: true,
  },
  {
    id: "dc3",
    name: "Alumno con más de un año",
    description: "15% con un año o más de antigüedad.",
    percent: 15,
    active: true,
    minMonthsEnrolled: 12,
  },
  {
    id: "dc4",
    name: "Cuota semestral",
    description: "20% pagando 6 cuotas juntas.",
    percent: 20,
    active: true,
    minPeriods: 6,
  },
  {
    id: "dc5",
    name: "Primer mes",
    description: "25% en la cuota de alta (pausada por administración).",
    percent: 25,
    active: false,
    enrollmentOnly: true,
  },
  {
    id: "pf1",
    name: "Plan familiar",
    description: "10% si otro integrante de la familia entrena en SquatGym.",
    percent: 10,
    active: true,
    family: true,
  },
  {
    id: "pr1",
    name: "Promo de temporada",
    description: "12% en cualquier cuota mientras dure la campaña.",
    percent: 12,
    active: true,
    validFrom: daysAgo(12),
    validTo: daysAhead(29),
  },
  {
    id: "cp1",
    name: "Cupón TRAEUNAMIGO",
    description: "10% con el código de la campaña de referidos.",
    percent: 10,
    active: true,
    code: "TRAEUNAMIGO",
    validTo: daysAhead(60),
  },
  {
    id: "cp2",
    name: "Cupón INVIERNO",
    description: "20% de la campaña de invierno.",
    percent: 20,
    active: true,
    code: "INVIERNO",
    validFrom: daysAgo(120),
    validTo: daysAgo(30),
  },
];

export function getPromotion(id?: string): Promotion | undefined {
  return promotionsMock.find((p) => p.id === id);
}
