import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getPlan } from "@/data/plans";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/data/payments";
import { formatARS } from "@/lib/format";
import { addMonths, formatDate, formatDateTime, formatPeriod, toPeriod, todayISO } from "@/lib/dates";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { dueDateFor } from "@/domain/billing";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { getUserName } from "@/data/users";
import type { Payment } from "@/data/payments";
import { selectAccount } from "@/store/selectors";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Promo {
  id: string;
  label: string;
  badge?: string;
  rate: number;
}

const PROMOS: Promo[] = [
  { id: "none",        label: "Sin promoción",            rate: 0 },
  { id: "efectivo10",  label: "10% OFF Pago en Efectivo", rate: 0.10, badge: "EFECTIVO" },
  { id: "referido5",   label: "5% OFF Referido",          rate: 0.05, badge: "REFERIDO" },
  { id: "socio15",     label: "15% OFF Socio Antiguo",    rate: 0.15, badge: "+1 AÑO" },
  { id: "semestral20", label: "20% OFF Cuota Semestral",  rate: 0.20, badge: "SEMESTRAL" },
  { id: "bienvenida",  label: "25% OFF Primer Mes",       rate: 0.25, badge: "BIENVENIDA" },
];

const METHOD_ICONS: Record<PaymentMethod, string> = {
  cash: "ti-cash",
  debit: "ti-credit-card",
  transfer: "ti-building-bank",
  qr: "ti-qrcode",
};

/** En recepción se aceptan los 4 medios; el pago online del alumno no puede ser en efectivo. */
const STAFF_METHODS: PaymentMethod[] = ["cash", "debit", "transfer", "qr"];
const ONLINE_METHODS: PaymentMethod[] = ["debit", "transfer", "qr"];

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
}

interface PaymentCheckoutContentProps {
  clientId: string;
  onClose?: () => void;
  /** Modo alumno: pago online, sin efectivo ni selector de promociones. */
  alumnoMode?: boolean;
}

export function PaymentCheckoutContent({ clientId, onClose, alumnoMode = false }: PaymentCheckoutContentProps) {
  const navigate = useNavigate();
  const methods = alumnoMode ? ONLINE_METHODS : STAFF_METHODS;
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentMethod>(methods[0]);
  const [promoId, setPromoId] = React.useState("none");
  const [promoOpen, setPromoOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  // Pago recién registrado (para mostrar su recibo).
  const [paidPayment, setPaidPayment] = React.useState<Payment | null>(null);
  const paid = paidPayment !== null;
  const state = useAppState();
  const actions = useStoreActions();
  const promoRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (promoRef.current && !promoRef.current.contains(e.target as Node)) {
        setPromoOpen(false);
      }
    }
    if (promoOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [promoOpen]);

  const client = state.clients.find((c) => c.id === clientId);
  const plan = getPlan(client?.planId);

  if (!client) return null;

  const account = selectAccount(state, client);
  const isDebtor = account.status === "deudor" || account.status === "bloqueado";
  // Se cobran todas las cuotas adeudadas. Si está al día, puede adelantar el mes siguiente.
  // Regla de negocio: no hay intereses ni recargos por mora.
  const nextPeriod = addMonths(toPeriod(todayISO()), 1);
  const charges =
    account.unpaid.length > 0
      ? account.unpaid
      : [{ period: nextPeriod, amount: plan?.monthlyPriceArs ?? 0, prorated: false, dueDate: dueDateFor(nextPeriod, client.enrolledAt), paid: false }];
  const subtotal = charges.reduce((sum, c) => sum + c.amount, 0);

  const activePromo = PROMOS.find((p) => p.id === promoId) ?? PROMOS[0];
  const discountAmt = !alumnoMode && activePromo.rate > 0 ? Math.round(subtotal * activePromo.rate) : 0;
  const total = subtotal - discountAmt;

  function handlePay() { setDialogOpen(true); }
  function handleConfirm() {
    // Queda registrado en el store: cambia el estado de cuenta y la habilitación en todas las pantallas.
    const payment = actions.registerPayment({
      clientId: client!.id,
      periods: charges.map((c) => c.period),
      subtotalArs: subtotal,
      discountArs: discountAmt,
      promoId: activePromo.id !== "none" ? activePromo.id : undefined,
      method: selectedPayment,
      online: alumnoMode,
      description: `Cuota${charges.length > 1 ? "s" : ""} ${charges.map((c) => formatPeriod(c.period)).join(", ")} · ${plan?.name ?? ""}`,
    });
    setPaidPayment(payment);
  }

  function handleClose() {
    if (paid) {
      setDialogOpen(false);
      setPaidPayment(null);
      if (onClose) { onClose(); } else { navigate(-1); }
    } else {
      setDialogOpen(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* ── Left Column ── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">

          {/* Account Status Card */}
          <div className="bg-stone-900 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-card glass-border">
            {isDebtor && (
              <div className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 rounded-xl blur-[32px] bg-[linear-gradient(135deg,rgba(147,0,10,0.2)_0%,rgba(147,0,10,0)_100%)]" />
            )}

            <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-zinc-800 border-2 border-zinc-700 shrink-0">
                  <span className="text-lg font-bold text-lime-400">{getInitials(client.fullName)}</span>
                </div>
                <div>
                  <h2 className="text-white font-jakarta text-xl md:text-2xl font-bold leading-8">
                    {client.fullName}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    DNI: {client.dni} • Alumno #{client.id.replace("cl_", "")}
                  </p>
                </div>
              </div>

              <AccountStatusBadge status={account.status} className="self-start" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Plan actual</span>
                <span className="text-white text-sm md:text-base font-medium">{plan?.name ?? "Sin plan"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
                  {isDebtor ? "Atraso" : "Fecha límite"}
                </span>
                <span className={`text-sm md:text-base font-medium ${isDebtor ? "text-red-400" : "text-white"}`}>
                  {isDebtor ? `${account.overdueDays} días (desde el ${formatDate(account.unpaid[0].dueDate)})` : formatDate(charges[0].dueDate)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
                  {alumnoMode ? "A pagar" : "A cobrar"}
                </span>
                <span className="text-white font-jakarta text-xl md:text-2xl font-extrabold">
                  {formatARS(subtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing detail */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-jakarta text-lg font-bold">Detalle</h3>

            <div className="border border-zinc-800 bg-neutral-900 rounded-xl p-2 flex flex-col">
              {charges.map((charge) => (
                <div key={charge.period} className="flex items-center justify-between p-4 rounded-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-zinc-800 rounded-lg">
                      <i className="ti ti-receipt text-lg text-gray-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">
                        Cuota de {formatPeriod(charge.period)}
                        {charge.prorated && <span className="ml-2 text-xs font-medium text-gray-400">(proporcional)</span>}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {plan?.name} · vence el {formatDate(charge.dueDate)}
                      </p>
                    </div>
                  </div>
                  <span className="text-white text-base font-bold shrink-0">{formatARS(charge.amount)}</span>
                </div>
              ))}
              <p className="px-4 pb-3 text-xs text-gray-400">Sin recargos por mora.</p>
            </div>

            {/* Promoción: solo la aplica la secretaria */}
            {!alumnoMode && (
              <div ref={promoRef} className="relative">
                <button
                  onClick={() => setPromoOpen((v) => !v)}
                  aria-expanded={promoOpen}
                  className="w-full bg-neutral-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2 text-left cursor-pointer hover:border-zinc-700 transition-colors"
                >
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Aplicar promoción</span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{activePromo.label}</span>
                      {activePromo.badge && activePromo.id !== "none" && (
                        <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 text-[11px] font-bold tracking-wider">
                          {activePromo.badge}
                        </span>
                      )}
                    </div>
                    <i className={`ti ti-chevron-down text-gray-400 text-base transition-transform duration-200 ${promoOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </div>
                </button>

                {promoOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-neutral-800 border border-zinc-700 rounded-xl overflow-hidden z-20 shadow-2xl">
                    {PROMOS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setPromoId(p.id); setPromoOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer transition-colors hover:bg-zinc-700/50 ${promoId === p.id ? "bg-zinc-700/40" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          {promoId === p.id && <i className="ti ti-check text-lime-400 text-xs" aria-hidden="true" />}
                          <span className={`text-sm ${promoId === p.id ? "text-white font-semibold" : "text-gray-300"}`}>
                            {p.label}
                          </span>
                        </div>
                        {p.badge && p.id !== "none" && (
                          <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 text-[11px] font-bold tracking-wider shrink-0">
                            {p.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column – Checkout ── */}
        <div className="col-span-12 lg:col-span-5 bg-stone-900 rounded-2xl flex flex-col gap-6 p-6 md:p-8 shadow-card glass-border">
          <h3 className="text-white font-jakarta text-xl font-bold">Medio de pago</h3>

          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Medio de pago">
            {methods.map((method) => (
              <button
                key={method}
                role="radio"
                aria-checked={selectedPayment === method}
                onClick={() => setSelectedPayment(method)}
                className={`flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl transition-all duration-150 cursor-pointer active:scale-[0.97] ${
                  selectedPayment === method
                    ? "border border-lime-400 bg-zinc-800 shadow-[0_0_12px_rgba(149,253,0,0.1)]"
                    : "border border-white/[0.06] bg-neutral-900 hover:bg-zinc-800/60"
                }`}
              >
                <i className={`ti ${METHOD_ICONS[method]} text-2xl ${selectedPayment === method ? "text-lime-400" : "text-gray-400"}`} aria-hidden="true" />
                <span className={`text-sm ${selectedPayment === method ? "font-bold text-white" : "font-medium text-gray-300"}`}>
                  {PAYMENT_METHOD_LABELS[method]}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-neutral-900 border border-dashed border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Subtotal</span>
              <span className="text-white text-sm">{formatARS(subtotal)}</span>
            </div>

            {discountAmt > 0 && (
              <div className="flex items-center justify-between pb-1">
                <span className="text-lime-400 text-sm">{activePromo.label}</span>
                <span className="text-lime-400 text-sm">-{formatARS(discountAmt)}</span>
              </div>
            )}

            <div className="h-px bg-zinc-800" />

            <div className="flex items-end justify-between pt-2">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                {alumnoMode ? "Total a pagar" : "Total a cobrar"}
              </span>
              <span className="text-white font-jakarta text-4xl font-extrabold">{formatARS(total)}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-lime-400 hover:brightness-105 active:brightness-95 active:scale-[0.99] transition-all duration-150 cursor-pointer shadow-btn-lime"
          >
            <i className="ti ti-circle-check text-lg text-squat-ink" aria-hidden="true" />
            <span className="text-squat-ink font-jakarta text-lg font-extrabold tracking-wide">
              {alumnoMode ? "PAGAR CUOTA" : "CONFIRMAR Y COBRAR"}
            </span>
          </button>

          <p className="text-gray-400 text-xs text-center">Al confirmar se emite el recibo correspondiente.</p>
        </div>
      </div>

      {/* Confirmation / Success Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <AlertDialogContent className="bg-neutral-900 border border-white/[0.08] text-white max-w-md">
          {!paid ? (
            <>
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
                    <i className="ti ti-receipt text-lime-400 text-lg" aria-hidden="true" />
                  </div>
                  <AlertDialogTitle className="text-white text-lg">
                    {alumnoMode ? "¿Confirmar pago?" : "¿Confirmar cobro?"}
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription asChild>
                  <div className="flex flex-col gap-3 text-gray-400 text-sm">
                    <p>Estás por registrar el siguiente pago:</p>
                    <div className="bg-neutral-800 rounded-xl p-4 flex flex-col gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Alumno</span>
                        <span className="text-white font-semibold">{client.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Medio de pago</span>
                        <span className="text-white font-semibold">{PAYMENT_METHOD_LABELS[selectedPayment]}</span>
                      </div>
                      {discountAmt > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Descuento</span>
                          <span className="text-lime-400 font-semibold">-{formatARS(discountAmt)}</span>
                        </div>
                      )}
                      <div className="h-px bg-zinc-700" />
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-semibold">Total</span>
                        <span className="text-white font-extrabold text-base">{formatARS(total)}</span>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 border border-zinc-700 text-gray-300 text-sm font-semibold hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-lime-400 text-squat-ink text-sm font-extrabold hover:brightness-105 active:brightness-95 transition-all cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-lime-400/10 flex items-center justify-center">
                    <i className="ti ti-circle-check text-lime-400 text-3xl" aria-hidden="true" />
                  </div>
                  <AlertDialogTitle className="text-white text-xl">Pago registrado</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="flex w-full flex-col gap-3">
                      <p className="text-gray-300 text-sm">Recibo digital {paidPayment?.receiptNumber}</p>
                      {paidPayment && (
                        <dl className="w-full rounded-xl bg-neutral-800 p-4 text-left text-sm">
                          {[
                            ["Alumno", client.fullName],
                            ["Período", paidPayment.periods.map((p) => formatPeriod(p)).join(", ")],
                            ["Monto", formatARS(paidPayment.amountArs)],
                            ["Medio de pago", PAYMENT_METHOD_LABELS[paidPayment.method]],
                            ["Fecha", formatDateTime(paidPayment.createdAt)],
                            ["Registrado por", getUserName(paidPayment.processedBy)],
                          ].map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-4 py-1">
                              <dt className="text-gray-400">{label}</dt>
                              <dd className="text-right font-semibold text-white">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  </AlertDialogDescription>
                </div>
              </AlertDialogHeader>
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-lime-400 text-squat-ink text-sm font-extrabold hover:brightness-105 transition-all cursor-pointer mt-2"
              >
                Listo
              </button>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
