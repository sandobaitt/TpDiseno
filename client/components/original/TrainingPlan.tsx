"use client";
import * as React from "react";
import PlanCard from "./PlanCard";

interface Plan {
    id: string;
    icon: string;
    title: string;
    description: string;
    price: string;
    isSelected?: boolean;
}

function TrainingPlan() {
    const [selectedPlan, setSelectedPlan] = React.useState<string>("pase-libre");

    const plans: Plan[] = [
        {
            id: "pase-libre",
            icon: "ti-barbell",
            title: "Pase Libre",
            description: "Musculación + Clases Grupales",
            price: "$25.000",
            isSelected: true,
        },
        {
            id: "musculacion-am",
            icon: "ti-run",
            title: "Musculación AM",
            description: "Acceso de 06:00 a 14:00 hrs",
            price: "$18.000",
        },
    ];

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
    };

    return (
        <section className="p-7 rounded-xl bg-stone-900">
            <header className="flex gap-2.5 items-center mb-6">
                <div className="bg-lime-400 rounded-full h-[22px] w-[3px]" />
                <h2 className="text-lg font-bold text-white">
                    Protocolo de Entrenamiento (Plan)
                </h2>
            </header>

            <div className="flex gap-4 max-sm:flex-col">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isSelected={selectedPlan === plan.id}
                        onSelect={() => handlePlanSelect(plan.id)}
                    />
                ))}
            </div>
        </section>
    );
}

export default TrainingPlan;