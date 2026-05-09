import * as React from "react";

interface MenuItem {
    icon: string;
    label: string;
    isActive?: boolean;
}

interface SubMenuItem {
    label: string;
    isActive?: boolean;
}

function Sidebar() {
    const menuItems: MenuItem[] = [
        { icon: "ti-users", label: "GESTIÓN DE SOCIOS", isActive: true },
        { icon: "ti-user-check", label: "CONTROL DE ASISTENCIA" },
        { icon: "ti-credit-card", label: "COBROS Y FACTURACIÓN" },
        { icon: "ti-shopping-cart", label: "KIOSCO" },
        { icon: "ti-message", label: "COMUNICACIONES" },
        { icon: "ti-calendar", label: "CRONOGRAMAS" },
        { icon: "ti-speakerphone", label: "NOVEDADES" },
    ];

    const subMenuItems: SubMenuItem[] = [
        { label: "ALTA DE SOCIOS", isActive: true },
        { label: "PERFIL" },
    ];

    return (
        <nav className="flex flex-col bg-zinc-900 flex-shrink-0 min-h-screen w-[248px] max-md:hidden">
            <header className="px-6 pt-7 pb-6">
                <h1 className="text-2xl font-extrabold tracking-normal leading-none text-lime-400">
                    SQUATGYM
                </h1>
                <p className="mt-0.5 text-xs font-medium tracking-wide text-gray-500 uppercase">
                    PANEL DE SECRETARÍA
                </p>
            </header>

            <div className="flex flex-col mt-2">
                {menuItems.map((item, index) => (
                    <div key={index}>
                        <div className="flex gap-2.5 items-center px-6 py-3 cursor-pointer">
                            <i className={`ti ${item.icon} text-lg text-gray-400`} />
                            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                                {item.label}
                            </span>
                        </div>

                        {item.isActive && (
                            <div className="ml-3 mr-3">
                                {subMenuItems.map((subItem, subIndex) => (
                                    <div
                                        key={subIndex}
                                        className={`px-3 py-2.5 mb-0.5 rounded-md cursor-pointer ${subItem.isActive ? "bg-zinc-800" : "bg-neutral-800"
                                            }`}
                                    >
                                        <span
                                            className={`text-xs font-bold tracking-widest text-center uppercase block ${subItem.isActive ? "text-lime-400" : "text-white"
                                                }`}
                                        >
                                            {subItem.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <footer className="p-6 mt-auto">
                <div className="flex gap-2.5 items-center cursor-pointer">
                    <i className="ti ti-logout text-lg text-gray-400" />
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                        CERRAR SESIÓN
                    </span>
                </div>
            </footer>
        </nav>
    );
}

export default Sidebar;