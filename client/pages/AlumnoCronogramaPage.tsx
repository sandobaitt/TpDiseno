import * as React from "react";
import { DayColumn } from "@/components/cronograma/DayColumn";
import { weekMock } from "@/data/schedule";

const MONTHS = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const BASE_MONDAY = new Date(2025, 4, 12); // May 12, 2025

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
  return `${MONTHS[first.getMonth()]} ${first.getDate()} - ${MONTHS[last.getMonth()]} ${last.getDate()}`;
}

export default function AlumnoCronogramaPage() {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [activeDay, setActiveDay] = React.useState(weekMock.find((d) => d.isActive)?.dayAbbr ?? "");

  const week = React.useMemo(() => {
    const w = buildWeek(weekOffset);
    return w.map((d) => ({ ...d, isActive: d.dayAbbr === activeDay }));
  }, [weekOffset, activeDay]);

  const handleSelectDay = (dayAbbr: string) => setActiveDay(dayAbbr);

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-app-text text-3xl md:text-4xl font-extrabold leading-tight mt-1">
              CRONOGRAMA DE CLASES
            </h1>
            <p className="text-app-faint text-sm mt-1">
              Consulta tus sesiones de entrenamiento.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-app-card/80 rounded-xl px-4 py-2.5 border border-app-border/[0.12]/50">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="text-app-subtle hover:text-app-text transition-colors cursor-pointer"
            >
              <i className="ti ti-chevron-left text-sm" />
            </button>
            <span className="text-app-text text-xs font-bold tracking-wider px-3">
              {weekLabel(weekOffset)}
            </span>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="text-app-subtle hover:text-app-text transition-colors cursor-pointer"
            >
              <i className="ti ti-chevron-right text-sm" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {week.map((day) => (
            <DayColumn key={day.dayAbbr} day={day} onSelect={handleSelectDay} />
          ))}
        </div>
      </div>
  );
}
