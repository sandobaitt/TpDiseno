"use client";
import * as React from "react";

interface Member {
    id: string;
    name: string;
    email: string;
    dni: string;
    plan: string;
    status: {
        type: 'enabled' | 'debtor' | 'inactive';
        text: string;
    };
    lastAccess: string;
    initials: string;
    initialsColor: string;
    initialsBackground: string;
}

interface MemberRowProps {
    member: Member;
}

function MemberRow({ member }: MemberRowProps) {
    const getStatusStyles = (status: Member['status']['type']) => {
        switch (status) {
            case 'enabled':
                return {
                    container: 'bg-green-900',
                    dot: 'bg-green-500',
                    text: 'text-green-500'
                };
            case 'debtor':
                return {
                    container: 'bg-orange-950',
                    dot: 'bg-red-500',
                    text: 'text-red-500'
                };
            case 'inactive':
                return {
                    container: 'bg-stone-900 border border-gray-700 border-solid',
                    dot: 'bg-gray-500',
                    text: 'text-gray-400'
                };
            default:
                return {
                    container: 'bg-stone-900',
                    dot: 'bg-gray-500',
                    text: 'text-gray-400'
                };
        }
    };

    const statusStyles = getStatusStyles(member.status.type);

    return (
        <div className="grid items-center py-3.5 border-b border-stone-900 grid-cols-[minmax(250px,_1fr)_100px_100px_120px_140px_60px]">
            <div className="flex gap-2.5 items-center px-1">
                <div className={`flex justify-center items-center w-9 h-9 rounded-full ${member.initialsBackground} flex-shrink-0`}>
                    <span className={`text-xs font-bold ${member.initialsColor}`}>
                        {member.initials}
                    </span>
                </div>
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-white">
                        {member.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {member.email}
                    </p>
                </div>
            </div>

            <div className="px-1 text-sm text-gray-400">{member.dni}</div>
            <div className="px-1 text-sm text-gray-400">{member.plan}</div>

            <div className="px-1">
                <div className={`inline-flex gap-1.5 items-center px-2.5 py-1 rounded-3xl ${statusStyles.container}`}>
                    <div className={`w-1.5 h-1.5 ${statusStyles.dot} rounded-full`} />
                    <span className={`text-xs font-semibold ${statusStyles.text}`}>
                        {member.status.text}
                    </span>
                </div>
            </div>

            <div className="px-1 text-sm text-gray-400">
                {member.lastAccess}
            </div>

            <div className="flex justify-center px-1">
                <button className="ti ti-dots-vertical text-lg text-gray-500 cursor-pointer hover:text-gray-400" />
            </div>
        </div>
    );
}

interface MembersTableProps {
    className?: string;
}

export function MembersTable({ className = "" }: MembersTableProps) {
    const members: Member[] = [
        {
            id: '1',
            name: 'Martín Rodríguez',
            email: 'martin.r@email.com',
            dni: '34.567.890',
            plan: 'Pase Libre',
            status: { type: 'enabled', text: 'Habilitado' },
            lastAccess: 'Hoy, 08:30 AM',
            initials: 'MR',
            initialsColor: 'text-lime-400',
            initialsBackground: 'bg-zinc-800'
        },
        {
            id: '2',
            name: 'Laura Gómez',
            email: 'laura.g@email.com',
            dni: '38.123.456',
            plan: 'Musculación',
            status: { type: 'debtor', text: 'Deudor' },
            lastAccess: 'Hace 3 días',
            initials: 'LG',
            initialsColor: 'text-violet-400',
            initialsBackground: 'bg-gray-800'
        },
        {
            id: '3',
            name: 'Carlos Silva',
            email: 'carlos.s@email.com',
            dni: '32.987.654',
            plan: 'Crossfit',
            status: { type: 'enabled', text: 'Habilitado' },
            lastAccess: 'Ayer, 19:15 PM',
            initials: 'CS',
            initialsColor: 'text-blue-400',
            initialsBackground: 'bg-slate-800'
        },
        {
            id: '4',
            name: 'Ana Pérez',
            email: 'ana.p@email.com',
            dni: '40.111.222',
            plan: '-',
            status: { type: 'inactive', text: 'Inactivo' },
            lastAccess: 'Hace 2 meses',
            initials: 'AP',
            initialsColor: 'text-gray-400',
            initialsBackground: 'bg-zinc-800'
        }
    ];

    return (
        <section className={`px-7 pb-7 max-sm:px-4 ${className}`}>
            <div className="p-5 rounded-2xl bg-neutral-900">
                <div className="flex flex-wrap gap-3 items-center mb-4 max-sm:gap-2">
                    <div className="flex flex-1 gap-2 items-center px-3.5 py-2.5 rounded-lg bg-stone-900 min-w-[200px] max-sm:w-full">
                        <i className="ti ti-search text-base text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            className="w-full text-sm text-gray-400 bg-transparent border-none outline-none placeholder-gray-500"
                        />
                    </div>

                    <button className="flex gap-1.5 justify-center items-center px-3.5 py-2.5 rounded-lg cursor-pointer bg-stone-900 hover:bg-stone-800 max-sm:flex-1">
                        <span className="text-sm text-gray-400 truncate">Todos los Planes</span>
                        <i className="ti ti-chevron-down text-sm text-gray-400 shrink-0" />
                    </button>

                    <button className="flex gap-1.5 justify-center items-center px-3.5 py-2.5 rounded-lg cursor-pointer bg-stone-900 hover:bg-stone-800 max-sm:flex-1">
                        <span className="text-sm text-gray-400 truncate">Cualquier Estado</span>
                        <i className="ti ti-chevron-down text-sm text-gray-400 shrink-0" />
                    </button>

                    <button className="flex gap-1.5 justify-center items-center px-3.5 py-2.5 rounded-lg cursor-pointer bg-stone-900 hover:bg-stone-800 max-sm:w-full">
                        <i className="ti ti-adjustments-horizontal text-sm text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-400">Ordenar</span>
                    </button>
                </div>

                <div className="mb-5 flex max-sm:w-full">
                    <button className="inline-flex max-sm:w-full justify-center gap-2 items-center px-4 py-2.5 bg-lime-400 rounded-lg cursor-pointer hover:bg-lime-500">
                        <i className="ti ti-plus text-base font-bold text-neutral-900" />
                        <span className="text-sm font-bold text-neutral-900">
                            Nueva Inscripción
                        </span>
                    </button>
                </div>

                <div className="w-full overflow-x-auto pb-4">
                    <div className="min-w-[770px]">
                        <header className="grid pb-2.5 mb-1 border-b border-stone-900 grid-cols-[minmax(250px,_1fr)_100px_100px_120px_140px_60px]">
                            <div className="px-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                                NOMBRE
                            </div>
                            <div className="px-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                                DNI
                            </div>
                            <div className="px-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                                PLAN
                            </div>
                            <div className="px-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                                ESTADO
                            </div>
                            <div className="px-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                                ÚLTIMO ACCESO
                            </div>
                            <div className="px-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                                ACCIONES
                            </div>
                        </header>

                        <div className="flex flex-col">
                            {members.map((member) => (
                                <MemberRow key={member.id} member={member} />
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="flex justify-between items-center pt-4 mt-1">
                    <p className="text-xs text-gray-500">
                        Mostrando 1-4 de 1,248 socios
                    </p>
                    <div className="flex gap-2 items-center">
                        <button className="flex justify-center items-center w-7 h-7 rounded-md cursor-pointer bg-stone-900 hover:bg-stone-800">
                            <i className="ti ti-chevron-left text-sm text-gray-400" />
                        </button>
                        <button className="flex justify-center items-center w-7 h-7 rounded-md cursor-pointer bg-stone-900 hover:bg-stone-800">
                            <i className="ti ti-chevron-right text-sm text-gray-400" />
                        </button>
                    </div>
                </footer>
            </div>
        </section>
    );
}