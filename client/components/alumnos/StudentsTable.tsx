import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { FilterSelect } from "@/components/common/FilterSelect";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { getPlan, plansMock } from "@/data/plans";
import { branchesMock } from "@/data/branches";
import { ACCOUNT_STATUS_LABELS, type AccountStatus } from "@/domain/billing";
import { addDays, formatDate, todayISO } from "@/lib/dates";
import { getInitials, matchesPersonSearch } from "@/lib/format";
import { useAppState } from "@/store/StoreProvider";
import { selectAccount, selectLastAccess } from "@/store/selectors";

interface StudentRow {
  id: string;
  name: string;
  email: string;
  dni: string;
  planId?: string;
  planName: string;
  branchId: string;
  branchCode: string;
  status: AccountStatus;
  lastAccess: string;
}

interface StudentsTableProps {
  /** Filtro de estado (lo comparte con las tarjetas de resumen). */
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  /** Ruta base de la ficha: la fila abre `${basePath}/${id}`. */
  basePath: string;
}

const ITEMS_PER_PAGE = 8;

const activePlans = plansMock.filter((p) => p.status === "active");
const activeBranches = branchesMock.filter((b) => b.status === "active");

function formatLastAccess(iso?: string): string {
  if (!iso) return "Sin registros";
  const day = iso.slice(0, 10);
  const time = iso.slice(11, 16);
  const today = todayISO();
  if (day === today) return `Hoy, ${time}`;
  if (day === addDays(today, -1)) return `Ayer, ${time}`;
  return `${formatDate(day)}, ${time}`;
}

/** Lista de alumnos con búsqueda tolerante y filtros. Cada fila abre la ficha. */
export function StudentsTable({
  statusFilter,
  onStatusFilterChange,
  basePath,
}: StudentsTableProps) {
  const state = useAppState();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState("");
  const [branchFilter, setBranchFilter] = React.useState("");

  const rows = React.useMemo<StudentRow[]>(
    () =>
      state.clients.map((client) => ({
        id: client.id,
        name: client.fullName,
        email: client.email,
        dni: client.dni,
        planId: client.planId,
        planName: getPlan(client.planId)?.name ?? "Sin plan",
        branchId: client.branchId,
        branchCode:
          branchesMock.find((b) => b.id === client.branchId)?.code ?? "",
        // El estado se calcula a partir de los pagos (no se guarda a mano).
        status: selectAccount(state, client).status,
        lastAccess: formatLastAccess(selectLastAccess(state, client.id)),
      })),
    [state],
  );

  const filtered = rows.filter(
    (row) =>
      matchesPersonSearch(search, {
        name: row.name,
        dni: row.dni,
        email: row.email,
      }) &&
      (!statusFilter || row.status === statusFilter) &&
      (!planFilter || row.planId === planFilter) &&
      (!branchFilter || row.branchId === branchFilter),
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, planFilter, branchFilter]);

  const hasFilters = !!(search || statusFilter || planFilter || branchFilter);
  function clearFilters() {
    setSearch("");
    onStatusFilterChange("");
    setPlanFilter("");
    setBranchFilter("");
  }

  const columns: DataTableColumn<StudentRow>[] = [
    {
      key: "name",
      header: "ALUMNO",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800">
            <span className="text-xs font-bold text-primary">
              {getInitials(row.name)}
            </span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-white">
              {row.name}
            </span>
            <span className="truncate text-xs text-gray-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    { key: "dni", header: "DNI" },
    {
      key: "plan",
      header: "PLAN Y SEDE",
      render: (row) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm text-white">{row.planName}</span>
          <span className="text-xs text-gray-400">{row.branchCode}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "ESTADO",
      render: (row) => <AccountStatusBadge status={row.status} />,
    },
    { key: "lastAccess", header: "ÚLTIMO INGRESO", cellClassName: "truncate" },
  ];

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageRows = filtered.slice(start, start + ITEMS_PER_PAGE);

  return (
    <section aria-label="Lista de alumnos" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Nombre, email o DNI…"
          label="Buscar alumno por nombre, email o DNI"
        />
        <FilterSelect
          value={statusFilter}
          onChange={onStatusFilterChange}
          placeholder="Estado"
          options={(Object.keys(ACCOUNT_STATUS_LABELS) as AccountStatus[]).map(
            (value) => ({ value, label: ACCOUNT_STATUS_LABELS[value] }),
          )}
        />
        <FilterSelect
          value={planFilter}
          onChange={setPlanFilter}
          placeholder="Plan"
          options={activePlans.map((p) => ({ value: p.id, label: p.name }))}
        />
        <FilterSelect
          value={branchFilter}
          onChange={setBranchFilter}
          placeholder="Sede"
          options={activeBranches.map((b) => ({ value: b.id, label: b.name }))}
        />
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="rounded-lg text-xs text-gray-300"
          >
            Limpiar filtros
          </Button>
        )}
        <span className="ml-auto text-xs text-gray-400" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "alumno" : "alumnos"}
        </span>
      </div>

      <div className="rounded-2xl bg-neutral-900 p-5 shadow-card glass-border max-sm:p-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon="ti-search-off"
            title="No hay alumnos con esos filtros"
            description="Probá buscar por DNI sin puntos o limpiá los filtros."
            action={
              <Button type="button" variant="link" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <DataTable<StudentRow>
            columns={columns}
            data={pageRows}
            getRowKey={(row) => row.id}
            gridTemplateClass="grid-cols-[minmax(0,_3fr)_1fr_1.2fr_1.2fr_1.3fr]"
            onRowClick={(row) => navigate(`${basePath}/${row.id}`)}
            rowActionLabel={(row) => `Ver ficha de ${row.name}`}
            label="Alumnos"
          />
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
}
