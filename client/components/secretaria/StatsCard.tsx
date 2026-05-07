"use client";
import * as React from "react";

interface StatCardProps {
    icon?: string;
    value: string;
    label: string;
    status?: {
        color: string;
        text: string;
        dotColor: string;
    };
    valueColor?: string;
    bgColor?: string;
}

function StatCard({ icon, value, label, status, valueColor = "text-white", bgColor = "bg-zinc-900" }: StatCardProps) {
    return (
        <article className={`flex flex-col gap-2 p-5 rounded-xl ${bgColor}`}>
            <div className="flex gap-2 items-center">
                {icon && <i className={`ti ${icon} text-xl text-gray-400`} />}
                {status && (
                    <>
                        <div className={`w-2 h-2 ${status.dotColor} rounded-full`} />
                        <span className={`text-xs font-bold tracking-widest ${status.color} uppercase`}>
                            {status.text}
                        </span>
                    </>
                )}
            </div>
            <div className={`mt-1 text-4xl font-extrabold leading-none ${valueColor}`}>
                {value}
            </div>
            <p className="mt-0.5 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                {label}
            </p>
        </article>
    );
}

interface StatsCardsProps {
    className?: string;
}

export function StatsCards({ className = "" }: StatsCardsProps) {
    return (
        <section className={`px-7 pb-6 max-sm:px-4 ${className}`}>
            <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
                <StatCard
                    icon="ti-user-plus"
                    value="1,248"
                    label="TOTAL SOCIOS"
                />

                <StatCard
                    value="982"
                    label="Activos este mes"
                    status={{
                        color: "text-green-500",
                        text: "HABILITADO",
                        dotColor: "bg-green-500"
                    }}
                    bgColor="bg-stone-900"
                />

                <StatCard
                    value="156"
                    label="Pagos pendientes"
                    status={{
                        color: "text-red-500",
                        text: "DEUDOR",
                        dotColor: "bg-red-500"
                    }}
                    valueColor="text-red-500"
                    bgColor="bg-stone-900"
                />

                <StatCard
                    value="110"
                    label="Sin actividad > 30 días"
                    status={{
                        color: "text-gray-400",
                        text: "INACTIVO",
                        dotColor: "bg-gray-500"
                    }}
                />
            </div>
        </section>
    );
}
