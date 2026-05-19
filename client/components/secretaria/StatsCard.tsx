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

function StatCard({ icon, value, label, status, valueColor = "text-app-text", bgColor = "bg-app-surface" }: StatCardProps) {
    return (
        <article className={`w-full flex flex-col items-center justify-center md:items-start md:justify-start gap-2 p-5 rounded-2xl shadow-card glass-border ${bgColor}`}>
            <div className="flex border-4 border-red-600  gap-2 items-center">
                {icon && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-lime-400/10">
                        <i className={`ti ${icon} text-base text-lime-400`} />
                    </div>
                )}
                {status && (
                    <div className="flex gap-1.5 items-center">
                        <div className={`w-1.5 h-1.5 ${status.dotColor} rounded-full`} />
                        <span className={`text-[10px] font-bold tracking-widest ${status.color} uppercase`}>
                            {status.text}
                        </span>
                    </div>
                )}
            </div>
            <div className={`mt-1 text-4xl font-extrabold leading-none tracking-tight ${valueColor}`}>
                {value}
            </div>
            <p className="mt-0.5 text-[10px] font-semibold tracking-widest text-app-subtle uppercase">
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
                    bgColor="bg-app-surface"
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
                    bgColor="bg-app-surface"
                />

                <StatCard
                    value="110"
                    label="Sin actividad > 30 días"
                    status={{
                        color: "text-app-muted",
                        text: "INACTIVO",
                        dotColor: "bg-app-subtle"
                    }}
                />
            </div>
        </section>
    );
}
