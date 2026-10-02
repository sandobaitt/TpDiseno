import * as React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";

interface HoraEntry {
  id: string;
  date: string;
  dayName: string;
  classTitle: string;
  startTime: string;
  durationMin: number;
  studentsPresent: number;
  studentsTotal: number;
  period: "semana" | "mes" | "anterior";
}

type Period = "semana" | "mes" | "anterior";

const PERIOD_LABELS: Record<Period, string> = {
  semana:   "Esta semana",
  mes:      "Este mes",
  anterior: "Mes anterior",
};

const horasMock: HoraEntry[] = [
  { id: "h1",  date: "13 MAY", dayName: "Martes",    classTitle: "HIIT ZONE",           startTime: "08:00", durationMin: 45, studentsPresent: 9,  studentsTotal: 15, period: "semana" },
  { id: "h2",  date: "13 MAY", dayName: "Martes",    classTitle: "FUNCIONAL INTENSO",   startTime: "17:30", durationMin: 50, studentsPresent: 12, studentsTotal: 12, period: "semana" },
  { id: "h3",  date: "12 MAY", dayName: "Lunes",     classTitle: "CROSS FIT WOD",       startTime: "07:00", durationMin: 45, studentsPresent: 8,  studentsTotal: 12, period: "semana" },
  { id: "h4",  date: "08 MAY", dayName: "Jueves",    classTitle: "CROSS FIT ENDURANCE", startTime: "09:00", durationMin: 60, studentsPresent: 6,  studentsTotal: 12, period: "mes"    },
  { id: "h5",  date: "06 MAY", dayName: "Martes",    classTitle: "HIIT ZONE",           startTime: "08:00", durationMin: 45, studentsPresent: 11, studentsTotal: 15, period: "mes"    },
  { id: "h6",  date: "06 MAY", dayName: "Martes",    classTitle: "FUNCIONAL INTENSO",   startTime: "17:30", durationMin: 50, studentsPresent: 10, studentsTotal: 12, period: "mes"    },
  { id: "h7",  date: "05 MAY", dayName: "Lunes",     classTitle: "CROSS FIT WOD",       startTime: "07:00", durationMin: 45, studentsPresent: 7,  studentsTotal: 12, period: "mes"    },
  { id: "h8",  date: "30 ABR", dayName: "Miércoles", classTitle: "HALTEROFILIA AVANZADA", startTime: "18:00", durationMin: 60, studentsPresent: 10, studentsTotal: 10, period: "anterior" },
  { id: "h9",  date: "29 ABR", dayName: "Martes",    classTitle: "HIIT ZONE",           startTime: "08:00", durationMin: 45, studentsPresent: 13, studentsTotal: 15, period: "anterior" },
  { id: "h10", date: "28 ABR", dayName: "Lunes",     classTitle: "CROSS FIT WOD",       startTime: "07:00", durationMin: 45, studentsPresent: 9,  studentsTotal: 12, period: "anterior" },
  { id: "h11", date: "24 ABR", dayName: "Jueves",    classTitle: "CROSS FIT ENDURANCE", startTime: "09:00", durationMin: 60, studentsPresent: 5,  studentsTotal: 12, period: "anterior" },
  { id: "h12", date: "22 ABR", dayName: "Martes",    classTitle: "FUNCIONAL INTENSO",   startTime: "17:30", durationMin: 50, studentsPresent: 11, studentsTotal: 12, period: "anterior" },
];

function fmtHours(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ProfesorHorasPage() {
  const [period, setPeriod] = React.useState<Period>("mes");

  const entries = React.useMemo(() => {
    if (period === "mes") return horasMock.filter((e) => e.period === "semana" || e.period === "mes");
    return horasMock.filter((e) => e.period === period);
  }, [period]);

  const totalMins     = entries.reduce((s, e) => s + e.durationMin, 0);
  const totalClases   = entries.length;
  const totalAlumnos  = entries.reduce((s, e) => s + e.studentsPresent, 0);
  const avgAlumnos    = totalClases > 0 ? Math.round(totalAlumnos / totalClases) : 0;

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">

      <PageHeader title="Mis horas" subtitle="Clases dictadas y horas trabajadas por período." />

      {/* Period selector */}
      <div className="flex gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              period === p
                ? "bg-lime-400/10 border border-lime-400/40 text-lime-400"
                : "bg-neutral-900 glass-border text-gray-400 hover:text-gray-300 hover:border-white/[0.10]"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon="ti-clock" value={fmtHours(totalMins)} label="Horas trabajadas" />
        <StatCard icon="ti-barbell" value={totalClases} label="Clases dictadas" />
        <StatCard icon="ti-users" value={avgAlumnos} label="Promedio de alumnos" tone="neutral" />
      </div>

      {/* Table */}
      <div className="bg-neutral-900 glass-border rounded-2xl overflow-hidden shadow-card">
        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-[1fr_120px_100px_100px] px-6 py-3 border-b border-white/[0.05]">
          <span className="text-[11px] font-bold tracking-widest text-gray-400">CLASE</span>
          <span className="text-[11px] font-bold tracking-widest text-gray-400 text-center">HORARIO</span>
          <span className="text-[11px] font-bold tracking-widest text-gray-400 text-center">DURACIÓN</span>
          <span className="text-[11px] font-bold tracking-widest text-gray-400 text-center">ALUMNOS</span>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <i className="ti ti-clock-off text-3xl text-gray-500" />
            <p className="text-sm text-gray-400 font-medium">Sin registros en este período</p>
          </div>
        ) : (
          <>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px_100px] gap-x-3 items-center px-4 sm:px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{entry.classTitle}</p>
                  <p className="text-gray-400 text-xs">
                    {entry.dayName}, {entry.date}
                    <span className="sm:hidden"> · {entry.startTime} · {entry.studentsPresent}/{entry.studentsTotal} alumnos</span>
                  </p>
                </div>
                <div className="hidden sm:flex justify-center">
                  <span className="text-gray-300 text-xs font-medium">{entry.startTime}</span>
                </div>
                <div className="flex justify-center">
                  <span className="px-2.5 py-1 rounded-lg bg-lime-400/10 text-lime-400 text-xs font-bold">
                    {fmtHours(entry.durationMin)}
                  </span>
                </div>
                <div className="hidden sm:flex justify-center">
                  <span className="text-gray-300 text-xs font-medium">
                    {entry.studentsPresent}
                    <span className="text-gray-400">/{entry.studentsTotal}</span>
                  </span>
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px_100px] gap-x-3 items-center px-4 sm:px-6 py-4 border-t border-white/[0.08] bg-white/[0.02]">
              <div>
                <span className="text-white text-xs font-extrabold tracking-wider">TOTAL PERÍODO</span>
                <span className="text-gray-400 text-xs ml-2">{totalClases} clases</span>
              </div>
              <div className="hidden sm:block" />
              <div className="flex justify-center">
                <span className="px-2.5 py-1 rounded-lg bg-lime-400/20 text-lime-400 text-[11px] font-extrabold">
                  {fmtHours(totalMins)}
                </span>
              </div>
              <div className="hidden sm:flex justify-center">
                <span className="text-lime-400 text-xs font-bold">{totalAlumnos} total</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
