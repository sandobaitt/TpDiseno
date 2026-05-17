import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  timeSlots,
  daysMock,
  blocksMock,
  type TimeBlock,
} from "@/data/adminAttendance";

type AttendanceStatus = "present" | "absent" | "pending";

interface SlotAttendance {
  blockId: string;
  trainer: string;
  type: string;
  status: AttendanceStatus;
}

function generateAttendance() {
  const statuses: AttendanceStatus[] = ["present", "absent", "pending"];
  const map = new Map<string, SlotAttendance[]>();
  blocksMock.forEach((b) => {
    const key = `${b.day}-${b.start}`;
    if (!map.has(key)) map.set(key, []);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    map.get(key)!.push({ blockId: b.id, trainer: b.trainer, type: b.type, status });
  });
  return map;
}

export default function AdminAsistenciaPage() {
  const [attendanceMap] = React.useState(generateAttendance);
  const [selectedSlot, setSelectedSlot] = React.useState<{ day: number; time: string } | null>(null);

  const slotAttendance = selectedSlot
    ? (attendanceMap.get(`${selectedSlot.day}-${selectedSlot.time}`) ?? [])
    : [];

  const slotEnd = selectedSlot
    ? (blocksMock.find((b) => b.day === selectedSlot.day && b.start === selectedSlot.time)?.end ?? selectedSlot.time)
    : "";

  return (
    <>
      <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-lime-400 text-[10px] font-bold tracking-widest">
              ASISTENCIA
            </span>
            <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mt-1">
              Control de Asistencias
            </h1>
            <div className="h-px bg-white/[0.06] mt-4" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 glass-border text-gray-300 text-xs font-bold hover:border-zinc-700 transition-colors cursor-pointer shadow-card">
            <i className="ti ti-calendar text-sm text-lime-400" />
            12 - 18 Noviembre, 2023
            <i className="ti ti-chevron-down text-gray-500 text-xs" />
          </button>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Horas Programadas */}
          <div className="rounded-2xl bg-neutral-900 p-5 shadow-card glass-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
              <i className="ti ti-clock text-lime-400 text-base" />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-semibold tracking-widest">HORAS PROGRAMADAS</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-lime-400">342</span>
                <span className="text-xs font-bold text-lime-400/70">hrs</span>
              </div>
            </div>
          </div>

          {/* Staff Activo */}
          <div className="rounded-2xl bg-neutral-900 p-5 shadow-card glass-border flex flex-col gap-3">
            <p className="text-gray-500 text-[10px] font-semibold tracking-widest">STAFF ACTIVO</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["A", "D", "F"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-neutral-900 flex items-center justify-center"
                  >
                    <span className="text-white text-[10px] font-bold">{letter}</span>
                  </div>
                ))}
              </div>
              <div className="w-8 h-8 rounded-full bg-lime-400/10 border-2 border-neutral-900 flex items-center justify-center">
                <span className="text-lime-400 text-[10px] font-bold">+12</span>
              </div>
              <span className="text-gray-500 text-[10px] font-medium ml-1">15 miembros</span>
            </div>
          </div>

          {/* Conflictos */}
          <div className="rounded-2xl bg-red-950/30 p-5 shadow-card border border-red-500/15 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <i className="ti ti-alert-triangle text-red-400 text-base" />
            </div>
            <div>
              <p className="text-red-400/60 text-[10px] font-semibold tracking-widest">CONFLICTOS</p>
              <p className="text-2xl font-extrabold text-red-400 mt-0.5">2</p>
              <p className="text-red-400/50 text-[10px]">Solapamientos detectados</p>
            </div>
          </div>

          {/* Reemplazos */}
          <div className="rounded-2xl bg-neutral-900 p-5 shadow-card glass-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
              <i className="ti ti-replace text-amber-400 text-base" />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-semibold tracking-widest">REEMPLAZOS</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-0.5">1</p>
              <p className="text-gray-600 text-[10px]">Turno descubierto (Jue)</p>
            </div>
          </div>
        </div>

        {/* Calendar Timeline */}
        <div className="rounded-2xl bg-neutral-900 shadow-card glass-border p-5 overflow-x-auto">
          <div className="min-w-[860px]">

            {/* Day headers */}
            <div className="grid grid-cols-[72px_repeat(7,1fr)] gap-2 mb-4">
              <div />
              {daysMock.map((d) => (
                <div
                  key={d.abbr}
                  className={`flex flex-col items-center py-3 rounded-xl transition-all ${
                    d.isActive
                      ? "bg-lime-400/10 border border-lime-400/40 shadow-[0_0_16px_rgba(149,253,0,0.06)]"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold tracking-widest ${
                      d.isActive ? "text-lime-400" : "text-gray-600"
                    }`}
                  >
                    {d.abbr}
                  </span>
                  <span
                    className={`text-xl font-extrabold mt-0.5 ${
                      d.isActive ? "text-lime-400" : "text-gray-400"
                    }`}
                  >
                    {d.number}
                  </span>
                  {d.isActive && (
                    <div className="w-1 h-1 rounded-full bg-lime-400 mt-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.05] mb-3" />

            {/* Time rows */}
            {timeSlots.map((time) => {
              const blocksAtTime = blocksMock.filter((b) => b.start === time);
              const hasAnyBlock = blocksAtTime.length > 0;

              return (
                <div
                  key={time}
                  className={`grid grid-cols-[72px_repeat(7,1fr)] gap-2 mb-2 ${
                    hasAnyBlock ? "" : "opacity-40"
                  }`}
                >
                  {/* Time label */}
                  <div className="flex items-start pt-3">
                    <span className="text-gray-600 text-[10px] font-semibold tabular-nums">
                      {time}
                    </span>
                  </div>

                  {daysMock.map((day, dayIdx) => {
                    const blocks = blocksAtTime.filter((b) => b.day === dayIdx);
                    const hasMultiple = blocks.length > 1;
                    const isConflict = blocks.some((b) => b.isConflict);

                    if (blocks.length === 0) {
                      return (
                        <div
                          key={`${time}-${day.abbr}`}
                          className="min-h-[60px] rounded-xl"
                        />
                      );
                    }

                    if (blocks[0].isFree) {
                      return (
                        <div
                          key={`${time}-${day.abbr}`}
                          className="min-h-[60px] rounded-xl border border-dashed border-zinc-800 flex items-center justify-center"
                        >
                          <span className="text-gray-700 text-[9px] font-medium tracking-wider">
                            LIBRE
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={`${time}-${day.abbr}`}
                        onClick={() => setSelectedSlot({ day: dayIdx, time })}
                        className={`w-full text-left rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-150 cursor-pointer active:scale-[0.98] shadow-card ${
                          isConflict
                            ? "bg-amber-950/40 border border-amber-500/25 hover:border-amber-500/40"
                            : "bg-[#1a1a1a] glass-border hover:border-white/[0.12]"
                        }`}
                      >
                        {/* Time range */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-bold tracking-wider ${
                              isConflict ? "text-amber-400" : "text-lime-400"
                            }`}
                          >
                            {blocks[0].start} – {blocks[0].end}
                          </span>
                          {blocks[0].isPro && !hasMultiple && (
                            <span className="px-1.5 py-0.5 rounded bg-lime-400/15 text-lime-400 text-[8px] font-bold tracking-wider">
                              PRO
                            </span>
                          )}
                          {isConflict && (
                            <i className="ti ti-alert-triangle text-amber-400 text-[10px]" />
                          )}
                        </div>

                        {/* Trainers */}
                        {hasMultiple ? (
                          <div className="flex flex-col gap-0.5">
                            {blocks.map((b) => (
                              <div key={b.id} className="flex flex-col">
                                <span className="text-white text-[11px] font-bold leading-tight">
                                  {b.trainer}
                                </span>
                                <span className="text-gray-500 text-[9px]">{b.type}</span>
                              </div>
                            ))}
                            <span className="text-amber-400 text-[8px] font-bold tracking-wider mt-0.5">
                              {blocks.length} profesores
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="text-white text-xs font-bold leading-tight">
                              {blocks[0].trainer}
                            </span>
                            <span className="text-gray-500 text-[9px]">
                              {blocks[0].type}
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slot Detail Dialog */}
      <Dialog
        open={!!selectedSlot}
        onOpenChange={(o) => !o && setSelectedSlot(null)}
      >
        <DialogContent className="max-w-md bg-stone-950 border-zinc-800 text-white">
          {selectedSlot && (
            <div className="flex flex-col gap-5">
              {/* Dialog header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center shrink-0">
                  <i className="ti ti-calendar-time text-lg text-lime-400" />
                </div>
                <div>
                  <h2 className="text-white text-base font-extrabold">
                    {daysMock[selectedSlot.day].abbr} {daysMock[selectedSlot.day].number} · {selectedSlot.time} – {slotEnd}
                  </h2>
                  <p className="text-gray-500 text-[10px]">
                    Profesores asignados a este horario
                  </p>
                </div>
              </div>

              {/* Trainer rows */}
              <div className="flex flex-col gap-2">
                {slotAttendance.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-6">
                    Sin profesores asignados
                  </p>
                )}
                {slotAttendance.map((sa) => (
                  <div
                    key={sa.blockId}
                    className="rounded-xl px-4 py-3 flex items-center justify-between glass-border bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px] font-bold">
                          {sa.trainer.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">{sa.trainer}</p>
                        <p className="text-gray-500 text-[10px]">{sa.type}</p>
                      </div>
                    </div>
                    <StatusBadge status={sa.status} />
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 px-1 border-t border-white/[0.05] pt-3">
                <span className="flex items-center gap-1.5 text-green-400 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Presente
                </span>
                <span className="flex items-center gap-1.5 text-red-400 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Ausente
                </span>
                <span className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Pendiente
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const config = {
    present: { dot: "bg-green-400", label: "Asistió", text: "text-green-400", bg: "bg-green-500/10 border border-green-500/20" },
    absent:  { dot: "bg-red-400",   label: "Ausente", text: "text-red-400",   bg: "bg-red-500/10 border border-red-500/20"   },
    pending: { dot: "bg-gray-500",  label: "Pendiente", text: "text-gray-400", bg: "bg-zinc-800/60 border border-zinc-700/40" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-[10px] font-bold ${c.text}`}>{c.label}</span>
    </span>
  );
}
