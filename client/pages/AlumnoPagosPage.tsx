import * as React from "react";
import { Pagination } from "@/components/common/Pagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentCheckoutContent } from "@/components/cobros/PaymentCheckoutContent";
import { getMockSession } from "@/data/users";
import { clientsMock, type Client } from "@/data/clients";
import { plansMock } from "@/data/plans";
import { paymentsMock, type Payment } from "@/data/payments";

interface MonthRecord {
  key: string;
  label: string;
  from: Date;
  to: Date;
  payment?: Payment;
  status: "paid" | "unpaid";
}

function getClientFromSession(): Client | undefined {
  const session = getMockSession();
  if (!session) return;
  return clientsMock.find((c) => c.fullName === session.fullName);
}

function buildMonthHistory(client: Client, planPrice: number): MonthRecord[] {
  const now = new Date();
  const months: MonthRecord[] = [];

  const clientPayments = paymentsMock.filter(
    (p) => p.clientId === client.id && p.concept === "membership",
  );

  for (let i = 0; i <= 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
    const from = d;
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const isCurrentMonth =
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

    const payment = clientPayments.find((p) => {
      if (!p.period) return false;
      const pFrom = new Date(p.period.from);
      return (
        pFrom.getMonth() === d.getMonth() &&
        pFrom.getFullYear() === d.getFullYear() &&
        p.status === "approved"
      );
    });

    months.push({
      key,
      label,
      from,
      to,
      payment:
        payment ||
        (isCurrentMonth
          ? undefined
          : {
              id: `synth_${key}`,
              clientId: client.id,
              branchId: client.branchId,
              processedByEmployeeId: "",
              createdAt: to.toISOString(),
              amountArs: planPrice,
              method: "debit" as const,
              status: "approved" as const,
              concept: "membership" as const,
              reference: `MENSUAL-${key}`,
            }),
      status: isCurrentMonth && !payment ? "unpaid" : "paid",
    });
  }

  return months;
}

function getMethodLabel(method: string) {
  const map: Record<string, string> = {
    cash: "Efectivo",
    debit: "Débito",
    credit: "Crédito",
    transfer: "Transferencia",
    mp: "Mercado Pago",
  };
  return map[method] ?? method;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ReceiptPopupProps {
  payment: Payment;
  planName: string;
  onClose: () => void;
}

function ReceiptPopup({ payment, planName, onClose }: ReceiptPopupProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center">
          <i className="ti ti-receipt text-2xl text-lime-400" />
        </div>
        <div>
          <h2 className="text-app-text text-lg font-extrabold">Comprobante</h2>
          <p className="text-app-subtle text-xs">{payment.reference}</p>
        </div>
      </div>

      <div className="bg-app-surface rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-app-border/[0.12]/40">
          <span className="text-app-subtle text-xs font-semibold tracking-wider">
            PERIODO
          </span>
          <span className="text-app-text text-sm font-bold">
            {payment.period
              ? `${new Date(payment.period.from).toLocaleDateString("es-AR", { day: "numeric", month: "short" })} - ${new Date(payment.period.to).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`
              : "-"}
          </span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-app-border/[0.12]/40">
          <span className="text-app-subtle text-xs font-semibold tracking-wider">
            PLAN
          </span>
          <span className="text-app-text text-sm font-bold">{planName}</span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-app-border/[0.12]/40">
          <span className="text-app-subtle text-xs font-semibold tracking-wider">
            MONTO
          </span>
          <span className="text-lime-400 text-base font-extrabold">
            ${payment.amountArs.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-app-border/[0.12]/40">
          <span className="text-app-subtle text-xs font-semibold tracking-wider">
            MÉTODO DE PAGO
          </span>
          <span className="text-app-text text-sm font-bold">
            {getMethodLabel(payment.method)}
          </span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-app-border/[0.12]/40">
          <span className="text-app-subtle text-xs font-semibold tracking-wider">
            FECHA DE PAGO
          </span>
          <span className="text-app-text text-sm font-bold">
            {formatDate(payment.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-app-subtle text-xs font-semibold tracking-wider">
            ESTADO
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15/40 text-lime-400 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            Aprobado
          </span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-app-bg text-app-text text-xs font-bold hover:bg-app-card transition-colors cursor-pointer"
      >
        CERRAR
      </button>
    </div>
  );
}

const ITEMS_PER_PAGE = 3;

export default function AlumnoPagosPage() {
  const [selectedMonthKey, setSelectedMonthKey] = React.useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = React.useState(1);

  const client = React.useMemo(() => getClientFromSession(), []);
  const plan = React.useMemo(
    () =>
      client
        ? plansMock.find((p) => p.id === client.membership?.planId)
        : undefined,
    [client],
  );
  const months = React.useMemo(() => {
    if (!client) return [];
    return buildMonthHistory(client, plan?.monthlyPriceArs ?? 0);
  }, [client, plan]);

  const selectedMonth = months.find((m) => m.key === selectedMonthKey);
  const totalPages = Math.ceil(months.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMonths = months.slice(start, start + ITEMS_PER_PAGE);

  return (
    <>
      <div className="px-7 pb-7 max-sm:px-4">
        <h1 className="text-app-text text-3xl md:text-4xl font-extrabold leading-tight">
          HISTORIAL DE PAGOS
        </h1>
        <p className="text-app-faint text-sm mt-2 max-w-xl leading-relaxed">
          Revisá el estado de tus cuotas mensuales y realizá el pago de las
          pendientes.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {paginatedMonths.map((m) => {
            const isPaid = m.status === "paid";
            const isUnpaid = m.status === "unpaid";

            return (
              <button
                key={m.key}
                onClick={() => setSelectedMonthKey(m.key)}
                className="w-full flex items-center justify-between bg-app-surface rounded-2xl p-5 hover:bg-app-card transition-all duration-150 text-left cursor-pointer group shadow-card glass-border hover:border-app-border/[0.08]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPaid ? "bg-lime-400/10" : "bg-red-500/12"
                    }`}
                  >
                    {isPaid ? (
                      <i className="ti ti-circle-check text-lg text-lime-400" />
                    ) : (
                      <i className="ti ti-alert-triangle text-lg text-red-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-app-text text-sm font-bold capitalize">
                      {m.label}
                    </p>
                    {isPaid && m.payment && (
                      <p className="text-app-subtle text-xs mt-0.5">
                        {getMethodLabel(m.payment.method)} · $
                        {m.payment.amountArs.toLocaleString()}
                      </p>
                    )}
                    {isUnpaid && (
                      <p className="text-red-400 text-xs mt-0.5 font-medium">
                        Pendiente de pago
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isPaid ? (
                    <span className="px-3 py-1 rounded-full bg-lime-400/15 border border-lime-400/25 text-lime-400 text-[10px] font-bold">
                      Pagado
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-500/12 border border-red-500/25 text-red-400 text-[10px] font-bold">
                      Adeuda
                    </span>
                  )}
                  <i className="ti ti-chevron-right text-app-faint text-sm group-hover:text-app-muted transition-colors" />
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

      {/* Dialog: Paid → receipt */}
      <Dialog
        open={!!selectedMonth && selectedMonth.status === "paid"}
        onOpenChange={(open) => !open && setSelectedMonthKey(null)}
      >
        <DialogContent className="max-w-lg bg-app-card-deep border-app-border/[0.12] text-app-text">
          {selectedMonth?.payment && (
            <ReceiptPopup
              payment={selectedMonth.payment}
              planName={plan?.name ?? "Sin plan"}
              onClose={() => setSelectedMonthKey(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Unpaid → checkout */}
      <Dialog
        open={!!selectedMonth && selectedMonth.status === "unpaid"}
        onOpenChange={(open) => !open && setSelectedMonthKey(null)}
      >
        <DialogContent className="max-w-6xl bg-app-card-deep border-app-border/[0.12] max-h-[90vh] overflow-y-auto text-app-text [&_.lucide-x]:h-6 [&_.lucide-x]:w-6">
          <div className="p-3">
            {client && (
              <PaymentCheckoutContent
                clientId={client.id}
                alumnoMode
                onClose={() => setSelectedMonthKey(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
