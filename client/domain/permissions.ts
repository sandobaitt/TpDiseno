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
