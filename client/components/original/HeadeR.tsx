import * as React from "react";

function Header() {
    const breadcrumbs = [
        { label: "Home", isActive: false },
        { label: "Gestión de Socios", isActive: false },
        { label: "Alta de Socios", isActive: true },
    ];

    return (
        <header className="flex justify-between items-center px-8 py-5 border-b border-neutral-800">
            <h1 className="text-lg font-semibold text-white">
                Gestión de Socios
            </h1>
            <nav className="flex gap-4 items-center">
                <button className="ti ti-bell text-xl text-gray-400 cursor-pointer" />
                <button className="ti ti-layout-dashboard text-xl text-gray-400 cursor-pointer" />
                <button className="ti ti-user-circle text-xl text-gray-400 cursor-pointer" />
            </nav>
        </header>
    );
}

export default Header;