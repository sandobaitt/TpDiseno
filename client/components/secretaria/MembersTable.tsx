// MembersTable.tsx
"use client";

import * as React from "react";
import { DataTable } from "../common/DataTable";

interface Member {
  id: string;
  name: string;
  email: string;
  dni: string;
  plan: string;
  status: {
    type: "enabled" | "debtor" | "inactive";
    text: string;
  };
  lastAccess: string;
  initials: string;
  initialsColor: string;
  initialsBackground: string;
}

interface MembersTableProps {
  className?: string;
}

export function MembersTable({
  className = "",
}: MembersTableProps) {
  const members: Member[] = [
    {
      id: "1",
      name: "Martín Rodríguez",
      email: "martin.r@email.com",
      dni: "34.567.890",
      plan: "Pase Libre",
      status: {
        type: "enabled",
        text: "Habilitado",
      },
      lastAccess: "Hoy, 08:30 AM",
      initials: "MR",
      initialsColor: "text-lime-400",
      initialsBackground: "bg-zinc-800",
    },
    {
      id: "2",
      name: "Laura Gómez",
      email: "laura.g@email.com",
      dni: "38.123.456",
      plan: "Musculación",
      status: {
        type: "debtor",
        text: "Deudor",
      },
      lastAccess: "Hace 3 días",
      initials: "LG",
      initialsColor: "text-violet-400",
      initialsBackground: "bg-gray-800",
    },
    {
      id: "3",
      name: "Carlos Silva",
      email: "carlos.s@email.com",
      dni: "32.987.654",
      plan: "Crossfit",
      status: {
        type: "enabled",
        text: "Habilitado",
      },
      lastAccess: "Ayer, 19:15 PM",
      initials: "CS",
      initialsColor: "text-blue-400",
      initialsBackground: "bg-slate-800",
    },
    {
      id: "4",
      name: "Ana Pérez",
      email: "ana.p@email.com",
      dni: "40.111.222",
      plan: "-",
      status: {
        type: "inactive",
        text: "Inactivo",
      },
      lastAccess: "Hace 2 meses",
      initials: "AP",
      initialsColor: "text-gray-400",
      initialsBackground: "bg-zinc-800",
    },
  ];

  const getStatusStyles = (
    status: Member["status"]["type"]
  ) => {
    switch (status) {
      case "enabled":
        return {
          container: "bg-green-900",
          dot: "bg-green-500",
          text: "text-green-500",
        };

      case "debtor":
        return {
          container: "bg-orange-950",
          dot: "bg-red-500",
          text: "text-red-500",
        };

      case "inactive":
        return {
          container:
            "bg-stone-900 border border-gray-700",
          dot: "bg-gray-500",
          text: "text-gray-400",
        };

      default:
        return {
          container: "bg-stone-900",
          dot: "bg-gray-500",
          text: "text-gray-400",
        };
    }
  };

  const columns = [
    {
      key: "name",
      header: "NOMBRE",

      render: (member: Member) => (
        <div className="flex gap-3 items-center min-w-0">
          <div
            className={`flex justify-center items-center w-9 h-9 rounded-full shrink-0 ${member.initialsBackground}`}
          >
            <span
              className={`text-xs font-bold ${member.initialsColor}`}
            >
              {member.initials}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {member.name}
            </h3>

            <p className="text-xs text-gray-500 truncate">
              {member.email}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "dni",
      header: "DNI",
    },

    {
      key: "plan",
      header: "PLAN",
    },

    {
      key: "status",
      header: "ESTADO",

      render: (member: Member) => {
        const statusStyles = getStatusStyles(
          member.status.type
        );

        return (
          <div
            className={`inline-flex gap-1.5 items-center px-2.5 py-1 rounded-3xl whitespace-nowrap ${statusStyles.container}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}
            />

            <span
              className={`text-xs font-semibold ${statusStyles.text}`}
            >
              {member.status.text}
            </span>
          </div>
        );
      },
    },

    {
      key: "lastAccess",
      header: "ÚLTIMO ACCESO",
      cellClassName: "truncate",
    },

    {
      key: "actions",
      header: "ACCIONES",
      cellClassName: "flex justify-center",

      render: () => (
        <button className="ti ti-dots-vertical text-lg text-gray-500 hover:text-gray-300 cursor-pointer" />
      ),
    },
  ];

  return (
    <section
      className={`px-7 pb-7 max-sm:px-4 ${className}`}
    >
      <div className="p-5 rounded-2xl bg-neutral-900">
			<DataTable<Member>
				columns={columns}
				data={members}
				getRowKey={(member) => member.id}
				minWidthClass="min-w-[900px] lg:min-w-0"
				gridTemplateClass="
					grid-cols-[minmax(260px,_1fr)_120px_120px_140px_160px_60px]
					lg:grid-cols-[minmax(0,_3fr)_1fr_1fr_1.2fr_1.4fr_60px]
				"
			/>
      </div>
    </section>
  );
}