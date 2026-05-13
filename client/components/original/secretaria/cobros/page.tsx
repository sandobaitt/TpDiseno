import { useState } from "react";

type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | "qr";

export default function Index() {
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethod>("efectivo");

  const isEfectivo = selectedPayment === "efectivo";
  const total = isEfectivo ? "$40.500" : "$45.000";

  return (
    <div className="min-h-screen flex flex-col bg-[#131313] text-white font-inter">
      {/* ── Top App Bar ── */}
      <header className="flex flex-wrap items-end justify-between gap-4 px-6 md:px-10 py-6 border-b border-[#1C1B1B]/80 bg-[#131313]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-col gap-1">
          {/* Breadcrumb */}
          <nav className="flex items-center">
            <span className="text-[#71717A] text-sm font-medium font-inter">
              Directorio
            </span>
            <svg
              className="mx-2 flex-shrink-0"
              width="13"
              height="7"
              viewBox="0 0 13 7"
              fill="none"
            >
              <path
                d="M10.6833 3.5L8 0.816667L8.81667 0L12.3167 3.5L8.81667 7L8 6.18333L10.6833 3.5Z"
                fill="#71717A"
              />
            </svg>
            <span className="text-[#E5E2E1] text-sm font-medium font-inter">
              Cobros y Facturación
            </span>
          </nav>
          {/* Page title */}
          <h1 className="text-white font-jakarta text-[26px] md:text-[30px] font-normal leading-[36px] tracking-[-0.75px]">
            Centro de Transacciones
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <svg width="18" height="18" viewBox="0 0 18 24" fill="none">
              <path
                d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z"
                fill="#A1A1AA"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar DNI, Nombre o leer QR..."
            className="w-full pl-11 pr-3 py-3.5 bg-[#0E0E0E] border border-[#1C1B1B] rounded text-[#52525B] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#353534] font-inter"
          />
        </div>
      </header>

      {/* ── Content Area ── */}
      <main className="flex-1 p-6 md:p-8 grid grid-cols-12 gap-6 md:gap-8 items-start">
        {/* ── Left Column ── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 md:gap-8">
          {/* Account Status Card */}
          <div className="bg-[#2A2A2A] rounded-lg p-6 md:p-8 flex flex-col gap-6 md:gap-8 relative overflow-hidden">
            {/* Decorative gradient blob */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(147,0,10,0.20) 0%, rgba(147,0,10,0.00) 100%)",
                filter: "blur(32px)",
              }}
            />

            {/* User info row */}
            <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4 md:gap-5">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/a857332920d03db7c790716d4d2ec48dd470c2d7?width=128"
                  alt="Martín Rodríguez"
                  className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-[#353534] object-cover flex-shrink-0"
                />
                <div>
                  <h2 className="text-white font-jakarta text-xl md:text-2xl font-bold leading-8 tracking-[-0.6px]">
                    Martín Rodríguez
                  </h2>
                  <p className="text-[#A1A1AA] text-sm font-inter">
                    DNI: 34.567.890 • Socio #4092
                  </p>
                </div>
              </div>

              {/* MOROSO badge */}
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-[#FFB4AB]/20 bg-[#353534] self-start">
                <div className="w-2 h-2 rounded-full bg-[#FFB4AB] flex-shrink-0" />
                <span className="text-[#FFB4AB] text-xs font-bold tracking-[0.6px] uppercase font-inter">
                  MOROSO
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 relative z-10">
              <div className="flex flex-col gap-1 pb-2">
                <span className="text-[#71717A] text-[11px] md:text-xs uppercase tracking-[0.6px] font-inter">
                  PLAN ACTUAL
                </span>
                <span className="text-white text-sm md:text-base font-medium font-inter leading-6">
                  Pase Libre Anual
                </span>
              </div>
              <div className="flex flex-col gap-1 pb-2">
                <span className="text-[#71717A] text-[11px] md:text-xs uppercase tracking-[0.6px] font-inter">
                  VENCIMIENTO
                </span>
                <span className="text-[#FFB4AB] text-sm md:text-base font-medium font-inter leading-6">
                  15 Octubre 2023
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#71717A] text-[11px] md:text-xs uppercase tracking-[0.6px] font-inter">
                  DEUDA TOTAL
                </span>
                <span className="text-white font-jakarta text-xl md:text-2xl font-extrabold leading-8 tracking-[-0.6px]">
                  $45.000
                </span>
              </div>
            </div>
          </div>

          {/* ── Pricing Engine ── */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-jakarta text-lg font-bold leading-7">
              Detalle de Cotización
            </h3>

            {/* Line items */}
            <div className="border border-[#201F1F]/50 bg-[#1C1B1B] rounded p-2 flex flex-col">
              {/* Base fee */}
              <div className="flex items-center justify-between p-4 rounded-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#353534] rounded-sm">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M11.3 19.8L9.9 18.4L13.45 14.85L4.95 6.35L1.4 9.9L0 8.5L1.4 7.05L0 5.65L2.1 3.55L0.7 2.1L2.1 0.7L3.55 2.1L5.65 0L7.05 1.4L8.5 0L9.9 1.4L6.35 4.95L14.85 13.45L18.4 9.9L19.8 11.3L18.4 12.75L19.8 14.15L17.7 16.25L19.1 17.7L17.7 19.1L16.25 17.7L14.15 19.8L12.75 18.4L11.3 19.8Z"
                        fill="#A1A1AA"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold font-inter leading-5">
                      Cuota Base - Mes Noviembre
                    </p>
                    <p className="text-[#71717A] text-xs font-inter">
                      Pase Libre Anual
                    </p>
                  </div>
                </div>
                <span className="text-white text-base font-bold font-inter flex-shrink-0">
                  $40.000
                </span>
              </div>

              {/* Mora surcharge */}
              <div className="flex items-center justify-between p-4 rounded-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#93000A]/20 rounded-sm">
                    <svg width="22" height="19" viewBox="0 0 22 19" fill="none">
                      <path
                        d="M0 19L11 0L22 19H0ZM3.45 17H18.55L11 4L3.45 17ZM11 16C11.2833 16 11.5208 15.9042 11.7125 15.7125C11.9042 15.5208 12 15.2833 12 15C12 14.7167 11.9042 14.4792 11.7125 14.2875C11.5208 14.0958 11.2833 14 11 14C10.7167 14 10.4792 14.0958 10.2875 14.2875C10.0958 14.4792 10 14.7167 10 15C10 15.2833 10.0958 15.5208 10.2875 15.7125C10.4792 15.9042 10.7167 16 11 16ZM10 13H12V8H10V13Z"
                        fill="#FFB4AB"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#FFB4AB] text-sm font-bold font-inter leading-5">
                      Recargo por Mora (15 días)
                    </p>
                    <p className="text-[#FFB4AB]/70 text-xs font-inter">
                      Interés compuesto 1.5%
                    </p>
                  </div>
                </div>
                <span className="text-[#FFB4AB] text-base font-bold font-inter flex-shrink-0">
                  +$5.000
                </span>
              </div>
            </div>

            {/* Modifiers grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Promotion selector */}
              <div className="bg-[#0E0E0E] border border-[#1C1B1B] rounded p-4 flex flex-col gap-2">
                <span className="text-[#71717A] text-xs font-medium uppercase tracking-[0.6px] font-inter">
                  APLICAR PROMOCIÓN
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white text-sm font-medium font-inter leading-5">
                    10% OFF Pago en Efectivo
                  </span>
                  <svg
                    className="flex-shrink-0"
                    width="21"
                    height="21"
                    viewBox="0 0 21 21"
                    fill="none"
                  >
                    <path
                      d="M6.2998 8.3999L10.4998 12.5999L14.6998 8.3999"
                      stroke="#6B7280"
                      strokeWidth="1.575"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Proration */}
              <div className="bg-[#0E0E0E] border border-[#1C1B1B] rounded p-4 flex flex-col gap-2">
                <span className="text-[#71717A] text-xs font-medium uppercase tracking-[0.6px] font-inter">
                  CÁLCULO DE PRORRATEO
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#A1A1AA] text-sm font-inter leading-5">
                    Días rest. mes actual
                  </span>
                  <span className="text-white text-sm font-bold font-inter">
                    N/A
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column – Checkout ── */}
        <div className="col-span-12 lg:col-span-5 bg-[#2A2A2A] rounded-lg shadow-[0_20px_40px_0_rgba(0,0,0,0.40)] flex flex-col gap-6 p-6 md:p-8">
          <h3 className="text-white font-jakarta text-xl font-bold leading-7 tracking-[-0.5px]">
            Método de Pago
          </h3>

          {/* Payment methods 2×2 grid */}
          <div className="grid grid-cols-2 gap-3">
            <PaymentButton
              id="efectivo"
              label="Efectivo"
              selected={selectedPayment === "efectivo"}
              onClick={() => setSelectedPayment("efectivo")}
              icon={
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                  <path
                    d="M13 9C12.1667 9 11.4583 8.70833 10.875 8.125C10.2917 7.54167 10 6.83333 10 6C10 5.16667 10.2917 4.45833 10.875 3.875C11.4583 3.29167 12.1667 3 13 3C13.8333 3 14.5417 3.29167 15.125 3.875C15.7083 4.45833 16 5.16667 16 6C16 6.83333 15.7083 7.54167 15.125 8.125C14.5417 8.70833 13.8333 9 13 9ZM6 12C5.45 12 4.97917 11.8042 4.5875 11.4125C4.19583 11.0208 4 10.55 4 10V2C4 1.45 4.19583 0.979167 4.5875 0.5875C4.97917 0.195833 5.45 0 6 0H20C20.55 0 21.0208 0.195833 21.4125 0.5875C21.8042 0.979167 22 1.45 22 2V10C22 10.55 21.8042 11.0208 21.4125 11.4125C21.0208 11.8042 20.55 12 20 12H6ZM8 10H18C18 9.45 18.1958 8.97917 18.5875 8.5875C18.9792 8.19583 19.45 8 20 8V4C19.45 4 18.9792 3.80417 18.5875 3.4125C18.1958 3.02083 18 2.55 18 2H8C8 2.55 7.80417 3.02083 7.4125 3.4125C7.02083 3.80417 6.55 4 6 4V8C6.55 8 7.02083 8.19583 7.4125 8.5875C7.80417 8.97917 8 9.45 8 10ZM19 16H2C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V3H2V14H19V16ZM6 10V2V10Z"
                    fill={selectedPayment === "efectivo" ? "#95FD00" : "#71717A"}
                  />
                </svg>
              }
            />

            <PaymentButton
              id="tarjeta"
              label="Tarjeta"
              selected={selectedPayment === "tarjeta"}
              onClick={() => setSelectedPayment("tarjeta")}
              icon={
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                  <path
                    d="M20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H2C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2ZM2 4H18V2H2V4ZM2 8V14H18V8H2ZM2 14V2V14Z"
                    fill={selectedPayment === "tarjeta" ? "#95FD00" : "#71717A"}
                  />
                </svg>
              }
            />

            <PaymentButton
              id="transferencia"
              label="Transferencia"
              selected={selectedPayment === "transferencia"}
              onClick={() => setSelectedPayment("transferencia")}
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 16V9H5V16H3ZM9 16V9H11V16H9ZM0 20V18H20V20H0ZM15 16V9H17V16H15ZM0 7V5L10 0L20 5V7H0ZM4.45 5H10H15.55H4.45ZM4.45 5H15.55L10 2.25L4.45 5Z"
                    fill={
                      selectedPayment === "transferencia" ? "#95FD00" : "#71717A"
                    }
                  />
                </svg>
              }
            />

            <PaymentButton
              id="qr"
              label="QR"
              selected={selectedPayment === "qr"}
              onClick={() => setSelectedPayment("qr")}
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M0 5V0H5V2H2V5H0ZM0 20V15H2V18H5V20H0ZM15 20V18H18V15H20V20H15ZM18 5V2H15V0H20V5H18ZM15.5 15.5H17V17H15.5V15.5ZM15.5 12.5H17V14H15.5V12.5ZM14 14H15.5V15.5H14V14ZM12.5 15.5H14V17H12.5V15.5ZM11 14H12.5V15.5H11V14ZM14 11H15.5V12.5H14V11ZM12.5 12.5H14V14H12.5V12.5ZM11 11H12.5V12.5H11V11ZM17 3V9H11V3H17ZM9 11V17H3V11H9ZM9 3V9H3V3H9ZM7.5 15.5V12.5H4.5V15.5H7.5ZM7.5 7.5V4.5H4.5V7.5H7.5ZM15.5 7.5V4.5H12.5V7.5H15.5Z"
                    fill={selectedPayment === "qr" ? "#95FD00" : "#71717A"}
                  />
                </svg>
              }
            />
          </div>

          {/* Payment summary */}
          <div className="bg-[#0E0E0E] border border-dashed border-[#201F1F] rounded p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA] text-sm font-inter">
                Subtotal
              </span>
              <span className="text-white text-sm font-inter">$45.000</span>
            </div>

            {isEfectivo && (
              <div className="flex items-center justify-between pb-2">
                <span className="text-[#95FD00] text-sm font-inter">
                  Descuento (Efectivo 10%)
                </span>
                <span className="text-[#95FD00] text-sm font-inter">
                  -$4.500
                </span>
              </div>
            )}

            <div className="h-px bg-[#353534]" />

            <div className="flex items-end justify-between pt-2">
              <span className="text-[#A1A1AA] text-xs font-bold uppercase tracking-[1.2px] font-inter">
                TOTAL A COBRAR
              </span>
              <span className="text-white font-jakarta text-[36px] font-extrabold leading-10 tracking-[-1.8px]">
                {total}
              </span>
            </div>
          </div>

          {/* Confirm button */}
          <button className="w-full flex items-center justify-center gap-2 py-5 rounded-md bg-[#95FD00] shadow-[0_0_30px_0_rgba(149,253,0,0.20)] hover:bg-[#82e000] active:bg-[#70c400] transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
                fill="#0E2000"
              />
            </svg>
            <span className="text-[#0E2000] font-jakarta text-lg font-extrabold tracking-wide">
              CONFIRMAR Y COBRAR
            </span>
          </button>

          {/* Footer note */}
          <p className="text-[#52525B] text-xs text-center font-inter">
            Al confirmar se emitirá el recibo correspondiente.
          </p>
        </div>
      </main>
    </div>
  );
}

interface PaymentButtonProps {
  id: PaymentMethod;
  label: string;
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

function PaymentButton({
  label,
  selected,
  onClick,
  icon,
}: PaymentButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 py-6 px-4 rounded transition-colors ${
        selected
          ? "border border-[#95FD00] bg-[#353534]"
          : "border border-transparent bg-[#0E0E0E] hover:bg-[#1a1a1a]"
      }`}
    >
      {icon}
      <span
        className={`text-sm font-inter ${
          selected ? "font-bold text-white" : "font-medium text-[#A1A1AA]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
