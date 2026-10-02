import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { DetailList } from "@/components/common/DetailList";
import { EmptyState } from "@/components/common/EmptyState";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { getPlan } from "@/data/plans";
import {
  PAYMENT_METHOD_LABELS,
  type Payment,
  type PaymentMethod,
} from "@/data/payments";
import { getPromotion, promotionsMock } from "@/data/promotions";
import { describeAccount, upcomingCharges } from "@/domain/billing";
import {
  checkPromotion,
  findCoupon,
  listedPromotions,
  promotionDiscount,
} from "@/domain/promotions";
import { formatPeriod, todayISO } from "@/lib/dates";
import { formatARS, getInitials } from "@/lib/format";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";
import { ChargesPicker } from "./ChargesPicker";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { PromotionPicker } from "./PromotionPicker";
import { ReceiptDetails } from "./ReceiptDetails";

/** En recepción se aceptan los 4 medios; el pago online del alumno no puede ser en efectivo. */
const STAFF_METHODS: PaymentMethod[] = ["cash", "debit", "transfer", "qr"];
const ONLINE_METHODS: PaymentMethod[] = ["debit", "transfer", "qr"];
/** Cuántos meses se pueden adelantar como máximo. */
const MAX_ADVANCE = 6;

interface CheckoutPanelProps {
  clientId: string;
  /** "online": lo paga el alumno desde la app (sin efectivo ni promociones). */
  mode?: "staff" | "online";
  /** Cerrar (después de pagar o al cancelar). */
  onClose: () => void;
}

/**
 * Cobro de cuotas (CU 4) con promociones (CU 9): elige cuántas cuotas, el
 * medio de pago y una promoción o cupón. Al confirmar se registra el pago, se
 * emite el recibo y el estado del alumno cambia en todas las pantallas.
 */
export function CheckoutPanel({
  clientId,
  mode = "staff",
  onClose,
}: CheckoutPanelProps) {
  const state = useAppState();
  const actions = useStoreActions();
  const today = todayISO();
  const online = mode === "online";
  const methods = online ? ONLINE_METHODS : STAFF_METHODS;

  const client = state.clients.find((c) => c.id === clientId);
  const plan = getPlan(client?.planId);
  const account = client ? selectAccount(state, client, today) : undefined;
  const unpaidCount = account?.unpaid.length ?? 0;

  const [method, setMethod] = React.useState<PaymentMethod>(methods[0]);
  const [count, setCount] = React.useState(Math.max(1, unpaidCount));
  const [promoId, setPromoId] = React.useState("");
  const [couponId, setCouponId] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [paid, setPaid] = React.useState<Payment | null>(null);

  if (!client || !account) return null;
  if (!plan) {
    return (
      <EmptyState
        icon="ti-receipt-off"
        title="Este alumno no tiene un plan asignado"
        description="Asignale un plan desde su ficha antes de cobrar."
      />
    );
  }

  const available = [
    ...account.unpaid,
    ...upcomingCharges(client, plan, account, state.payments, MAX_ADVANCE),
  ];
  const selected = available.slice(0, count);
  const periods = selected.map((c) => c.period);
  const subtotal = selected.reduce((sum, c) => sum + c.amount, 0);

  const promoContext = {
    client,
    clients: state.clients,
    method,
    periods,
    today,
  };
  const options = online
    ? []
    : listedPromotions(promotionsMock, today).map((promo) => ({
        promo,
        check: checkPromotion(promo, promoContext),
      }));
  const applied = getPromotion(couponId || promoId);
  const appliedCheck = applied
    ? checkPromotion(applied, promoContext)
    : undefined;
  const discount =
    applied && appliedCheck?.ok ? promotionDiscount(applied, subtotal) : 0;
  const total = subtotal - discount;

  function applyCoupon(code: string): string | null {
    const coupon = findCoupon(promotionsMock, code);
    if (!coupon) return "Ese cupón no existe. Revisá cómo está escrito.";
    const check = checkPromotion(coupon, promoContext);
    if (!check.ok)
      return `El cupón ${coupon.code} no se puede usar: ${check.reason}`;
    setCouponId(coupon.id);
    setPromoId("");
    return null;
  }

  function confirm() {
    const payment = actions.registerPayment({
      clientId: client!.id,
      periods,
      subtotalArs: subtotal,
      discountArs: discount,
      promoId: discount > 0 ? applied?.id : undefined,
      method,
      online,
      description: `${periods.length > 1 ? "Cuotas" : "Cuota"} ${periods.map(formatPeriod).join(", ")} · ${plan!.name}`,
    });
    setPaid(payment);
  }

  return (
    <>
      <div className="grid items-start gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-neutral-900 p-5 shadow-card glass-border">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-lg font-bold text-primary"
              aria-hidden="true"
            >
              {getInitials(client.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white">
                {client.fullName}
              </h2>
              <p className="text-sm text-gray-400">
                DNI {client.dni} · {plan.name}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <AccountStatusBadge status={account.status} />
                <span className="text-sm text-gray-300">
                  {describeAccount(account)}
                </span>
              </div>
            </div>
          </div>

          <SectionCard title="Cuotas a cobrar" icon="ti-receipt">
            <ChargesPicker
              available={available}
              unpaidCount={unpaidCount}
              count={count}
              onCountChange={setCount}
              today={today}
            />
          </SectionCard>

          {!online && (
            <SectionCard title="Promoción" icon="ti-discount">
              <PromotionPicker
                options={options}
                selectedId={promoId}
                onSelect={(id) => {
                  setPromoId(id);
                  setCouponId("");
                }}
                coupon={couponId ? getPromotion(couponId) : undefined}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={() => setCouponId("")}
              />
            </SectionCard>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <SectionCard title="Medio de pago" icon="ti-wallet">
            <PaymentMethodPicker
              methods={methods}
              value={method}
              onChange={setMethod}
            />
          </SectionCard>

          <SectionCard title="Total" icon="ti-calculator">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-400">
                  Subtotal ({count} {count === 1 ? "cuota" : "cuotas"})
                </dt>
                <dd className="text-white">{formatARS(subtotal)}</dd>
              </div>
              {discount > 0 && applied && (
                <div className="flex justify-between gap-3">
                  <dt className="text-primary">{applied.name}</dt>
                  <dd className="text-primary">− {formatARS(discount)}</dd>
                </div>
              )}
              <div className="mt-1 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-3">
                <dt className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {online ? "Total a pagar" : "Total a cobrar"}
                </dt>
                <dd className="text-3xl font-extrabold text-white">
                  {formatARS(total)}
                </dd>
              </div>
            </dl>
            {applied && appliedCheck && !appliedCheck.ok && (
              <p
                className="flex items-start gap-2 text-xs text-warning"
                role="status"
              >
                <i
                  className="ti ti-alert-triangle mt-0.5 text-sm"
                  aria-hidden="true"
                />
                «{applied.name}» no se aplica: {appliedCheck.reason}
              </p>
            )}
            <Button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="h-12 rounded-xl text-base font-extrabold"
            >
              <i className="ti ti-circle-check text-lg" aria-hidden="true" />
              {online ? "Pagar" : "Cobrar"} {formatARS(total)}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Al confirmar se emite el recibo digital.
            </p>
          </SectionCard>
        </div>
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (open) return;
          setConfirmOpen(false);
          if (paid) onClose();
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
          {!paid ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-extrabold">
                  {online ? "¿Confirmar el pago?" : "¿Confirmar el cobro?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Revisá los datos antes de registrar el pago.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <DetailList
                items={[
                  { label: "Alumno", value: client.fullName },
                  {
                    label: periods.length > 1 ? "Cuotas" : "Cuota",
                    value: periods.map(formatPeriod).join(", "),
                  },
                  {
                    label: "Medio de pago",
                    value: PAYMENT_METHOD_LABELS[method],
                  },
                  ...(discount > 0 && applied
                    ? [
                        {
                          label: "Promoción",
                          value: `${applied.name} (− ${formatARS(discount)})`,
                        },
                      ]
                    : []),
                  { label: "Total", value: formatARS(total) },
                ]}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={confirm}
                  className="flex-1 rounded-xl font-bold"
                >
                  Confirmar
                </Button>
              </div>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <i
                    className="ti ti-circle-check text-2xl text-success"
                    aria-hidden="true"
                  />
                  Pago registrado
                </AlertDialogTitle>
                <AlertDialogDescription>
                  El estado de {client.fullName} ya se actualizó en todas las
                  pantallas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <ReceiptDetails payment={paid} clientName={client.fullName} />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex-1 rounded-xl"
                >
                  <i className="ti ti-printer text-base" aria-hidden="true" />
                  Imprimir recibo
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setConfirmOpen(false);
                    onClose();
                  }}
                  className="flex-1 rounded-xl font-bold"
                >
                  Listo
                </Button>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
