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
import { needsBankValidation, validateWithBank } from "@/domain/bank";
import { BANK_VALIDATION_MS } from "@/data/rules";
import { Checkbox } from "@/components/ui/checkbox";
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
  /** "online": lo paga el alumno desde la app (sin efectivo). */
  mode?: "staff" | "online";
  /** Cerrar (después de pagar o al cancelar). */
  onClose: () => void;
}

/**
 * Registrar Pagos (CU 4), con Aplicar Promociones (CU 9) y Emitir Recibos:
 * se eligen las cuotas una por una, el medio de pago y una promoción o cupón.
 * Si el medio es digital, la entidad bancaria valida el pago (y puede
 * rechazarlo: no se registra y se vuelve a elegir el medio). Al registrarse se
 * emite el recibo y el estado del alumno cambia en todas las pantallas.
 */
type ConfirmPhase = "review" | "validating" | "rejected";

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
  /** Cuotas elegidas (`null` = todavía no tocó nada: van las impagas). */
  const [chosen, setChosen] = React.useState<string[] | null>(null);
  const [promoId, setPromoId] = React.useState("");
  const [couponId, setCouponId] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [paid, setPaid] = React.useState<Payment | null>(null);
  const [phase, setPhase] = React.useState<ConfirmPhase>("review");
  const [simulateRejection, setSimulateRejection] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const bankTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(bankTimer.current), []);

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
  const defaultPeriods = (
    account.unpaid.length > 0 ? account.unpaid : available.slice(0, 1)
  ).map((c) => c.period);
  const chosenSet = new Set(chosen ?? defaultPeriods);
  const selected = available.filter((c) => chosenSet.has(c.period));
  const periods = selected.map((c) => c.period);
  const subtotal = selected.reduce((sum, c) => sum + c.amount, 0);

  const promoContext = {
    client,
    clients: state.clients,
    method,
    periods,
    today,
  };
  const options = listedPromotions(promotionsMock, today).map((promo) => ({
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

  function toggleCharge(period: string, checked: boolean) {
    const next = new Set(chosenSet);
    if (checked) next.add(period);
    else next.delete(period);
    setChosen(available.map((c) => c.period).filter((p) => next.has(p)));
  }

  /** Confirmar: si el medio es digital, primero valida la entidad bancaria (pasos 10 y 11). */
  function confirm() {
    if (!needsBankValidation(method)) return register();
    setPhase("validating");
    bankTimer.current = window.setTimeout(() => {
      const result = validateWithBank({
        method,
        amountArs: total,
        simulateRejection,
      });
      if (result.approved) return register();
      // Camino alternativo 11.b: no se registra el pago y se vuelve a elegir el medio.
      actions.rejectPayment({
        clientId: client!.id,
        amountArs: total,
        method,
        reason: result.reason ?? "Sin motivo informado",
      });
      setRejectionReason(result.reason ?? "Sin motivo informado");
      setPhase("rejected");
    }, BANK_VALIDATION_MS);
  }

  function register() {
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
    setPhase("review");
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setPhase("review");
    setSimulateRejection(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-card p-5 shadow-card glass-border">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-primary"
              aria-hidden="true"
            >
              {getInitials(client.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {client.fullName}
              </h2>
              <p className="text-sm text-muted-foreground">
                DNI {client.dni} · {plan.name}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <AccountStatusBadge status={account.status} />
                <span className="text-sm text-foreground/80">
                  {describeAccount(account)}
                </span>
              </div>
            </div>
          </div>

          <SectionCard title="Cuotas a cobrar" icon="ti-receipt">
            <ChargesPicker
              available={available}
              unpaidCount={unpaidCount}
              selected={periods}
              onToggle={toggleCharge}
              today={today}
            />
          </SectionCard>

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
                <dt className="text-muted-foreground">
                  Subtotal ({periods.length}{" "}
                  {periods.length === 1 ? "cuota" : "cuotas"})
                </dt>
                <dd className="text-foreground">{formatARS(subtotal)}</dd>
              </div>
              {discount > 0 && applied && (
                <div className="flex justify-between gap-3">
                  <dt className="text-primary">{applied.name}</dt>
                  <dd className="text-primary">− {formatARS(discount)}</dd>
                </div>
              )}
              <div className="mt-1 flex items-end justify-between gap-3 border-t border-border pt-3">
                <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {online ? "Total a pagar" : "Total a cobrar"}
                </dt>
                <dd className="text-3xl font-extrabold text-foreground">
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
              disabled={periods.length === 0}
              className="h-12 rounded-xl text-base font-extrabold"
            >
              <i className="ti ti-circle-check text-lg" aria-hidden="true" />
              {online ? "Pagar" : "Cobrar"} {formatARS(total)}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {needsBankValidation(method)
                ? "Al confirmar, la entidad bancaria valida el pago y se emite el recibo digital."
                : "Al confirmar se emite el recibo digital."}
            </p>
          </SectionCard>
        </div>
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          // Mientras responde el banco no se puede cerrar.
          if (open || phase === "validating") return;
          closeConfirm();
          if (paid) onClose();
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl border-border bg-card text-foreground">
          {!paid && phase === "validating" ? (
            <div
              className="flex flex-col items-center gap-4 py-6 text-center"
              role="status"
              aria-live="polite"
            >
              <i
                className="ti ti-loader-2 animate-spin text-4xl text-primary motion-reduce:animate-none"
                aria-hidden="true"
              />
              <AlertDialogTitle className="text-lg font-extrabold">
                Validando el pago con la entidad bancaria…
              </AlertDialogTitle>
              <AlertDialogDescription>
                {PAYMENT_METHOD_LABELS[method]} · {formatARS(total)}. No cierres
                esta ventana.
              </AlertDialogDescription>
            </div>
          ) : !paid && phase === "rejected" ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-lg font-extrabold">
                  <i
                    className="ti ti-circle-x text-2xl text-danger"
                    aria-hidden="true"
                  />
                  La entidad bancaria rechazó el pago
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Motivo: {rejectionReason}. El pago no se registró y la deuda
                  sigue igual. Elegí otro medio de pago para intentar de nuevo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Button
                type="button"
                onClick={closeConfirm}
                className="h-11 rounded-xl font-bold"
              >
                Elegir otro medio de pago
              </Button>
            </>
          ) : !paid ? (
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
              {needsBankValidation(method) && (
                <div className="flex flex-col gap-2 rounded-xl bg-secondary/60 p-3">
                  <p className="flex items-start gap-2 text-xs text-foreground/80">
                    <i
                      className="ti ti-building-bank mt-0.5 text-sm"
                      aria-hidden="true"
                    />
                    Con {PAYMENT_METHOD_LABELS[method].toLowerCase()} el pago lo
                    valida la entidad bancaria antes de registrarse.
                  </p>
                  <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={simulateRejection}
                      onCheckedChange={(v) => setSimulateRejection(v === true)}
                    />
                    Simular que la entidad rechaza el pago (DEMO)
                  </label>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeConfirm}
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
                  {needsBankValidation(paid.method)
                    ? "La entidad bancaria aprobó el pago. "
                    : ""}
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
                    closeConfirm();
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
