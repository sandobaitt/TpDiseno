import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";
import { todayISO } from "@/lib/dates";
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
  const actions = useStoreActions();
  const [statusFilter, setStatusFilter] = React.useState("");
  const isAdmin = variant === "admin";
  const basePath = isAdmin ? "/admin/alumnos" : "/secretaria/alumnos";
  const today = todayISO();

  const debtClientIds = React.useMemo(() => {
    const ids: string[] = [];
    for (const client of state.clients) {
      if (client.status !== "active") continue;
      const account = selectAccount(state, client, today);
      if (account.status === "deudor" || account.status === "bloqueado") {
        ids.push(client.id);
      }
    }
    return ids;
  }, [state, today]);

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
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={debtClientIds.length === 0}
                  onClick={() => {
                    const result = actions.sendDebtAlerts?.(debtClientIds);
                    const sent = result?.sent ?? debtClientIds.length;
                    toast.success(`Se enviaron ${sent} alerta(s) a alumnos con pagos pendientes.`);
                  }}
                >
                  <i className="ti ti-bell-ringing text-base" aria-hidden="true" />
                  Enviar alerta a deudores
                </Button>
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
