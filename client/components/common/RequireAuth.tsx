import * as React from "react";
import { Navigate } from "react-router-dom";
import { getMockSession } from "@/data/users";

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const session = getMockSession();

  if (!session) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
