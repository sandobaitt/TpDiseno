import * as React from "react";
import { type Bitacora } from "@/data/bitacoras";
import { cn } from "@/lib/utils";

type DateFilter = "all" | "day" | "week" | "month";

const FILTER_LABELS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "day", label: "Hoy" },
  { key: "week", label: "Esta semana" },
  { key: "month", label: "Este mes" },
];

function isInRange(dateStr: string, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  if (filter === "day") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }
  if (filter === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }
  if (filter === "month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }
  return true;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const timeStr = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return `Hoy, ${timeStr}`;
  if (diffDays === 1) return `Ayer, ${timeStr}`;
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" }) + `, ${timeStr}`;
}

interface ObservacionesListProps {
  bitacoras: Bitacora[];
}

export function ObservacionesList({ bitacoras }: ObservacionesListProps) {
  const [activeFilter, setActiveFilter] = React.useState<DateFilter>("all");

  const filtered = React.useMemo(
    () => bitacoras.filter((b) => isInRange(b.createdAt, activeFilter)),
    [bitacoras, activeFilter],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-app-text text-xl font-bold leading-tight">
            Observaciones de profesores
          </h2>
          <p className="text-app-faint text-xs mt-0.5">
            Registros subidos por el cuerpo docente.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-app-card/60 border border-app-border/[0.12]/40 rounded-xl p-1">
          {FILTER_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                activeFilter === key
                  ? "bg-app-text text-app-card"
                  : "text-app-subtle hover:text-app-text",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-app-faint bg-app-card/40 border border-app-border/[0.12]/30 rounded-2xl">
          <i className="ti ti-clipboard-off text-3xl" />
          <p className="text-sm font-medium">No hay observaciones para este período.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-1.5 bg-app-card/60 border border-app-border/[0.12]/40 rounded-2xl px-5 py-4"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className="text-app-text text-sm font-semibold leading-tight">{b.title}</p>
                <span className="text-app-faint text-xs shrink-0">{formatDate(b.createdAt)}</span>
              </div>
              {b.studentName && (
                <p className="text-app-accent text-xs font-medium">
                  <i className="ti ti-user mr-1" />
                  {b.studentName}
                </p>
              )}
              <p className="text-app-subtle text-xs leading-relaxed line-clamp-3">{b.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
