export type PlanStatus = "active" | "archived";

export interface Plan {
  id: string;
  name: string;
  status: PlanStatus;
  description?: string;
  /** Precio mensual en ARS (para mocks) */
  monthlyPriceArs: number;
  /** Cantidad de días de gracia antes de marcar deudor (mocks) */
  graceDays: number;
}

export const plansMock: Plan[] = [
  {
    id: "pl_001",
    name: "Pase Libre",
    status: "active",
    description: "Acceso ilimitado a musculación y clases.",
    monthlyPriceArs: 34990,
    graceDays: 5,
  },
  {
    id: "pl_002",
    name: "Musculación",
    status: "active",
    description: "Acceso a sala de musculación.",
    monthlyPriceArs: 27990,
    graceDays: 5,
  },
  {
    id: "pl_003",
    name: "Crossfit",
    status: "active",
    description: "Acceso a clases de Crossfit (cupos limitados).",
    monthlyPriceArs: 39990,
    graceDays: 3,
  },
  {
    id: "pl_004",
    name: "Día de Prueba",
    status: "archived",
    description: "Plan promocional (no se vende actualmente).",
    monthlyPriceArs: 0,
    graceDays: 0,
  },
];

