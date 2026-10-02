export interface ClassCardData {
  id: string;
  start: string;
  end: string;
  durationMin: number;
  title: string;
  teacherName: string;
  branchName: string;
  capacity: number;
  /** Si ese día la dicta un reemplazante. */
  replacementNote?: string;
}

interface ClassCardProps {
  classItem: ClassCardData;
}

/** Tarjeta informativa de una clase del cronograma. */
export function ClassCard({ classItem: c }: ClassCardProps) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 bg-neutral-900 shadow-card glass-border">
      <div className="flex items-center justify-between gap-2">
        <span className="text-white text-sm font-bold">
          {c.start}–{c.end}
        </span>
        <span className="text-lime-400 text-[11px] font-bold tracking-wider">
          {c.durationMin} MIN
        </span>
      </div>

      <h4 className="text-white text-base font-extrabold leading-tight">
        {c.title}
      </h4>

      <div className="flex flex-col gap-1 text-gray-400 text-xs">
        <span className="flex items-center gap-1.5">
          <i className="ti ti-user-circle text-sm" aria-hidden="true" />
          {c.teacherName}
        </span>
        <span className="flex items-center gap-1.5">
          <i className="ti ti-map-pin text-sm" aria-hidden="true" />
          {c.branchName}
        </span>
      </div>

      {c.replacementNote && (
        <span className="w-fit rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
          {c.replacementNote}
        </span>
      )}

      <div className="flex items-center pt-2 border-t border-zinc-800/50 mt-auto">
        <span className="text-gray-400 text-[11px] font-medium">
          Cupo: {c.capacity} personas
        </span>
      </div>
    </div>
  );
}
