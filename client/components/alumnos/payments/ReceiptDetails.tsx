import { DetailList, type DetailItem } from "@/components/common/DetailList";
import { PAYMENT_METHOD_LABELS, type Payment } from "@/data/payments";
import { getPromotion } from "@/data/promotions";
import { getUserName } from "@/data/users";
import { formatDateTime, formatPeriod } from "@/lib/dates";
import { formatARS } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ReceiptDetailsProps {
  payment: Payment;
  clientName: string;
  className?: string;
}

/**
 * Recibo digital: fecha, monto y medio de pago (regla de negocio), con número,
 * cuotas, descuento y quién lo registró. Es lo único que sale al imprimir.
 */
export function ReceiptDetails({
  payment,
  clientName,
  className,
}: ReceiptDetailsProps) {
  const promo = getPromotion(payment.promoId);
  const items: DetailItem[] = [
    { label: "Recibo", value: payment.receiptNumber },
    { label: "Alumno", value: clientName },
    {
      label: payment.periods.length > 1 ? "Cuotas" : "Cuota",
      value: payment.periods.map(formatPeriod).join(", "),
    },
  ];
  if (payment.discountArs > 0) {
    items.push(
      { label: "Subtotal", value: formatARS(payment.subtotalArs) },
      {
        label: "Descuento",
        value: `− ${formatARS(payment.discountArs)}${promo ? ` (${promo.name})` : ""}`,
      },
    );
  }
  items.push(
    { label: "Total pagado", value: formatARS(payment.amountArs) },
    { label: "Medio de pago", value: PAYMENT_METHOD_LABELS[payment.method] },
    { label: "Fecha", value: formatDateTime(payment.createdAt) },
    { label: "Registrado por", value: getUserName(payment.processedBy) },
  );

  return (
    <div className={cn("print-area", className)}>
      <p className="mb-2 hidden text-lg font-bold print:block">
        SquatGym · Recibo de pago
      </p>
      <DetailList items={items} />
      <p className="mt-3 hidden text-xs print:block">
        Sin intereses ni recargos por mora.
      </p>
    </div>
  );
}
