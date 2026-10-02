import * as React from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/store/StoreProvider";
import { StudentStats } from "./StudentStats";
import { StudentsTable } from "./StudentsTable";

interface StudentsDashboardProps {
  /** Secretaría (inicio con accesos rápidos) o Administrador (ABM, CU 11). */
  variant?: "secretaria" | "admin";
}

/** Lista de alumnos con resumen. Secretaría la usa como inicio; el admin, para el ABM. */
export function StudentsDashboard({
  variant = "secretaria",
}: StudentsDashboardProps) {
  const state = useAppState();
  const [statusFilter, setStatusFilter] = React.useState("");
  const isAdmin = variant === "admin";
  const basePath = isAdmin ? "/admin/alumnos" : "/secretaria/alumnos";

  return (
    <div className="flex flex-col gap-6 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title={isAdmin ? "Alumnos" : "Gestión de alumnos"}
        subtitle={
          isAdmin
            ? "Alta, modificación y baja de alumnos de todas las sedes. Las bajas conservan el historial."
            : "Buscá un alumno para ver su ficha, inscribí alumnos nuevos o cobrá cuotas."
        }
        actions={
          <>
            {!isAdmin && (
              <>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/secretaria/acceso">
                    <i
                      className="ti ti-door-enter text-base"
                      aria-hidden="true"
                    />
                    Control de acceso
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/secretaria/asistencia">
                    <i
                      className="ti ti-user-check text-base"
                      aria-hidden="true"
                    />
                    Tomar asistencia
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/secretaria/cobros">
                    <i className="ti ti-cash text-base" aria-hidden="true" />
                    Cobrar cuota
                  </Link>
                </Button>
              </>
            )}
            <Button asChild className="rounded-xl font-bold">
              <Link to={`${basePath}/nuevo`}>
                <i className="ti ti-user-plus text-base" aria-hidden="true" />
                {isAdmin ? "Dar de alta" : "Inscribir alumno"}
              </Link>
            </Button>
          </>
        }
      />
      <StudentStats
        clients={state.clients}
        activeStatus={statusFilter}
        onStatusClick={setStatusFilter}
      />
      <StudentsTable
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        basePath={basePath}
      />
    </div>
  );
}
