"use client";
import * as React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MemberProfile from "./MemberProfile";
import FinancialCard from "./FinancialCard";
import AccessControlCard from "./AccessControlCard";
import PaymentHistory from "./PaymentHistory";

function GymDashboard() {
    return (
        <>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
            />
            <div className="flex bg-neutral-900 min-h-[screen]">
                <Sidebar />
                <main className="flex flex-col flex-1 bg-neutral-900 min-h-[screen]">
                    <Header />
                    <div className="flex gap-2 items-center px-8 py-4">
                        <div className="text-sm cursor-pointer text-zinc-500">Home</div>
                        <div className="text-sm text-zinc-500">/</div>
                        <div className="text-sm cursor-pointer text-zinc-500">
                            Gestión de Socios
                        </div>
                        <div className="text-sm text-zinc-500">/</div>
                        <div className="text-sm font-medium text-lime-400">Perfil</div>
                    </div>
                    <div className="flex flex-col gap-6 px-8 pb-8">
                        <MemberProfile />
                        <div className="flex gap-5 max-md:flex-col">
                            <aside className="flex flex-col gap-4 flex-[shrink] w-[280px] max-md:w-full">
                                <FinancialCard />
                                <AccessControlCard />
                            </aside>
                            <PaymentHistory />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default GymDashboard;