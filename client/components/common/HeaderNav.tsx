"use client";
import * as React from "react";

interface HeaderProps {
    nav: string;
    title: string;
    className?: string;
    onMenuClick?: () => void;
}

export function Header({ nav, title, className = "", onMenuClick }: HeaderProps) {
    return (
        <header className={`flex sticky top-0 z-10 justify-between items-center px-7 max-sm:px-4 py-3.5 border-b bg-neutral-900 border-white/[0.05] ${className}`}>
            <nav className="flex gap-2 items-center max-md:hidden">
                <span className="text-sm text-gray-500">{nav}</span>
            </nav>

            <div className="hidden gap-2 items-center max-md:flex">
                <h1 className="text-lg font-extrabold tracking-tight text-lime-400">
                    {title}
                </h1>
            </div>

            <div className="flex gap-1 items-center">
                <button className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer">
                    <i className="ti ti-bell text-[18px]" />
                </button>
                <button className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer">
                    <i className="ti ti-layout-dashboard text-[18px]" />
                </button>
                <button className="flex justify-center items-center w-9 h-9 rounded-xl cursor-pointer bg-zinc-800 hover:bg-zinc-700 transition-all duration-150 glass-border ml-1">
                    <i className="ti ti-user text-base text-gray-400" />
                </button>
                <div className="hidden max-md:flex ml-1">
                    <button onClick={onMenuClick} className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer">
                        <i className="ti ti-menu-2 text-xl" />
                    </button>
                </div>
            </div>
        </header>
    );
}