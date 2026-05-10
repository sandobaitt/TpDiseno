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

const defaultTransactions: PaymentTransaction[] = [
  {
    id: "1",
    type: "unpaid",
    title: "Cuota Mensual",
    date: "Vencimiento: 10 del mes",
    amount: 28500,
    status: "Impago",
  },
  {
    id: "2",
    type: "payment",
    title: "Cuota Mensual",
    date: "Pagado: mes anterior",
    amount: 28500,
    status: "Aprobado",
    paymentMethod: "MercadoPago",
  },
  {
    id: "3",
    type: "payment",
    title: "Producto Kiosco",
    date: "Pagado: fecha anterior",
    amount: 1200,
    status: "Aprobado",
    paymentMethod: "Efectivo",
  },
];

const tabs = [
  {
    id: "payments",
    label: "Historial de Pagos",
    icon: "ti-receipt",
    active: true,
  },
  {
    id: "medical",
    label: "Legajo Médico",
    icon: "ti-stethoscope",
    active: false,
  },
  {
    id: "notifications",
    label: "Logs de Notificaciones",
    icon: "ti-history",
    active: false,
  },
];

export function PaymentHistory({
  transactions = defaultTransactions,
}: PaymentHistoryProps) {
  return (
    <section className="flex flex-col flex-1 gap-5 p-6 rounded-2xl bg-stone-900">
      <nav className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex gap-2 items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
              tab.active
                ? "text-lime-400 border-2 border-lime-400 bg-zinc-800 font-semibold"
                : "text-stone-500"
            }`}
          >
            <i className={`ti ${tab.icon} text-base`} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-1">
        <header className="flex justify-between items-center mb-1">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-extrabold text-white">
              Últimos Movimientos
            </h3>
            <p className="text-xs text-stone-500">
              Registro de las últimas transacciones.
            </p>
          </div>
          <button className="flex gap-1 items-center text-sm font-medium text-lime-400 cursor-pointer">
            Ver Todo
            <i className="ti ti-arrow-right text-sm" />
          </button>
        </header>

        <div className="flex flex-col gap-2 mt-2">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface TransactionRowProps {
  transaction: PaymentTransaction;
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const isUnpaid = transaction.type === "unpaid";

  return (
    <article
      className={`flex gap-3.5 items-center px-4 py-3.5 rounded-xl ${
        isUnpaid ? "border-red-500 bg-neutral-800 border-[3px]" : "bg-stone-900"
      }`}
    >
      <div
        className={`flex justify-center items-center w-8 h-8 rounded-full flex-[shrink] ${
          isUnpaid ? "bg-orange-950" : "bg-lime-950"
        }`}
      >
        <i
          className={`ti ${isUnpaid ? "ti-x" : "ti-check"} text-base ${
            isUnpaid ? "text-red-500" : "text-lime-400"
          }`}
        />
      </div>

      <div className="flex flex-col flex-1 gap-0.5">
        <h4 className="text-sm font-semibold text-white">
          {transaction.title}
        </h4>
        <p className="text-xs text-stone-500">
          {transaction.date}
          {transaction.paymentMethod && ` • ${transaction.paymentMethod}`}
        </p>
      </div>

      <div className="flex flex-col gap-1 items-end">
        <div
          className={`text-base font-bold ${isUnpaid ? "text-red-400" : "text-white"}`}
        >
          ${transaction.amount.toLocaleString()}
        </div>
        <div
          className={`px-2 py-0.5 text-xs font-bold tracking-wide uppercase rounded ${
            isUnpaid ? "text-white bg-red-500" : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {transaction.status}
        </div>
      </div>
    </article>
  );
}
