import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { DetailList } from "@/components/common/DetailList";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import {
  PAYMENT_METHOD_LABELS,
  type Payment,
  type PaymentStatus,
} from "@/data/payments";
import { getUserName } from "@/data/users";
import { formatDateTime, formatPeriod } from "@/lib/dates";
import { formatARS } from "@/lib/format";

const STATUS: Record<
  PaymentStatus,
  { label: string; tone: StatusTone; icon: string }
> = {
  approved: { label: "Aprobado", tone: "success", icon: "ti-circle-check" },
  rejected: { label: "Rechazado", tone: "danger", icon: "ti-circle-x" },
  refunded: { label: "Reintegrado", tone: "neutral", icon: "ti-arrow-back-up" },
};

const periodsLabel = (payment: Payment) =>
  payment.periods.map(formatPeriod).join(", ");

interface PaymentsSectionProps {
  clientName: string;
  payments: Payment[];
}

/** Pagos registrados del alumno, cada uno con su recibo digital. */
export function PaymentsSection({
  clientName,
  payments,
}: PaymentsSectionProps) {
  const [receipt, setReceipt] = React.useState<Payment | null>(null);

  return (
    <SectionCard title="Pagos registrados" icon="ti-receipt">
      {payments.length === 0 ? (
        <EmptyState
          icon="ti-receipt-off"
          title="Todavía no tiene pagos registrados"
        />
      ) : (
        <ul className="flex flex-col divide-y divide-white/[0.05]">
          {payments.map((payment) => {
            const status = STATUS[payment.status];
            return (
              <li
                key={payment.id}
                className="flex flex-wrap items-center gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    Cuota de {periodsLabel(payment)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(payment.createdAt)} ·{" "}
                    {PAYMENT_METHOD_LABELS[payment.method]} ·{" "}
                    {getUserName(payment.processedBy)}
                  </p>
                </div>
                <span className="text-sm font-bold text-white">
                  {formatARS(payment.amountArs)}
                </span>
                <StatusBadge tone={status.tone} icon={status.icon}>
                  {status.label}
                </StatusBadge>
                {payment.status === "approved" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReceipt(payment)}
                    aria-label={`Ver recibo ${payment.receiptNumber}`}
                    className="rounded-xl text-primary hover:text-primary"
                  >
                    <i
                      className="ti ti-file-invoice text-sm"
                      aria-hidden="true"
                    />
                    Recibo
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={!!receipt}
        onOpenChange={(open) => !open && setReceipt(null)}
      >
        <DialogContent className="max-w-md rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
          {receipt && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold">
                  Recibo {receipt.receiptNumber}
                </DialogTitle>
                <DialogDescription>
                  Comprobante del pago de {clientName}.
                </DialogDescription>
              </DialogHeader>
              <DetailList
                items={[
                  { label: "Período", value: periodsLabel(receipt) },
                  ...(receipt.discountArs > 0
                    ? [
                        {
                          label: "Subtotal",
                          value: formatARS(receipt.subtotalArs),
                        },
                        {
                          label: "Descuento",
                          value: `− ${formatARS(receipt.discountArs)}`,
                        },
                      ]
                    : []),
                  {
                    label: "Total pagado",
                    value: formatARS(receipt.amountArs),
                  },
                  {
                    label: "Medio de pago",
                    value: PAYMENT_METHOD_LABELS[receipt.method],
                  },
                  { label: "Fecha", value: formatDateTime(receipt.createdAt) },
                  {
                    label: "Registrado por",
                    value: getUserName(receipt.processedBy),
                  },
                ]}
              />
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setReceipt(null)}
                  className="rounded-xl font-bold"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
