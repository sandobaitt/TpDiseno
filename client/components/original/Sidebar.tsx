import * as React from "react";

interface NavigationItem {
    icon: string;
    label: string;
    isActive?: boolean;
}

const navigationItems: NavigationItem[] = [
    { icon: "ti-users", label: "Gestión de Socios", isActive: true },
    { icon: "ti-user-check", label: "Control de Asistencia" },
    { icon: "ti-credit-card", label: "Cobros y Facturación" },
    { icon: "ti-shopping-cart", label: "Kiosco" },
    { icon: "ti-message", label: "Comunicaciones" },
    { icon: "ti-calendar", label: "Cronogramas" },
    { icon: "ti-speakerphone", label: "Novedades" },
];

function Sidebar() {
    return (
        <nav className="flex flex-col bg-neutral-900 flex-[shrink] min-h-[screen] w-[250px] max-md:hidden">
            <header className="px-6 pt-7 pb-6">
                <h1 className="text-2xl font-extrabold tracking-wider leading-none text-lime-400">
                    SQUATGYM
                </h1>
                <p className="mt-0.5 text-xs font-medium tracking-wide uppercase text-stone-500">
                    PANEL DE SECRETARÍA
                </p>
            </header>
            <div className="flex flex-col flex-1 mt-4">
                {navigationItems.map((item, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 items-center px-6 py-3 cursor-pointer ${item.isActive
                                ? "border-lime-400 bg-zinc-900 border-[3px]"
                                : ""
                            }`}
                    >
                        <i className={`ti ${item.icon} text-lg ${item.isActive ? "text-lime-400" : "text-neutral-600"
                            }`} />
                        <div className={`text-xs font-bold tracking-wide uppercase ${item.isActive ? "text-lime-400" : "text-neutral-600 font-semibold"
                            }`}>
                            {item.label}
                        </div>
                    </div>
                ))}
                <div className="flex gap-3 items-center px-6 py-3 mt-auto mb-6 cursor-pointer">
                    <i className="ti ti-logout text-lg text-neutral-600" />
                    <div className="text-xs font-semibold tracking-wide uppercase text-neutral-600">
                        Cerrar Sesión
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Sidebar;