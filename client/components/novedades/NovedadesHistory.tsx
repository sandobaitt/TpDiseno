import * as React from "react";
import { Pagination } from "@/components/common/Pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Novedad, NovedadType, NovedadStatus } from "@/data/novedades";

type FilterKey = "all" | "staff" | "classes";

interface NovedadesHistoryProps {
  novedades: Novedad[];
  onResolve?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const typeConfig: Record<
  NovedadType,
  { icon: string; color: string; label: string }
> = {
  incident: {
    icon: "ti ti-alert-triangle",
    color: "text-red-400",
    label: "INCIDENTE",
  },
  change: {
    icon: "ti ti-arrows-exchange",
    color: "text-amber-400",
    label: "CAMBIO TURNO",
  },
  normal: {
    icon: "ti ti-info-circle",
    color: "text-lime-400",
    label: "NOVEDAD",
  },
};

const typeBadgeBg: Record<NovedadType, string> = {
  incident: "bg-red-950/60 text-red-400",
  change: "bg-amber-950/60 text-amber-400",
  normal: "bg-lime-950/60 text-lime-400",
};

const statusConfig: Record<
  NovedadStatus,
  { label: string; className: string }
> = {
  resolved: { label: "Resuelto", className: "bg-green-900/60 text-green-400" },
  in_progress: {
    label: "En Proceso",
    className: "bg-blue-900/60 text-blue-400",
  },
  closed: { label: "Cerrado", className: "bg-zinc-800 text-gray-400" },
};

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "all", label: "TODOS" },
  { key: "staff", label: "STAFF" },
  { key: "classes", label: "CLASES" },
];

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const time = d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Hoy, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return `Ayer, ${time}`;

  return (
    d.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    }) + `, ${time}`
  );
}

const ITEMS_PER_PAGE = 4;

export function NovedadesHistory({ novedades, onResolve, onDelete }: NovedadesHistoryProps) {
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  const filtered = novedades.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "staff") return n.entityType === "profesor";
    if (activeFilter === "classes") return n.entityType === "clase";
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  return (
    <section className="flex-1 min-w-0">
      <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-card glass-border">
        <h1 className="text-white font-extrabold text-2xl md:text-3xl tracking-wider">
          HISTORIAL DE NOVEDADES
        </h1>

        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setActiveFilter(opt.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                activeFilter === opt.key
                  ? "bg-neutral-800 text-lime-400 border border-lime-400/40 shadow-[0_0_12px_rgba(163,230,53,0.12)]"
                  : "bg-neutral-800/50 text-gray-500 hover:text-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {paginated.map((nov) => {
            const cfg = typeConfig[nov.type];
            const badge = typeBadgeBg[nov.type];
            const st = statusConfig[nov.status];

            return (
              <div
                key={nov.id}
                className="bg-neutral-800/50 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-neutral-800/80 transition-all duration-150 glass-border hover:border-white/[0.08] group/row"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center shrink-0 border border-zinc-800">
                    <i className={`${cfg.icon} text-base ${cfg.color}`} />
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${badge}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-white text-sm font-bold truncate">
                      {nov.entityType === "profesor" ? "Profesor" : "Clase"}:{" "}
                      {nov.entityName}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                      {nov.detail}
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col items-end gap-2 shrink-0 md:ml-4">
                  <span className="text-gray-600 text-xs whitespace-nowrap">
                    {formatTimestamp(nov.timestamp)}
                  </span>

                  <div className="flex items-center gap-2">
                    {nov.status === "in_progress" && onResolve ? (
                      <button
                        onClick={() => onResolve(nov.id)}
                        className="group relative px-3 py-1 rounded-full text-[10px] font-bold tracking-wider whitespace-nowrap bg-blue-900/60 text-blue-400 border border-blue-500/20 hover:bg-green-900/60 hover:text-green-400 hover:border-green-500/30 transition-all duration-200 cursor-pointer overflow-hidden"
                      >
                        <span className="flex items-center gap-1 group-hover:opacity-0 transition-opacity duration-150">
                          En Proceso
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <i className="ti ti-circle-check text-xs" />
                          Resolver
                        </span>
                      </button>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider whitespace-nowrap ${st.className}`}>
                        {st.label}
                      </span>
                    )}

                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
                            <i className="ti ti-trash text-sm" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-900 border border-white/[0.08] text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Eliminar novedad?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-500">
                              Vas a eliminar <span className="text-white font-semibold">{nov.entityName}</span>. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-neutral-800 border-zinc-700 text-gray-300 hover:bg-neutral-700 hover:text-white cursor-pointer">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(nov.id)}
                              className="bg-red-500/80 hover:bg-red-500 text-white border-0 cursor-pointer"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
}
