export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  variation: string;
  icon: string;
  iconColor: string;
  warning?: boolean;
}

export interface NewsEvent {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  timestamp: string;
  urgent?: boolean;
}

export const metricsMock: DashboardMetric[] = [
  {
    id: "m1",
    label: "ASISTENCIA HOY",
    value: "1,245",
    variation: "+5%",
    icon: "ti ti-users",
    iconColor: "text-primary",
  },
  {
    id: "m2",
    label: "NUEVOS SOCIOS",
    value: "18",
    variation: "+2%",
    icon: "ti ti-user-plus",
    iconColor: "text-primary",
  },
  {
    id: "m3",
    label: "INGRESOS (MES)",
    value: "$45.2K",
    variation: "+10%",
    icon: "ti ti-credit-card",
    iconColor: "text-primary",
  },
  {
    id: "m4",
    label: "INCIDENCIAS",
    value: "2",
    variation: "",
    icon: "ti ti-alert-triangle",
    iconColor: "text-danger",
    warning: true,
  },
];

export const newsMock: NewsEvent[] = [
  {
    id: "n1",
    icon: "ti ti-activity",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    title: "Pico de Acceso Detectado",
    description: "Zona de musculación reporta alta densidad.",
    timestamp: "Hace 10 min",
  },
  {
    id: "n2",
    icon: "ti ti-arrows-exchange",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    title: "Cambio de Turno Aprobado",
    description: "Clase de Crossfit PM reagendada al jueves.",
    timestamp: "Hace 45 min",
  },
  {
    id: "n3",
    icon: "ti ti-alert-triangle",
    iconBg: "bg-danger/10",
    iconColor: "text-danger",
    title: "Incidencia Reportada",
    description: "Cinta de correr #04 requiere mantenimiento.",
    timestamp: "Hace 2 horas",
    urgent: true,
  },
];
