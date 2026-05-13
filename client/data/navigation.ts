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
        label: "Panel general",
        iconClassName: "ti ti-dashboard",
        to: "/admin",
      },
      {
        id: "members",
        label: "Gestión de socios",
        iconClassName: "ti ti-users",
        to: "/secretaria",
      },
      {
        id: "employees",
        label: "Empleados",
        iconClassName: "ti ti-users",
        disabled: true,
      },
      {
        id: "branches",
        label: "Sucursales",
        iconClassName: "ti ti-building",
        disabled: true,
      },
      {
        id: "plans",
        label: "Planes",
        iconClassName: "ti ti-tag",
        disabled: true,
      },
      {
        id: "reports",
        label: "Reportes",
        iconClassName: "ti ti-report",
        disabled: true,
      },
    ],
  },
  alumno: {
    panelName: "alumno",
    items: [
      {
        id: "profile",
        label: "Mi perfil",
        iconClassName: "ti ti-user",
        to: "/alumno",
      },
      {
        id: "plan",
        label: "Mi plan",
        iconClassName: "ti ti-barbell",
        disabled: true,
      },
      {
        id: "payments",
        label: "Pagos",
        iconClassName: "ti ti-credit-card",
        disabled: true,
      },
      {
        id: "attendance",
        label: "Asistencia",
        iconClassName: "ti ti-calendar-check",
        disabled: true,
      },
      {
        id: "schedule",
        label: "Horarios",
        iconClassName: "ti ti-calendar",
        disabled: true,
      },
    ],
  },
  profesor: {
    panelName: "profesor",
    items: [
      {
        id: "classes",
        label: "Mis clases",
        iconClassName: "ti ti-barbell",
        to: "/profesor",
      },
      {
        id: "students",
        label: "Mis alumnos",
        iconClassName: "ti ti-users",
        disabled: true,
      },
      {
        id: "attendance",
        label: "Asistencia",
        iconClassName: "ti ti-calendar-check",
        disabled: true,
      },
      {
        id: "schedule",
        label: "Horarios",
        iconClassName: "ti ti-calendar",
        disabled: true,
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
