import * as React from "react";
import { UnifiedCalendar } from "@/components/cronograma/UnifiedCalendar";
import { ClassCard } from "@/components/cronograma/ClassCard";
import {
  buildWeekDays,
  toClassCard,
  weekLabel,
} from "@/components/cronograma/weekView";
import { scheduleMock } from "@/data/schedule";
import { sessionsBetween } from "@/domain/schedule";
import { addDays, startOfWeek, todayISO } from "@/lib/dates";
import { useAppState } from "@/store/StoreProvider";

export default function AlumnoCronogramaPage() {
  const today = todayISO();
  const { replacements } = useAppState();
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(today));
  const [activeDate, setActiveDate] = React.useState(today);

  const sessions = React.useMemo(
    () =>
      sessionsBetween(
        weekStart,
        addDays(weekStart, 6),
        scheduleMock,
        replacements,
      ),
    [weekStart, replacements],
  );
  const days = buildWeekDays(weekStart, activeDate);

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mt-1">
            CRONOGRAMA DE CLASES
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Clases de todas las sedes para la semana.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-800/80 rounded-xl px-2 py-1.5 border border-zinc-800/50">
          <button
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            aria-label="Semana anterior"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <i className="ti ti-chevron-left text-sm" aria-hidden="true" />
          </button>
          <span className="text-white text-xs font-bold tracking-wider px-2 whitespace-nowrap">
            {weekLabel(weekStart)}
          </span>
          <button
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            aria-label="Semana siguiente"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <i className="ti ti-chevron-right text-sm" aria-hidden="true" />
          </button>
        </div>
      </div>

      <UnifiedCalendar
        days={days}
        getItemsForDay={(day) =>
          sessions.filter((s) => s.date === day.iso).map(toClassCard)
        }
        renderItem={(card) => <ClassCard key={card.id} classItem={card} />}
        onSelectDay={(abbr) =>
          setActiveDate(days.find((d) => d.dayAbbr === abbr)?.iso ?? activeDate)
        }
      />
    </div>
  );
}
