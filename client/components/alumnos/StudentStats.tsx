import type { Client } from "@/data/clients";
import type { AccountStatus } from "@/domain/billing";
import { StatCard } from "@/components/common/StatCard";
import { useAppState } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";

interface StudentStatsProps {
  clients: Client[];
  /** Estado que está filtrando la lista ("" = todos). */
  activeStatus: string;
  onStatusClick: (status: AccountStatus | "") => void;
}

/** Resumen calculado con los datos reales. Las tarjetas de estado filtran la lista. */
export function StudentStats({
  clients,
  activeStatus,
  onStatusClick,
}: StudentStatsProps) {
  const state = useAppState();
  const active = clients.filter((c) => c.status === "active");
  const statuses = active.map((c) => selectAccount(state, c).status);
  const count = (status: AccountStatus) =>
    statuses.filter((s) => s === status).length;
  const filterProps = (status: AccountStatus) => ({
    onClick: () => onStatusClick(activeStatus === status ? "" : status),
    pressed: activeStatus === status,
  });

  return (
    <section
      aria-label="Resumen de alumnos"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
    >
      <StatCard icon="ti-users" value={active.length} label="Alumnos activos" />
      <StatCard
        icon="ti-clock"
        value={count("por_vencer")}
        label="Cuota por vencer"
        tone="info"
        {...filterProps("por_vencer")}
      />
      <StatCard
        icon="ti-alert-triangle"
        value={count("deudor")}
        label="Con cuota vencida"
        tone="warning"
        {...filterProps("deudor")}
      />
      <StatCard
        icon="ti-lock"
        value={count("bloqueado")}
        label="Bloqueados"
        tone="danger"
        {...filterProps("bloqueado")}
      />
    </section>
  );
}
