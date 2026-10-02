import { Button } from "@/components/ui/button";
import type { MonthlyCharge } from "@/domain/billing";
import { diffDays, formatDate, formatPeriod } from "@/lib/dates";
import { formatARS } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ChargesPickerProps {
  /** Cuotas impagas (de la más vieja a la más nueva) y, después, las que se pueden adelantar. */
  available: MonthlyCharge[];
  /** Cuántas impagas hay (las primeras de `available`). */
  unpaidCount: number;
  count: number;
  onCountChange: (count: number) => void;
  today: string;
}

/** Qué cuotas se cobran: siempre de la más vieja a la más nueva, y se pueden adelantar meses. */
export function ChargesPicker({
  available,
  unpaidCount,
  count,
  onCountChange,
  today,
}: ChargesPickerProps) {
  // Se muestran las impagas y las adelantadas que se eligieron.
  const visible = available.slice(0, Math.max(unpaidCount, count));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-300">
          Se cobran de la más vieja a la más nueva.
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onCountChange(count - 1)}
            disabled={count <= 1}
            aria-label="Cobrar una cuota menos"
            className="h-9 w-9 rounded-lg"
          >
            <i className="ti ti-minus text-sm" aria-hidden="true" />
          </Button>
          <span
            className="min-w-[88px] text-center text-sm font-bold text-white"
            aria-live="polite"
          >
            {count} {count === 1 ? "cuota" : "cuotas"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onCountChange(count + 1)}
            disabled={count >= available.length}
            aria-label="Cobrar una cuota más"
            className="h-9 w-9 rounded-lg"
          >
            <i className="ti ti-plus text-sm" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-white/[0.05] rounded-xl border border-white/[0.06]">
        {visible.map((charge, index) => {
          const included = index < count;
          const isAdvance = index >= unpaidCount;
          const late = diffDays(charge.dueDate, today);
          return (
            <li
              key={charge.period}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                !included && "opacity-50",
              )}
            >
              <i
                className={cn(
                  "ti text-lg",
                  included
                    ? "ti-square-check text-primary"
                    : "ti-square text-gray-500",
                )}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  Cuota de {formatPeriod(charge.period)}
                  {charge.prorated && (
                    <span className="font-normal text-gray-400">
                      {" "}
                      (proporcional)
                    </span>
                  )}
                  <span className="sr-only">
                    {included ? ", se cobra" : ", no se cobra"}
                  </span>
                </p>
                <p
                  className={cn(
                    "text-xs",
                    !isAdvance && late > 0 ? "text-warning" : "text-gray-400",
                  )}
                >
                  {isAdvance
                    ? `Adelanto · vence el ${formatDate(charge.dueDate)}`
                    : late > 0
                      ? `Venció el ${formatDate(charge.dueDate)} (${late} ${late === 1 ? "día" : "días"} de atraso)`
                      : `Vence el ${formatDate(charge.dueDate)}`}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold text-white">
                {formatARS(charge.amount)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Sin intereses ni recargos por mora.
      </p>
    </div>
  );
}
