import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import {
  timeSlots,
  daysMock,
  blocksMock,
  type TimeBlock,
} from "@/data/adminAttendance";

/* ---------- helpers ---------- */

function blockStyle(block: TimeBlock) {
  if (block.isConflict) return "bg-red-950/40 border-l-2 border-red-500";
  if (block.isFree)
    return "bg-black/40 border border-dashed border-lime-400/30";
  return "bg-neutral-900 border-l-2 border-lime-400/60";
}

/* ---------- page ---------- */

export default function AdminAsistenciaPage() {
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
                    const block = blocksAtTime.find(
                      (b) => b.day === daysMock.indexOf(day),
                    );
                    return (
                      <div key={`${time}-${day.abbr}`} className="min-h-[60px]">
                        {block ? (
                          <BlockCard block={block} />
                        ) : (
                          <div className="h-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
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

function BlockCard({ block }: { block: TimeBlock }) {
  return (
    <div
      className={`rounded-xl p-2.5 flex flex-col gap-1 ${blockStyle(block)}`}
    >
      <span className="text-lime-400 text-[9px] font-bold">
        {block.start} - {block.end}
      </span>
      {block.isPro && (
        <span className="w-fit px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-400 text-[8px] font-bold tracking-wider">
          PRO
        </span>
      )}
      <span className="text-white text-[11px] font-bold leading-tight">
        {block.trainer}
      </span>
      <span className="text-gray-500 text-[9px]">{block.type}</span>
    </div>
  );
}
