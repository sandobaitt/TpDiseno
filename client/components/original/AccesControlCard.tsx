"use client";
import * as React from "react";

function AccessControlCard() {
    const [isEnabled, setIsEnabled] = React.useState(true);

    return (
        <article className="flex flex-col gap-3 p-6 rounded-2xl bg-stone-900">
            <header className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">
                    Control de Acceso
                </h3>
                <button
                    className="flex justify-end items-center pr-1 w-11 h-6 bg-lime-400 rounded-xl cursor-pointer"
                    onClick={() => setIsEnabled(!isEnabled)}
                >
                    <div className="bg-white rounded-full h-[18px] w-[18px]" />
                </button>
            </header>
            <p className="text-xs leading-normal text-zinc-500">
                Bloquea acceso para este usuario.
            </p>
            <div className="flex gap-1.5 items-center mt-1">
                <i className="ti ti-lock text-sm text-red-400" />
                <p className="text-xs font-semibold tracking-wide text-red-400 uppercase">
                    Acceso Restringido (Deuda)
                </p>
            </div>
        </article>
    );
}

export default AccessControlCard;