import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import HeaderPage from "@/components/common/HeaderPage";
import { clientsMock } from "@/data/clients";
import { plansMock } from "@/data/plans";
import { employeesMock } from "@/data/employees";
import { branchesMock } from "@/data/branches";

type TabId = "students" | "teachers";

const ITEMS_PER_PAGE = 4;

const roleLabels: Record<string, string> = {
  reception: "Recepcionista",
  manager: "Gerente",
  trainer: "Entrenador",
  accounting: "Contabilidad",
  admin: "Administrativo",
};

const roleBadgeStyles: Record<string, string> = {
  reception: "bg-blue-950/60 text-blue-400",
  manager: "bg-violet-950/60 text-violet-400",
  trainer: "bg-lime-950/60 text-lime-400",
  accounting: "bg-amber-950/60 text-amber-400",
  admin: "bg-zinc-800 text-gray-300",
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
    roleBadge: roleBadgeStyles[e.role] ?? "bg-zinc-800 text-gray-400",
    branch: branch?.code ?? "Sin sede",
    status: e.status,
    initials: getInitials(e.fullName),
    initialsBg: style.bg,
    initialsText: style.text,
  };
});

export default function AttendancePage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("students");
  const [studentPage, setStudentPage] = React.useState(1);
  const [teacherPage, setTeacherPage] = React.useState(1);

  const [studentCheckins, setStudentCheckins] = React.useState<
    Record<string, boolean>
  >({
    cl_001: true,
    cl_002: false,
    cl_003: true,
    cl_004: false,
  });

  const [teacherCheckins, setTeacherCheckins] = React.useState<
    Record<string, boolean>
  >({});

  const studentTotalPages = Math.ceil(studentsData.length / ITEMS_PER_PAGE);
  const teacherTotalPages = Math.ceil(employeesData.length / ITEMS_PER_PAGE);
  const studentStart = (studentPage - 1) * ITEMS_PER_PAGE;
  const teacherStart = (teacherPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = studentsData.slice(
    studentStart,
    studentStart + ITEMS_PER_PAGE,
  );
  const paginatedTeachers = employeesData.slice(
    teacherStart,
    teacherStart + ITEMS_PER_PAGE,
  );

  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    employeesMock.forEach((e) => {
      initial[e.id] = Math.random() > 0.5;
    });
    setTeacherCheckins(initial);
  }, []);

  const studentColumns = [
    {
      key: "name",
      header: "NOMBRE",
      headerClassName: "text-[10px]",
      render: (row: (typeof studentsData)[number]) => (
        <div className="flex gap-2 items-center min-w-0">
          <div
            className={`flex justify-center items-center w-7 h-7 rounded-lg shrink-0 ${row.initialsBg}`}
          >
            <span className={`text-[10px] font-bold ${row.initialsText}`}>
              {row.initials}
            </span>
          </div>
          <span className="text-xs font-semibold text-white truncate">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "CLASE",
      headerClassName: "text-[10px]",
      render: (row: (typeof studentsData)[number]) => (
        <span className="text-xs text-gray-400">{row.plan}</span>
      ),
    },
    {
      key: "financialStatus",
      header: "ESTADO FINANCIERO",
      headerClassName: "text-[10px]",
      render: (row: (typeof studentsData)[number]) => {
        const styles =
          row.financialStatus === "enabled"
            ? {
                container: "bg-green-900",
                dot: "bg-green-500",
                text: "text-green-500",
                label: "Habilitado",
              }
            : row.financialStatus === "debtor"
              ? {
                  container: "bg-orange-950",
                  dot: "bg-red-500",
                  text: "text-red-500",
                  label: "Deudor",
                }
              : {
                  container: "bg-stone-900 border border-gray-700",
                  dot: "bg-gray-500",
                  text: "text-gray-400",
                  label: "Inactivo",
                };
        return (
          <div
            className={`inline-flex gap-1 items-center px-2 py-0.5 rounded-3xl ${styles.container}`}
          >
            <div className={`w-1 h-1 rounded-full ${styles.dot}`} />
            <span className={`text-[10px] font-semibold ${styles.text}`}>
              {styles.label}
            </span>
          </div>
        );
      },
    },
    {
      key: "checkin",
      header: "CHECK-IN",
      headerClassName: "text-[10px]",
      render: (row: (typeof studentsData)[number]) => {
        const present = studentCheckins[row.id] ?? false;
        return (
          <button
            onClick={() =>
              setStudentCheckins((prev) => ({
                ...prev,
                [row.id]: !prev[row.id],
              }))
            }
            className={`inline-flex gap-1.5 items-center px-2.5 py-1 rounded-3xl cursor-pointer transition-opacity hover:opacity-80 ${present ? "bg-green-900" : "bg-red-900"}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${present ? "bg-green-500" : "bg-red-500"}`}
            />
            <span
              className={`text-[10px] font-semibold ${present ? "text-green-500" : "text-red-500"}`}
            >
              {present ? "Presente" : "Ausente"}
            </span>
          </button>
        );
      },
    },
  ];

  const teacherColumns = [
    {
      key: "name",
      header: "NOMBRE",
      headerClassName: "text-[10px]",
      render: (row: (typeof employeesData)[number]) => (
        <div className="flex gap-2 items-center min-w-0">
          <div
            className={`flex justify-center items-center w-7 h-7 rounded-lg shrink-0 ${row.initialsBg}`}
          >
            <span className={`text-[10px] font-bold ${row.initialsText}`}>
              {row.initials}
            </span>
          </div>
          <span className="text-xs font-semibold text-white truncate">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "ROL",
      headerClassName: "text-[10px]",
      render: (row: (typeof employeesData)[number]) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${row.roleBadge}`}
        >
          {row.roleLabel}
        </span>
      ),
    },
    {
      key: "branch",
      header: "SUCURSAL",
      headerClassName: "text-[10px]",
      render: (row: (typeof employeesData)[number]) => (
        <span className="text-xs text-gray-400">{row.branch}</span>
      ),
    },
    {
      key: "checkin",
      header: "CHECK-IN",
      headerClassName: "text-[10px]",
      render: (row: (typeof employeesData)[number]) => {
        const present = teacherCheckins[row.id] ?? false;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setTeacherCheckins((prev) => ({ ...prev, [row.id]: false }))
              }
              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider transition-all cursor-pointer ${
                !present
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-black text-gray-400 border border-zinc-800 hover:border-red-500/30 hover:text-red-400"
              }`}
            >
              <i className="ti ti-x text-[9px] mr-0.5" />
              Ausente
            </button>
            <button
              onClick={() =>
                setTeacherCheckins((prev) => ({ ...prev, [row.id]: true }))
              }
              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider transition-all cursor-pointer ${
                present
                  ? "bg-lime-400 text-black shadow-[0_0_12px_rgba(163,230,53,0.25)]"
                  : "bg-black text-gray-400 border border-zinc-800 hover:border-lime-400/30 hover:text-lime-400"
              }`}
            >
              <i className="ti ti-check text-[9px] mr-0.5" />
              Presente
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout headerNav="Control de Asistencia">
      <HeaderPage
        title="CONTROL DE ASISTENCIA"
        subtitle="Registro de ingresos y egresos."
      />

      <section className="px-7 pb-7 max-sm:px-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
              activeTab === "students"
                ? "text-lime-400 border-2 border-lime-400 bg-zinc-800 font-semibold"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            <i className="ti ti-users text-base mr-2" />
            Asistencia Alumnos
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
              activeTab === "teachers"
                ? "text-lime-400 border-2 border-lime-400 bg-zinc-800 font-semibold"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            <i className="ti ti-user-star text-base mr-2" />
            Asistencia Profesores
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900">
          {activeTab === "students" ? (
            <DataTable
              columns={studentColumns}
              data={paginatedStudents}
              getRowKey={(row) => row.id}
              minWidthClass="min-w-[700px] lg:min-w-0"
              gridTemplateClass="grid-cols-[minmax(220px,_1fr)_1fr_1.2fr_1fr] lg:grid-cols-[2fr_1fr_1.2fr_1fr]"
            />
          ) : (
            <DataTable
              columns={teacherColumns}
              data={paginatedTeachers}
              getRowKey={(row) => row.id}
              minWidthClass="min-w-[700px] lg:min-w-0"
              gridTemplateClass="grid-cols-[minmax(220px,_1fr)_1fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]"
            />
          )}
        </div>

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
      </section>
    </DashboardLayout>
  );
}
