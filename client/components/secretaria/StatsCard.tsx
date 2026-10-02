import type { Client } from "@/data/clients";
import { StatCard } from "@/components/common/StatCard";
import { useAppState } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";

interface StatsCardsProps {
  className?: string;
  clients: Client[];
}

/** Resumen calculado con los datos reales (antes eran números fijos). */
export function StatsCards({ className = "", clients }: StatsCardsProps) {
  const state = useAppState();
  const active = clients.filter((c) => c.status === "active");
  const statuses = active.map((c) => selectAccount(state, c).status);
  const count = (...wanted: string[]) =>
    statuses.filter((s) => wanted.includes(s)).length;

  return (
    <section
      className={`px-7 pb-6 max-sm:px-4 ${className}`}
      aria-label="Resumen de alumnos"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          icon="ti-users"
          value={active.length}
          label="Alumnos activos"
        />
        <StatCard
          icon="ti-circle-check"
          value={count("al_dia", "por_vencer")}
          label="Al día o por vencer"
          tone="success"
        />
        <StatCard
          icon="ti-alert-triangle"
          value={count("deudor")}
          label="Con cuota vencida"
          tone="warning"
        />
        <StatCard
          icon="ti-lock"
          value={count("bloqueado")}
          label="Bloqueados por deuda"
          tone="danger"
        />
      </div>
    </section>
  );
}
