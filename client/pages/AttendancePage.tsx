import * as React from "react";
import { Pagination } from "@/components/common/Pagination";
import { clientsMock } from "@/data/clients";
import { plansMock } from "@/data/plans";
import { employeesMock } from "@/data/employees";
import { branchesMock } from "@/data/branches";

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

const studentsData = clientsMock.map((c, i) => {
  const planName =
    plansMock.find((p) => p.id === c.membership?.planId)?.name ?? "Sin plan";
  const style = avatarStyles[i % avatarStyles.length];
  return {
    id: c.id,
    name: c.fullName,
    plan: planName,
    financialStatus: c.status,
    initials: getInitials(c.fullName),
    initialsBg: style.bg,
    initialsText: style.text,
  };
});

const employeesData = employeesMock.map((e, i) => {
  const style = avatarStyles[i % avatarStyles.length];
  const branch = branchesMock.find((b) => b.id === e.branchId);
  return {
    id: e.id,
    name: e.fullName,
    role: e.role,
    roleLabel: roleLabels[e.role] ?? e.role,
    roleBadge: roleBadgeStyles[e.role] ?? "bg-zinc-800 text-gray-400 border border-zinc-700/40",
    branch: branch?.code ?? "Sin sede",
    status: e.status,
    initials: getInitials(e.fullName),
    initialsBg: style.bg,
    initialsText: style.text,
  };
});

function getFinancialStyle(status: string) {
  if (status === "enabled")
    return {
      container: "bg-green-500/10 border border-green-500/20",
      dot: "bg-green-500",
      text: "text-green-400",
      label: "Habilitado",
    };
  if (status === "debtor")
    return {
      container: "bg-red-500/10 border border-red-500/20",
      dot: "bg-red-500",
      text: "text-red-400",
      label: "Deudor",
    };
  return {
    container: "bg-zinc-800/60 border border-zinc-700/40",
    dot: "bg-gray-500",
    text: "text-gray-400",
    label: "Inactivo",
  };
}

const todayRaw = new Date().toLocaleDateString("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const todayLabel = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({ icon, label, value, iconBg, iconColor, valueColor }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-neutral-900 px-5 py-4 shadow-card glass-border">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <i className={`ti ${icon} text-base ${iconColor}`} />
      </div>
      <div>
        <p className={`text-2xl font-extrabold leading-tight ${valueColor ?? "text-white"}`}>
          {value}
        </p>
        <p className="text-[11px] text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

type PresenceFilter = "all" | "present" | "absent";

export default function AttendancePage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("students");
  const [studentPage, setStudentPage] = React.useState(1);
  const [teacherPage, setTeacherPage] = React.useState(1);

  const [search, setSearch] = React.useState("");
  const [presenceFilter, setPresenceFilter] = React.useState<PresenceFilter>("all");
  const [filterFinancial, setFilterFinancial] = React.useState("");
  const [filterPlan, setFilterPlan] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterBranch, setFilterBranch] = React.useState("");

  const uniqueBranches = [...new Set(employeesData.map((e) => e.branch).filter(Boolean))];
  const uniquePlans = [...new Set(studentsData.map((s) => s.plan).filter((p) => p !== "Sin plan"))];

  const [studentCheckins, setStudentCheckins] = React.useState<Record<string, boolean>>({
    cl_001: true,
    cl_002: false,
    cl_003: true,
    cl_004: false,
  });

  const [teacherCheckins, setTeacherCheckins] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    employeesMock.forEach((e) => {
      initial[e.id] = Math.random() > 0.5;
    });
    setTeacherCheckins(initial);
  }, []);

  const clearFilters = () => {
    setSearch("");
    setPresenceFilter("all");
    setFilterFinancial("");
    setFilterPlan("");
    setFilterRole("");
    setFilterBranch("");
  };

  React.useEffect(() => { setStudentPage(1); }, [search, presenceFilter, filterFinancial, filterPlan]);
  React.useEffect(() => { setTeacherPage(1); }, [search, presenceFilter, filterRole, filterBranch]);

  // Stats
  const studentPresent = studentsData.filter((s) => studentCheckins[s.id]).length;
  const studentAbsent = studentsData.length - studentPresent;
  const studentRate = studentsData.length
    ? Math.round((studentPresent / studentsData.length) * 100)
    : 0;

  const teacherPresent = employeesData.filter((e) => teacherCheckins[e.id]).length;
  const teacherAbsent = employeesData.length - teacherPresent;
  const teacherRate = employeesData.length
    ? Math.round((teacherPresent / employeesData.length) * 100)
    : 0;

  const present = activeTab === "students" ? studentPresent : teacherPresent;
  const absent = activeTab === "students" ? studentAbsent : teacherAbsent;
  const total = activeTab === "students" ? studentsData.length : employeesData.length;
  const rate = activeTab === "students" ? studentRate : teacherRate;

  // Filtered lists
  const filteredStudents = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return studentsData.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (presenceFilter === "present" && !studentCheckins[s.id]) return false;
      if (presenceFilter === "absent" && studentCheckins[s.id]) return false;
      if (filterFinancial && s.financialStatus !== filterFinancial) return false;
      if (filterPlan && s.plan !== filterPlan) return false;
      return true;
    });
  }, [search, presenceFilter, filterFinancial, filterPlan, studentCheckins]);

  const filteredTeachers = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return employeesData.filter((e) => {
      if (q && !e.name.toLowerCase().includes(q)) return false;
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
  const paginatedStudents = filteredStudents.slice(studentStart, studentStart + ITEMS_PER_PAGE);
  const paginatedTeachers = filteredTeachers.slice(teacherStart, teacherStart + ITEMS_PER_PAGE);

  return (
    <section className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3 pt-1">
          <div>
            <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              CONTROL DE ASISTENCIA
            </h1>
            <p className="text-gray-500 text-sm mt-1">Registro de presencia diario del gimnasio.</p>
            <div className="h-px bg-white/[0.06] mt-4" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 glass-border">
            <i className="ti ti-calendar text-lime-400 text-sm" />
            <span className="text-xs font-semibold text-gray-300">{todayLabel}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon="ti-users"
            label="Total registros"
            value={total}
            iconBg="bg-zinc-800"
            iconColor="text-gray-400"
          />
          <StatCard
            icon="ti-circle-check"
            label="Presentes hoy"
            value={present}
            iconBg="bg-lime-400/10"
            iconColor="text-lime-400"
            valueColor="text-lime-400"
          />
          <StatCard
            icon="ti-circle-x"
            label="Ausentes hoy"
            value={absent}
            iconBg="bg-red-500/10"
            iconColor="text-red-400"
            valueColor="text-red-400"
          />
          <div className="flex items-center gap-4 rounded-2xl bg-neutral-900 px-5 py-4 shadow-card glass-border">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-lime-400/10">
              <i className="ti ti-chart-bar text-base text-lime-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-extrabold leading-tight text-white">{rate}%</p>
              <p className="text-[11px] text-gray-500 font-medium">Tasa de asistencia</p>
              <div className="mt-1.5 h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-lime-400 transition-all duration-500"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Table */}
        <div className="flex flex-col gap-4">
          {/* Tab bar */}
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("students"); setStudentPage(1); clearFilters(); }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-150 ${
                activeTab === "students"
                  ? "text-lime-400 border border-lime-400/60 bg-lime-400/10 shadow-[0_0_10px_rgba(149,253,0,0.08)]"
                  : "text-stone-500 hover:text-stone-300 hover:bg-white/[0.03]"
              }`}
            >
              <i className="ti ti-users text-base" />
              Alumnos
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === "students" ? "bg-lime-400/20 text-lime-400" : "bg-zinc-800 text-gray-500"}`}>
                {studentsData.length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab("teachers"); setTeacherPage(1); clearFilters(); }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-150 ${
                activeTab === "teachers"
                  ? "text-lime-400 border border-lime-400/60 bg-lime-400/10 shadow-[0_0_10px_rgba(149,253,0,0.08)]"
                  : "text-stone-500 hover:text-stone-300 hover:bg-white/[0.03]"
              }`}
            >
              <i className="ti ti-user-star text-base" />
              Profesores / Staff
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === "teachers" ? "bg-lime-400/20 text-lime-400" : "bg-zinc-800 text-gray-500"}`}>
                {employeesData.length}
              </span>
            </button>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-[280px]">
              <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-900 glass-border text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-lime-400/30 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer">
                  <i className="ti ti-x text-xs" />
                </button>
              )}
            </div>

            {/* Presence filter */}
            {(["all", "present", "absent"] as PresenceFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setPresenceFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                  presenceFilter === f
                    ? "bg-lime-400/10 border-lime-400/40 text-lime-400"
                    : "bg-neutral-900 border-white/[0.06] text-gray-500 hover:border-white/[0.12] hover:text-gray-300"
                }`}
              >
                {f === "all" ? "Todos" : f === "present" ? "Presentes" : "Ausentes"}
              </button>
            ))}

            {/* Student: financial status + plan dropdowns */}
            {activeTab === "students" && (
              <>
                <select
                  value={filterFinancial}
                  onChange={(e) => setFilterFinancial(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 glass-border text-xs font-semibold text-gray-400 outline-none cursor-pointer transition-all appearance-none pr-7"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                >
                  <option value="">Todos los estados</option>
                  <option value="enabled">Habilitado</option>
                  <option value="debtor">Deudor</option>
                  <option value="inactive">Inactivo</option>
                </select>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 glass-border text-xs font-semibold text-gray-400 outline-none cursor-pointer transition-all appearance-none pr-7"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                >
                  <option value="">Todos los planes</option>
                  {uniquePlans.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </>
            )}

            {/* Teacher: role + branch dropdowns */}
            {activeTab === "teachers" && (
              <>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 glass-border text-xs font-semibold text-gray-400 outline-none cursor-pointer hover:border-white/[0.12] transition-all appearance-none pr-7 relative"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                >
                  <option value="">Todos los roles</option>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 glass-border text-xs font-semibold text-gray-400 outline-none cursor-pointer hover:border-white/[0.12] transition-all appearance-none pr-7"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                >
                  <option value="">Todas las sedes</option>
                  {uniqueBranches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </>
            )}

            {(search || presenceFilter !== "all" || filterFinancial || filterPlan || filterRole || filterBranch) && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer ml-1"
              >
                Limpiar
              </button>
            )}

            <span className="text-xs text-gray-600 ml-auto">
              {activeTab === "students" ? filteredStudents.length : filteredTeachers.length} registros
            </span>
          </div>

          {/* Table card */}
          <div className="rounded-2xl bg-neutral-900 shadow-card glass-border overflow-hidden">
            {/* Column headers */}
            {activeTab === "students" ? (
              <>
                <div className="grid grid-cols-[minmax(0,1fr)_160px_152px] px-6 py-3 border-b border-white/[0.05]">
                  <span className="text-[10px] font-bold tracking-widest text-gray-600">ALUMNO</span>
                  <span className="text-[10px] font-bold tracking-widest text-gray-600 text-center">ESTADO FINANCIERO</span>
                  <span className="text-[10px] font-bold tracking-widest text-gray-600 text-center">CHECK-IN</span>
                </div>
                <div>
                  {filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-2">
                      <i className="ti ti-search-off text-3xl text-gray-700" />
                      <p className="text-sm text-gray-600 font-medium">Sin resultados</p>
                    </div>
                  ) : null}
                  {paginatedStudents.map((row) => {
                    const present = studentCheckins[row.id] ?? false;
                    const fin = getFinancialStyle(row.financialStatus);
                    return (
                      <div
                        key={row.id}
                        className="grid grid-cols-[minmax(0,1fr)_160px_152px] items-center px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors duration-100"
                      >
                        {/* Name + plan */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${row.initialsBg}`}>
                            <span className={`text-sm font-bold ${row.initialsText}`}>{row.initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{row.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{row.plan}</p>
                          </div>
                        </div>

                        {/* Financial status */}
                        <div className="flex justify-center">
                          <div className={`inline-flex gap-1.5 items-center px-3 py-1 rounded-full ${fin.container}`}>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${fin.dot}`} />
                            <span className={`text-[10px] font-semibold ${fin.text}`}>{fin.label}</span>
                          </div>
                        </div>

                        {/* Check-in dual button */}
                        <div className="flex items-center gap-1.5 justify-center">
                          <button
                            onClick={() => setStudentCheckins((prev) => ({ ...prev, [row.id]: false }))}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                              !present
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-transparent text-gray-600 border border-zinc-800 hover:border-red-500/20 hover:text-red-400/60"
                            }`}
                          >
                            <i className="ti ti-x text-[10px] shrink-0" />
                            Ausente
                          </button>
                          <button
                            onClick={() => setStudentCheckins((prev) => ({ ...prev, [row.id]: true }))}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                              present
                                ? "bg-lime-400 text-black shadow-btn-lime"
                                : "bg-transparent text-gray-600 border border-zinc-800 hover:border-lime-400/30 hover:text-lime-400/60"
                            }`}
                          >
                            <i className="ti ti-check text-[10px] shrink-0" />
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
                <div className="grid grid-cols-[minmax(0,1fr)_120px_152px] px-6 py-3 border-b border-white/[0.05]">
                  <span className="text-[10px] font-bold tracking-widest text-gray-600">EMPLEADO</span>
                  <span className="text-[10px] font-bold tracking-widest text-gray-600 text-center">SUCURSAL</span>
                  <span className="text-[10px] font-bold tracking-widest text-gray-600 text-center">CHECK-IN</span>
                </div>
                <div>
                  {filteredTeachers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-2">
                      <i className="ti ti-search-off text-3xl text-gray-700" />
                      <p className="text-sm text-gray-600 font-medium">Sin resultados</p>
                    </div>
                  ) : null}
                  {paginatedTeachers.map((row) => {
                    const present = teacherCheckins[row.id] ?? false;
                    return (
                      <div
                        key={row.id}
                        className="grid grid-cols-[minmax(0,1fr)_120px_152px] items-center px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors duration-100"
                      >
                        {/* Name + role */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${row.initialsBg}`}>
                            <span className={`text-sm font-bold ${row.initialsText}`}>{row.initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{row.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.roleBadge}`}>
                              {row.roleLabel}
                            </span>
                          </div>
                        </div>

                        {/* Branch */}
                        <div className="flex justify-center">
                          <span className="text-xs text-gray-400 font-medium">{row.branch}</span>
                        </div>

                        {/* Ausente / Presente dual button */}
                        <div className="flex items-center gap-1.5 justify-center">
                          <button
                            onClick={() =>
                              setTeacherCheckins((prev) => ({ ...prev, [row.id]: false }))
                            }
                            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                              !present
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-transparent text-gray-600 border border-zinc-800 hover:border-red-500/20 hover:text-red-400/60"
                            }`}
                          >
                            <i className="ti ti-x text-[10px] shrink-0" />
                            Ausente
                          </button>
                          <button
                            onClick={() =>
                              setTeacherCheckins((prev) => ({ ...prev, [row.id]: true }))
                            }
                            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                              present
                                ? "bg-lime-400 text-black shadow-btn-lime"
                                : "bg-transparent text-gray-600 border border-zinc-800 hover:border-lime-400/30 hover:text-lime-400/60"
                            }`}
                          >
                            <i className="ti ti-check text-[10px] shrink-0" />
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
