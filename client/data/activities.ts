/** Actividades que se dictan en las sedes. Cada plan habilita algunas. */
export interface Activity {
  id: string;
  name: string;
}

export const activitiesMock: Activity[] = [
  { id: "ac_musc", name: "Musculación" },
  { id: "ac_cross", name: "Crossfit" },
  { id: "ac_func", name: "Funcional" },
  { id: "ac_hiit", name: "HIIT" },
  { id: "ac_spin", name: "Spinning" },
  { id: "ac_zumba", name: "Zumba" },
  { id: "ac_kick", name: "Kick boxing" },
  { id: "ac_yoga", name: "Yoga" },
];

export function getActivityName(activityId: string): string {
  return activitiesMock.find((a) => a.id === activityId)?.name ?? "Actividad";
}
