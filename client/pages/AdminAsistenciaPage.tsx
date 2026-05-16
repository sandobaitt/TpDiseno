import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
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
    map
      .get(key)!
      .push({ blockId: b.id, trainer: b.trainer, type: b.type, status });
  });
  return map;
}

export default function AdminAsistenciaPage() {
  const [attendanceMap] = React.useState(generateAttendance);
  const [selectedSlot, setSelectedSlot] = React.useState<{
    day: number;
    time: string;
  } | null>(null);

  const slotAttendance = selectedSlot
    ? (attendanceMap.get(`${selectedSlot.day}-${selectedSlot.time}`) ?? [])
    : [];

  const slotEnd = selectedSlot
    ? (blocksMock.find(
        (b) => b.day === selectedSlot.day && b.start === selectedSlot.time,
      )?.end ?? selectedSlot.time)
    : "";

  return (
    <DashboardLayout headerNav="Asistencia">
      <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
        {/* Title + date selector */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-lime-400 text-xs font-bold tracking-widest">
              ASISTENCIA
            </span>
            <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mt-1">
              Control de Asistencias
            </h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-zinc-800 text-gray-300 text-xs font-bold hover:border-zinc-700 transition-colors cursor-pointer">
            <i className="ti ti-calendar text-sm text-lime-400" />
            12 - 18 Noviembre, 2023
            <i className="ti ti-chevron-down text-gray-500 text-xs" />
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Horas Programadas"
            value="342"
            unit="hrs"
            valueColor="text-lime-400"
          />
          <StaffMetricCard />
          <MetricCard
            title="Conflictos de Horario"
            value="2"
            subtitle="Solapamientos detectados"
            valueColor="text-red-400"
            bgColor="bg-red-950/20"
          />
          <MetricCard
            title="Reemplazos Pendientes"
            value="1"
            subtitle="Turno descubierto (Jueves)"
            valueColor="text-lime-400"
          />
        </div>

        {/* Timeline */}
        <div className="bg-[#171717] rounded-2xl p-5 overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Day headers */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-4">
              <div />
              {daysMock.map((d) => (
                <div
                  key={d.abbr}
                  className={`flex flex-col items-center py-3 rounded-xl ${
                    d.isActive ? "bg-lime-400/5 border-t-2 border-lime-400" : ""
                  }`}
                >
                  <span
                    className={`text-xs font-bold tracking-widest ${
                      d.isActive ? "text-lime-400" : "text-gray-500"
                    }`}
                  >
                    {d.abbr}
                  </span>
                  <span
                    className={`text-lg font-extrabold ${
                      d.isActive ? "text-lime-400" : "text-gray-400"
                    }`}
                  >
                    {d.number}
                  </span>
                </div>
              ))}
            </div>

            {/* Time rows */}
            {timeSlots.map((time) => {
              const blocksAtTime = blocksMock.filter((b) => b.start === time);

              return (
                <div
                  key={time}
                  className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-2"
                >
                  <div className="flex items-start pt-2">
                    <span className="text-gray-600 text-[10px] font-medium">
                      {time}
                    </span>
                  </div>
                  {daysMock.map((day) => {
                    const dayIdx = daysMock.indexOf(day);
                    const blocks = blocksAtTime.filter((b) => b.day === dayIdx);
                    const hasMultiple = blocks.length > 1;
                    return (
                      <div key={`${time}-${day.abbr}`} className="min-h-[60px]">
                        {blocks.length > 0 && !blocks[0].isFree ? (
                          <button
                            onClick={() =>
                              setSelectedSlot({ day: dayIdx, time })
                            }
                            className={`w-full text-left rounded-xl p-2.5 flex flex-col gap-1 hover:brightness-110 transition-all cursor-pointer ${
                              hasMultiple
                                ? "bg-zinc-800/80 border-l-2 border-amber-400"
                                : "bg-neutral-900 border-l-2 border-lime-400/60"
                            }`}
                          >
                            <span className="text-lime-400 text-[9px] font-bold">
                              {blocks[0].start} - {blocks[0].end}
                            </span>
                            {blocks[0].isPro && (
                              <span className="w-fit px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-400 text-[8px] font-bold tracking-wider">
                                PRO
                              </span>
                            )}
                            {hasMultiple ? (
                              <div className="flex flex-col gap-0.5">
                                {blocks.map((b) => (
                                  <span
                                    key={b.id}
                                    className="text-white text-[11px] font-bold leading-tight"
                                  >
                                    {b.trainer} ·{" "}
                                    <span className="text-gray-500 font-normal">
                                      {b.type}
                                    </span>
                                  </span>
                                ))}
                                <span className="text-amber-400 text-[8px] font-bold tracking-wider mt-0.5">
                                  {blocks.length} profesores
                                </span>
                              </div>
                            ) : (
                              <>
                                <span className="text-white text-[11px] font-bold leading-tight">
                                  {blocks[0].trainer}
                                </span>
                                <span className="text-gray-500 text-[9px]">
                                  {blocks[0].type}
                                </span>
                              </>
                            )}
                          </button>
                        ) : blocks[0]?.isFree ? (
                          <div className="h-full rounded-xl bg-black/40 border border-dashed border-lime-400/30 p-2.5 flex items-center justify-center">
                            <span className="text-gray-600 text-[8px] font-medium">
                              Libre
                            </span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dialog: Slot Attendance */}
      <Dialog
        open={!!selectedSlot}
        onOpenChange={(o) => !o && setSelectedSlot(null)}
      >
        <DialogContent className="max-w-md bg-stone-950 border-zinc-800 text-white">
          {selectedSlot && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
                  <i className="ti ti-calendar-time text-lg text-lime-400" />
                </div>
                <div>
                  <h2 className="text-white text-base font-extrabold">
                    {daysMock[selectedSlot.day].abbr}{" "}
                    {daysMock[selectedSlot.day].number} · {selectedSlot.time} -{" "}
                    {slotEnd}
                  </h2>
                  <p className="text-gray-600 text-[10px]">
                    Profesores asignados a este horario
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {slotAttendance.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-6">
                    Sin profesores asignados
                  </p>
                )}
                {slotAttendance.map((sa) => (
                  <div
                    key={sa.blockId}
                    className="bg-black/40 rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">
                          {sa.trainer
                            .split(" ")
                            .map((s) => s[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">
                          {sa.trainer}
                        </p>
                        <p className="text-gray-500 text-[10px]">{sa.type}</p>
                      </div>
                    </div>
                    <StatusBadge status={sa.status} />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-green-400 text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Presente
                  </span>
                  <span className="flex items-center gap-1.5 text-red-400 text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Ausente
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                    Pendiente
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

/* ---------- sub-components ---------- */

function MetricCard({
  title,
  value,
  unit,
  subtitle,
  valueColor = "text-lime-400",
  bgColor = "bg-[#171717]",
}: {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  valueColor?: string;
  bgColor?: string;
}) {
  return (
    <div className={`${bgColor} rounded-2xl p-5 flex flex-col gap-1.5`}>
      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">
        {title}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-extrabold ${valueColor}`}>{value}</span>
        {unit && (
          <span className={`text-xs font-bold ${valueColor}`}>{unit}</span>
        )}
      </div>
      {subtitle && (
        <span className="text-gray-600 text-[10px]">{subtitle}</span>
      )}
    </div>
  );
}

function StaffMetricCard() {
  return (
    <div className="bg-[#171717] rounded-2xl p-5 flex flex-col gap-3">
      <span className="text-gray-500 text-[10px] font-semibold tracking-widest">
        Staff Activo
      </span>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {["A", "D", "F"].map((letter, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border-2 border-[#171717] flex items-center justify-center"
            >
              <span className="text-white text-[10px] font-bold">{letter}</span>
            </div>
          ))}
        </div>
        <div className="w-8 h-8 rounded-full bg-lime-400/10 border-2 border-[#171717] flex items-center justify-center">
          <span className="text-lime-400 text-[10px] font-bold">+12</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const config = {
    present: {
      dot: "bg-green-400",
      label: "Asistió",
      text: "text-green-400",
      bg: "bg-green-900/30",
    },
    absent: {
      dot: "bg-red-400",
      label: "Ausente",
      text: "text-red-400",
      bg: "bg-red-900/30",
    },
    pending: {
      dot: "bg-gray-500",
      label: "Pendiente",
      text: "text-gray-400",
      bg: "bg-zinc-800/50",
    },
  };
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-[10px] font-bold ${c.text}`}>{c.label}</span>
    </span>
  );
}
