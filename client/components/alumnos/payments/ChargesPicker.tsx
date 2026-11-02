import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { MonthlyCharge } from "@/domain/billing";
import { diffDays, formatDate, formatPeriod } from "@/lib/dates";
import { formatARS } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Meses para adelantar que se muestran de entrada (el resto, con "Ver más meses"). */
const ADVANCE_VISIBLE = 2;

interface ChargesPickerProps {
  /** Cuotas impagas (de la más vieja a la más nueva) y, después, las que se pueden adelantar. */
  available: MonthlyCharge[];
  /** Cuántas impagas hay (las primeras de `available`). */
  unpaidCount: number;
  /** Períodos elegidos ("AAAA-MM"). */
  selected: string[];
  onToggle: (period: string, checked: boolean) => void;
  today: string;
}

/**
 * Qué cuotas se cobran (Registrar Pagos, paso 5): se eligen una por una entre
 * las impagas y las que se pueden adelantar.
 */
export function ChargesPicker({
  available,
  unpaidCount,
  selected,
  onToggle,
  today,
}: ChargesPickerProps) {
  const baseId = React.useId();
  const [showAll, setShowAll] = React.useState(false);
  const chosen = new Set(selected);
  // Siempre se ven las impagas y las adelantadas que ya se eligieron.
  const visible = available.filter(
    (charge, index) =>
      index < unpaidCount + (showAll ? available.length : ADVANCE_VISIBLE) ||
      chosen.has(charge.period),
  );
  const hidden = available.length - visible.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/80">
          Marcá las cuotas que se pagan. Las vencidas aparecen primero.
        </p>
        <span className="text-sm font-bold text-foreground" aria-live="polite">
          {selected.length}{" "}
          {selected.length === 1 ? "cuota elegida" : "cuotas elegidas"}
        </span>
      </div>

      <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
        {visible.map((charge) => {
          const index = available.indexOf(charge);
          const included = chosen.has(charge.period);
          const isAdvance = index >= unpaidCount;
          const late = diffDays(charge.dueDate, today);
          const id = `${baseId}-${charge.period}`;
          return (
            <li key={charge.period}>
              <label
                htmlFor={id}
                className={cn(
                  "flex min-h-[52px] cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.03]",
                  !included && "text-muted-foreground",
                )}
              >
                <Checkbox
                  id={id}
                  checked={included}
                  onCheckedChange={(value) =>
                    onToggle(charge.period, value === true)
                  }
                  className="h-5 w-5 rounded-[4px]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    Cuota de {formatPeriod(charge.period)}
                    {charge.prorated && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        (proporcional)
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "block text-xs",
                      !isAdvance && late > 0
                        ? "text-warning"
                        : "text-muted-foreground",
                    )}
                  >
                    {isAdvance
                      ? `Adelanto · vence el ${formatDate(charge.dueDate)}`
                      : late > 0
                        ? `Venció el ${formatDate(charge.dueDate)} (${late} ${late === 1 ? "día" : "días"} de atraso)`
                        : `Vence el ${formatDate(charge.dueDate)}`}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-foreground">
                  {formatARS(charge.amount)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAll(true)}
          className="h-10 w-fit rounded-xl"
        >
          <i className="ti ti-calendar-plus text-base" aria-hidden="true" />
          Ver más meses para adelantar ({hidden})
        </Button>
      )}
      {selected.length === 0 && (
        <p className="text-xs font-semibold text-warning" role="status">
          Elegí al menos una cuota para cobrar.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Sin intereses ni recargos por mora.
      </p>
    </div>
  );
}
