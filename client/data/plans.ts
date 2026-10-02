export type PlanStatus = "active" | "archived";

export interface Plan {
  id: string;
  name: string;
  status: PlanStatus;
  description?: string;
  /** Precio mensual en ARS. */
  monthlyPriceArs: number;
  /** Actividades que habilita el plan (no todos los alumnos acceden a todas las clases). */
  activityIds: string[];
}

export const plansMock: Plan[] = [
  {
    id: "pl_001",
    name: "Pase Libre",
    status: "active",
    description:
      "Acceso ilimitado a musculación y a todas las clases, en cualquier sede.",
    monthlyPriceArs: 34990,
    activityIds: [
      "ac_musc",
      "ac_cross",
      "ac_func",
      "ac_hiit",
      "ac_spin",
      "ac_zumba",
      "ac_kick",
      "ac_yoga",
    ],
  },
  {
    id: "pl_002",
    name: "Musculación",
    status: "active",
    description: "Acceso a la sala de musculación.",
    monthlyPriceArs: 27990,
    activityIds: ["ac_musc"],
  },
  {
    id: "pl_003",
    name: "Crossfit",
    status: "active",
    description: "Clases de Crossfit, Funcional y HIIT (cupos limitados).",
    monthlyPriceArs: 39990,
    activityIds: ["ac_cross", "ac_func", "ac_hiit"],
  },
  {
    id: "pl_004",
    name: "Día de Prueba",
    status: "archived",
    description: "Plan promocional (no se vende actualmente).",
    monthlyPriceArs: 0,
    activityIds: ["ac_musc"],
  },
];

export function getPlan(planId?: string): Plan | undefined {
  return plansMock.find((p) => p.id === planId);
}
