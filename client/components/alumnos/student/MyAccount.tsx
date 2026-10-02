import * as React from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { CheckoutDialog } from "@/components/alumnos/payments/CheckoutDialog";
import { ReceiptDialog } from "@/components/alumnos/payments/ReceiptDialog";
import { getPlan } from "@/data/plans";
import { PAYMENT_METHOD_LABELS, type Payment } from "@/data/payments";
import { describeAccount } from "@/domain/billing";
import { diffDays, formatDate, formatPeriod, todayISO } from "@/lib/dates";
import { formatARS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppState } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";

const ITEMS_PER_PAGE = 6;

/**
 * Estado de cuenta del alumno (CU 3) y pago online (sin efectivo): cuánto
 * debe, hasta cuándo, cada cuota del mes con su recibo.
 */
export function MyAccount({ clientId }: { clientId?: string }) {
  const state = useAppState();
  const today = todayISO();
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [receipt, setReceipt] = React.useState<Payment | null>(null);
  const [page, setPage] = React.useState(1);

  const client = state.clients.find((c) => c.id === clientId);
  if (!client) {
    return (
      <div className="px-7 pb-7 max-sm:px-4">
        <EmptyState
          icon="ti-user-question"
          title="No encontramos tu ficha de alumno"
          description="Consultá en recepción."
        />
      </div>
    );
  }

  const plan = getPlan(client.planId);
  const account = selectAccount(state, client, today);
  const months = [...account.charges].reverse();
  const totalPages = Math.ceil(months.length / ITEMS_PER_PAGE);
  const pageMonths = months.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const owes = account.owedAmount > 0;

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Mi cuenta"
        subtitle="Revisá tus cuotas y pagá las pendientes. No hay recargos por pagar fuera de término."
      />

      <section
        aria-label="Resumen de tu cuenta"
        className="grid grid-cols-1 gap-4 rounded-2xl bg-neutral-900 p-5 shadow-card glass-border sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <AccountStatusBadge status={account.status} />
            {plan && (
              <span className="text-sm text-gray-300">Plan {plan.name}</span>
            )}
          </div>
          <p className="text-sm text-gray-300">{describeAccount(account)}</p>
          <div className="flex flex-wrap gap-6 pt-1">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                Monto adeudado
              </p>
              <p
                className={cn(
                  "text-2xl font-extrabold",
                  owes ? "text-danger" : "text-white",
                )}
              >
                {formatARS(account.owedAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                {owes ? "Fecha límite" : "Próximo vencimiento"}
              </p>
              <p className="text-2xl font-extrabold text-white">
                {formatDate(account.nextDueDate)}
              </p>
            </div>
          </div>
        </div>
        {owes && (
          <Button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="h-12 rounded-xl px-6 text-base font-extrabold"
          >
            <i className="ti ti-credit-card text-lg" aria-hidden="true" />
            Pagar {formatARS(account.owedAmount)}
          </Button>
        )}
      </section>

      <SectionCard title="Cuotas" icon="ti-receipt">
        {months.length === 0 ? (
          <EmptyState
            icon="ti-receipt-off"
            title="Todavía no tenés cuotas generadas"
          />
        ) : (
          <ul className="flex flex-col divide-y divide-white/[0.05]">
            {pageMonths.map((m) => {
              const payment = m.paymentId
                ? state.payments.find((p) => p.id === m.paymentId)
                : undefined;
              const late = diffDays(m.dueDate, today);
              return (
                <li
                  key={m.period}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <i
                    className={cn(
                      "ti text-xl",
                      m.paid
                        ? "ti-circle-check text-success"
                        : "ti-alert-triangle text-warning",
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">
                      Cuota de {formatPeriod(m.period)}
                      {m.prorated && (
                        <span className="font-normal text-gray-400">
                          {" "}
                          (proporcional)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m.paid && payment
                        ? `${PAYMENT_METHOD_LABELS[payment.method]} · ${formatARS(payment.amountArs)} · ${formatDate(payment.createdAt.slice(0, 10))}`
                        : late > 0
                          ? `${formatARS(m.amount)} · venció el ${formatDate(m.dueDate)}`
                          : `${formatARS(m.amount)} · vence el ${formatDate(m.dueDate)}`}
                    </p>
                  </div>
                  {m.paid ? (
                    <>
                      <StatusBadge tone="success" icon="ti-check">
                        Pagada
                      </StatusBadge>
                      {payment && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setReceipt(payment)}
                          className="rounded-lg text-primary hover:text-primary"
                        >
                          Ver recibo
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setCheckoutOpen(true)}
                      className="rounded-lg font-bold"
                    >
                      Pagar
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </SectionCard>

      <CheckoutDialog
        clientId={checkoutOpen ? client.id : null}
        mode="online"
        onClose={() => setCheckoutOpen(false)}
      />
      <ReceiptDialog
        payment={receipt}
        clientName={client.fullName}
        onClose={() => setReceipt(null)}
      />
    </div>
  );
}
