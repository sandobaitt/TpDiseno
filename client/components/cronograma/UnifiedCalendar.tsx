import * as React from "react";
import { DayColumn, type DayBase } from "./DayColumn";

interface UnifiedCalendarProps<T, D extends DayBase> {
  days: D[];
  getItemsForDay: (day: D) => T[];
  renderItem: (item: T) => React.ReactNode;
  onSelectDay?: (dayAbbr: string) => void;
  emptyMessage?: string;
}

export function UnifiedCalendar<T, D extends DayBase>({
  days,
  getItemsForDay,
  renderItem,
  onSelectDay,
  emptyMessage,
}: UnifiedCalendarProps<T, D>) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {days.map((day) => (
        <DayColumn
          key={day.dayAbbr}
          day={day}
          items={getItemsForDay(day)}
          renderItem={renderItem}
          onSelect={onSelectDay}
          emptyMessage={emptyMessage}
        />
      ))}
    </div>
  );
}
