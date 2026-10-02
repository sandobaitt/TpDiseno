import type { GymClass } from "@/data/schedule";

interface ClassCardProps {
  classItem: GymClass;
}

/** Tarjeta informativa de una clase del cronograma. */
export function ClassCard({ classItem }: ClassCardProps) {
  const c = classItem;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 bg-neutral-900 shadow-card glass-border">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-bold">{c.time}</span>
        <span className="text-lime-400 text-[11px] font-bold tracking-wider">
          {c.durationMin} MIN
        </span>
      </div>

      <div className="flex flex-col">
        {c.isPro && (
          <span className="text-[11px] font-bold tracking-wider text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-md w-fit mb-1">
            PRO
          </span>
        )}
        <h4 className="text-white text-base font-extrabold leading-tight">
          {c.title}
        </h4>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <i className="ti ti-user-circle text-sm" aria-hidden="true" />
        {c.coach}
      </div>

      <div className="flex items-center pt-2 border-t border-zinc-800/50 mt-auto">
        {c.isFull ? (
          <span className="text-red-400 text-[11px] font-bold tracking-wider flex items-center gap-1">
            <i className="ti ti-alert-circle text-xs" aria-hidden="true" />
            Completa ({c.capacity}/{c.capacity})
          </span>
        ) : (
          <span className="text-gray-400 text-[11px] font-medium">
            {c.booked}/{c.capacity} lugares ocupados
          </span>
        )}
      </div>
    </div>
  );
}
