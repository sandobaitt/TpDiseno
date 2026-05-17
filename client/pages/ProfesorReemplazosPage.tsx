import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { Pagination } from "@/components/common/Pagination";
import { replacementsMock, type ReplacementRequest } from "@/data/replacements";

type TabId = "solicitudes" | "novedades";

const categoryBadge: Record<string, string> = {
  CROSSFIT: "bg-zinc-700/60 text-white",
  HALTEROFILIA: "bg-zinc-700/60 text-white",
};

const ITEMS_PER_PAGE = 2;

export default function ProfesorReemplazosPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("solicitudes");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [requests, setRequests] = React.useState(replacementsMock);

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = requests.slice(start, start + ITEMS_PER_PAGE);

  const handleConfirm = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReject = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <DashboardLayout headerNav=" ">
      <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl md:text-4xl font-extrabold">
              REEMPLAZOS Y NOVEDADES
            </h1>
            <i className="ti ti-circle-check text-lime-400 text-2xl" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-zinc-800/50">
          <button
            onClick={() => setActiveTab("solicitudes")}
            className={`pb-3 text-sm font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === "solicitudes"
                ? "text-lime-400 border-b-2 border-lime-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Solicitudes de Cobertura
          </button>
          <button
            onClick={() => setActiveTab("novedades")}
            className={`pb-3 text-sm font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === "novedades"
                ? "text-lime-400 border-b-2 border-lime-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Novedades
          </button>
        </div>

        {/* Content */}
        {activeTab === "solicitudes" ? (
          <div className="flex flex-col gap-4">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600 gap-3">
                <i className="ti ti-circle-check text-4xl text-lime-400" />
                <p className="text-sm font-medium">
                  No hay solicitudes pendientes
                </p>
              </div>
            ) : (
              <>
                {paginatedRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                  />
                ))}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600 gap-3">
            <i className="ti ti-speakerphone text-4xl text-gray-600" />
            <p className="text-sm font-medium">No hay novedades disponibles</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* ── Request Card ── */

interface RequestCardProps {
  request: ReplacementRequest;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}

function RequestCard({ request, onConfirm, onReject }: RequestCardProps) {
  const r = request;

  return (
    <div className="bg-black/60 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 hover:bg-black/70 transition-all duration-150 shadow-card glass-border hover:border-white/[0.08]">
      {/* Left */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
              categoryBadge[r.category] ?? "bg-zinc-700/60 text-white"
            }`}
          >
            {r.category}
          </span>
          {r.isUrgent && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-red-950/60 text-red-400">
              URGENTE
            </span>
          )}
        </div>

        <h2 className="text-white text-lg md:text-xl font-extrabold">
          {r.title}
        </h2>

        <div className="flex items-center gap-2">
          <i className="ti ti-user-circle text-gray-500 text-sm" />
          <span className="text-gray-500 text-[10px] font-semibold tracking-wider">
            PROFESOR A REEMPLAZAR
          </span>
        </div>
        <p className="text-white text-sm font-bold -mt-1">
          {r.professorToReplace}
        </p>
      </div>

      {/* Right */}
      <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-3 shrink-0">
        <div className="flex flex-col items-center md:items-end">
          <span className="text-lime-400 text-xl font-extrabold leading-none">
            {r.dateLabel}
          </span>
          <span className="text-gray-500 text-xs mt-1">{r.timeLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onReject(r.id)}
            className="px-4 py-2 rounded-xl bg-black border border-zinc-800 text-gray-300 text-[10px] font-bold hover:border-red-500/30 hover:text-red-400 transition-all cursor-pointer"
          >
            Rechazar
          </button>
          <button
            onClick={() => onConfirm(r.id)}
            className="px-4 py-2 rounded-xl bg-lime-400 text-black text-[10px] font-bold hover:brightness-110 active:scale-[0.97] transition-all duration-150 shadow-btn-lime cursor-pointer"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
