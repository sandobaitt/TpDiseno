import { Button } from "@/components/ui/button";
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
  /** Reemplazo pedido que todavía no respondió el profesor. */
  pendingNote?: string;
  /** El profesor tiene otra clase a la misma hora (superposición). */
  conflictNote?: string;
  /** Para el alumno: si la clase está incluida en su plan (CU 8). */
  inPlan?: boolean;
}

interface ClassCardProps {
  classItem: ClassCardData;
  /** Si se pasa, la tarjeta se puede tocar (por ejemplo, para ver el detalle). */
  onSelect?: () => void;
}

/** Tarjeta informativa de una clase del cronograma. */
export function ClassCard({ classItem: c, onSelect }: ClassCardProps) {
  const excluded = c.inPlan === false;
  const cardClasses = cn(
    "rounded-2xl p-4 flex flex-col gap-2 bg-card shadow-card glass-border",
    c.inPlan && "ring-1 ring-primary/50",
    c.conflictNote && "ring-1 ring-danger/60",
    excluded && "opacity-60",
  );
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground text-sm font-bold">
          {c.start}–{c.end}
        </span>
        <span className="text-primary text-[11px] font-bold tracking-wider">
          {c.durationMin} MIN
        </span>
      </div>

      <h4 className="text-foreground text-base font-extrabold leading-tight">
        {c.title}
      </h4>

      <div className="flex flex-col gap-1 text-muted-foreground text-xs">
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
              : "bg-foreground/[0.06] text-foreground/80",
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
        <span className="w-fit rounded-md bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
          {c.replacementNote}
        </span>
      )}

      {c.pendingNote && (
        <span className="flex w-fit items-center gap-1 rounded-md bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">
          <i className="ti ti-hourglass text-xs" aria-hidden="true" />
          {c.pendingNote}
        </span>
      )}

      {c.conflictNote && (
        <span className="flex w-fit items-center gap-1 rounded-md bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">
          <i className="ti ti-alert-triangle text-xs" aria-hidden="true" />
          {c.conflictNote}
        </span>
      )}

      <div className="flex items-center pt-2 border-t border-border/50 mt-auto">
        <span className="text-muted-foreground text-[11px] font-medium">
          Cupo: {c.capacity} personas
        </span>
      </div>
    </>
  );

  if (!onSelect) return <div className={cardClasses}>{content}</div>;
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onSelect}
      aria-label={`Ver el detalle de ${c.title}, ${c.start} a ${c.end}, ${c.branchName}`}
      className={cn(
        cardClasses,
        "h-auto w-full items-stretch justify-start whitespace-normal text-left font-normal hover:bg-secondary/80",
      )}
    >
      {content}
    </Button>
  );
}
