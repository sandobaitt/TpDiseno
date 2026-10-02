import { daysAgo } from "./seed";

/**
 * Tipos de novedad (CU 4 de Personal). "absence" se crea desde la app; la
 * semilla usa solo los tres tipos que conoce el panel del admin (otro grupo).
 */
export type NovedadType = "absence" | "incident" | "change" | "normal";

export const NOVEDAD_TYPE_LABELS: Record<NovedadType, string> = {
  absence: "Ausencia",
  incident: "Incidente",
  change: "Cambio de turno",
  normal: "General",
};

export const NOVEDAD_STATUS_LABELS: Record<NovedadStatus, string> = {
  in_progress: "En curso",
  resolved: "Resuelta",
  closed: "Cerrada",
};
export type NovedadEntity = "profesor" | "clase";
export type NovedadStatus = "resolved" | "in_progress" | "closed";

export interface Novedad {
  id: string;
  type: NovedadType;
  entityType: NovedadEntity;
  /** Id del profesor o del slot de clase vinculado, si se eligió de la lista. */
  entityId?: string;
  entityName: string;
  /** Sede donde ocurrió (el encargado ve solo las de su sede). */
  branchId: string;
  timestamp: string; // ISO con hora local
  detail: string;
  status: NovedadStatus;
  /** Id del usuario que la registró. */
  createdBy: string;
  /** Si se avisa al profesor involucrado (le aparece en su campana). */
  notifyTeacher?: boolean;
  /** Las novedades no se borran: se anulan con motivo (queda en el historial). */
  annulled?: { by: string; at: string; reason: string };
}

export const novedadesMock: Novedad[] = [
  {
    id: "nov_001",
    type: "incident",
    entityType: "clase",
    entityId: "sl_c01",
    entityName: "Musculación · Centro",
    branchId: "br_001",
    timestamp: `${daysAgo(1)}T09:15:00`,
    detail:
      "Se cortó el cable de la polea alta. Se dejó fuera de servicio y se pidió la reparación.",
    status: "in_progress",
    createdBy: "us_se_001",
  },
  {
    id: "nov_002",
    type: "change",
    entityType: "profesor",
    entityId: "tc_007",
    entityName: "Diego Ferraro",
    branchId: "br_002",
    timestamp: `${daysAgo(2)}T11:30:00`,
    detail:
      "Diego pidió licencia por un trámite personal. Se le pidió a Tomás Ibáñez que cubra el HIIT del viernes 09:00.",
    status: "in_progress",
    createdBy: "us_en_002",
  },
  {
    id: "nov_003",
    type: "normal",
    entityType: "profesor",
    entityId: "tc_006",
    entityName: "Carla Benítez",
    branchId: "br_002",
    timestamp: `${daysAgo(5)}T18:00:00`,
    detail:
      "Carla toma también la clase de Yoga de los jueves 19:30. Documentación verificada.",
    status: "resolved",
    createdBy: "us_en_002",
  },
  {
    id: "nov_004",
    type: "incident",
    entityType: "clase",
    entityId: "sl_c09",
    entityName: "Zumba · Centro",
    branchId: "br_001",
    timestamp: `${daysAgo(9)}T19:40:00`,
    detail:
      "Corte de luz durante la clase. Se terminó 20 minutos antes y se avisó a los alumnos.",
    status: "resolved",
    createdBy: "us_se_001",
  },
  {
    id: "nov_005",
    type: "change",
    entityType: "clase",
    entityId: "sl_c03",
    entityName: "Spinning · Centro",
    branchId: "br_001",
    timestamp: `${daysAgo(12)}T10:00:00`,
    detail:
      "La clase de los lunes pasa de 19:00 a 19:15 por un cambio de turno de la sala.",
    status: "closed",
    createdBy: "us_en_001",
  },
  {
    id: "nov_006",
    type: "normal",
    entityType: "profesor",
    entityId: "tc_004",
    entityName: "Valentina Méndez",
    branchId: "br_001",
    timestamp: `${daysAgo(16)}T08:30:00`,
    detail:
      "Valentina tiene turno médico el martes. La reemplaza Carla Benítez en Zumba.",
    status: "resolved",
    createdBy: "us_en_001",
  },
];
