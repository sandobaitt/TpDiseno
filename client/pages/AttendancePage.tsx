import * as React from "react";
import { Pagination } from "@/components/common/Pagination";
import { FilterSelect } from "@/components/common/FilterSelect";
import { getPlan } from "@/data/plans";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { ACCOUNT_STATUS_LABELS, type AccountStatus } from "@/domain/billing";
import { useAppState } from "@/store/StoreProvider";
import type { AppState } from "@/store/state";
import { selectAccount } from "@/store/selectors";
import { employeesMock } from "@/data/employees";
import { branchesMock } from "@/data/branches";
import { matchesPersonSearch } from "@/lib/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";

type TabId = "students" | "teachers";

const ITEMS_PER_PAGE = 6;

const roleLabels: Record<string, string> = {
  reception: "Recepcionista",
  manager: "Gerente",
  trainer: "Entrenador",
  accounting: "Contabilidad",
  admin: "Administrativo",
};

const roleBadgeStyles: Record<string, string> = {
  reception: "bg-blue-950/60 text-blue-400 border border-blue-500/20",
  manager: "bg-violet-950/60 text-violet-400 border border-violet-500/20",
  trainer: "bg-lime-950/60 text-lime-400 border border-lime-500/20",
  accounting: "bg-amber-950/60 text-amber-400 border border-amber-500/20",
  admin: "bg-zinc-800 text-gray-300 border border-zinc-700/40",
};

const avatarStyles = [
  { bg: "bg-zinc-800", text: "text-lime-400" },
  { bg: "bg-gray-800", text: "text-violet-400" },
  { bg: "bg-slate-800", text: "text-blue-400" },
  { bg: "bg-zinc-800", text: "text-gray-400" },
];

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
}

function buildStudents(state: AppState) {
  return state.clients
    .filter((c) => c.status === "active")
    .map((c, i) => {
      const planName = getPlan(c.planId)?.name ?? "Sin plan";
      const style = avatarStyles[i % avatarStyles.length];
      return {
        id: c.id,
        name: c.fullName,
        dni: c.dni,
        plan: planName,
        financialStatus: selectAccount(state, c).status as AccountStatus,
        initials: getInitials(c.fullName),
        initialsBg: style.bg,
        initialsText: style.text,
      };
    });
}

const employeesData = employeesMock.map((e, i) => {
  const style = avatarStyles[i % avatarStyles.length];
  const branch = branchesMock.find((b) => b.id === e.branchId);
  return {
    id: e.id,
    name: e.fullName,
    dni: e.dni,
    role: e.role,
    roleLabel: roleLabels[e.role] ?? e.role,
    roleBadge:
      roleBadgeStyles[e.role] ??
      "bg-zinc-800 text-gray-400 border border-zinc-700/40",
    branch: branch?.code ?? "Sin sede",
    status: e.status,
    initials: getInitials(e.fullName),
    initialsBg: style.bg,
    initialsText: style.text,
  };
});

const todayRaw = new Date().toLocaleDateString("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const todayLabel = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

type PresenceFilter = "all" | "present" | "absent";

export default function AttendancePage() {
  const state = useAppState();
  const studentsData = React.useMemo(() => buildStudents(state), [state]);
  const [activeTab, setActiveTab] = React.useState<TabId>("students");
  const [studentPage, setStudentPage] = React.useState(1);
  const [teacherPage, setTeacherPage] = React.useState(1);

  const [search, setSearch] = React.useState("");
  const [presenceFilter, setPresenceFilter] =
    React.useState<PresenceFilter>("all");
  const [filterFinancial, setFilterFinancial] = React.useState("");
  const [filterPlan, setFilterPlan] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterBranch, setFilterBranch] = React.useState("");

  const uniqueBranches = [
    ...new Set(employeesData.map((e) => e.branch).filter(Boolean)),
  ];
  const uniquePlans = [
    ...new Set(studentsData.map((s) => s.plan).filter((p) => p !== "Sin plan")),
  ];

  const [studentCheckins, setStudentCheckins] = React.useState<
    Record<string, boolean>
  >({
    cl_001: true,
    cl_002: false,
    cl_003: true,
    cl_004: false,
  });

  // Estado inicial fijo de la demo (antes era aleatorio y cambiaba en cada visita).
  const [teacherCheckins, setTeacherCheckins] = React.useState<
    Record<string, boolean>
  >({
    em_001: true,
    em_002: true,
    em_003: false,
    em_004: false,
  });

  const clearFilters = () => {
    setSearch("");
    setPresenceFilter("all");
    setFilterFinancial("");
    setFilterPlan("");
    setFilterRole("");
    setFilterBranch("");
  };

  React.useEffect(() => {
    setStudentPage(1);
  }, [search, presenceFilter, filterFinancial, filterPlan]);
  React.useEffect(() => {
    setTeacherPage(1);
  }, [search, presenceFilter, filterRole, filterBranch]);

  // Stats
  const studentPresent = studentsData.filter(
    (s) => studentCheckins[s.id],
  ).length;
  const studentAbsent = studentsData.length - studentPresent;
  const studentRate = studentsData.length
    ? Math.round((studentPresent / studentsData.length) * 100)
    : 0;

  const teacherPresent = employeesData.filter(
    (e) => teacherCheckins[e.id],
  ).length;
  const teacherAbsent = employeesData.length - teacherPresent;
  const teacherRate = employeesData.length
    ? Math.round((teacherPresent / employeesData.length) * 100)
    : 0;

  const present = activeTab === "students" ? studentPresent : teacherPresent;
  const absent = activeTab === "students" ? studentAbsent : teacherAbsent;
  const total =
    activeTab === "students" ? studentsData.length : employeesData.length;
  const rate = activeTab === "students" ? studentRate : teacherRate;

  // Filtered lists
  const filteredStudents = React.useMemo(() => {
    return studentsData.filter((s) => {
      if (!matchesPersonSearch(search, { name: s.name, dni: s.dni }))
        return false;
      if (presenceFilter === "present" && !studentCheckins[s.id]) return false;
      if (presenceFilter === "absent" && studentCheckins[s.id]) return false;
      if (filterFinancial && s.financialStatus !== filterFinancial)
        return false;
      if (filterPlan && s.plan !== filterPlan) return false;
      return true;
    });
  }, [
    studentsData,
    search,
    presenceFilter,
    filterFinancial,
    filterPlan,
    studentCheckins,
  ]);

  const filteredTeachers = React.useMemo(() => {
    return employeesData.filter((e) => {
      if (!matchesPersonSearch(search, { name: e.name, dni: e.dni }))
        return false;
      if (presenceFilter === "present" && !teacherCheckins[e.id]) return false;
      if (presenceFilter === "absent" && teacherCheckins[e.id]) return false;
      if (filterRole && e.role !== filterRole) return false;
      if (filterBranch && e.branch !== filterBranch) return false;
      return true;
    });
  }, [search, presenceFilter, filterRole, filterBranch, teacherCheckins]);

  // Pagination
  const studentTotalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const teacherTotalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const studentStart = (studentPage - 1) * ITEMS_PER_PAGE;
  const teacherStart = (teacherPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(
    studentStart,
    studentStart + ITEMS_PER_PAGE,
  );
  const paginatedTeachers = filteredTeachers.slice(
    teacherStart,
    teacherStart + ITEMS_PER_PAGE,
  );

  return (
    <section className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
      <PageHeader
        title="Control de asistencia"
        subtitle="Registro de presencia del día."
        actions={
          <span className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-neutral-900 px-4 py-2 text-xs font-semibold text-gray-300">
            <i
              className="ti ti-calendar text-sm text-primary"
              aria-hidden="true"
            />
            {todayLabel}
          </span>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon="ti-users"
          label="Total en la lista"
          value={total}
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
          value={absent}
          tone="danger"
        />
        <StatCard
          icon="ti-chart-bar"
          label="Tasa de asistencia"
          value={`${rate}%`}
        />
      </div>

      {/* Tabs + Table */}
      <div className="flex flex-col gap-4">
        <SegmentedTabs
          label="Lista de asistencia"
          value={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            if (tab === "students") setStudentPage(1);
            else setTeacherPage(1);
            clearFilters();
          }}
          items={[
            {
              id: "students",
              label: "Alumnos",
              icon: "ti-users",
              count: studentsData.length,
            },
            {
              id: "teachers",
              label: "Profesores / Staff",
              icon: "ti-user-star",
              count: employeesData.length,
            },
          ]}
        />

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Nombre o DNI…"
            label="Buscar por nombre o DNI"
          />

          {/* Presence filter */}
          {(["all", "present", "absent"] as PresenceFilter[]).map((f) => (
            <button
              key={f}
              aria-pressed={presenceFilter === f}
              onClick={() => setPresenceFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                presenceFilter === f
                  ? "bg-lime-400/10 border-lime-400/40 text-lime-400"
                  : "bg-neutral-900 border-white/[0.06] text-gray-400 hover:border-white/[0.12] hover:text-gray-300"
              }`}
            >
              {f === "all"
                ? "Todos"
                : f === "present"
                  ? "Presentes"
                  : "Ausentes"}
            </button>
          ))}

          {/* Student: financial status + plan dropdowns */}
          {activeTab === "students" && (
            <>
              <FilterSelect
                value={filterFinancial}
                onChange={setFilterFinancial}
                placeholder="Todos los estados"
                options={(Object.keys(ACCOUNT_STATUS_LABELS) as AccountStatus[])
                  .filter((value) => value !== "inactivo")
                  .map((value) => ({
                    value,
                    label: ACCOUNT_STATUS_LABELS[value],
                  }))}
              />
              <FilterSelect
                value={filterPlan}
                onChange={setFilterPlan}
                placeholder="Todos los planes"
                options={uniquePlans.map((p) => ({ value: p, label: p }))}
              />
            </>
          )}

          {/* Teacher: role + branch dropdowns */}
          {activeTab === "teachers" && (
            <>
              <FilterSelect
                value={filterRole}
                onChange={setFilterRole}
                placeholder="Todos los roles"
                options={Object.entries(roleLabels).map(([key, label]) => ({
                  value: key,
                  label,
                }))}
              />
              <FilterSelect
                value={filterBranch}
                onChange={setFilterBranch}
                placeholder="Todas las sedes"
                options={uniqueBranches.map((b) => ({ value: b, label: b }))}
              />
            </>
          )}

          {(search ||
            presenceFilter !== "all" ||
            filterFinancial ||
            filterPlan ||
            filterRole ||
            filterBranch) && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-pointer ml-1"
            >
              Limpiar
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto">
            {activeTab === "students"
              ? filteredStudents.length
              : filteredTeachers.length}{" "}
            en la lista
          </span>
        </div>

        {/* Table card */}
        <div className="rounded-2xl bg-neutral-900 shadow-card glass-border overflow-hidden">
          {/* Column headers */}
          {activeTab === "students" ? (
            <>
              <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_160px_152px] px-6 py-3 border-b border-white/[0.05]">
                <span className="text-[11px] font-bold tracking-widest text-gray-400">
                  ALUMNO
                </span>
                <span className="text-[11px] font-bold tracking-widest text-gray-400 text-center">
                  ESTADO FINANCIERO
                </span>
                <span className="text-[11px] font-bold tracking-widest text-gray-400 text-center">
                  ASISTENCIA
                </span>
              </div>
              <div>
                {filteredStudents.length === 0 ? (
                  <EmptyState
                    icon="ti-search-off"
                    title="No hay resultados con esos filtros"
                  />
                ) : null}
                {paginatedStudents.map((row) => {
                  const present = studentCheckins[row.id] ?? false;
                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 gap-3 sm:gap-0 sm:grid-cols-[minmax(0,1fr)_160px_152px] items-center px-4 sm:px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors duration-100"
                    >
                      {/* Name + plan */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${row.initialsBg}`}
                        >
                          <span
                            className={`text-sm font-bold ${row.initialsText}`}
                          >
                            {row.initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {row.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {row.plan}
                          </p>
                        </div>
                      </div>

                      {/* Financial status */}
                      <div className="flex sm:justify-center">
                        <AccountStatusBadge status={row.financialStatus} />
                      </div>

                      {/* Check-in dual button */}
                      <div className="flex items-center gap-1.5 justify-center">
                        <button
                          onClick={() =>
                            setStudentCheckins((prev) => ({
                              ...prev,
                              [row.id]: false,
                            }))
                          }
                          className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                            !present
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-transparent text-gray-400 border border-zinc-800 hover:border-red-500/20 hover:text-red-400/60"
                          }`}
                        >
                          <i className="ti ti-x text-[11px] shrink-0" />
                          Ausente
                        </button>
                        <button
                          onClick={() =>
                            setStudentCheckins((prev) => ({
                              ...prev,
                              [row.id]: true,
                            }))
                          }
                          className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                            present
                              ? "bg-lime-400 text-black shadow-btn-lime"
                              : "bg-transparent text-gray-400 border border-zinc-800 hover:border-lime-400/30 hover:text-lime-400/60"
                          }`}
                        >
                          <i className="ti ti-check text-[11px] shrink-0" />
                          Presente
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_120px_152px] px-6 py-3 border-b border-white/[0.05]">
                <span className="text-[11px] font-bold tracking-widest text-gray-400">
                  EMPLEADO
                </span>
                <span className="text-[11px] font-bold tracking-widest text-gray-400 text-center">
                  SUCURSAL
                </span>
                <span className="text-[11px] font-bold tracking-widest text-gray-400 text-center">
                  ASISTENCIA
                </span>
              </div>
              <div>
                {filteredTeachers.length === 0 ? (
                  <EmptyState
                    icon="ti-search-off"
                    title="No hay resultados con esos filtros"
                  />
                ) : null}
                {paginatedTeachers.map((row) => {
                  const present = teacherCheckins[row.id] ?? false;
                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 gap-3 sm:gap-0 sm:grid-cols-[minmax(0,1fr)_120px_152px] items-center px-4 sm:px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors duration-100"
                    >
                      {/* Name + role */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${row.initialsBg}`}
                        >
                          <span
                            className={`text-sm font-bold ${row.initialsText}`}
                          >
                            {row.initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {row.name}
                          </p>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${row.roleBadge}`}
                          >
                            {row.roleLabel}
                          </span>
                        </div>
                      </div>

                      {/* Branch */}
                      <div className="flex sm:justify-center">
                        <span className="text-xs text-gray-400 font-medium">
                          {row.branch}
                        </span>
                      </div>

                      {/* Ausente / Presente dual button */}
                      <div className="flex items-center gap-1.5 justify-center">
                        <button
                          onClick={() =>
                            setTeacherCheckins((prev) => ({
                              ...prev,
                              [row.id]: false,
                            }))
                          }
                          className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                            !present
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-transparent text-gray-400 border border-zinc-800 hover:border-red-500/20 hover:text-red-400/60"
                          }`}
                        >
                          <i className="ti ti-x text-[11px] shrink-0" />
                          Ausente
                        </button>
                        <button
                          onClick={() =>
                            setTeacherCheckins((prev) => ({
                              ...prev,
                              [row.id]: true,
                            }))
                          }
                          className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                            present
                              ? "bg-lime-400 text-black shadow-btn-lime"
                              : "bg-transparent text-gray-400 border border-zinc-800 hover:border-lime-400/30 hover:text-lime-400/60"
                          }`}
                        >
                          <i className="ti ti-check text-[11px] shrink-0" />
                          Presente
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {activeTab === "students" ? (
          <Pagination
            currentPage={studentPage}
            totalPages={studentTotalPages}
            onPageChange={setStudentPage}
          />
        ) : (
          <Pagination
            currentPage={teacherPage}
            totalPages={teacherTotalPages}
            onPageChange={setTeacherPage}
          />
        )}
      </div>
    </section>
  );
}
