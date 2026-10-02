import type { AppUserRole } from "@/data/users";

/**
 * Qué rol puede entrar a cada sección privada. Cada rol tiene su propio prefijo
 * de ruta; si una pantalla la usan dos roles (por ejemplo, Novedades), se
 * registra una ruta en cada prefijo.
 */
export const ROUTE_ROLES: { prefix: string; roles: AppUserRole[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/encargado", roles: ["encargado"] },
  { prefix: "/secretaria", roles: ["secretario"] },
  { prefix: "/profesor", roles: ["profesor"] },
  { prefix: "/alumno", roles: ["alumno"] },
];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/** true si el rol puede ver la ruta privada. Las rutas no registradas se niegan. */
export function canAccess(
  role: AppUserRole | undefined,
  pathname: string,
): boolean {
  if (!role) return false;
  const rule = ROUTE_ROLES.find((r) => matchesPrefix(pathname, r.prefix));
  return !!rule && rule.roles.includes(role);
}

/** Qué puede hacer cada rol en la ficha de un alumno. */
export interface StudentCapabilities {
  /** Modificar datos personales y la declaración jurada. */
  editData: boolean;
  /** Adjuntar y revisar certificados o autorizaciones. */
  manageDocuments: boolean;
  /** Ir a cobrar la cuota (CU 4). */
  collect: boolean;
  /** Aplicar o quitar una restricción de acceso manual (CU 5). */
  restrict: boolean;
  /** Dar de baja o reactivar (CU 11: solo el Administrador). */
  deactivate: boolean;
}

const NO_STUDENT_CAPABILITIES: StudentCapabilities = {
  editData: false,
  manageDocuments: false,
  collect: false,
  restrict: false,
  deactivate: false,
};

export function studentCapabilities(
  role: AppUserRole | undefined,
): StudentCapabilities {
  switch (role) {
    case "secretario":
      return {
        editData: true,
        manageDocuments: true,
        collect: true,
        restrict: true,
        deactivate: false,
      };
    case "admin":
      return {
        editData: true,
        manageDocuments: true,
        collect: false,
        restrict: false,
        deactivate: true,
      };
    default:
      // El encargado consulta (CU 12) y el resto no ve fichas de otros alumnos.
      return NO_STUDENT_CAPABILITIES;
  }
}
