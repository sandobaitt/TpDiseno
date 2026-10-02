import * as React from "react";
import { Pagination } from "@/components/common/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentCheckoutContent } from "@/components/cobros/PaymentCheckoutContent";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { getMockSession } from "@/data/users";
import { getPlan } from "@/data/plans";
import { PAYMENT_METHOD_LABELS, type Payment } from "@/data/payments";
import { describeAccount, type MonthlyCharge } from "@/domain/billing";
import {
  diffDays,
  formatDate,
  formatDateTime,
  formatPeriod,
  todayISO,
} from "@/lib/dates";
import { formatARS } from "@/lib/format";
import { useAppState } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";
import { PageHeader } from "@/components/common/PageHeader";

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface ReceiptPopupProps {
  payment: Payment;
  planName: string;
  onClose: () => void;
}

/** Recibo digital: fecha, monto y medio de pago (regla de negocio). */
function ReceiptPopup({ payment, planName, onClose }: ReceiptPopupProps) {
  const rows: [string, string][] = [
    [
      "Período",
      payment.periods.map((p) => capitalize(formatPeriod(p))).join(", "),
    ],
    ["Plan", planName],
    ["Monto", formatARS(payment.amountArs)],
    ["Medio de pago", PAYMENT_METHOD_LABELS[payment.method]],
    ["Fecha de pago", formatDateTime(payment.createdAt)],
    [
      "Registrado",
      payment.processedBy === "online" ? "Pago online" : "En recepción",
    ],
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center">
          <i
            className="ti ti-receipt text-2xl text-lime-400"
            aria-hidden="true"
          />
        </div>
        <div>
          <DialogTitle className="text-white text-lg font-extrabold">
            Recibo {payment.receiptNumber}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs">
            Comprobante de pago de tu cuota.
          </DialogDescription>
        </div>
      </div>

      <dl className="bg-black/40 rounded-xl p-5 flex flex-col gap-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800/40 last:border-0 last:pb-0"
          >
            <dt className="text-gray-400 text-xs font-semibold tracking-wider uppercase">
              {label}
            </dt>
            <dd className="text-white text-sm font-bold text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        Cerrar
      </button>
    </div>
  );
}

const ITEMS_PER_PAGE = 4;

export default function AlumnoPagosPage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState<string | null>(
    null,
  );
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  // El alumno se identifica por el id vinculado a su usuario.
  const state = useAppState();
  const session = getMockSession();
  const client = state.clients.find((c) => c.id === session?.clientId);
  const plan = getPlan(client?.planId);
  const account = client ? selectAccount(state, client) : undefined;
  const today = todayISO();

  if (!client || !account) {
    return (
      <div className="px-7 pb-7 max-sm:px-4">
        <p className="text-gray-400 text-sm">
          No encontramos tu ficha de alumno. Consultá en recepción.
        </p>
      </div>
    );
  }

  const months = [...account.charges].reverse();
  const selectedCharge = months.find((m) => m.period === selectedPeriod);
  const selectedPayment = selectedCharge?.paymentId
    ? state.payments.find((p) => p.id === selectedCharge.paymentId)
    : undefined;
  const totalPages = Math.ceil(months.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMonths = months.slice(start, start + ITEMS_PER_PAGE);

  function dueLabel(charge: MonthlyCharge) {
    const days = diffDays(charge.dueDate, today);
    if (days > 0)
      return `Venció hace ${days} ${days === 1 ? "día" : "días"} (${formatDate(charge.dueDate)})`;
    return `Vence el ${formatDate(charge.dueDate)}`;
  }

  return (
    <>
      <div className="px-7 pb-7 max-sm:px-4">
        <PageHeader
          title="Mi cuenta"
          subtitle="Revisá el estado de tus cuotas y pagá las pendientes. No hay recargos por pagar fuera de término."
        />

        {/* Resumen del estado de cuenta */}
        <section
          aria-label="Resumen de tu cuenta"
          className="mt-6 grid gap-4 rounded-2xl bg-black/60 p-5 shadow-card glass-border sm:grid-cols-[1fr_auto] sm:items-center"
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
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Monto adeudado
                </p>
                <p
                  className={`text-2xl font-extrabold ${account.owedAmount > 0 ? "text-red-400" : "text-white"}`}
                >
                  {formatARS(account.owedAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Fecha límite
                </p>
                <p className="text-2xl font-extrabold text-white">
                  {formatDate(account.nextDueDate)}
                </p>
              </div>
            </div>
          </div>
          {account.owedAmount > 0 && (
            <button
              onClick={() => setCheckoutOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 py-3.5 text-sm font-extrabold text-squat-ink shadow-btn-lime hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              <i className="ti ti-credit-card text-base" aria-hidden="true" />
              Pagar {formatARS(account.owedAmount)}
            </button>
          )}
        </section>

        <h2 className="mt-8 text-white text-lg font-extrabold">Cuotas</h2>
        <div className="mt-3 flex flex-col gap-3">
          {paginatedMonths.map((m) => {
            const payment = m.paymentId
              ? state.payments.find((p) => p.id === m.paymentId)
              : undefined;
            return (
              <button
                key={m.period}
                onClick={() =>
                  m.paid ? setSelectedPeriod(m.period) : setCheckoutOpen(true)
                }
                className="w-full flex items-center justify-between gap-3 bg-black/60 rounded-2xl p-5 hover:bg-black/70 transition-all duration-150 text-left cursor-pointer group shadow-card glass-border hover:border-white/[0.08]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${m.paid ? "bg-lime-400/10" : "bg-red-900/20"}`}
                  >
                    <i
                      className={`ti ${m.paid ? "ti-circle-check text-lime-400" : "ti-alert-triangle text-red-400"} text-lg`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold">
                      {capitalize(formatPeriod(m.period))}
                      {m.prorated && (
                        <span className="ml-2 text-xs font-medium text-gray-400">
                          (proporcional)
                        </span>
                      )}
                    </p>
                    {m.paid && payment ? (
                      <p className="text-gray-400 text-xs mt-0.5">
                        {PAYMENT_METHOD_LABELS[payment.method]} ·{" "}
                        {formatARS(payment.amountArs)}
                      </p>
                    ) : (
                      <p className="text-red-400 text-xs mt-0.5 font-medium">
                        {formatARS(m.amount)} · {dueLabel(m)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${m.paid ? "bg-green-900/40 text-lime-400" : "bg-red-900/40 text-red-400"}`}
                  >
                    {m.paid ? "Pagada · ver recibo" : "Pagar"}
                  </span>
                  <i
                    className="ti ti-chevron-right text-gray-400 text-sm"
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Recibo de una cuota pagada */}
      <Dialog
        open={!!selectedPayment}
        onOpenChange={(open) => !open && setSelectedPeriod(null)}
      >
        <DialogContent className="max-w-lg bg-stone-950 border-zinc-800 text-white">
          {selectedPayment && (
            <ReceiptPopup
              payment={selectedPayment}
              planName={plan?.name ?? "Sin plan"}
              onClose={() => setSelectedPeriod(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Pago online de lo adeudado */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-6xl bg-stone-950 border-zinc-800 max-h-[90vh] overflow-y-auto text-white [&_.lucide-x]:h-6 [&_.lucide-x]:w-6">
          <DialogTitle className="sr-only">Pagar cuota</DialogTitle>
          <DialogDescription className="sr-only">
            Elegí el medio de pago y confirmá.
          </DialogDescription>
          <div className="p-3">
            <PaymentCheckoutContent
              clientId={client.id}
              alumnoMode
              onClose={() => setCheckoutOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
