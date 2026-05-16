import type { DaySchedule } from "@/data/schedule";
import { ClassCard } from "./ClassCard";

interface DayColumnProps {
  day: DaySchedule;
  onSelect: (dayAbbr: string) => void;
}

export function DayColumn({ day, onSelect }: DayColumnProps) {
  const active = day.isActive;

  return (
    <div
      onClick={() => onSelect(day.dayAbbr)}
      className={`relative flex flex-col gap-3 min-w-[160px] w-full rounded-2xl p-4 transition-all cursor-pointer ${
        active
          ? "bg-neutral-800/60 border border-lime-400/40 shadow-[0_0_24px_rgba(163,230,53,0.08)]"
          : "bg-neutral-900/50 border border-transparent hover:border-zinc-800/50"
      }`}
    >
      {active && (
        <>
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.6)]" />
          <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-lime-400/60 shadow-[0_0_8px_rgba(163,230,53,0.15)]" />
        </>
      )}

      <div className="flex flex-col items-center gap-0.5 pb-2 border-b border-zinc-800/40">
        <span
          className={`text-xs font-bold tracking-widest ${active ? "text-lime-400" : "text-gray-500"}`}
        >
          {day.dayAbbr}
        </span>
        <span className="text-gray-600 text-[11px] font-medium">
          {day.date} {day.month}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {day.classes.length > 0 ? (
          day.classes.map((cls) => <ClassCard key={cls.id} classItem={cls} />)
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-600">
            <i className="ti ti-calendar-off text-xl" />
            <span className="text-xs font-medium">Sin clases</span>
          </div>
        )}
      </div>
    </div>
  );
}
