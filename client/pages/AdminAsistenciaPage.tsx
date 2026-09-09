import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UnifiedCalendar } from "@/components/cronograma/UnifiedCalendar";
import { AdminShiftCard } from "@/components/cronograma/AdminShiftCard";
import {
  timeSlots,
  blocksMock,
  type TimeBlock,
  type DayInfo,
} from "@/data/adminAttendance";

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_ABBRS = ["LUN","MAR","MIE","JUE","VIE","SAB","DOM"];
const BASE_MONDAY = new Date(2023, 10, 12); // Nov 12, 2023

function buildWeekDays(offset: number): DayInfo[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return DAY_ABBRS.map((abbr, i) => {
    const d = new Date(BASE_MONDAY);
    d.setDate(BASE_MONDAY.getDate() + offset * 7 + i);
    d.setHours(0, 0, 0, 0);
    const isActive = (offset === 0 && i === 2) || d.getTime() === today.getTime();
    return { abbr, number: d.getDate(), isActive };
  });
}

function weekLabel(offset: number): string {
  const first = new Date(BASE_MONDAY);
  first.setDate(BASE_MONDAY.getDate() + offset * 7);
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  const year = last.getFullYear();
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} - ${last.getDate()} ${MONTHS_ES[last.getMonth()]}, ${year}`;
  }
  return `${first.getDate()} ${MONTHS_ES[first.getMonth()]} - ${last.getDate()} ${MONTHS_ES[last.getMonth()]}, ${year}`;
}

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
  const [weekOffset, setWeekOffset] = React.useState(0);
  const weekDays = React.useMemo(() => buildWeekDays(weekOffset), [weekOffset]);
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
          <div className="flex items-center bg-neutral-900 glass-border rounded-xl shadow-card overflow-hidden">
            <button onClick={() => setWeekOffset((o) => o - 1)} className="px-3 py-2.5 text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer">
              <i className="ti ti-chevron-left text-sm" />
            </button>
            <span className="flex items-center gap-2 px-2 text-gray-300 text-xs font-bold whitespace-nowrap">
              <i className="ti ti-calendar text-sm text-lime-400" />
              {weekLabel(weekOffset)}
            </span>
            <button onClick={() => setWeekOffset((o) => o + 1)} className="px-3 py-2.5 text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer">
              <i className="ti ti-chevron-right text-sm" />
            </button>
          </div>
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

        {/* Unified Calendar Timeline */}
        <div className="w-full">
          <UnifiedCalendar
            days={weekDays.map((d) => ({
              dayAbbr: d.abbr,
              date: d.number,
              isActive: d.isActive,
            }))}
            getItemsForDay={(day) => {
              const dayIdx = weekDays.findIndex((d) => d.number === day.date);
              return blocksMock
                .filter((b) => b.day === dayIdx)
                .sort((a, b) => a.start.localeCompare(b.start));
            }}
            renderItem={(shift) => (
              <AdminShiftCard
                key={`${shift.id}-${shift.start}`}
                shift={shift}
                onSelect={(s) => setSelectedSlot({ day: s.day, time: s.start })}
              />
            )}
            emptyMessage="Sin turnos asignados"
          />
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
                    {weekDays[selectedSlot.day].abbr} {weekDays[selectedSlot.day].number} · {selectedSlot.time} – {slotEnd}
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
