"use client";
import * as React from "react";
import { clientsMock } from "@/data/clients";
import { plansMock } from "@/data/plans";

type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | "qr";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
}

interface PaymentCheckoutContentProps {
  clientId: string;
}

export function PaymentCheckoutContent({
  clientId,
}: PaymentCheckoutContentProps) {
  const [selectedPayment, setSelectedPayment] =
    React.useState<PaymentMethod>("efectivo");

  const client = clientsMock.find((c) => c.id === clientId);
  const plan = plansMock.find((p) => p.id === client?.membership?.planId);

  if (!client) return null;

  const isEfectivo = selectedPayment === "efectivo";
  const baseAmount = plan?.monthlyPriceArs ?? 40000;
  const lateFee = 5000;
  const discount = isEfectivo ? Math.round(baseAmount * 0.1) : 0;
  const subtotal = baseAmount + lateFee;
  const total = subtotal - discount;

  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      {/* ── Left Column ── */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
        {/* Account Status Card */}
        <div className="bg-stone-900 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-card glass-border">
          <div
            className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(147,0,10,0.20) 0%, rgba(147,0,10,0.00) 100%)",
              filter: "blur(32px)",
            }}
          />

          <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex justify-center items-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-zinc-800 border-2 border-zinc-700 shrink-0">
                <span className="text-lg font-bold text-lime-400">
                  {getInitials(client.fullName)}
                </span>
              </div>
              <div>
                <h2 className="text-white font-jakarta text-xl md:text-2xl font-bold leading-8">
                  {client.fullName}
                </h2>
                <p className="text-gray-500 text-sm">
                  DNI: {client.dni} • Socio #{client.id.replace("cl_", "")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-red-900 bg-zinc-800 self-start">
              <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <span className="text-red-400 text-xs font-bold tracking-widest uppercase">
                MOROSO
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
                PLAN ACTUAL
              </span>
              <span className="text-white text-sm md:text-base font-medium">
                {plan?.name ?? "Sin plan"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
                VENCIMIENTO
              </span>
              <span className="text-red-400 text-sm md:text-base font-medium">
                {client.membership?.endDate
                  ? new Date(client.membership.endDate).toLocaleDateString(
                      "es-AR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )
                  : "Sin fecha"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
                DEUDA TOTAL
              </span>
              <span className="text-white font-jakarta text-xl md:text-2xl font-extrabold">
                ${subtotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Engine */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-jakarta text-lg font-bold">
            Detalle de Cotización
          </h3>

          <div className="border border-zinc-800 bg-neutral-900 rounded-xl p-2 flex flex-col">
            <div className="flex items-center justify-between p-4 rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-zinc-800 rounded-lg">
                  <i className="ti ti-receipt text-lg text-gray-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">
                    Cuota Base -{" "}
                    {new Date().toLocaleDateString("es-AR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-500 text-xs">{plan?.name}</p>
                </div>
              </div>
              <span className="text-white text-base font-bold shrink-0">
                ${baseAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-red-950 rounded-lg">
                  <i className="ti ti-alert-triangle text-lg text-red-400" />
                </div>
                <div>
                  <p className="text-red-400 text-sm font-bold">
                    Recargo por Mora (15 días)
                  </p>
                  <p className="text-red-400/70 text-xs">
                    Interés compuesto 1.5%
                  </p>
                </div>
              </div>
              <span className="text-red-400 text-base font-bold shrink-0">
                +${lateFee.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
                APLICAR PROMOCIÓN
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white text-sm font-medium">
                  10% OFF Pago en Efectivo
                </span>
                <i className="ti ti-chevron-down text-gray-500 text-base" />
              </div>
            </div>

            <div className="bg-neutral-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
                CÁLCULO DE PRORRATEO
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 text-sm">
                  Días rest. mes actual
                </span>
                <span className="text-white text-sm font-bold">N/A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column – Checkout ── */}
      <div className="col-span-12 lg:col-span-5 bg-stone-900 rounded-2xl flex flex-col gap-6 p-6 md:p-8 shadow-card glass-border">
        <h3 className="text-white font-jakarta text-xl font-bold">
          Método de Pago
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "efectivo" as const, label: "Efectivo", icon: "ti-cash" },
            {
              id: "tarjeta" as const,
              label: "Tarjeta",
              icon: "ti-credit-card",
            },
            {
              id: "transferencia" as const,
              label: "Transferencia",
              icon: "ti-building-bank",
            },
            { id: "qr" as const, label: "QR", icon: "ti-qrcode" },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={`flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl transition-all duration-150 cursor-pointer active:scale-[0.97] ${
                selectedPayment === method.id
                  ? "border border-lime-400 bg-zinc-800 shadow-[0_0_12px_rgba(149,253,0,0.1)]"
                  : "border border-white/[0.06] bg-neutral-900 hover:bg-zinc-800/60"
              }`}
            >
              <i
                className={`ti ${method.icon} text-2xl ${
                  selectedPayment === method.id
                    ? "text-lime-400"
                    : "text-gray-500"
                }`}
              />
              <span
                className={`text-sm ${
                  selectedPayment === method.id
                    ? "font-bold text-white"
                    : "font-medium text-gray-400"
                }`}
              >
                {method.label}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-neutral-900 border border-dashed border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Subtotal</span>
            <span className="text-white text-sm">
              ${subtotal.toLocaleString()}
            </span>
          </div>

          {isEfectivo && (
            <div className="flex items-center justify-between pb-2">
              <span className="text-lime-400 text-sm">
                Descuento (Efectivo 10%)
              </span>
              <span className="text-lime-400 text-sm">
                -${discount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="h-px bg-zinc-800" />

          <div className="flex items-end justify-between pt-2">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              TOTAL A COBRAR
            </span>
            <span className="text-white font-jakarta text-4xl font-extrabold">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-lime-400 hover:brightness-105 active:brightness-95 active:scale-[0.99] transition-all duration-150 cursor-pointer shadow-btn-lime">
          <i className="ti ti-circle-check text-lg text-squat-ink" />
          <span className="text-squat-ink font-jakarta text-lg font-extrabold tracking-wide">
            CONFIRMAR Y COBRAR
          </span>
        </button>

        <p className="text-gray-600 text-xs text-center">
          Al confirmar se emitirá el recibo correspondiente.
        </p>
      </div>
    </div>
  );
}
