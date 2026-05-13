import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { DataTable } from "@/components/common/DataTable";
import HeaderPage from "@/components/common/HeaderPage";
import { clientsMock } from "@/data/clients";
import { plansMock } from "@/data/plans";
import { teachersMock } from "@/data/teachers";

type TabId = "students" | "teachers";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
}

const avatarStyles = [
  { bg: "bg-zinc-800", text: "text-lime-400" },
  { bg: "bg-gray-800", text: "text-violet-400" },
  { bg: "bg-slate-800", text: "text-blue-400" },
  { bg: "bg-zinc-800", text: "text-gray-400" },
];

const students = clientsMock.map((c, i) => {
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

const teachers = teachersMock.map((t, i) => {
  const style = avatarStyles[i % avatarStyles.length];
  return {
    id: t.id,
    name: t.fullName,
    specialty: t.specialties[0] ?? "Sin especialidad",
    shift: ["Mañana", "Tarde", "Noche"][Math.floor(Math.random() * 3)],
    initials: getInitials(t.fullName),
    initialsBg: style.bg,
    initialsText: style.text,
  };
});

export default function AttendancePage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("students");

  const studentCheckins: Record<string, boolean> = {
    cl_001: true,
    cl_002: false,
    cl_003: true,
    cl_004: false,
  };

  const teacherCheckins: Record<string, boolean> = {
    tc_001: true,
    tc_002: false,
    tc_003: true,
    tc_004: false,
    tc_005: false,
  };

  const studentColumns = [
    {
      key: "name",
      header: "NOMBRE",
      render: (row: (typeof students)[number]) => (
        <div className="flex gap-3 items-center min-w-0">
          <div
            className={`flex justify-center items-center w-9 h-9 rounded-lg shrink-0 ${row.initialsBg}`}
          >
            <span className={`text-xs font-bold ${row.initialsText}`}>
              {row.initials}
            </span>
          </div>
          <span className="text-sm font-semibold text-white truncate">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "CLASE",
    },
    {
      key: "financialStatus",
      header: "ESTADO FINANCIERO",
      render: (row: (typeof students)[number]) => {
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
            className={`inline-flex gap-1.5 items-center px-2.5 py-1 rounded-3xl ${styles.container}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            <span className={`text-xs font-semibold ${styles.text}`}>
              {styles.label}
            </span>
          </div>
        );
      },
    },
    {
      key: "checkin",
      header: "CHECK-IN",
      render: (row: (typeof students)[number]) => {
        const present = studentCheckins[row.id] ?? false;
        return (
          <div
            className={`inline-flex gap-1.5 items-center px-2.5 py-1 rounded-3xl ${present ? "bg-green-900" : "bg-red-900"}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${present ? "bg-green-500" : "bg-red-500"}`}
            />
            <span
              className={`text-xs font-semibold ${present ? "text-green-500" : "text-red-500"}`}
            >
              {present ? "Presente" : "Ausente"}
            </span>
          </div>
        );
      },
    },
  ];

  const teacherColumns = [
    {
      key: "name",
      header: "NOMBRE",
      render: (row: (typeof teachers)[number]) => (
        <div className="flex gap-3 items-center min-w-0">
          <div
            className={`flex justify-center items-center w-9 h-9 rounded-lg shrink-0 ${row.initialsBg}`}
          >
            <span className={`text-xs font-bold ${row.initialsText}`}>
              {row.initials}
            </span>
          </div>
          <span className="text-sm font-semibold text-white truncate">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "specialty",
      header: "ESPECIALIDAD",
    },
    {
      key: "shift",
      header: "TURNO",
    },
    {
      key: "checkin",
      header: "CHECK-IN",
      render: (row: (typeof teachers)[number]) => {
        const present = teacherCheckins[row.id] ?? false;
        return (
          <div
            className={`inline-flex gap-1.5 items-center px-2.5 py-1 rounded-3xl ${present ? "bg-green-900" : "bg-red-900"}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${present ? "bg-green-500" : "bg-red-500"}`}
            />
            <span
              className={`text-xs font-semibold ${present ? "text-green-500" : "text-red-500"}`}
            >
              {present ? "Presente" : "Ausente"}
            </span>
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
              data={students}
              getRowKey={(row) => row.id}
              minWidthClass="min-w-[700px] lg:min-w-0"
              gridTemplateClass="grid-cols-[minmax(220px,_1fr)_1fr_1.2fr_1fr] lg:grid-cols-[2fr_1fr_1.2fr_1fr]"
            />
          ) : (
            <DataTable
              columns={teacherColumns}
              data={teachers}
              getRowKey={(row) => row.id}
              minWidthClass="min-w-[700px] lg:min-w-0"
              gridTemplateClass="grid-cols-[minmax(220px,_1fr)_1fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]"
            />
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
