import type { EnrollmentCharge } from "@/domain/enrollment";
import { formatDate, formatPeriod } from "@/lib/dates";
import { formatARS } from "@/lib/format";

/** Cuota de alta calculada: monto, si es proporcional y vencimiento. */
export function EnrollmentChargeBox({ charge }: { charge: EnrollmentCharge }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <i className="ti ti-receipt text-xl text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-muted-foreground">
          Cuota de alta
        </p>
        <p className="text-2xl font-extrabold text-white">
          {formatARS(charge.amount)}
        </p>
        <p className="text-xs text-gray-300">
          {charge.prorated
            ? `Proporcional: ${charge.daysCharged} de ${charge.daysInMonth} días de ${formatPeriod(charge.period)} (precio del mes: ${formatARS(charge.fullPrice)}).`
            : `Mes completo de ${formatPeriod(charge.period)}.`}{" "}
          Vence el {formatDate(charge.dueDate)}. Sin intereses ni recargos.
        </p>
      </div>
    </div>
  );
}
