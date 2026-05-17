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
    iconColor: "text-lime-400",
  },
  {
    id: "m2",
    label: "NUEVOS SOCIOS",
    value: "18",
    variation: "+2%",
    icon: "ti ti-user-plus",
    iconColor: "text-lime-400",
  },
  {
    id: "m3",
    label: "INGRESOS (MES)",
    value: "$45.2K",
    variation: "+10%",
    icon: "ti ti-credit-card",
    iconColor: "text-lime-400",
  },
  {
    id: "m4",
    label: "INCIDENCIAS",
    value: "2",
    variation: "",
    icon: "ti ti-alert-triangle",
    iconColor: "text-red-400",
    warning: true,
  },
];

export const newsMock: NewsEvent[] = [
  {
    id: "n1",
    icon: "ti ti-activity",
    iconBg: "bg-lime-400/10",
    iconColor: "text-lime-400",
    title: "Pico de Acceso Detectado",
    description: "Zona de musculación reporta alta densidad.",
    timestamp: "Hace 10 min",
  },
  {
    id: "n2",
    icon: "ti ti-arrows-exchange",
    iconBg: "bg-amber-400/10",
    iconColor: "text-amber-400",
    title: "Cambio de Turno Aprobado",
    description: "Clase de Crossfit PM reagendada al jueves.",
    timestamp: "Hace 45 min",
  },
  {
    id: "n3",
    icon: "ti ti-alert-triangle",
    iconBg: "bg-red-950/30",
    iconColor: "text-red-400",
    title: "Incidencia Reportada",
    description: "Cinta de correr #04 requiere mantenimiento.",
    timestamp: "Hace 2 horas",
    urgent: true,
  },
];
