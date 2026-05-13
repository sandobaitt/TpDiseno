export type NovedadType = "incident" | "change" | "normal";
export type NovedadEntity = "profesor" | "clase";
export type NovedadStatus = "resolved" | "in_progress" | "closed";

export interface Novedad {
  id: string;
  type: NovedadType;
  entityType: NovedadEntity;
  entityName: string;
  timestamp: string;
  detail: string;
  status: NovedadStatus;
}

export const novedadesMock: Novedad[] = [
  {
    id: "nov_001",
    type: "incident",
    entityType: "profesor",
    entityName: "Marcos Rojo (Crossfit AM)",
    timestamp: "2026-05-13T08:30:00",
    detail:
      "El profesor reportó que la barra olímpica del rack 3 tiene una deformación en el rodamiento central. Se aisló el equipo y se solicitó orden de reparación.",
    status: "resolved",
  },
  {
    id: "nov_002",
    type: "change",
    entityType: "clase",
    entityName: "Spinning PM",
    timestamp: "2026-05-12T14:15:00",
    detail:
      "Cambio de horario solicitado por la profesora Laura Giménez. La clase pasa de 18:00 a 19:30 los días martes y jueves por superposición con el torneo de la federación.",
    status: "in_progress",
  },
  {
    id: "nov_003",
    type: "normal",
    entityType: "profesor",
    entityName: "Lucía Méndez (Yoga)",
    timestamp: "2026-05-11T10:00:00",
    detail:
      "Se dio de alta a la nueva profesora de yoga con disponibilidad completa en sucursal Belgrano. Certificados y documentación verificada por recursos humanos.",
    status: "resolved",
  },
  {
    id: "nov_004",
    type: "incident",
    entityType: "clase",
    entityName: "Funcional Sala 2",
    timestamp: "2026-05-10T19:45:00",
    detail:
      "Filtración de agua en el techo de la sala 2 durante la tormenta. Se evacuó la clase y se cancelaron las actividades hasta nuevo aviso. Mantenimiento ya fue notificado.",
    status: "in_progress",
  },
  {
    id: "nov_005",
    type: "change",
    entityType: "profesor",
    entityName: "Gonzalo Pérez (Musculación)",
    timestamp: "2026-05-09T11:30:00",
    detail:
      "El profesor solicita cambio de sucursal de Palermo a Caballito por razones personales. Se evaluará disponibilidad de cupo en la sede solicitada.",
    status: "closed",
  },
  {
    id: "nov_006",
    type: "normal",
    entityType: "clase",
    entityName: "HIIT Intensivo",
    timestamp: "2026-05-08T07:00:00",
    detail:
      "Nueva clase HIIT agregada a la grilla semanal los lunes, miércoles y viernes a las 7:00 AM. Cupo máximo 20 personas. Instructora a cargo: Valentina Rossi.",
    status: "resolved",
  },
];
