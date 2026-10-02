import * as React from "react";
import { cn } from "@/lib/utils";

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

export function DayColumn<T>({
  day,
  items,
  renderItem,
  onSelect,
  emptyMessage = "Sin clases",
}: DayColumnProps<T>) {
  const active = day.isActive;

  return (
    <div
      className={cn(
        "relative flex w-full min-w-[170px] flex-col gap-3 rounded-2xl p-3 transition-all",
        active
          ? "border border-primary/40 bg-neutral-800/60 shadow-card"
          : "bg-neutral-900/50 glass-border",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect?.(day.dayAbbr)}
        aria-pressed={!!active}
        className="flex flex-col items-center gap-0.5 rounded-lg border-b border-zinc-800/40 pb-2 pt-1"
      >
        <span
          className={cn(
            "text-xs font-bold tracking-widest",
            active ? "text-primary" : "text-gray-400",
          )}
        >
          {day.dayAbbr}
        </span>
        <span className="text-[11px] font-medium text-gray-400">
          {day.date} {day.month || ""}
        </span>
      </button>

      <div className="flex flex-col gap-3">
        {items.length > 0 ? (
          items.map(renderItem)
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
            <i className="ti ti-calendar-off text-xl" aria-hidden="true" />
            <span className="max-w-[120px] text-center text-xs font-medium leading-tight">
              {emptyMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
