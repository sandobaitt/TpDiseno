import * as React from "react";
import { DataTable } from "../common/DataTable";
import { Pagination } from "../common/Pagination";
import { FilterSelect } from "../common/FilterSelect";
import type { Client } from "@/data/clients";
import { getPlan, plansMock } from "@/data/plans";
import { MemberDetailModal } from "./MemberDetailModal";
import { matchesPersonSearch } from "@/lib/format";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { ACCOUNT_STATUS_LABELS, type AccountStatus } from "@/domain/billing";
import { seedState } from "@/store/state";
import { selectAccount, selectLastAccess } from "@/store/selectors";

interface Member {
  id: string;
  name: string;
  email: string;
  dni: string;
  plan: string;
  status: AccountStatus;
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

  const allMembers: Member[] = [...extraClients, ...seedState.clients].map((client, index) => {
    const style = initialsStyles[index % initialsStyles.length];

    return {
      id: client.id,
      name: client.fullName,
      email: client.email,
      dni: client.dni,
      plan: getPlan(client.planId)?.name ?? "-",
      // El estado se calcula a partir de los pagos (no se guarda a mano).
      status: selectAccount(seedState, client).status,
      lastAccess: formatLastAccess(selectLastAccess(seedState, client.id)),
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
    return allMembers.filter((m) => {
      if (!matchesPersonSearch(search, { name: m.name, dni: m.dni, email: m.email })) return false;
      if (filterStatus && m.status !== filterStatus) return false;
      if (filterPlan && m.plan !== filterPlan) return false;
      return true;
    });
  }, [allMembers, search, filterStatus, filterPlan]);

  React.useEffect(() => { setCurrentPage(1); }, [search, filterStatus, filterPlan]);

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
              className="text-sm font-semibold text-white truncate hover:text-lime-400 transition-colors text-left cursor-pointer"
            >
              {member.name}
            </button>
            <p className="text-xs text-gray-500 truncate">{member.email}</p>
          </div>
        </div>
      ),
    },
    { key: "dni",  header: "DNI" },
    { key: "plan", header: "PLAN" },
    {
      key: "status",
      header: "ESTADO",
      render: (member: Member) => <AccountStatusBadge status={member.status} />,
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
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, email o DNI..."
            aria-label="Buscar alumno por nombre, email o DNI"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-900 glass-border text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-lime-400/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
            >
              <i className="ti ti-x text-xs" />
            </button>
          )}
        </div>

        <FilterSelect
          value={filterStatus}
          onChange={setFilterStatus}
          placeholder="Estado"
          options={(Object.keys(ACCOUNT_STATUS_LABELS) as AccountStatus[]).map((value) => ({
            value,
            label: ACCOUNT_STATUS_LABELS[value],
          }))}
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
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer ml-1"
          >
            Limpiar
          </button>
        )}

        <span className="text-xs text-gray-400 ml-auto">{filteredMembers.length} alumnos</span>

        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-400 text-squat-ink text-xs font-extrabold tracking-wider hover:brightness-105 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-btn-lime shrink-0"
          >
            <i className="ti ti-user-plus text-sm" />
            INSCRIBIR ALUMNO
          </button>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-neutral-900 shadow-card glass-border">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <i className="ti ti-search-off text-3xl text-gray-700" />
            <p className="text-sm text-gray-600 font-medium">Sin resultados para los filtros aplicados</p>
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
