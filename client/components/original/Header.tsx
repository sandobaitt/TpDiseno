import * as React from "react";

function Header() {
    return (
        <header className="flex justify-between items-center px-8 py-5 border bg-neutral-900 border-neutral-800">
            <div className="flex gap-2 items-center">
                <h1 className="text-xl font-bold text-white">
                    Gestión de Socios
                </h1>
            </div>
            <div className="flex gap-5 items-center">
                <i className="ti ti-bell text-xl cursor-pointer text-zinc-500" />
                <i className="ti ti-photo text-xl cursor-pointer text-zinc-500" />
                <i className="ti ti-user-circle text-xl cursor-pointer text-zinc-500" />
            </div>
        </header>
    );
}

export default Header;
