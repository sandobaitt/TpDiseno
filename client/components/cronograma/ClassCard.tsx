import type { GymClass } from "@/data/schedule";

interface ClassCardProps {
  classItem: GymClass;
}

export function ClassCard({ classItem }: ClassCardProps) {
  const c = classItem;
  return (
    <div className="bg-app-bg rounded-2xl p-4 flex flex-col gap-2 shadow-card glass-border hover:border-app-border/[0.10] transition-all duration-150">
      <div className="flex items-center justify-between">
        <span className="text-app-text text-sm font-bold">{c.time}</span>
        <span className="text-lime-400 text-[10px] font-bold tracking-wider">
          {c.durationMin} MIN
        </span>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          {c.isPro && (
            <span className="text-[10px] font-bold tracking-wider text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-md w-fit mb-1">
              PRO
            </span>
          )}
          <h4 className="text-app-text text-base font-extrabold leading-tight">
            {c.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-2 text-app-subtle text-xs">
        <i className="ti ti-user-circle text-sm" />
        {c.coach}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-app-border/[0.08]">
        {c.isFull ? (
          <span className="text-red-400 text-[10px] font-bold tracking-wider flex items-center gap-1">
            <i className="ti ti-alert-circle text-xs" />
            Lleno
          </span>
        ) : (
          <span className="text-app-subtle text-[10px] font-medium">
            {c.booked}/{c.capacity} Lugares
          </span>
        )}
      </div>
    </div>
  );
}
