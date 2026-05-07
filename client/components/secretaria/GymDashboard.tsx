"use client";
import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StatsCards } from "./StatsCard";
import { MembersTable } from "./MembersTable";

export function GymDashboard() {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
            />
            <div className="flex bg-neutral-900 min-h-screen relative overflow-hidden">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                
                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-10 md:hidden" 
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <main className="flex flex-col flex-1 md:ml-[248px] w-full min-w-0">
                    <Header onMenuClick={() => setSidebarOpen(true)} />

                    <nav className="px-7 pt-5 pb-2 max-sm:px-4">
                        <div className="flex gap-1.5 items-center text-sm">
                            <button className="text-gray-500 cursor-pointer hover:text-gray-400">← Home</button>
                            <span className="text-gray-500">/</span>
                            <span className="font-medium text-lime-400">Gestión de Socios</span>
                        </div>
                    </nav>

                    <section className="px-7 pt-2 pb-6 max-sm:px-4">
                        <h1 className="text-4xl font-black tracking-normal leading-none text-white uppercase max-sm:text-3xl">
                            GESTIÓN DE SOCIOS
                        </h1>
                        <p className="mt-1.5 text-sm text-gray-500">
                            Administración de membresías y estado de cuentas.
                        </p>
                    </section>

                    <StatsCards />
                    <MembersTable />
                </main>
            </div>
        </>
    );
}

export default GymDashboard;