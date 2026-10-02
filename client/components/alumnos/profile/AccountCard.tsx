import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { describeAccount, type AccountSummary } from "@/domain/billing";
import { diffDays, formatDate, formatPeriod, todayISO } from "@/lib/dates";
import { formatARS } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: AccountSummary;
  /** Si se pasa, aparece el botón para cobrar lo adeudado. */
  onCollect?: () => void;
}

/** Estado de cuenta (CU 3): monto adeudado, cuotas impagas y vencimientos. */
export function AccountCard({ account, onCollect }: AccountCardProps) {
  const today = todayISO();
  const owes = account.owedAmount > 0;

  return (
    <SectionCard title="Estado de cuenta" icon="ti-wallet">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">
            {owes ? "Debe" : "Saldo"}
          </p>
          <p
            className={cn(
              "text-3xl font-black",
              !owes
                ? "text-success"
                : account.status === "bloqueado" || account.status === "deudor"
                  ? "text-danger"
                  : "text-white",
            )}
          >
            {formatARS(account.owedAmount)}
          </p>
        </div>
        <AccountStatusBadge status={account.status} />
      </div>
      <p className="text-sm text-gray-300">{describeAccount(account)}</p>

      {account.unpaid.length > 0 && (
        <ul className="divide-y divide-white/[0.05] rounded-xl border border-white/[0.06]">
          {account.unpaid.map((charge) => {
            const late = diffDays(charge.dueDate, today);
            return (
              <li
                key={charge.period}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Cuota de {formatPeriod(charge.period)}
                    {charge.prorated && (
                      <span className="font-normal text-gray-400">
                        {" "}
                        (proporcional)
                      </span>
                    )}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      late > 0 ? "text-warning" : "text-gray-400",
                    )}
                  >
                    {late > 0
                      ? `Venció el ${formatDate(charge.dueDate)} · ${late} ${late === 1 ? "día" : "días"} de atraso`
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
      )}

      {onCollect && owes && (
        <Button
          type="button"
          onClick={onCollect}
          className="rounded-xl font-bold sm:self-start"
        >
          <i className="ti ti-cash text-base" aria-hidden="true" />
          Cobrar {formatARS(account.owedAmount)}
        </Button>
      )}
    </SectionCard>
  );
}
