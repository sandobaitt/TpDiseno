import * as React from "react";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { attendanceMock, type AttendanceRecord } from "@/data/attendance";

function formatDate(iso: string) {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dateStr}, ${timeStr}`;
}

const HEALTH_CONDITIONS = [
  "¿Tenés alguna lesión o cirugía reciente?",
  "¿Padecés de presión arterial alta o baja?",
  "¿Tenés antecedentes cardíacos?",
  "¿Tenés diabetes o problemas metabólicos?",
  "¿Sos asmático/a o tenés problemas respiratorios?",
  "¿Tomás medicación de forma habitual?",
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "No sé"];

const ITEMS_PER_PAGE = 4;

export default function AlumnoPanel() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(attendanceMock.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = attendanceMock.slice(start, start + ITEMS_PER_PAGE);

  // Certificado médico
  const [certUploaded, setCertUploaded] = React.useState(false);

  // DDJJ
  const [ddjjOpen, setDdjjOpen] = React.useState(false);
  const [conditions, setConditions] = React.useState<boolean[]>(Array(HEALTH_CONDITIONS.length).fill(false));
  const [bloodType, setBloodType] = React.useState("");
  const [emergency, setEmergency] = React.useState("");
  const [accepted, setAccepted] = React.useState(false);
  const [ddjjSaved, setDdjjSaved] = React.useState(false);

  function toggleCondition(i: number) {
    setConditions((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function handleDdjjSubmit() {
    if (!accepted) return;
    setDdjjSaved(true);
    setDdjjOpen(false);
    toast.success("DDJJ de Salud actualizada");
  }

  const columns = [
    {
      key: "date",
      header: "FECHA",
      render: (row: AttendanceRecord) => (
        <span className="text-app-muted text-sm">{formatDate(row.date)}</span>
      ),
    },
    {
      key: "className",
      header: "CLASE",
      render: (row: AttendanceRecord) => (
        <span className="text-app-text text-sm font-semibold">{row.className}</span>
      ),
    },
    {
      key: "trainer",
      header: "ENTRENADOR",
      render: (row: AttendanceRecord) => (
        <span className="text-app-muted text-sm">{row.trainer}</span>
      ),
    },
    {
      key: "status",
      header: "ESTADO",
      render: (row: AttendanceRecord) =>
        row.status === "present" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/15 border border-lime-400/25 text-lime-400 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            Asistió
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/12 border border-red-500/25 text-red-400 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Ausente
          </span>
        ),
    },
  ];

  return (
    <div className="px-7 pb-7 max-sm:px-4">
      <div className="flex items-center gap-2 mb-6">
        <i className="ti ti-arrow-left text-app-subtle text-lg" />
        <span className="text-lime-400 text-xs font-bold tracking-widest">
          MI PERFIL Y ASISTENCIA
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        {/* LEFT: Attendance Table */}
        <div className="bg-app-surface rounded-2xl p-6 md:p-8 flex flex-col gap-5 shadow-card glass-border">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-app-text text-lg font-extrabold">Historial de Asistencias</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-bg text-lime-400 text-xs font-bold hover:brightness-110 transition-all cursor-pointer">
                <i className="ti ti-file-text text-sm" />PDF
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-bg text-lime-400 text-xs font-bold hover:brightness-110 transition-all cursor-pointer">
                <i className="ti ti-table text-sm" />CSV
              </button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={paginatedData}
            getRowKey={(row) => row.id}
            minWidthClass="min-w-[600px]"
            gridTemplateClass="grid-cols-[1fr_1fr_1fr_1fr]"
            rowClassName="hover:bg-app-card/30 transition-colors"
          />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>

        {/* RIGHT: Cards */}
        <div className="flex flex-col gap-5">
          {/* Card 1: Certificado Médico */}
          <div className="bg-app-surface rounded-2xl p-6 flex flex-col gap-5 shadow-card glass-border">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center">
              <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center">
                <i className="ti ti-certificate text-lg text-lime-400" />
              </div>
              <h3 className="text-app-text text-sm font-extrabold">Certificado Médico</h3>
            </div>

            {certUploaded ? (
              <div className="border-2 border-lime-400/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center bg-lime-400/5">
                <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center">
                  <i className="ti ti-circle-check text-2xl text-lime-400" />
                </div>
                <div>
                  <p className="text-lime-400 text-xs font-bold">Confirmado</p>
                  <p className="text-app-faint text-[10px] mt-0.5">certificado_medico.pdf</p>
                </div>
                <button
                  onClick={() => setCertUploaded(false)}
                  className="text-[10px] text-app-faint hover:text-app-muted transition-colors cursor-pointer underline underline-offset-2"
                >
                  Reemplazar archivo
                </button>
              </div>
            ) : (
              <div
                onClick={() => setCertUploaded(true)}
                className="border-2 border-dashed border-lime-400/20 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:border-lime-400/40 transition-all duration-150 cursor-pointer"
              >
                <i className="ti ti-file-upload text-2xl text-app-faint" />
                <div>
                  <p className="text-app-text text-xs font-semibold">Subir PDF o JPG</p>
                  <p className="text-app-faint text-[10px] mt-0.5">Máx 5MB. Apto físico obligatorio.</p>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: DDJJ de Salud */}
          <div className="bg-app-surface rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-card glass-border">
            <div
              className="pointer-events-none absolute -right-12 -bottom-12 w-40 h-40 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%)" }}
            />
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center">
              <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center">
                <i className="ti ti-clipboard-text text-lg text-lime-400" />
              </div>
              <h3 className="text-app-text text-sm font-extrabold">DDJJ de Salud</h3>
            </div>
            <p className="text-app-subtle text-xs leading-relaxed">
              Declaración Jurada actualizada de estado físico y lesiones previas.
            </p>
            <button
              onClick={() => setDdjjOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-app-bg text-app-text text-xs font-bold hover:bg-app-card hover:shadow-[0_0_16px_rgba(163,230,53,0.1)] transition-all cursor-pointer group"
            >
              {ddjjSaved ? "VER / ACTUALIZAR FORMULARIO" : "COMPLETAR FORMULARIO"}
              <i className="ti ti-arrow-right text-sm text-lime-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <div className="flex items-center gap-2">
              {ddjjSaved ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.5)]" />
                  <span className="text-app-faint text-[10px]">Declaración enviada</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-400 text-[10px]">Pendiente de completar</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DDJJ Dialog */}
      <Dialog open={ddjjOpen} onOpenChange={(open) => !open && setDdjjOpen(false)}>
        <DialogContent className="max-w-lg bg-app-card-deep border-app-border/[0.12] text-app-text max-h-[90vh] overflow-y-auto [&_.lucide-x]:h-6 [&_.lucide-x]:w-6">
          <div className="flex flex-col gap-6 p-1">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
                <i className="ti ti-clipboard-text text-xl text-lime-400" />
              </div>
              <div>
                <h2 className="text-app-text text-base font-extrabold">Declaración Jurada de Salud</h2>
                <p className="text-app-subtle text-xs mt-0.5">Completá con información veraz y actualizada.</p>
              </div>
            </div>

            {/* Datos básicos */}
            <div className="flex flex-col gap-3">
              <p className="text-app-subtle text-[10px] font-bold tracking-widest uppercase">Datos Básicos</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-app-muted text-xs font-semibold">Grupo Sanguíneo</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm text-app-text appearance-none outline-none focus:ring-1 focus:ring-lime-400/20 transition-all cursor-pointer glass-border"
                >
                  <option value="">Seleccionar...</option>
                  {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-app-muted text-xs font-semibold">Contacto de Emergencia</label>
                <input
                  value={emergency}
                  onChange={(e) => setEmergency(e.target.value)}
                  placeholder="Nombre y teléfono"
                  className="w-full bg-app-bg rounded-xl px-4 py-2.5 text-sm text-app-text placeholder-app-faint outline-none focus:ring-1 focus:ring-lime-400/20 transition-all glass-border"
                />
              </div>
            </div>

            {/* Condiciones de salud */}
            <div className="flex flex-col gap-3">
              <p className="text-app-subtle text-[10px] font-bold tracking-widest uppercase">Condiciones de Salud</p>
              <div className="flex flex-col gap-2">
                {HEALTH_CONDITIONS.map((cond, i) => (
                  <button
                    key={cond}
                    onClick={() => toggleCondition(i)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      conditions[i]
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                        : "bg-app-bg glass-border text-app-muted hover:bg-app-card"
                    }`}
                  >
                    <span>{cond}</span>
                    <span className={`shrink-0 ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      conditions[i]
                        ? "border-amber-400 bg-amber-400/20"
                        : "border-zinc-600"
                    }`}>
                      {conditions[i] && <i className="ti ti-check text-amber-400 text-[10px]" />}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-app-faint text-[10px]">
                Seleccioná las condiciones que apliquen. Sin selección se interpreta como "No".
              </p>
            </div>

            {/* Nota legal */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <i className="ti ti-alert-triangle text-amber-400 text-sm shrink-0 mt-0.5" />
              <p className="text-amber-400/80 text-xs leading-relaxed">
                Esta declaración tiene carácter de instrumento privado. La información falsa o incompleta
                puede resultar en la suspensión de la membresía.
              </p>
            </div>

            {/* Aceptación */}
            <button
              onClick={() => setAccepted((v) => !v)}
              className="flex items-start gap-3 text-left cursor-pointer group"
            >
              <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                accepted ? "border-lime-400 bg-lime-400/20" : "border-zinc-600 group-hover:border-zinc-400"
              }`}>
                {accepted && <i className="ti ti-check text-lime-400 text-[10px]" />}
              </span>
              <span className="text-app-muted text-xs leading-relaxed">
                Declaro que la información consignada es verdadera y me comprometo a actualizar
                cualquier cambio en mi estado de salud.
              </span>
            </button>

            {/* Botón enviar */}
            <button
              onClick={handleDdjjSubmit}
              disabled={!accepted}
              className={`w-full py-3.5 rounded-xl text-sm font-extrabold tracking-wider transition-all ${
                accepted
                  ? "bg-lime-400 text-squat-ink hover:brightness-105 active:scale-[0.98] cursor-pointer"
                  : "bg-app-card text-zinc-600 cursor-not-allowed"
              }`}
            >
              ENVIAR DECLARACIÓN
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
