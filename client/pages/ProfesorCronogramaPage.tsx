import * as React from "react";
import { UnifiedCalendar } from "@/components/cronograma/UnifiedCalendar";
import { ClassCard } from "@/components/cronograma/ClassCard";
import { buildWeekDays, toClassCard } from "@/components/cronograma/weekView";
import { scheduleMock } from "@/data/schedule";
import { getMockSession } from "@/data/users";
import { sessionsBetween } from "@/domain/schedule";
import { addDays, formatMinutes, startOfWeek, todayISO } from "@/lib/dates";
import { useAppState } from "@/store/StoreProvider";
import { PageHeader } from "@/components/common/PageHeader";
import { WeekNavigator } from "@/components/common/WeekNavigator";

export default function ProfesorCronogramaPage() {
  const teacherId = getMockSession()?.teacherId;
  const today = todayISO();
  const { replacements } = useAppState();
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(today));
  const [activeDate, setActiveDate] = React.useState(today);

  // Solo las clases que dicta este profesor (incluye reemplazos que aceptó).
  const sessions = React.useMemo(
    () =>
      sessionsBetween(
        weekStart,
        addDays(weekStart, 6),
        scheduleMock,
        replacements,
      ).filter((s) => s.teacherId === teacherId),
    [weekStart, teacherId, replacements],
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
      <PageHeader
        title="Mi cronograma"
        subtitle="Tus clases de la semana, con los reemplazos que aceptaste."
        actions={<WeekNavigator weekStart={weekStart} onChange={setWeekStart} />}
      />

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
