import type { SidebarNavItem } from "@/components/common/SidebarNav";
import type { AppUserRole } from "@/data/users";

interface RoleNavConfig {
  panelName: string;
  items: SidebarNavItem[];
}

const roleNavigation: Record<AppUserRole, RoleNavConfig> = {
  secretario: {
    panelName: "secretaría",
    items: [
      {
        id: "members",
        label: "Gestión de alumnos",
        iconClassName: "ti ti-users",
        to: "/secretaria/alumnos",
        end: false,
      },
      {
        id: "access",
        label: "Control de acceso",
        iconClassName: "ti ti-door-enter",
        to: "/secretaria/acceso",
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
        to: "/secretaria/comunicaciones",
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
  encargado: {
    panelName: "encargado de sede",
    items: [
      {
        id: "staff-attendance",
        label: "Asistencia docente",
        iconClassName: "ti ti-calendar-check",
        to: "/encargado/asistencia",
      },
      {
        id: "news",
        label: "Novedades",
        iconClassName: "ti ti-speakerphone",
        to: "/encargado/novedades",
      },
      {
        id: "enrollments",
        label: "Inscripciones de mi sede",
        iconClassName: "ti ti-user-plus",
        to: "/encargado/inscripciones",
      },
    ],
  },
  admin: {
    panelName: "administración",
    items: [
      {
        id: "dashboard",
        label: "Inicio",
        iconClassName: "ti ti-dashboard",
        to: "/admin",
      },
      {
        id: "students",
        label: "Alumnos",
        iconClassName: "ti ti-users",
        to: "/admin/alumnos",
        end: false,
      },
      {
        id: "staff",
        label: "Gestión de personal",
        iconClassName: "ti ti-briefcase",
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
        label: "Mi plan y cronograma",
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
        label: "Reemplazos",
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

const EMPTY_NAV: RoleNavConfig = { panelName: "", items: [] };

/** Menú del rol. Un rol desconocido no recibe ningún ítem (antes caía en el de secretaría). */
export function getNavigationByRole(role?: string): RoleNavConfig {
  return role && role in roleNavigation
    ? roleNavigation[role as AppUserRole]
    : EMPTY_NAV;
}
