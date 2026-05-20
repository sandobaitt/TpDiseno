import * as React from "react";
import { buildWeekFromWorkoutTypes } from "@/data/schedule";
import { workoutTypesMock } from "@/data/workoutTypes";
import { teachersMock } from "@/data/teachers";
import { classStudentsMock } from "@/data/classStudents";
import { getMockSession } from "@/data/users";

interface HoraEntry {
  id: string;
  date: string;
  dayName: string;
  classTitle: string;
  startTime: string;
  durationMin: number;
  studentsPresent: number;
  studentsTotal: number;
}

type Period = "semana" | "mes" | "anterior";

const PERIOD_LABELS: Record<Period, string> = {
  semana:   "Esta semana",
  mes:      "Este mes",
  anterior: "Mes anterior",
};

const BASE_MONDAY = new Date(2025, 4, 12);

const PERIOD_WEEKS: Record<Period, number[]> = {
  semana: [0],
  mes: [-3, -2, -1, 0],
  anterior: [-7, -6, -5, -4],
};

function fmtHours(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ProfesorHorasPage() {
  const [period, setPeriod] = React.useState<Period>("mes");

  const teacherName = React.useMemo(() => {
    const session = getMockSession();
    const t = teachersMock.find((t) => t.fullName === session?.fullName);
    return t?.fullName ?? "";
  }, []);

  const entries = React.useMemo(() => {
    const offsets = PERIOD_WEEKS[period];
    const all: HoraEntry[] = [];
    let idCounter = 0;

    for (const offset of offsets) {
      const baseDate = new Date(BASE_MONDAY);
      baseDate.setDate(baseDate.getDate() + offset * 7);
      const week = buildWeekFromWorkoutTypes(baseDate, workoutTypesMock, teachersMock, classStudentsMock);

      for (const day of week) {
        for (const cls of day.classes) {
          if (cls.coach !== teacherName) continue;
          idCounter++;
          const total = cls.enrolledStudentIds.length;
          const present = Math.floor(total * 0.75);
          all.push({
            id: `he_${idCounter}`,
            date: `${day.date} ${day.month}`,
            dayName: day.dayFull,
            classTitle: cls.title,
            startTime: cls.time,
            durationMin: cls.durationMin,
            studentsPresent: Math.max(1, present),
            studentsTotal: total,
          });
        }
      }
    }
    return all;
  }, [period, teacherName]);

  const totalMins     = entries.reduce((s, e) => s + e.durationMin, 0);
  const totalClases   = entries.length;
  const totalAlumnos  = entries.reduce((s, e) => s + e.studentsPresent, 0);
  const avgAlumnos    = totalClases > 0 ? Math.round(totalAlumnos / totalClases) : 0;

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-app-text text-3xl md:text-4xl font-extrabold leading-tight mt-1">
          MIS HORAS
        </h1>
        <p className="text-app-faint text-sm mt-1">
          Detalle de clases dictadas y horas trabajadas por período.
        </p>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === p
                ? "bg-lime-400/10 border border-lime-400/40 text-lime-400"
                : "bg-app-bg glass-border text-app-subtle hover:text-app-muted hover:border-app-border/[0.10]"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-3">
        <div className="bg-app-bg glass-border rounded-2xl p-5 flex flex-col gap-2 shadow-card">
          <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center">
            <i className="ti ti-clock text-lime-400 text-base" />
          </div>
          <p className="text-app-text text-2xl font-extrabold mt-1">{fmtHours(totalMins)}</p>
          <p className="text-app-subtle text-[10px] font-semibold tracking-wider">HORAS TRABAJADAS</p>
        </div>

        <div className="bg-app-bg glass-border rounded-2xl p-5 flex flex-col gap-2 shadow-card">
          <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center">
            <i className="ti ti-barbell text-lime-400 text-base" />
          </div>
          <p className="text-app-text text-2xl font-extrabold mt-1">{totalClases}</p>
          <p className="text-app-subtle text-[10px] font-semibold tracking-wider">CLASES DICTADAS</p>
        </div>

        <div className="bg-app-bg glass-border rounded-2xl p-5 flex flex-col gap-2 shadow-card">
          <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center">
            <i className="ti ti-users text-lime-400 text-base" />
          </div>
          <p className="text-app-text text-2xl font-extrabold mt-1">{avgAlumnos}</p>
          <p className="text-app-subtle text-[10px] font-semibold tracking-wider">PROMEDIO ALUMNOS</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-app-bg glass-border rounded-2xl overflow-x-auto shadow-card">
        <div className="min-w-[600px]">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_120px_100px_100px] px-6 py-3 border-b border-app-border/[0.05]">
          <span className="text-[10px] font-bold tracking-widest text-app-faint">CLASE</span>
          <span className="text-[10px] font-bold tracking-widest text-app-faint text-center">HORARIO</span>
          <span className="text-[10px] font-bold tracking-widest text-app-faint text-center">DURACIÓN</span>
          <span className="text-[10px] font-bold tracking-widest text-app-faint text-center">ALUMNOS</span>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <i className="ti ti-clock-off text-3xl text-app-faint" />
            <p className="text-sm text-app-faint font-medium">Sin registros en este período</p>
          </div>
        ) : (
          <>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-[1fr_120px_100px_100px] items-center px-6 py-4 border-b border-app-border/[0.04] last:border-0 hover:bg-app-hover/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-app-text text-sm font-semibold truncate">{entry.classTitle}</p>
                  <p className="text-app-subtle text-[11px]">{entry.dayName}, {entry.date}</p>
                </div>
                <div className="flex justify-center">
                  <span className="text-app-muted text-xs font-medium">{entry.startTime}</span>
                </div>
                <div className="flex justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-lime-400/10 text-lime-400 text-[10px] font-bold">
                    {fmtHours(entry.durationMin)}
                  </span>
                </div>
                <div className="flex justify-center">
                  <span className="text-app-muted text-xs font-medium">
                    {entry.studentsPresent}
                    <span className="text-app-faint">/{entry.studentsTotal}</span>
                  </span>
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="grid grid-cols-[1fr_120px_100px_100px] items-center px-6 py-4 border-t border-app-border/[0.08] bg-white/[0.02]">
              <div>
                <span className="text-app-text text-xs font-extrabold tracking-wider">TOTAL PERÍODO</span>
                <span className="text-app-faint text-[10px] ml-2">{totalClases} clases</span>
              </div>
              <div />
              <div className="flex justify-center">
                <span className="px-2.5 py-1 rounded-lg bg-lime-400/20 text-lime-400 text-[10px] font-extrabold">
                  {fmtHours(totalMins)}
                </span>
              </div>
              <div className="flex justify-center">
                <span className="text-lime-400 text-xs font-bold">{totalAlumnos} total</span>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
