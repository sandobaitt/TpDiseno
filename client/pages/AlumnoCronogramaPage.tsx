import * as React from "react";
import { UnifiedCalendar } from "@/components/cronograma/UnifiedCalendar";
import { ClassCard } from "@/components/cronograma/ClassCard";
import { buildWeekDays, toClassCard } from "@/components/cronograma/weekView";
import { scheduleMock } from "@/data/schedule";
import { sessionsBetween } from "@/domain/schedule";
import { addDays, startOfWeek, todayISO } from "@/lib/dates";
import { useAppState } from "@/store/StoreProvider";
import { PageHeader } from "@/components/common/PageHeader";
import { WeekNavigator } from "@/components/common/WeekNavigator";

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
      <PageHeader
        title="Cronograma de clases"
        subtitle="Clases de todas las sedes para la semana."
        actions={<WeekNavigator weekStart={weekStart} onChange={setWeekStart} />}
      />

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
