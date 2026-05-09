import * as React from "react";

interface PaymentMethod {
    icon: string;
    label: string;
}

const paymentMethods: PaymentMethod[] = [
    { icon: "ti-qrcode", label: "Mercado" },
    { icon: "ti-cash", label: "Efectivo" },
    { icon: "ti-building-bank", label: "Transf" },
];

function FinancialCard() {
    return (
        <article className="flex flex-col gap-5 p-6 rounded-2xl bg-stone-900">
            <header className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">
                    Estado Financiero
                </h3>
                <i className="ti ti-credit-card text-lg text-neutral-600" />
            </header>
            <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
                    Saldo Pendiente
                </p>
                <div className="text-5xl font-black leading-none text-red-400">
                    <span className="text-2xl font-bold">$</span>28.500
                </div>
                <div className="flex gap-1.5 items-center mt-1">
                    <i className="ti ti-calendar text-sm text-red-400" />
                    <p className="text-xs font-medium text-red-400">
                        Vencido hace 14 días
                    </p>
                </div>
            </div>
            <button className="flex gap-2 justify-center items-center py-3.5 bg-lime-400 rounded-xl cursor-pointer">
                <i className="ti ti-cash-register text-lg text-neutral-900" />
                <span className="text-sm font-extrabold tracking-wider uppercase text-neutral-900">
                    Cobrar Saldo
                </span>
            </button>
            <div className="flex justify-around items-center">
                {paymentMethods.map((method, index) => (
                    <button key={index} className="flex flex-col gap-1 items-center cursor-pointer">
                        <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-zinc-800">
                            <i className={`ti ${method.icon} text-lg text-zinc-500`} />
                        </div>
                        <span className="text-xs font-medium tracking-wider uppercase text-stone-500">
                            {method.label}
                        </span>
                    </button>
                ))}
            </div>
        </article>
    );
}

export default FinancialCard;