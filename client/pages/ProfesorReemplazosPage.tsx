import * as React from "react";
import { Pagination } from "@/components/common/Pagination";
import { isUrgent } from "@/data/replacements";
import { getSlot } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { getTeacher } from "@/data/teachers";
import { getMockSession } from "@/data/users";
import { branchName } from "@/components/cronograma/weekView";
import { addMinutesToTime, parseISODate } from "@/lib/dates";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import type { AppState } from "@/store/state";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Replacement } from "@/data/replacements";

type TabId = "pendientes" | "historial";

interface ReplacementRequest {
  id: string;
  category: string;
  isUrgent: boolean;
  title: string;
  professorToReplace: string;
  dateLabel: string;
  timeLabel: string;
}

/** Pedidos pendientes en los que el profesor logueado es el candidato. */
function buildRequests(
  state: AppState,
  teacherId: string | undefined,
): ReplacementRequest[] {
  return state.replacements
    .filter((r) => r.status === "pending" && r.candidateTeacherId === teacherId)
    .map((r) => {
      const slot = getSlot(r.slotId);
      return {
        id: r.id,
        category: slot
          ? getActivityName(slot.activityId).toUpperCase()
          : "CLASE",
        isUrgent: isUrgent(r),
        title: slot ? `Sede ${branchName(slot.branchId)}` : "Sede",
        professorToReplace: getTeacher(r.originalTeacherId)?.fullName ?? "-",
        dateLabel: parseISODate(r.date).toLocaleDateString("es-AR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        timeLabel: slot
          ? `${slot.start} – ${addMinutesToTime(slot.start, slot.durationMin)}`
          : "",
      };
    });
}

/** Reemplazos que el profesor ya respondió (aceptados o rechazados). */
function buildHistory(
  state: AppState,
  teacherId: string | undefined,
): Replacement[] {
  return state.replacements
    .filter((r) => r.status !== "pending" && r.candidateTeacherId === teacherId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function replacementTitle(r: Replacement) {
  const slot = getSlot(r.slotId);
  const date = parseISODate(r.date).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return `${slot ? getActivityName(slot.activityId) : "Clase"} · ${slot ? branchName(slot.branchId) : ""} · ${date}`;
}

const ITEMS_PER_PAGE = 4;

export default function ProfesorReemplazosPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("pendientes");
  const [currentPage, setCurrentPage] = React.useState(1);
  const state = useAppState();
  const actions = useStoreActions();
  // Pedidos pendientes para este profesor: al responder, desaparecen solos de la lista.
  const teacherId = getMockSession()?.teacherId;
  const requests = React.useMemo(
    () => buildRequests(state, teacherId),
    [state, teacherId],
  );
  const history = React.useMemo(
    () => buildHistory(state, teacherId),
    [state, teacherId],
  );

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = requests.slice(start, start + ITEMS_PER_PAGE);

  // Aceptar cambia el cronograma y suma las horas al reemplazante (lo calcula domain/schedule y domain/hours).
  const handleConfirm = (id: string) => {
    actions.respondReplacement(id, true);
    toast.success("Reemplazo aceptado: ya figura en tu cronograma.");
  };

  const handleReject = (id: string) => {
    actions.respondReplacement(id, false);
    toast.info("Reemplazo rechazado. Le avisamos al encargado.");
  };

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
      <PageHeader
        title="Reemplazos"
        subtitle="Pedidos para que cubras clases de otros profesores. Si aceptás, la clase aparece en tu cronograma."
      />

      <SegmentedTabs<TabId>
        label="Reemplazos"
        value={activeTab}
        onChange={setActiveTab}
        items={[
          {
            id: "pendientes",
            label: "Pendientes",
            icon: "ti-clock",
            count: requests.length,
          },
          {
            id: "historial",
            label: "Historial",
            icon: "ti-history",
            count: history.length,
          },
        ]}
      />

      {activeTab === "pendientes" ? (
        <div className="flex flex-col gap-4">
          {requests.length === 0 ? (
            <EmptyState
              icon="ti-circle-check"
              title="No tenés pedidos de reemplazo pendientes"
            />
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
      ) : history.length === 0 ? (
        <EmptyState
          icon="ti-history"
          title="Todavía no respondiste ningún reemplazo"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {history.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/60 p-4 shadow-card glass-border"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-white first-letter:uppercase">
                  {replacementTitle(r)}
                </p>
                <p className="text-xs text-gray-400">
                  Titular: {getTeacher(r.originalTeacherId)?.fullName ?? "-"}
                </p>
              </div>
              {r.status === "accepted" ? (
                <StatusBadge tone="success" icon="ti-check">
                  Aceptado
                </StatusBadge>
              ) : (
                <StatusBadge tone="neutral" icon="ti-x">
                  Rechazado
                </StatusBadge>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
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
            className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${"bg-zinc-700/60 text-white"}`}
          >
            {r.category}
          </span>
          {r.isUrgent && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-red-950/60 text-red-400">
              URGENTE
            </span>
          )}
        </div>

        <h2 className="text-white text-lg md:text-xl font-extrabold">
          {r.title}
        </h2>

        <div className="flex items-center gap-2">
          <i className="ti ti-user-circle text-gray-400 text-sm" />
          <span className="text-gray-400 text-[11px] font-semibold tracking-wider">
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
          <span className="text-gray-400 text-xs mt-1">{r.timeLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onReject(r.id)}
            className="px-4 py-2 rounded-xl bg-black border border-zinc-800 text-gray-300 text-[11px] font-bold hover:border-red-500/30 hover:text-red-400 transition-all cursor-pointer"
          >
            Rechazar
          </button>
          <button
            onClick={() => onConfirm(r.id)}
            className="px-4 py-2 rounded-xl bg-lime-400 text-black text-[11px] font-bold hover:brightness-110 active:scale-[0.97] transition-all duration-150 shadow-btn-lime cursor-pointer"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
