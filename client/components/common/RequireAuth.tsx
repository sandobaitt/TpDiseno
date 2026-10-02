import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getMockSession } from "@/data/users";
import { canAccess } from "@/domain/permissions";

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Protege las rutas privadas: exige sesión y que el rol tenga permiso para la
 * ruta actual (reglas en `domain/permissions.ts`).
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const session = getMockSession();
  const { pathname } = useLocation();

  if (!session || !canAccess(session.role, pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
