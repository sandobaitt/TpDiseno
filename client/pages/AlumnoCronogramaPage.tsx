import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { DayColumn } from "@/components/cronograma/DayColumn";
import { weekMock } from "@/data/schedule";

export default function AlumnoCronogramaPage() {
  const [week, setWeek] = React.useState(weekMock);
  const weekLabel = "MAY 12 - MAY 18";

  const handleSelectDay = (dayAbbr: string) => {
    setWeek((prev) =>
      prev.map((d) => ({ ...d, isActive: d.dayAbbr === dayAbbr })),
    );
  };

  return (
    <DashboardLayout headerNav=" ">
      <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mt-1">
              CRONOGRAMA DE CLASES
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Consulta tus sesiones de entrenamiento.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-800/80 rounded-xl px-4 py-2.5 border border-zinc-800/50">
            <button className="text-gray-500 hover:text-white transition-colors cursor-pointer">
              <i className="ti ti-chevron-left text-sm" />
            </button>
            <span className="text-white text-xs font-bold tracking-wider px-3">
              {weekLabel}
            </span>
            <button className="text-gray-500 hover:text-white transition-colors cursor-pointer">
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
    </DashboardLayout>
  );
}
