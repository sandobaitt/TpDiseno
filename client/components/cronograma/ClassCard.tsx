import { cn } from "@/lib/utils";

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
  /** Para el alumno: si la clase está incluida en su plan (CU 8). */
  inPlan?: boolean;
}

interface ClassCardProps {
  classItem: ClassCardData;
}

/** Tarjeta informativa de una clase del cronograma. */
export function ClassCard({ classItem: c }: ClassCardProps) {
  const excluded = c.inPlan === false;
  return (
    <div
      className={cn(
        "rounded-2xl p-4 flex flex-col gap-2 bg-neutral-900 shadow-card glass-border",
        c.inPlan && "ring-1 ring-primary/50",
        excluded && "opacity-60",
      )}
    >
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

      {c.inPlan !== undefined && (
        <span
          className={cn(
            "flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
            c.inPlan
              ? "bg-primary/10 text-primary"
              : "bg-white/[0.06] text-gray-300",
          )}
        >
          <i
            className={cn(
              "ti text-sm",
              c.inPlan ? "ti-circle-check" : "ti-lock",
            )}
            aria-hidden="true"
          />
          {c.inPlan ? "En tu plan" : "No incluida en tu plan"}
        </span>
      )}

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
