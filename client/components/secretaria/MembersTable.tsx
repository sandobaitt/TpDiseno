// MembersTable.tsx
"use client";

import * as React from "react";
import { DataTable } from "../common/DataTable";
import { Pagination } from "../common/Pagination";
import { FilterSelect } from "../common/FilterSelect";
import { clientsMock, type Client } from "@/data/clients";
import { plansMock } from "@/data/plans";
import { MemberDetailModal } from "./MemberDetailModal";

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
  extraClients?: Client[];
  onAddClick?: () => void;
}

const ITEMS_PER_PAGE = 8;

export function MembersTable({ className = "", extraClients = [], onAddClick }: MembersTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterPlan, setFilterPlan] = React.useState("");
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);

  const initialsStyles = [
    { initialsColor: "text-lime-400",   initialsBackground: "bg-app-card" },
    { initialsColor: "text-violet-400", initialsBackground: "bg-app-surface" },
    { initialsColor: "text-blue-400",   initialsBackground: "bg-app-surface" },
    { initialsColor: "text-app-muted",  initialsBackground: "bg-app-card" },
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
      case "enabled":  return "Habilitado";
      case "debtor":   return "Deudor";
      case "inactive": return "Inactivo";
      default:         return "Inactivo";
    }
  };

  const allMembers: Member[] = [...extraClients, ...clientsMock].map((client, index) => {
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

  const activePlanNames = React.useMemo(
    () => new Set(plansMock.filter((p) => p.status === "active").map((p) => p.name)),
    [],
  );

  const uniquePlans = React.useMemo(
    () => [...new Set(allMembers.map((m) => m.plan).filter((p) => p !== "-" && activePlanNames.has(p)))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const filteredMembers = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return allMembers.filter((m) => {
      if (q && !m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q) && !m.dni.includes(q)) return false;
      if (filterStatus && m.status.type !== filterStatus) return false;
      if (filterPlan && m.plan !== filterPlan) return false;
      return true;
    });
  }, [allMembers, search, filterStatus, filterPlan]);

  React.useEffect(() => { setCurrentPage(1); }, [search, filterStatus, filterPlan]);

  const getStatusStyles = (status: Member["status"]["type"]) => {
    switch (status) {
      case "enabled":
        return { container: "bg-green-500/15", dot: "bg-green-500", text: "text-green-500" };
      case "debtor":
        return { container: "bg-orange-500/15", dot: "bg-red-500", text: "text-red-500" };
      case "inactive":
        return { container: "bg-app-surface border border-app-border/[0.15]", dot: "bg-app-subtle", text: "text-app-subtle" };
      default:
        return { container: "bg-app-surface", dot: "bg-app-subtle", text: "text-app-subtle" };
    }
  };

  const columns = [
    {
      key: "name",
      header: "NOMBRE",
      render: (member: Member) => (
        <div className="flex gap-3 items-center min-w-0">
          <div className={`flex justify-center items-center w-9 h-9 rounded-full shrink-0 ${member.initialsBackground}`}>
            <span className={`text-xs font-bold ${member.initialsColor}`}>{member.initials}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <button
              onClick={() => setSelectedClientId(member.id)}
              className="text-sm font-semibold text-app-text truncate hover:text-lime-400 transition-colors text-left cursor-pointer"
            >
              {member.name}
            </button>
            <p className="text-xs text-app-subtle truncate">{member.email}</p>
          </div>
        </div>
      ),
    },
    { key: "dni",  header: "DNI" },
    { key: "plan", header: "PLAN" },
    {
      key: "status",
      header: "ESTADO",
      render: (member: Member) => {
        const s = getStatusStyles(member.status.type);
        return (
          <div className={`inline-flex gap-1.5 items-center px-3 py-1 rounded-full whitespace-nowrap ${s.container}`}>
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
            <span className={`text-[11px] font-semibold ${s.text}`}>{member.status.text}</span>
          </div>
        );
      },
    },
    { key: "lastAccess", header: "ÚLTIMO ACCESO", cellClassName: "truncate" },
  ];

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  const hasFilters = search.length > 0 || filterStatus !== "" || filterPlan !== "";

  return (
    <section className={`px-7 pb-7 max-sm:px-4 ${className}`}>
      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1  md:min-w-[200px] max-w-[320px]">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-app-subtle text-sm pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, email o DNI..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-app-bg glass-border text-sm text-app-text placeholder-app-faint outline-none focus:ring-1 focus:ring-lime-400/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-app-subtle hover:text-app-muted cursor-pointer"
            >
              <i className="ti ti-x text-xs" />
            </button>
          )}
        </div>

        <FilterSelect
          value={filterStatus}
          onChange={setFilterStatus}
          placeholder="Estado"
          options={[
            { value: "enabled", label: "Habilitado" },
            { value: "debtor", label: "Deudor" },
            { value: "inactive", label: "Inactivo" },
          ]}
        />

        <FilterSelect
          value={filterPlan}
          onChange={setFilterPlan}
          placeholder="Plan"
          options={uniquePlans.map((p) => ({ value: p, label: p }))}
        />

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilterStatus(""); setFilterPlan(""); }}
            className="text-xs text-app-subtle hover:text-app-muted transition-colors cursor-pointer ml-1"
          >
            Limpiar
          </button>
        )}

        <span className="text-xs text-app-faint ml-auto">{filteredMembers.length} socios</span>

        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-400 text-squat-ink text-xs font-extrabold tracking-wider hover:brightness-105 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-btn-lime shrink-0"
          >
            <i className="ti ti-user-plus text-sm" />
            AGREGAR SOCIO
          </button>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-app-bg shadow-card glass-border">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <i className="ti ti-search-off text-3xl text-app-faint" />
            <p className="text-sm text-app-faint font-medium">Sin resultados para los filtros aplicados</p>
            <button
              onClick={() => { setSearch(""); setFilterStatus(""); setFilterPlan(""); }}
              className="text-xs text-lime-400 hover:text-lime-300 transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <DataTable<Member>
            columns={columns}
            data={paginatedMembers}
            getRowKey={(member) => member.id}
            minWidthClass="min-w-[900px] lg:min-w-0"
            gridTemplateClass="grid-cols-[minmax(260px,_1fr)_120px_120px_140px_160px_60px] lg:grid-cols-[minmax(0,_3fr)_1fr_1fr_1.2fr_1.4fr_60px]"
          />
        )}
      </div>

      {filteredMembers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <MemberDetailModal
        clientId={selectedClientId}
        extraClients={extraClients}
        onClose={() => setSelectedClientId(null)}
      />
    </section>
  );
}
