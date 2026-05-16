import type { SidebarNavItem } from "@/components/common/SidebarNav";
import type { AppUserRole } from "@/data/users";

interface RoleNavConfig {
  panelName: string;
  items: SidebarNavItem[];
}

const roleNavigation: Record<string, RoleNavConfig> = {
  secretario: {
    panelName: "secretaría",
    items: [
      {
        id: "members",
        label: "Gestión de socios",
        iconClassName: "ti ti-users",
        to: "/secretaria",
      },
      {
        id: "checkins",
        label: "Control de asistencia",
        iconClassName: "ti ti-user-check",
        to: "/secretaria/asistencia",
      },
      {
        id: "billing",
        label: "Cobros y facturación",
        iconClassName: "ti ti-credit-card",
        to: "/secretaria/cobros",
      },
      {
        id: "kiosk",
        label: "Kiosco",
        iconClassName: "ti ti-shopping-cart",
        disabled: true,
      },
      {
        id: "comms",
        label: "Comunicaciones",
        iconClassName: "ti ti-message",
        disabled: true,
      },
      {
        id: "schedule",
        label: "Cronogramas",
        iconClassName: "ti ti-calendar",
        disabled: true,
      },
      {
        id: "news",
        label: "Novedades",
        iconClassName: "ti ti-speakerphone",
        to: "/secretaria/novedades",
      },
    ],
  },
  admin: {
    panelName: "administración",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        iconClassName: "ti ti-dashboard",
        to: "/admin",
      },
      {
        id: "staff",
        label: "Gestión de personal",
        iconClassName: "ti ti-users",
        to: "/admin/personal",
      },
      {
        id: "attendance",
        label: "Asistencia",
        iconClassName: "ti ti-calendar-check",
        to: "/admin/asistencia",
      },
      {
        id: "news",
        label: "Historial de novedades",
        iconClassName: "ti ti-speakerphone",
        to: "/admin/novedades",
      },
    ],
  },
  alumno: {
    panelName: "alumno",
    items: [
      {
        id: "schedule",
        label: "Cronograma de clases",
        iconClassName: "ti ti-calendar",
        to: "/alumno/cronograma",
      },
      {
        id: "payments",
        label: "Pagos",
        iconClassName: "ti ti-credit-card",
        to: "/alumno/pagos",
      },
      {
        id: "profile",
        label: "Mi perfil y asistencia",
        iconClassName: "ti ti-user",
        to: "/alumno",
      },
      {
        id: "settings",
        label: "Ajustes y alertas",
        iconClassName: "ti ti-settings",
        to: "/alumno/ajustes",
      },
    ],
  },
  profesor: {
    panelName: "profesor",
    items: [
      {
        id: "schedule",
        label: "Cronograma",
        iconClassName: "ti ti-calendar",
        to: "/profesor/cronograma",
      },
      {
        id: "students",
        label: "Asistencia y alumnos",
        iconClassName: "ti ti-users",
        to: "/profesor/asistencia",
      },
      {
        id: "replacements",
        label: "Reemplazos y novedades",
        iconClassName: "ti ti-arrows-exchange",
        to: "/profesor/reemplazos",
      },
      {
        id: "hours",
        label: "Mis horas",
        iconClassName: "ti ti-clock",
        to: "/profesor/horas",
      },
    ],
  },
};

export function getNavigationByRole(role?: string): RoleNavConfig {
  const normalized = role === "secretaria" ? "secretario" : role;
  if (normalized && normalized in roleNavigation) {
    return roleNavigation[normalized];
  }
  return roleNavigation.secretario;
}
