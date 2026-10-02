import { addDays, startOfWeek, todayISO } from "@/lib/dates";
import { weekLabel } from "@/components/cronograma/weekView";

interface WeekNavigatorProps {
  /** Lunes de la semana mostrada (AAAA-MM-DD). */
  weekStart: string;
  onChange: (weekStart: string) => void;
}

/** Navegación entre semanas, con botón para volver a la actual. */
export function WeekNavigator({ weekStart, onChange }: WeekNavigatorProps) {
  const currentWeek = startOfWeek(todayISO());
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-neutral-900 p-1 shadow-card">
      <button
        type="button"
        onClick={() => onChange(addDays(weekStart, -7))}
        aria-label="Semana anterior"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <i className="ti ti-chevron-left text-sm" aria-hidden="true" />
      </button>
      <span
        className="flex items-center gap-2 whitespace-nowrap px-2 text-xs font-bold tracking-wider text-white"
        aria-live="polite"
      >
        <i className="ti ti-calendar text-sm text-primary" aria-hidden="true" />
        {weekLabel(weekStart)}
      </span>
      <button
        type="button"
        onClick={() => onChange(addDays(weekStart, 7))}
        aria-label="Semana siguiente"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <i className="ti ti-chevron-right text-sm" aria-hidden="true" />
      </button>
      {weekStart !== currentWeek && (
        <button
          type="button"
          onClick={() => onChange(currentWeek)}
          className="ml-1 rounded-lg px-2.5 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          Hoy
        </button>
      )}
    </div>
  );
}
