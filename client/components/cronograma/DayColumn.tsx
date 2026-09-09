import * as React from "react";

export interface DayBase {
  dayAbbr: string;
  date: number;
  month?: string;
  isActive?: boolean;
}

interface DayColumnProps<T> {
  day: DayBase;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onSelect?: (dayAbbr: string) => void;
  emptyMessage?: string;
}

export function DayColumn<T>({ day, items, renderItem, onSelect, emptyMessage = "Sin clases" }: DayColumnProps<T>) {
  const active = day.isActive;

  return (
    <div
      onClick={() => onSelect?.(day.dayAbbr)}
      className={`relative flex flex-col gap-3 min-w-[160px] w-full rounded-2xl p-4 transition-all cursor-pointer ${
        active
          ? "bg-neutral-800/60 border border-lime-400/40 shadow-[0_0_28px_rgba(149,253,0,0.10)] shadow-card"
          : "bg-neutral-900/50 glass-border hover:border-white/[0.08]"
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
          {day.date} {day.month || ""}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {items.length > 0 ? (
          items.map(renderItem)
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-600">
            <i className="ti ti-calendar-off text-xl" />
            <span className="text-xs font-medium text-center leading-tight max-w-[120px]">{emptyMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
