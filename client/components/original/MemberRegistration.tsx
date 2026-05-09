import * as React from "react";
import BiometricForm from "./BiometricForm";
import TrainingPlan from "./TrainingPlan";
import MedicalCompliance from "./MedicalCompliance";

function MemberRegistration() {
    const breadcrumbs = [
        { label: "Home", isActive: false },
        { label: "Gestión de Socios", isActive: false },
        { label: "Alta de Socios", isActive: true },
    ];

    return (
        <main className="overflow-y-auto flex-1 px-8 py-7">
            <nav className="flex gap-1.5 items-center mb-4 text-sm">
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                        <span
                            className={`cursor-pointer ${crumb.isActive ? "text-white" : "text-gray-400"
                                }`}
                        >
                            {crumb.label}
                        </span>
                        {index < breadcrumbs.length - 1 && (
                            <span className="text-gray-400">/</span>
                        )}
                    </React.Fragment>
                ))}
            </nav>

            <div className="flex gap-2 items-center mb-1.5">
                <i className="ti ti-user-plus text-sm text-lime-400" />
                <span className="text-xs font-semibold tracking-widest text-lime-400 uppercase">
                    MÓDULO DE ONBOARDING
                </span>
            </div>

            <h1 className="mb-7 text-4xl font-black tracking-normal leading-none text-white uppercase">
                ALTA DE SOCIOS
            </h1>

            <div className="flex gap-5 max-md:flex-col">
                <div className="flex flex-col flex-1 gap-5">
                    <BiometricForm />
                    <TrainingPlan />
                </div>
                <div className="flex flex-col gap-5 w-[340px] max-md:w-full">
                    <MedicalCompliance />
                    <button className="flex gap-2 justify-center items-center px-6 py-5 bg-lime-400 rounded-xl cursor-pointer">
                        <span className="text-sm font-extrabold tracking-wide uppercase text-neutral-900">
                            FINALIZAR INSCRIPCIÓN
                        </span>
                        <i className="ti ti-arrow-right text-lg font-extrabold text-neutral-900" />
                    </button>
                </div>
            </div>
        </main>
    );
}

export default MemberRegistration;