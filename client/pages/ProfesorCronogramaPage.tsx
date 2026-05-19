import * as React from "react";
import { DayColumn } from "@/components/cronograma/DayColumn";
import { weekMock } from "@/data/schedule";

const MONTHS = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const BASE_MONDAY = new Date(2025, 4, 12);

function buildWeek(offset: number) {
  return weekMock.map((day, i) => {
    const d = new Date(BASE_MONDAY);
    d.setDate(BASE_MONDAY.getDate() + offset * 7 + i);
    return { ...day, date: d.getDate(), month: MONTHS[d.getMonth()] };
  });
}

function weekLabel(offset: number) {
  const first = new Date(BASE_MONDAY);
  first.setDate(BASE_MONDAY.getDate() + offset * 7);
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  return `${MONTHS[first.getMonth()]} ${first.getDate()} — ${MONTHS[last.getMonth()]} ${last.getDate()}`;
}

export default function ProfesorCronogramaPage() {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [activeDay, setActiveDay] = React.useState(
    weekMock.find((d) => d.isActive)?.dayAbbr ?? "",
  );

  const week = React.useMemo(() => {
    const w = buildWeek(weekOffset);
    return w.map((d) => ({ ...d, isActive: d.dayAbbr === activeDay }));
  }, [weekOffset, activeDay]);

  const totalClases = week.reduce((sum, d) => sum + d.classes.length, 0);
  const totalMins = week.reduce(
    (sum, d) => sum + d.classes.reduce((s, c) => s + c.durationMin, 0),
    0,
  );
  const totalAlumnos = week.reduce(
    (sum, d) => sum + d.classes.reduce((s, c) => s + c.booked, 0),
    0,
  );
  const horas = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-app-text text-3xl md:text-4xl font-extrabold leading-tight mt-1">
            CRONOGRAMA
          </h1>
          <p className="text-app-faint text-sm mt-1">
            Tu agenda de clases para la semana.
          </p>
        </div>

        {/* Week navigator */}
        <div className="flex items-center bg-app-bg glass-border rounded-xl shadow-card overflow-hidden">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="px-3 py-2.5 text-app-subtle hover:text-app-text hover:bg-app-hover/[0.04] transition-all cursor-pointer"
          >
            <i className="ti ti-chevron-left text-sm" />
          </button>
          <span className="flex items-center gap-2 px-3 text-app-text text-xs font-bold tracking-wider border-x border-app-border/[0.05]">
            <i className="ti ti-calendar text-lime-400 text-sm" />
            {weekLabel(weekOffset)}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="px-3 py-2.5 text-app-subtle hover:text-app-text hover:bg-app-hover/[0.04] transition-all cursor-pointer"
          >
            <i className="ti ti-chevron-right text-sm" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-3">
        <div className="bg-app-bg glass-border rounded-2xl p-4 flex items-center gap-3 shadow-card">
          <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
            <i className="ti ti-calendar-event text-lime-400 text-base" />
          </div>
          <div>
            <p className="text-app-text text-2xl font-extrabold leading-tight">{totalClases}</p>
            <p className="text-app-subtle text-[10px] font-semibold tracking-wider">CLASES</p>
          </div>
        </div>

        <div className="bg-app-bg glass-border rounded-2xl p-4 flex items-center gap-3 shadow-card">
          <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
            <i className="ti ti-clock text-lime-400 text-base" />
          </div>
          <div>
            <p className="text-app-text text-2xl font-extrabold leading-tight">
              {horas}h{mins > 0 ? ` ${mins}m` : ""}
            </p>
            <p className="text-app-subtle text-[10px] font-semibold tracking-wider">EN CANCHA</p>
          </div>
        </div>

        <div className="bg-app-bg glass-border rounded-2xl p-4 flex items-center gap-3 shadow-card">
          <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
            <i className="ti ti-users text-lime-400 text-base" />
          </div>
          <div>
            <p className="text-app-text text-2xl font-extrabold leading-tight">{totalAlumnos}</p>
            <p className="text-app-subtle text-[10px] font-semibold tracking-wider">ALUMNOS</p>
          </div>
        </div>
      </div>

      {/* Day columns */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {week.map((day) => (
          <DayColumn
            key={day.dayAbbr}
            day={day}
            onSelect={(abbr) => setActiveDay(abbr)}
          />
        ))}
      </div>
    </div>
  );
}
