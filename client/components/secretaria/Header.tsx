"use client";
import * as React from "react";

interface HeaderProps {
    className?: string;
    onMenuClick?: () => void;
}

export function Header({ className = "", onMenuClick }: HeaderProps) {
    return (
        <header className={`flex sticky top-0 z-10 justify-between items-center px-7 max-sm:px-4 py-4 border-b bg-neutral-900 border-stone-900 ${className}`}>
            <nav className="flex gap-2 items-center max-md:hidden">
                <span className="text-sm text-gray-500">Gestión de Socios</span>
            </nav>

            <div className="hidden gap-2 items-center max-md:flex">
                <h1 className="text-lg font-extrabold tracking-normal text-lime-400">
                    SQUATGYM
                </h1>
            </div>

            <div className="flex gap-4 items-center">
                <button className="ti ti-bell text-xl text-gray-400 cursor-pointer hover:text-gray-300" />
                <button className="ti ti-layout-dashboard text-xl text-gray-400 cursor-pointer hover:text-gray-300" />
                <button className="flex justify-center items-center w-8 h-8 rounded-full cursor-pointer bg-zinc-800 hover:bg-zinc-700">
                    <i className="ti ti-user text-base text-gray-400" />
                </button>
                <div className="hidden max-md:flex">
                    <button onClick={onMenuClick} className="ti ti-menu-2 text-2xl text-gray-400 cursor-pointer hover:text-gray-300" />
                </div>
            </div>
        </header>
    );
}