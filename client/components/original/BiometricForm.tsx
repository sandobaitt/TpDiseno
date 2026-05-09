"use client";
import * as React from "react";

function BiometricForm() {
    const [formData, setFormData] = React.useState({
        dni: "",
        firstName: "",
        lastName: "",
        email: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <section className="p-7 rounded-xl bg-stone-900">
            <header className="flex gap-2.5 items-center mb-6">
                <div className="bg-lime-400 rounded-full h-[22px] w-[3px]" />
                <h2 className="text-lg font-bold text-white">
                    Datos Biométricos y Contacto
                </h2>
            </header>

            <form>
                <div className="mb-5">
                    <label className="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase block">
                        DOCUMENTO NACIONAL DE IDENTIDAD (DNI)
                    </label>
                    <div className="flex gap-2.5 items-center px-4 py-3.5 rounded-lg border border-solid bg-zinc-800 border-zinc-800">
                        <i className="ti ti-id-badge text-lg text-gray-500" />
                        <input
                            type="text"
                            placeholder="Ingresar sin puntos"
                            value={formData.dni}
                            onChange={(e) => handleInputChange("dni", e.target.value)}
                            className="flex-1 text-sm text-gray-500 bg-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mb-5 max-sm:flex-col">
                    <div className="flex-1">
                        <label className="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase block">
                            NOMBRES
                        </label>
                        <div className="px-4 py-3.5 rounded-lg border border-solid bg-zinc-800 border-zinc-800">
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                className="w-full text-sm text-white bg-transparent outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase block">
                            APELLIDOS
                        </label>
                        <div className="px-4 py-3.5 rounded-lg border border-solid bg-zinc-800 border-zinc-800">
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                className="w-full text-sm text-white bg-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase block">
                        CORREO ELECTRÓNICO
                    </label>
                    <div className="flex gap-2.5 items-center px-4 py-3.5 rounded-lg border border-solid bg-zinc-800 border-zinc-800">
                        <i className="ti ti-at text-lg text-gray-500" />
                        <input
                            type="email"
                            placeholder="socio@ejemplo.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="flex-1 text-sm text-gray-500 bg-transparent outline-none"
                        />
                    </div>
                </div>
            </form>
        </section>
    );
}

export default BiometricForm;