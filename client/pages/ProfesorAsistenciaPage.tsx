import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { classStudentsMock, type ClassStudent } from "@/data/classStudents";

type AttendanceStatus = "present" | "absent" | null;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export default function ProfesorAsistenciaPage() {
  const [attendance, setAttendance] = React.useState<
    Record<string, AttendanceStatus>
  >({});
  const [logText, setLogText] = React.useState("");
  const [selectedStudent, setSelectedStudent] = React.useState("");
  const [observations, setObservations] = React.useState("");

  const setStatus = (id: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const all: Record<string, AttendanceStatus> = {};
    classStudentsMock.forEach((s) => (all[s.id] = status));
    setAttendance(all);
  };

  const allMarked = classStudentsMock.every((s) => attendance[s.id] != null);

  return (
    <DashboardLayout headerNav="Asistencia y alumnos">
      <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs">
          <i className="ti ti-arrow-left text-gray-500 text-base" />
          <span className="text-gray-500">Home</span>
          <span className="text-gray-600">/</span>
          <span className="text-lime-400 font-bold tracking-wider">
            Asistencia de Alumnos
          </span>
        </div>

        {/* Class Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl md:text-4xl font-extrabold">
              CrossFit WOD
            </h1>
            <i className="ti ti-circle-check text-lime-400 text-2xl" />
          </div>
          <div className="flex items-center gap-5 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <i className="ti ti-clock text-lime-400 text-sm" />
              18:00 - 19:00
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ti ti-map-pin text-lime-400 text-sm" />
              CABA Centro
            </span>
          </div>
        </div>

        <div className="h-px bg-zinc-800/60" />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 items-start">
          {/* ── LEFT: Student List ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-sm font-extrabold tracking-wider">
                LISTA DE ALUMNOS
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => markAll("present")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-lime-400 text-[10px] font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Marcar Todos
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {classStudentsMock.map((student) => {
                const status = attendance[student.id] ?? null;
                return (
                  <StudentCard
                    key={student.id}
                    student={student}
                    status={status}
                    onSetStatus={(s) => setStatus(student.id, s)}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <button className="text-gray-500 text-xs font-semibold hover:text-gray-300 transition-colors cursor-pointer">
                ← Anterior
              </button>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-lime-400/10 text-lime-400 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="w-7 h-7 rounded-lg text-gray-600 text-xs font-medium flex items-center justify-center hover:text-gray-400 transition-colors cursor-pointer">
                  2
                </span>
                <span className="w-7 h-7 rounded-lg text-gray-600 text-xs font-medium flex items-center justify-center hover:text-gray-400 transition-colors cursor-pointer">
                  3
                </span>
              </div>
              <button className="text-gray-500 text-xs font-semibold hover:text-gray-300 transition-colors cursor-pointer">
                Siguiente →
              </button>
            </div>
          </div>

          {/* ── RIGHT: Bitácora ── */}
          <div className="bg-black/60 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <i className="ti ti-notes text-lg text-lime-400" />
              <div>
                <h2 className="text-white text-sm font-extrabold">Bitácora</h2>
                <p className="text-gray-600 text-[10px]">Notas de la Clase</p>
              </div>
            </div>

            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Ej: WOD enfocado en movilidad de hombros..."
              rows={5}
              className="w-full bg-neutral-900 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none resize-none focus:ring-1 focus:ring-lime-400/20 transition-all"
            />

            <div className="flex flex-col gap-2">
              <label className="text-gray-500 text-[10px] font-semibold tracking-widest">
                SELECCIONAR ALUMNO
              </label>
              <div className="relative">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer"
                >
                  <option value="">Seleccionar alumno...</option>
                  {classStudentsMock.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <i className="ti ti-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-500 text-[10px] font-semibold tracking-widest">
                OBSERVACIONES DE ALUMNO
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Anotaciones individuales..."
                rows={3}
                className="w-full bg-neutral-900 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none resize-none focus:ring-1 focus:ring-lime-400/20 transition-all"
              />
            </div>

            <button className="w-full py-3 rounded-xl border border-lime-400/30 text-lime-400 text-xs font-bold hover:bg-lime-400/5 hover:shadow-[0_0_16px_rgba(163,230,53,0.1)] transition-all cursor-pointer">
              Guardar Notas
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ── Student Card Component ── */

interface StudentCardProps {
  student: ClassStudent;
  status: AttendanceStatus;
  onSetStatus: (status: AttendanceStatus) => void;
}

const avatarColors = [
  "from-blue-800 to-blue-950",
  "from-violet-800 to-violet-950",
  "from-cyan-800 to-cyan-950",
  "from-indigo-800 to-indigo-950",
  "from-sky-800 to-sky-950",
  "from-purple-800 to-purple-950",
  "from-teal-800 to-teal-950",
  "from-blue-900 to-slate-950",
];

function StudentCard({ student, status, onSetStatus }: StudentCardProps) {
  const colorIdx = student.name.charCodeAt(0) % avatarColors.length;
  const gradient = avatarColors[colorIdx];

  return (
    <div className="bg-black/60 rounded-2xl p-4 flex items-center justify-between gap-4 hover:bg-black/70 transition-colors group border border-transparent hover:border-zinc-800/30">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
        >
          <span className="text-white text-xs font-bold">
            {getInitials(student.name)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-bold truncate">
            {student.name}
          </p>
          <p className="text-gray-500 text-[10px] truncate">
            {student.plan} • {student.weekSession}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onSetStatus("absent")}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            status === "absent"
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-black text-gray-400 border border-zinc-800 hover:border-red-500/30 hover:text-red-400"
          }`}
        >
          <i className="ti ti-x text-xs mr-1" />
          Ausente
        </button>
        <button
          onClick={() => onSetStatus("present")}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            status === "present"
              ? "bg-lime-400 text-black shadow-[0_0_12px_rgba(163,230,53,0.25)]"
              : "bg-black text-gray-400 border border-zinc-800 hover:border-lime-400/30 hover:text-lime-400"
          }`}
        >
          <i className="ti ti-check text-xs mr-1" />
          Presente
        </button>
      </div>
    </div>
  );
}
