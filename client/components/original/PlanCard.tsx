import * as React from "react";

interface Plan {
    id: string;
    icon: string;
    title: string;
    description: string;
    price: string;
}

interface PlanCardProps {
    plan: Plan;
    isSelected: boolean;
    onSelect: () => void;
}

function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
    return (
        <article
            className={`flex-1 p-5 rounded-xl border-2 cursor-pointer bg-stone-900 ${isSelected ? "border-lime-400" : "border-zinc-800"
                }`}
            onClick={onSelect}
        >
            <header className="flex justify-between items-start mb-4">
                <div className="flex justify-center items-center w-9 h-9">
                    <i
                        className={`ti ${plan.icon} text-2xl ${isSelected ? "text-lime-400" : "text-gray-400"
                            }`}
                    />
                </div>
                <div
                    className={`flex justify-center items-center rounded-full border-2 h-[18px] w-[18px] ${isSelected
                            ? "border-lime-400 bg-lime-400"
                            : "border-neutral-700"
                        }`}
                >
                    {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-neutral-900" />
                    )}
                </div>
            </header>

            <h3 className="mb-1 text-base font-bold text-white">{plan.title}</h3>
            <p className="mb-4 text-xs text-gray-400">{plan.description}</p>

            <div className="text-xl font-extrabold text-lime-400">
                {plan.price}
                <span className="text-sm text-gray-400">/mes</span>
            </div>
        </article>
    );
}

export default PlanCard;