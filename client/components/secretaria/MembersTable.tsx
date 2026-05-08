// MembersTable.tsx
"use client";

import * as React from "react";
import { DataTable } from "../common/DataTable";
import { clientsMock } from "@/data/clients";
import { plansMock } from "@/data/plans";

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
  const initialsStyles = [
    { initialsColor: "text-lime-400", initialsBackground: "bg-zinc-800" },
    { initialsColor: "text-violet-400", initialsBackground: "bg-gray-800" },
    { initialsColor: "text-blue-400", initialsBackground: "bg-slate-800" },
    { initialsColor: "text-gray-400", initialsBackground: "bg-zinc-800" },
  ];

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
    return `${first}${second}`.toUpperCase();
  };

  const formatLastAccess = (iso?: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";

    const now = new Date();
    const isSameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const time = new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    if (isSameDay) return `Hoy, ${time}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    if (isYesterday) return `Ayer, ${time}`;

    const day = new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    return `${day}, ${time}`;
  };

  const getStatusText = (status: Member["status"]["type"]) => {
    switch (status) {
      case "enabled":
        return "Habilitado";
      case "debtor":
        return "Deudor";
      case "inactive":
        return "Inactivo";
      default:
        return "Inactivo";
    }
  };

  const members: Member[] = clientsMock.map((client, index) => {
    const style = initialsStyles[index % initialsStyles.length];
    const planName =
      plansMock.find((p) => p.id === client.membership?.planId)?.name ?? "-";

    return {
      id: client.id,
      name: client.fullName,
      email: client.email,
      dni: client.dni,
      plan: planName,
      status: {
        type: client.status,
        text: getStatusText(client.status),
      },
      lastAccess: formatLastAccess(client.lastAccessAt),
      initials: getInitials(client.fullName),
      ...style,
    };
  });

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