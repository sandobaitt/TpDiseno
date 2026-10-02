import * as React from "react";
import { UnifiedCalendar } from "@/components/cronograma/UnifiedCalendar";
import { ClassCard } from "@/components/cronograma/ClassCard";
import {
  buildWeekDays,
  toClassCard,
  weekLabel,
} from "@/components/cronograma/weekView";
import { scheduleMock } from "@/data/schedule";
import { getMockSession } from "@/data/users";
import { sessionsBetween } from "@/domain/schedule";
import { addDays, formatMinutes, startOfWeek, todayISO } from "@/lib/dates";
import { seedState } from "@/store/state";

export default function ProfesorCronogramaPage() {
  const teacherId = getMockSession()?.teacherId;
  const today = todayISO();
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(today));
  const [activeDate, setActiveDate] = React.useState(today);

  // Solo las clases que dicta este profesor (incluye reemplazos que aceptó).
  const sessions = React.useMemo(
    () =>
      sessionsBetween(
        weekStart,
        addDays(weekStart, 6),
        scheduleMock,
        seedState.replacements,
      ).filter((s) => s.teacherId === teacherId),
    [weekStart, teacherId],
  );
  const days = buildWeekDays(weekStart, activeDate);
  const totalMins = sessions.reduce((sum, s) => sum + s.durationMin, 0);
  const branches = new Set(sessions.map((s) => s.branchId)).size;

  const stats = [
    {
      icon: "ti-calendar-event",
      value: String(sessions.length),
      label: "CLASES",
    },
    { icon: "ti-clock", value: formatMinutes(totalMins), label: "HORAS" },
    {
      icon: "ti-map-pin",
      value: String(branches),
      label: branches === 1 ? "SEDE" : "SEDES",
    },
  ];

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mt-1">
            MI CRONOGRAMA
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Tus clases de la semana, con los reemplazos que aceptaste.
          </p>
        </div>

        <div className="flex items-center bg-neutral-900 glass-border rounded-xl shadow-card overflow-hidden">
          <button
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            aria-label="Semana anterior"
            className="px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <i className="ti ti-chevron-left text-sm" aria-hidden="true" />
          </button>
          <span className="flex items-center gap-2 px-3 text-white text-xs font-bold tracking-wider border-x border-white/[0.05] whitespace-nowrap">
            <i
              className="ti ti-calendar text-lime-400 text-sm"
              aria-hidden="true"
            />
            {weekLabel(weekStart)}
          </span>
          <button
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            aria-label="Semana siguiente"
            className="px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <i className="ti ti-chevron-right text-sm" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-neutral-900 glass-border rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-card"
          >
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-lime-400/10 items-center justify-center shrink-0">
              <i
                className={`ti ${stat.icon} text-lime-400 text-base`}
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-white text-xl sm:text-2xl font-extrabold leading-tight">
                {stat.value}
              </p>
              <p className="text-gray-400 text-[11px] font-semibold tracking-wider">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
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
