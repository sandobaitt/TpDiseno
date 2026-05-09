import * as React from "react";

function MemberProfile() {
    return (
        <section className="flex gap-6 items-center max-sm:flex-col max-sm:items-start">
            <div className="overflow-hidden rounded-xl bg-slate-500 flex-[shrink] h-[120px] w-[120px]">
                <img
                    src="https://placehold.co/120x120/5b8fa8/5b8fa8"
                    alt="profile"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex flex-col flex-1 gap-2">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-800 text-neutral-400">
                        ID #84920
                    </div>
                    <div className="flex gap-1.5 items-center px-3 py-1 text-xs font-semibold text-red-400 rounded-md bg-orange-950">
                        <i className="ti ti-alert-triangle text-sm" />
                        DEUDOR
                    </div>
                </div>
                <h2 className="text-5xl font-black leading-none text-white max-sm:text-4xl">
                    Maximiliano<span className="text-neutral-700">Cabrera.</span>
                </h2>
                <div className="flex gap-2 items-center">
                    <i className="ti ti-run text-base text-zinc-500" />
                    <span className="text-sm text-zinc-500">
                        Plan:
                        <span className="font-semibold text-white">
                            Musculación + HIIT Libre
                        </span>
                    </span>
                </div>
            </div>
            <div className="ml-auto">
                <button className="flex gap-2 items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg border cursor-pointer bg-zinc-800 border-zinc-800">
                    <i className="ti ti-pencil text-sm" />
                    Editar Perfil
                </button>
            </div>
        </section>
    );
}

export default MemberProfile;