import type { Client } from "@/data/clients";
import { seedState } from "@/store/state";
import { selectAccount } from "@/store/selectors";

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  iconClasses: string;
  valueClasses?: string;
}

function StatCard({
  icon,
  value,
  label,
  iconClasses,
  valueClasses = "text-white",
}: StatCardProps) {
  return (
    <article className="flex flex-col gap-2 p-5 rounded-2xl shadow-card glass-border bg-zinc-900">
      <div
        className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconClasses}`}
      >
        <i className={`ti ${icon} text-lg`} aria-hidden="true" />
      </div>
      <p
        className={`mt-1 text-4xl font-extrabold leading-none tracking-tight ${valueClasses}`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </p>
    </article>
  );
}

interface StatsCardsProps {
  className?: string;
  clients: Client[];
}

/** Resumen calculado con los datos reales (antes eran números fijos). */
export function StatsCards({ className = "", clients }: StatsCardsProps) {
  const active = clients.filter((c) => c.status === "active");
  const statuses = active.map((c) => selectAccount(seedState, c).status);
  const count = (...wanted: string[]) =>
    statuses.filter((s) => wanted.includes(s)).length;

  return (
    <section className={`px-7 pb-6 max-sm:px-4 ${className}`}>
      <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
        <StatCard
          icon="ti-users"
          value={active.length}
          label="Alumnos activos"
          iconClasses="bg-lime-400/10 text-lime-400"
        />
        <StatCard
          icon="ti-circle-check"
          value={count("al_dia", "por_vencer")}
          label="Al día o por vencer"
          iconClasses="bg-green-500/10 text-green-400"
        />
        <StatCard
          icon="ti-alert-triangle"
          value={count("deudor")}
          label="Con cuota vencida"
          iconClasses="bg-orange-500/10 text-orange-300"
          valueClasses="text-orange-300"
        />
        <StatCard
          icon="ti-lock"
          value={count("bloqueado")}
          label="Bloqueados por deuda"
          iconClasses="bg-red-500/10 text-red-400"
          valueClasses="text-red-400"
        />
      </div>
    </section>
  );
}
