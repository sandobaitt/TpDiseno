import * as React from "react";

interface FinancialStatusCardProps {
  pendingBalance?: number;
  overdueDays?: number;
  onCollectPayment?: () => void;
}

export function FinancialStatusCard({
  pendingBalance = 0,
  overdueDays = 0,
  onCollectPayment,
}: FinancialStatusCardProps) {
  const hasDebt = pendingBalance > 0;

  return (
    <article className="flex flex-col gap-5 p-6 rounded-2xl bg-app-surface shadow-card glass-border">
      <header className="flex justify-between items-center">
        <h3 className="text-base font-bold text-app-text">Estado Financiero</h3>
        <i className="ti ti-credit-card text-lg text-app-faint" />
      </header>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-widest uppercase text-app-subtle">
          Saldo Pendiente
        </p>
        <div className={`text-5xl font-black leading-none ${hasDebt ? "text-red-400" : "text-lime-400"}`}>
          <span className="text-2xl font-bold">$</span>
          {pendingBalance.toLocaleString()}
        </div>
        {overdueDays > 0 && (
          <div className="flex gap-1.5 items-center mt-1">
            <i className="ti ti-calendar text-sm text-red-400" />
            <p className="text-xs font-medium text-red-400">
              Vencido hace {overdueDays} {overdueDays === 1 ? "día" : "días"}
            </p>
          </div>
        )}
        {!hasDebt && (
          <div className="flex gap-1.5 items-center mt-1">
            <i className="ti ti-circle-check text-sm text-lime-400" />
            <p className="text-xs font-medium text-lime-400">Al día</p>
          </div>
        )}
      </div>

      {hasDebt && (
        <button
          onClick={onCollectPayment}
          className="flex gap-2 justify-center items-center py-3.5 bg-lime-400 rounded-xl cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all duration-150 shadow-btn-lime"
        >
          <i className="ti ti-cash-register text-lg text-neutral-900" />
          <span className="text-sm font-extrabold tracking-wider uppercase text-neutral-900">
            Cobrar Saldo
          </span>
        </button>
      )}
    </article>
  );
}
