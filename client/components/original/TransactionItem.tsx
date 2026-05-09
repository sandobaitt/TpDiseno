import * as React from "react";

interface Transaction {
    id: string;
    type: "payment" | "unpaid";
    title: string;
    date: string;
    amount: number;
    status: string;
    paymentMethod?: string;
}

interface TransactionItemProps {
    transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
    const isUnpaid = transaction.type === "unpaid";

    return (
        <article className={`flex gap-3.5 items-center px-4 py-3.5 rounded-xl ${isUnpaid
                ? "border-red-500 bg-neutral-800 border-[3px]"
                : "bg-stone-900"
            }`}>
            <div className={`flex justify-center items-center w-8 h-8 rounded-full flex-[shrink] ${isUnpaid ? "bg-orange-950" : "bg-lime-950"
                }`}>
                <i className={`ti ${isUnpaid ? "ti-x" : "ti-check"} text-base ${isUnpaid ? "text-red-500" : "text-lime-400"
                    }`} />
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
                <div className={`text-base font-bold ${isUnpaid ? "text-red-400" : "text-white"
                    }`}>
                    ${transaction.amount.toLocaleString()}
                </div>
                <div className={`px-2 py-0.5 text-xs font-bold tracking-wide uppercase rounded ${isUnpaid
                        ? "text-white bg-red-500"
                        : "bg-zinc-800 text-zinc-500"
                    }`}>
                    {transaction.status}
                </div>
            </div>
        </article>
    );
}

export default TransactionItem;