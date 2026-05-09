import * as React from "react";
import TransactionItem from "./TransactionItem";

interface Transaction {
    id: string;
    type: "payment" | "unpaid";
    title: string;
    date: string;
    amount: number;
    status: string;
    paymentMethod?: string;
}

const transactions: Transaction[] = [
    {
        id: "1",
        type: "unpaid",
        title: "Cuota Mensual – Octubre",
        date: "Vencimiento: 10 Oct 2023",
        amount: 28500,
        status: "Impago",
    },
    {
        id: "2",
        type: "payment",
        title: "Cuota Mensual – Septiembre",
        date: "Pagado: 05 Sep 2023",
        amount: 28500,
        status: "Aprobado",
        paymentMethod: "MercadoPago",
    },
    {
        id: "3",
        type: "payment",
        title: "Bebida Isotónica Kiosco",
        date: "Pagado: 02 Sep 2023",
        amount: 1200,
        status: "Aprobado",
        paymentMethod: "Efectivo",
    },
    {
        id: "4",
        type: "payment",
        title: "Cuota Mensual – Agosto",
        date: "Pagado: 08 Ago 2023",
        amount: 25000,
        status: "Aprobado",
        paymentMethod: "Transferencia",
    },
];

const tabs = [
    { id: "payments", label: "Historial de Pagos", icon: "ti-receipt", active: true },
    { id: "medical", label: "Legajo Médico", icon: "ti-stethoscope", active: false },
    { id: "notifications", label: "Logs de Notificaciones", icon: "ti-history", active: false },
];

function PaymentHistory() {
    return (
        <section className="flex flex-col flex-1 gap-5 p-6 rounded-2xl bg-stone-900">
            <nav className="flex items-center">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`flex gap-2 items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${tab.active
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
                            Registro de las últimas 5 transacciones.
                        </p>
                    </div>
                    <button className="flex gap-1 items-center text-sm font-medium text-lime-400 cursor-pointer">
                        Ver Todo
                        <i className="ti ti-arrow-right text-sm" />
                    </button>
                </header>
                <div className="flex flex-col gap-2 mt-2">
                    {transactions.map((transaction) => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PaymentHistory;