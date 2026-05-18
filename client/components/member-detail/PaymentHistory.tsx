"use client";
import * as React from "react";

export interface PaymentTransaction {
  id: string;
  type: "payment" | "unpaid";
  title: string;
  date: string;
  amount: number;
  status: string;
  paymentMethod?: string;
}

interface PaymentHistoryProps {
  transactions?: PaymentTransaction[];
}

type TabId = "payments" | "medical";

const HEALTH_CONDITIONS = [
  "Lesión o cirugía reciente",
  "Presión arterial alta o baja",
  "Antecedentes cardíacos",
  "Diabetes o problemas metabólicos",
  "Asma o problemas respiratorios",
  "Medicación habitual",
];

export function PaymentHistory({ transactions = [] }: PaymentHistoryProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>("payments");

  return (
    <section className="flex flex-col flex-1 gap-5 p-6 rounded-2xl bg-app-surface">
      <nav className="flex items-center gap-2 flex-wrap">
        <TabBtn id="payments" label="Historial de Pagos" icon="ti-receipt" active={activeTab === "payments"} onClick={() => setActiveTab("payments")} />
        <TabBtn id="medical" label="Legajo Médico" icon="ti-stethoscope" active={activeTab === "medical"} onClick={() => setActiveTab("medical")} />
      </nav>

      {activeTab === "payments" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-app-text text-lg font-extrabold">Últimos Movimientos</h3>
              <p className="text-app-subtle text-xs mt-0.5">Registro de las últimas transacciones.</p>
            </div>
            <button className="flex items-center gap-1 text-lime-400 text-xs font-medium cursor-pointer hover:text-lime-300 transition-colors">
              Ver todo <i className="ti ti-arrow-right text-xs" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <i className="ti ti-receipt-off text-2xl text-app-faint" />
              <p className="text-xs text-app-faint">Sin movimientos registrados</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-app-border/[0.04]">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "medical" && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-app-text text-lg font-extrabold">Legajo Médico</h3>
            <p className="text-app-subtle text-xs mt-0.5">Información de salud declarada por el socio.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoField label="Grupo Sanguíneo" value="No declarado" />
            <InfoField label="Contacto de Emergencia" value="No declarado" />
          </div>

          <div className="rounded-xl border border-app-border/[0.06] overflow-hidden">
            <p className="text-[10px] font-bold text-app-subtle tracking-widest px-4 py-2.5 border-b border-app-border/[0.05] bg-app-surface/50">
              DECLARACIÓN DE SALUD
            </p>
            {HEALTH_CONDITIONS.map((cond) => (
              <div
                key={cond}
                className="flex items-center justify-between px-4 py-2.5 border-b border-app-border/[0.04] last:border-0"
              >
                <span className="text-xs text-app-muted">{cond}</span>
                <span className="text-[10px] text-app-faint bg-app-surface px-2 py-0.5 rounded-full">
                  Sin declarar
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <i className="ti ti-info-circle text-amber-400 text-sm shrink-0" />
            <p className="text-amber-400/80 text-xs">
              La declaración jurada debe ser completada al momento de la inscripción.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function TabBtn({
  label, icon, active, onClick,
}: { id: string; label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all ${
        active
          ? "text-lime-400 border-2 border-lime-400 bg-app-card font-semibold"
          : "text-app-subtle hover:text-app-text hover:bg-app-hover/[0.04]"
      }`}
    >
      <i className={`ti ${icon} text-base`} />
      {label}
    </button>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-app-surface border border-app-border/[0.05]">
      <span className="text-[10px] text-app-faint font-semibold tracking-wider uppercase">{label}</span>
      <span className="text-sm text-app-muted">{value}</span>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: PaymentTransaction }) {
  const isUnpaid = transaction.type === "unpaid";
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUnpaid ? "bg-red-500/15" : "bg-lime-400/15"}`}>
        <i className={`ti ${isUnpaid ? "ti-x" : "ti-check"} text-sm ${isUnpaid ? "text-red-400" : "text-lime-400"}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-app-text truncate capitalize">{transaction.title}</p>
        <p className="text-xs text-app-subtle mt-0.5">
          {transaction.date}
          {transaction.paymentMethod && ` · ${transaction.paymentMethod}`}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-sm font-bold ${isUnpaid ? "text-red-400" : "text-app-text"}`}>
          ${transaction.amount.toLocaleString()}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isUnpaid
            ? "bg-red-500/15 text-red-400"
            : transaction.status === "Aprobado"
              ? "bg-lime-400/15 text-lime-400"
              : "bg-app-card text-app-subtle"
        }`}>
          {transaction.status}
        </span>
      </div>
    </div>
  );
}
