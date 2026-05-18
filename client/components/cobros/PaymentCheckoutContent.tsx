"use client";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { clientsMock } from "@/data/clients";
import { plansMock } from "@/data/plans";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | "qr";

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

const PAYMENT_METHODS = [
  { id: "efectivo" as const,      label: "Efectivo",      icon: "ti-cash" },
  { id: "tarjeta" as const,       label: "Tarjeta",       icon: "ti-credit-card" },
  { id: "transferencia" as const, label: "Transferencia", icon: "ti-building-bank" },
  { id: "qr" as const,            label: "QR",            icon: "ti-qrcode" },
];

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
}

interface PaymentCheckoutContentProps {
  clientId: string;
  onClose?: () => void;
  /** Modo alumno: sin toggle de mora, descuento automático 10% en efectivo */
  alumnoMode?: boolean;
}

export function PaymentCheckoutContent({ clientId, onClose, alumnoMode = false }: PaymentCheckoutContentProps) {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentMethod>("efectivo");
  const [promoId, setPromoId] = React.useState("none");
  const [promoOpen, setPromoOpen] = React.useState(false);
  const [includeMora, setIncludeMora] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [paid, setPaid] = React.useState(false);
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

  const client = clientsMock.find((c) => c.id === clientId);
  const plan = plansMock.find((p) => p.id === client?.membership?.planId);

  if (!client) return null;

  const isDebtor = client.status === "debtor";
  const baseAmount = plan?.monthlyPriceArs ?? 40000;
  const lateFee = 5000;

  // In alumno mode mora is fixed (applied only if actually debtor, no toggle)
  const mora = alumnoMode
    ? (isDebtor ? lateFee : 0)
    : (includeMora ? lateFee : 0);

  const subtotal = baseAmount + mora;

  // In alumno mode: auto 10% if efectivo, no promo selector
  const alumnoDiscount = alumnoMode && selectedPayment === "efectivo"
    ? Math.round(subtotal * 0.10)
    : 0;

  const adminPromo = PROMOS.find((p) => p.id === promoId)!;
  const adminDiscount = !alumnoMode && adminPromo.rate > 0
    ? Math.round(subtotal * adminPromo.rate)
    : 0;

  const discountAmt = alumnoMode ? alumnoDiscount : adminDiscount;
  const discountLabel = alumnoMode ? "10% OFF Pago en Efectivo" : adminPromo.label;
  const total = subtotal - discountAmt;

  function handlePay() { setDialogOpen(true); }
  function handleConfirm() { setPaid(true); }

  function handleClose() {
    if (paid) {
      setDialogOpen(false);
      setPaid(false);
      if (onClose) { onClose(); } else { navigate(-1); }
    } else {
      setDialogOpen(false);
    }
  }

  const activePromo = PROMOS.find((p) => p.id === promoId);

  return (
    <>
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* ── Left Column ── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">

          {/* Account Status Card */}
          <div className="bg-app-surface rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-card glass-border">
            {isDebtor && (
              <div
                className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(147,0,10,0.20) 0%, rgba(147,0,10,0.00) 100%)",
                  filter: "blur(32px)",
                }}
              />
            )}

            <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-app-card border-2 border-app-input-border shrink-0">
                  <span className="text-lg font-bold text-lime-400">{getInitials(client.fullName)}</span>
                </div>
                <div>
                  <h2 className="text-app-text font-jakarta text-xl md:text-2xl font-bold leading-8">
                    {client.fullName}
                  </h2>
                  <p className="text-app-subtle text-sm">
                    DNI: {client.dni} • Socio #{client.id.replace("cl_", "")}
                  </p>
                </div>
              </div>

              {/* MOROSO badge only for actual debtors */}
              {isDebtor && (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 self-start">
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span className="text-red-400 text-xs font-bold tracking-widest uppercase">MOROSO</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-6 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-app-subtle text-xs uppercase tracking-widest font-semibold">PLAN ACTUAL</span>
                <span className="text-app-text text-sm md:text-base font-medium">{plan?.name ?? "Sin plan"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-app-subtle text-xs uppercase tracking-widest font-semibold">VENCIMIENTO</span>
                <span className={`text-sm md:text-base font-medium ${isDebtor ? "text-red-400" : "text-app-text"}`}>
                  {client.membership?.endDate
                    ? new Date(client.membership.endDate).toLocaleDateString("es-AR", {
                        day: "numeric", month: "long", year: "numeric",
                      })
                    : "Sin fecha"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-app-subtle text-xs uppercase tracking-widest font-semibold">
                  {alumnoMode ? "A PAGAR" : "DEUDA TOTAL"}
                </span>
                <span className="text-app-text font-jakarta text-xl md:text-2xl font-extrabold">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing detail */}
          <div className="flex flex-col gap-4">
            <h3 className="text-app-text font-jakarta text-lg font-bold">Detalle de Cotización</h3>

            <div className="border border-app-border/[0.12] bg-app-bg rounded-xl p-2 flex flex-col">
              {/* Base cuota */}
              <div className="flex items-center justify-between p-4 rounded-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-app-card rounded-lg">
                    <i className="ti ti-receipt text-lg text-app-muted" />
                  </div>
                  <div>
                    <p className="text-app-text text-sm font-bold">
                      Cuota Base -{" "}
                      {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-app-subtle text-xs">{plan?.name}</p>
                  </div>
                </div>
                <span className="text-app-text text-base font-bold shrink-0">${baseAmount.toLocaleString()}</span>
              </div>

              {/* Mora row */}
              {/* Admin mode: always show with toggle | Alumno mode: only show if debtor, no toggle */}
              {(!alumnoMode || isDebtor) && (
                <div className="flex items-center justify-between p-4 rounded-md">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg transition-colors ${
                      (alumnoMode ? true : includeMora) ? "bg-red-500/15" : "bg-app-card"
                    }`}>
                      <i className={`ti ti-alert-triangle text-lg transition-colors ${
                        (alumnoMode ? true : includeMora) ? "text-red-400" : "text-gray-600"
                      }`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold transition-colors ${
                        (alumnoMode ? true : includeMora) ? "text-red-400" : "text-gray-600 line-through"
                      }`}>
                        Recargo por Mora (15 días)
                      </p>
                      <p className={`text-xs transition-colors ${
                        (alumnoMode ? true : includeMora) ? "text-red-400/70" : "text-app-faint"
                      }`}>
                        Interés compuesto 1.5%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-base font-bold transition-colors ${
                      (alumnoMode ? true : includeMora) ? "text-red-400" : "text-gray-600 line-through"
                    }`}>
                      +${lateFee.toLocaleString()}
                    </span>
                    {/* Toggle only for admin */}
                    {!alumnoMode && (
                      <button
                        onClick={() => setIncludeMora((v) => !v)}
                        title={includeMora ? "Quitar recargo" : "Aplicar recargo"}
                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${includeMora ? "bg-red-500" : "bg-app-elevated"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${includeMora ? "left-5" : "left-0.5"}`} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Promo: admin gets full dropdown, alumno gets an info hint */}
            {!alumnoMode ? (
              <div ref={promoRef} className="relative">
                <button
                  onClick={() => setPromoOpen((v) => !v)}
                  className="w-full bg-app-bg border border-app-border/[0.12] rounded-xl p-4 flex flex-col gap-2 text-left cursor-pointer hover:border-app-input-border transition-colors"
                >
                  <span className="text-app-subtle text-xs font-semibold uppercase tracking-widest">APLICAR PROMOCIÓN</span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-app-text text-sm font-medium">{activePromo?.label ?? "Sin promoción"}</span>
                      {activePromo && activePromo.badge && activePromo.id !== "none" && (
                        <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 text-[10px] font-bold tracking-wider">
                          {activePromo.badge}
                        </span>
                      )}
                    </div>
                    <i className={`ti ti-chevron-down text-app-subtle text-base transition-transform duration-200 ${promoOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {promoOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-app-card border border-app-input-border rounded-xl overflow-hidden z-20 shadow-dropdown">
                    {PROMOS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setPromoId(p.id); setPromoOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer transition-colors hover:bg-app-elevated/50 ${promoId === p.id ? "bg-app-elevated/40" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          {promoId === p.id && <i className="ti ti-check text-lime-400 text-xs" />}
                          <span className={`text-sm ${promoId === p.id ? "text-app-text font-semibold" : "text-app-muted"}`}>
                            {p.label}
                          </span>
                        </div>
                        {p.badge && p.id !== "none" && (
                          <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 text-[10px] font-bold tracking-wider shrink-0">
                            {p.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Alumno: info chip about efectivo discount */
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-lime-400/10 border border-lime-400/25">
                <i className="ti ti-tag text-lime-400 text-sm shrink-0" />
                <p className="text-lime-400 text-xs">
                  Pagá con <span className="font-bold">Efectivo</span> y obtené un{" "}
                  <span className="font-bold">10% de descuento</span> sobre el total.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column – Checkout ── */}
        <div className="col-span-12 lg:col-span-5 bg-app-surface rounded-2xl flex flex-col gap-6 p-6 md:p-8 shadow-card glass-border">
          <h3 className="text-app-text font-jakarta text-xl font-bold">Método de Pago</h3>

          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl transition-all duration-150 cursor-pointer active:scale-[0.97] ${
                  selectedPayment === method.id
                    ? "border border-lime-400 bg-app-card shadow-[0_0_12px_rgba(149,253,0,0.1)]"
                    : "border border-app-border/[0.06] bg-app-bg hover:bg-app-card/60"
                }`}
              >
                <i className={`ti ${method.icon} text-2xl ${selectedPayment === method.id ? "text-lime-400" : "text-app-subtle"}`} />
                <span className={`text-sm ${selectedPayment === method.id ? "font-bold text-app-text" : "font-medium text-app-muted"}`}>
                  {method.label}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-app-bg border border-dashed border-app-border/[0.12] rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-app-muted text-sm">Subtotal</span>
              <span className="text-app-text text-sm">${subtotal.toLocaleString()}</span>
            </div>

            {discountAmt > 0 && (
              <div className="flex items-center justify-between pb-1">
                <span className="text-lime-400 text-sm">{discountLabel}</span>
                <span className="text-lime-400 text-sm">-${discountAmt.toLocaleString()}</span>
              </div>
            )}

            <div className="h-px bg-app-border/[0.12]" />

            <div className="flex items-end justify-between pt-2">
              <span className="text-app-subtle text-xs font-bold uppercase tracking-widest">TOTAL A COBRAR</span>
              <span className="text-app-text font-jakarta text-4xl font-extrabold">${total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-lime-400 hover:brightness-105 active:brightness-95 active:scale-[0.99] transition-all duration-150 cursor-pointer shadow-btn-lime"
          >
            <i className="ti ti-circle-check text-lg text-squat-ink" />
            <span className="text-squat-ink font-jakarta text-lg font-extrabold tracking-wide">
              {alumnoMode ? "PAGAR CUOTA" : "CONFIRMAR Y COBRAR"}
            </span>
          </button>

          <p className="text-app-faint text-xs text-center">Al confirmar se emitirá el recibo correspondiente.</p>
        </div>
      </div>

      {/* Confirmation / Success Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <AlertDialogContent className="bg-app-bg border border-app-border/[0.08] text-app-text max-w-md">
          {!paid ? (
            <>
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
                    <i className="ti ti-receipt text-lime-400 text-lg" />
                  </div>
                  <AlertDialogTitle className="text-app-text text-lg">
                    {alumnoMode ? "¿Confirmar pago?" : "¿Confirmar cobro?"}
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription asChild>
                  <div className="flex flex-col gap-3 text-app-muted text-sm">
                    <p>{alumnoMode ? "Estás por registrar el siguiente pago:" : "Estás por registrar el siguiente pago:"}</p>
                    <div className="bg-app-card rounded-xl p-4 flex flex-col gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-app-subtle">Socio</span>
                        <span className="text-app-text font-semibold">{client.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-app-subtle">Método</span>
                        <span className="text-app-text font-semibold capitalize">{selectedPayment}</span>
                      </div>
                      {discountAmt > 0 && (
                        <div className="flex justify-between">
                          <span className="text-app-subtle">Descuento</span>
                          <span className="text-lime-400 font-semibold">-${discountAmt.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="h-px bg-app-input-border" />
                      <div className="flex justify-between">
                        <span className="text-app-muted font-semibold">Total</span>
                        <span className="text-app-text font-extrabold text-base">${total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl bg-app-card border border-app-input-border text-app-muted text-sm font-semibold hover:bg-app-elevated hover:text-app-text transition-colors cursor-pointer"
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
                    <i className="ti ti-circle-check text-lime-400 text-3xl" />
                  </div>
                  <AlertDialogTitle className="text-app-text text-xl">Pago registrado</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-app-muted text-sm">
                        El pago de{" "}
                        <span className="text-app-text font-semibold">${total.toLocaleString()}</span>{" "}
                        fue registrado correctamente.
                      </p>
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
