import * as React from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/store/StoreProvider";
import { StudentStats } from "./StudentStats";
import { StudentsTable } from "./StudentsTable";

/** Inicio de secretaría: accesos rápidos, resumen y lista de alumnos. */
export function StudentsDashboard() {
  const state = useAppState();
  const [statusFilter, setStatusFilter] = React.useState("");

  return (
    <div className="flex flex-col gap-6 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Gestión de alumnos"
        subtitle="Buscá un alumno para ver su ficha, inscribí alumnos nuevos o cobrá cuotas."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/secretaria/acceso">
                <i className="ti ti-door-enter text-base" aria-hidden="true" />
                Control de acceso
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/secretaria/asistencia">
                <i className="ti ti-user-check text-base" aria-hidden="true" />
                Tomar asistencia
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/secretaria/cobros">
                <i className="ti ti-cash text-base" aria-hidden="true" />
                Cobrar cuota
              </Link>
            </Button>
            <Button asChild className="rounded-xl font-bold">
              <Link to="/secretaria/alumnos/nuevo">
                <i className="ti ti-user-plus text-base" aria-hidden="true" />
                Inscribir alumno
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
        basePath="/secretaria/alumnos"
      />
    </div>
  );
}
