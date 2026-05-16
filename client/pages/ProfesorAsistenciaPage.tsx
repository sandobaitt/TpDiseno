import * as React from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { Pagination } from "@/components/common/Pagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { classStudentsMock, type ClassStudent } from "@/data/classStudents";
import { bitacorasMock, type Bitacora } from "@/data/bitacoras";

type AttendanceStatus = "present" | "absent" | null;

const ITEMS_PER_PAGE = 6;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export default function ProfesorAsistenciaPage() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [attendance, setAttendance] = React.useState<
    Record<string, AttendanceStatus>
  >({});
  const [bitacoras, setBitacoras] = React.useState<Bitacora[]>(bitacorasMock);
  const [selectedBitacora, setSelectedBitacora] =
    React.useState<Bitacora | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [formTitle, setFormTitle] = React.useState("");
  const [formContent, setFormContent] = React.useState("");
  const [formStudent, setFormStudent] = React.useState("");

  const totalPages = Math.ceil(classStudentsMock.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = classStudentsMock.slice(
    start,
    start + ITEMS_PER_PAGE,
  );

  const setStatus = (id: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const all: Record<string, AttendanceStatus> = {};
    classStudentsMock.forEach((s) => (all[s.id] = status));
    setAttendance(all);
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    const newBitacora: Bitacora = {
      id: `bit_${Date.now()}`,
      title: formTitle.trim(),
      content: formContent.trim(),
      studentName: formStudent || undefined,
      createdAt: new Date().toISOString(),
    };
    setBitacoras((prev) => [newBitacora, ...prev]);
    setShowForm(false);
    setFormTitle("");
    setFormContent("");
    setFormStudent("");
    toast.success("Bitácora agregada");
  };

  function formatDate(iso: string) {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("es-AR", { day: "numeric", month: "short" }) +
      `, ${d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
    );
  }

  return (
    <DashboardLayout headerNav=" ">
      <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 items-start">
          {/* ── LEFT: Student List ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-sm font-extrabold tracking-wider">
                LISTA DE ALUMNOS
              </h2>
              <button
                onClick={() => markAll("present")}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 text-lime-400 text-[10px] font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Marcar Todos
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {paginatedStudents.map((student) => {
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* ── RIGHT: Bitácora List ── */}
          <div className="bg-black/60 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ti ti-notes text-lg text-lime-400" />
                <div>
                  <h2 className="text-white text-sm font-extrabold">
                    Bitácora
                  </h2>
                  <p className="text-gray-600 text-[10px]">Notas de la Clase</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-7 h-7 rounded-lg bg-lime-400/10 flex items-center justify-center hover:bg-lime-400/20 transition-colors cursor-pointer"
              >
                <i className="ti ti-plus text-sm text-lime-400" />
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
              {bitacoras.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBitacora(b)}
                  className="w-full text-left bg-neutral-900/50 rounded-xl p-3 flex flex-col gap-1 hover:bg-neutral-900 transition-colors cursor-pointer group border border-transparent hover:border-zinc-800/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-white text-xs font-bold leading-tight line-clamp-1">
                      {b.title}
                    </span>
                    <i className="ti ti-chevron-right text-gray-600 text-[10px] shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-2">
                    {b.content}
                  </p>
                  <span className="text-gray-600 text-[9px]">
                    {formatDate(b.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog: View Bitácora */}
      <Dialog
        open={!!selectedBitacora}
        onOpenChange={(o) => !o && setSelectedBitacora(null)}
      >
        <DialogContent className="max-w-lg bg-stone-950 border-zinc-800 text-white">
          {selectedBitacora && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
                  <i className="ti ti-notes text-lg text-lime-400" />
                </div>
                <div>
                  <h2 className="text-white text-base font-extrabold">
                    {selectedBitacora.title}
                  </h2>
                  <p className="text-gray-600 text-[10px]">
                    {formatDate(selectedBitacora.createdAt)}
                  </p>
                </div>
              </div>
              {selectedBitacora.studentName && (
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <i className="ti ti-user-circle text-sm" />
                  {selectedBitacora.studentName}
                </div>
              )}
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedBitacora.content}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: New Bitácora */}
      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-lg bg-stone-950 border-zinc-800 text-white">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <i className="ti ti-notes text-lg text-lime-400" />
              <h2 className="text-white text-sm font-extrabold">
                Nueva Bitácora
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-500 text-[10px] font-semibold tracking-widest">
                TÍTULO
              </label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Título de la bitácora..."
                className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-lime-400/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-500 text-[10px] font-semibold tracking-widest">
                ALUMNO (OPCIONAL)
              </label>
              <select
                value={formStudent}
                onChange={(e) => setFormStudent(e.target.value)}
                className="w-full bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-white appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer"
              >
                <option value="">Seleccionar alumno...</option>
                {classStudentsMock.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-500 text-[10px] font-semibold tracking-widest">
                CONTENIDO
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Describí la novedad o anotación..."
                rows={5}
                className="w-full bg-neutral-900 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none resize-none focus:ring-1 focus:ring-lime-400/20 transition-all"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!formTitle.trim() || !formContent.trim()}
              className="w-full py-3 rounded-xl bg-lime-400 text-black text-xs font-extrabold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              GUARDAR BITÁCORA
            </button>
          </div>
        </DialogContent>
      </Dialog>
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
