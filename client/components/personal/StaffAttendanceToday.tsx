import * as React from "react";
import { Pagination } from "@/components/common/Pagination";
import { FilterSelect } from "@/components/common/FilterSelect";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { employeesMock } from "@/data/employees";
import { branchesMock } from "@/data/branches";
import { getInitials, matchesPersonSearch } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Presentismo del personal del día (pantalla anterior, sin cambios de lógica).
 * Se reemplaza en E11 por la asistencia de profesores por turno y sede (CU 1–3 de Personal).
 */

const ITEMS_PER_PAGE = 6;

const roleLabels: Record<string, string> = {
  reception: "Recepcionista",
  manager: "Gerente",
  trainer: "Entrenador",
  accounting: "Contabilidad",
  admin: "Administrativo",
};

const employees = employeesMock.map((e) => ({
  id: e.id,
  name: e.fullName,
  dni: e.dni,
  role: e.role,
  roleLabel: roleLabels[e.role] ?? e.role,
  branch: branchesMock.find((b) => b.id === e.branchId)?.code ?? "Sin sede",
}));

type PresenceFilter = "all" | "present" | "absent";

export function StaffAttendanceToday() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [presence, setPresence] = React.useState<PresenceFilter>("all");
  const [role, setRole] = React.useState("");
  const [branch, setBranch] = React.useState("");
  // Estado inicial fijo de la demo (antes era aleatorio y cambiaba en cada visita).
  const [checkins, setCheckins] = React.useState<Record<string, boolean>>({
    em_001: true,
    em_002: true,
    em_003: false,
    em_004: false,
  });

  React.useEffect(() => {
    setPage(1);
  }, [search, presence, role, branch]);

  const present = employees.filter((e) => checkins[e.id]).length;
  const filtered = employees.filter(
    (e) =>
      matchesPersonSearch(search, { name: e.name, dni: e.dni }) &&
      (presence === "all" || (presence === "present") === !!checkins[e.id]) &&
      (!role || e.role === role) &&
      (!branch || e.branch === branch),
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageRows = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon="ti-users"
          label="Total en la lista"
          value={employees.length}
          tone="neutral"
        />
        <StatCard
          icon="ti-circle-check"
          label="Presentes hoy"
          value={present}
          tone="success"
        />
        <StatCard
          icon="ti-circle-x"
          label="Ausentes hoy"
          value={employees.length - present}
          tone="danger"
        />
        <StatCard
          icon="ti-chart-bar"
          label="Tasa de asistencia"
          value={`${employees.length ? Math.round((present / employees.length) * 100) : 0}%`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Nombre o DNI…"
          label="Buscar por nombre o DNI"
        />
        {(["all", "present", "absent"] as PresenceFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={presence === f}
            onClick={() => setPresence(f)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
              presence === f
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/[0.06] bg-neutral-900 text-gray-400 hover:text-gray-200",
            )}
          >
            {f === "all" ? "Todos" : f === "present" ? "Presentes" : "Ausentes"}
          </button>
        ))}
        <FilterSelect
          value={role}
          onChange={setRole}
          placeholder="Todos los roles"
          options={Object.entries(roleLabels).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <FilterSelect
          value={branch}
          onChange={setBranch}
          placeholder="Todas las sedes"
          options={[...new Set(employees.map((e) => e.branch))].map((b) => ({
            value: b,
            label: b,
          }))}
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-neutral-900 shadow-card glass-border">
        {filtered.length === 0 && (
          <EmptyState
            icon="ti-search-off"
            title="No hay resultados con esos filtros"
          />
        )}
        {pageRows.map((row) => {
          const isPresent = checkins[row.id] ?? false;
          return (
            <div
              key={row.id}
              className="grid grid-cols-1 items-center gap-3 border-b border-white/[0.04] px-4 py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_120px_200px] sm:gap-0 sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                  <span className="text-sm font-bold text-primary">
                    {getInitials(row.name)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {row.name}
                  </p>
                  <p className="text-xs text-gray-400">{row.roleLabel}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400 sm:text-center">
                {row.branch}
              </span>
              <div className="flex items-center justify-center gap-1.5">
                {[false, true].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    aria-pressed={isPresent === value}
                    onClick={() =>
                      setCheckins((prev) => ({ ...prev, [row.id]: value }))
                    }
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1 rounded-lg border py-2.5 text-xs font-bold transition-colors",
                      isPresent === value
                        ? value
                          ? "border-success/40 bg-success/15 text-success"
                          : "border-danger/40 bg-danger/15 text-danger"
                        : "border-zinc-800 text-gray-400 hover:text-gray-200",
                    )}
                  >
                    <i
                      className={cn("ti text-sm", value ? "ti-check" : "ti-x")}
                      aria-hidden="true"
                    />
                    {value ? "Presente" : "Ausente"}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
