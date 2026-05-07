"use client";
import * as React from "react";

interface SidebarProps {
    className?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ className = "", isOpen = false, onClose }: SidebarProps) {
    return (
        <aside className={`flex fixed inset-y-0 left-0 z-20 flex-col bg-neutral-900 min-h-screen w-[248px] transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${className}`}>
            <header className="px-6 pt-7 pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-normal leading-none text-lime-400">
                        SQUATGYM
                    </h1>
                    <p className="mt-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                        PANEL DE SECRETARÍA
                    </p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <i className="ti ti-x text-2xl" />
                    </button>
                )}
            </header>

            <nav className="flex flex-col flex-1 gap-1 px-3 mt-2">
                <a href="#" className="flex gap-2.5 items-center px-3 py-2.5 rounded-lg cursor-pointer bg-stone-900">
                    <i className="ti ti-users text-lg text-lime-400" />
                    <span className="text-xs font-bold tracking-wide text-lime-400 uppercase">
                        GESTIÓN DE SOCIOS
                    </span>
                </a>

                <a href="#" className="flex gap-2.5 items-center px-3 py-2.5 mt-0.5 rounded-lg cursor-pointer hover:bg-stone-900">
                    <i className="ti ti-user-check text-lg text-gray-500" />
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        CONTROL DE ASISTENCIA
                    </span>
                </a>

                <a href="#" className="flex gap-2.5 items-center px-3 py-2.5 mt-0.5 rounded-lg cursor-pointer hover:bg-stone-900">
                    <i className="ti ti-credit-card text-lg text-gray-500" />
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        COBROS Y FACTURACIÓN
                    </span>
                </a>

                <a href="#" className="flex gap-2.5 items-center px-3 py-2.5 mt-0.5 rounded-lg cursor-pointer hover:bg-stone-900">
                    <i className="ti ti-shopping-cart text-lg text-gray-500" />
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        KIOSCO
                    </span>
                </a>

                <a href="#" className="flex gap-2.5 items-center px-3 py-2.5 mt-0.5 rounded-lg cursor-pointer hover:bg-stone-900">
                    <i className="ti ti-message text-lg text-gray-500" />
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        COMUNICACIONES
                    </span>
                </a>

                <a href="#" className="flex gap-2.5 items-center px-3 py-2.5 mt-0.5 rounded-lg cursor-pointer hover:bg-stone-900">
                    <i className="ti ti-calendar text-lg text-gray-500" />
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        CRONOGRAMAS
                    </span>
                </a>

                <a href="#" className="flex gap-2.5 items-center px-3 py-2.5 mt-0.5 rounded-lg cursor-pointer hover:bg-stone-900">
                    <i className="ti ti-speakerphone text-lg text-gray-500" />
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        NOVEDADES
                    </span>
                </a>
            </nav>

            <footer className="px-3 pb-7">
                <button className="flex gap-2.5 items-center px-3 py-2.5 rounded-lg cursor-pointer hover:bg-stone-900 w-full text-left">
                    <i className="ti ti-logout text-lg text-gray-500" />
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        CERRAR SESIÓN
                    </span>
                </button>
            </footer>
        </aside>
    );
}