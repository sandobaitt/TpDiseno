import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterSelect } from "@/components/common/FilterSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import { FormField, inputClasses } from "@/components/common/FormField";
import {
  NOVEDAD_STATUS_LABELS,
  NOVEDAD_TYPE_LABELS,
  type Novedad,
  type NovedadStatus,
  type NovedadType,
} from "@/data/novedades";
import { branchesMock } from "@/data/branches";
import { getUserName } from "@/data/users";
import { formatDateTime } from "@/lib/dates";
import { cleanText, normalizeText } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useStoreActions } from "@/store/StoreProvider";

const TYPE_STYLE: Record<NovedadType, { tone: StatusTone; icon: string }> = {
  absence: { tone: "danger", icon: "ti-user-off" },
  incident: { tone: "warning", icon: "ti-alert-triangle" },
  change: { tone: "info", icon: "ti-arrows-exchange" },
  normal: { tone: "neutral", icon: "ti-info-circle" },
};

const STATUS_STYLE: Record<NovedadStatus, { tone: StatusTone; icon: string }> =
  {
    in_progress: { tone: "warning", icon: "ti-clock" },
    resolved: { tone: "success", icon: "ti-circle-check" },
    closed: { tone: "neutral", icon: "ti-lock" },
  };

const ANNULLED = "anulada";

interface NovedadesHistoryProps {
  novedades: Novedad[];
  /** Admin: muestra la sede y permite filtrar por sede. */
  showBranch?: boolean;
}

/** Historial de novedades (CU 5 de Personal), con filtros. No se borran: se anulan. */
export function NovedadesHistory({
  novedades,
  showBranch,
}: NovedadesHistoryProps) {
  const actions = useStoreActions();
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [branch, setBranch] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [annulling, setAnnulling] = React.useState<Novedad | null>(null);
  const [reason, setReason] = React.useState("");
  const [reasonError, setReasonError] = React.useState<string>();

  const q = normalizeText(search);
  const filtered = [...novedades]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .filter(
      (n) =>
        (!q || normalizeText(`${n.entityName} ${n.detail}`).includes(q)) &&
        (!type || n.type === type) &&
        (!status ||
          (status === ANNULLED
            ? !!n.annulled
            : !n.annulled && n.status === status)) &&
        (!branch || n.branchId === branch) &&
        (!from || n.timestamp.slice(0, 10) >= from) &&
        (!to || n.timestamp.slice(0, 10) <= to),
    );
  const hasFilters = !!(search || type || status || branch || from || to);

  function clear() {
    setSearch("");
    setType("");
    setStatus("");
    setBranch("");
    setFrom("");
    setTo("");
  }

  function confirmAnnul(event: React.FormEvent) {
    event.preventDefault();
    if (!annulling) return;
    if (cleanText(reason).length < 3) {
      setReasonError("Escribí por qué se anula.");
      return;
    }
    actions.annulNovedad(annulling.id, cleanText(reason));
    toast.success("Novedad anulada. Queda en el historial.");
    setAnnulling(null);
  }

  return (
    <SectionCard title="Historial" icon="ti-history">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar…"
          label="Buscar en las novedades"
        />
        <FilterSelect
          value={type}
          onChange={setType}
          placeholder="Todos los tipos"
          options={(Object.keys(NOVEDAD_TYPE_LABELS) as NovedadType[]).map(
            (t) => ({ value: t, label: NOVEDAD_TYPE_LABELS[t] }),
          )}
        />
        <FilterSelect
          value={status}
          onChange={setStatus}
          placeholder="Todos los estados"
          options={[
            ...(Object.keys(NOVEDAD_STATUS_LABELS) as NovedadStatus[]).map(
              (s) => ({ value: s, label: NOVEDAD_STATUS_LABELS[s] }),
            ),
            { value: ANNULLED, label: "Anuladas" },
          ]}
        />
        {showBranch && (
          <FilterSelect
            value={branch}
            onChange={setBranch}
            placeholder="Todas las sedes"
            options={branchesMock
              .filter((b) => b.status === "active")
              .map((b) => ({ value: b.id, label: b.name }))}
          />
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <FormField label="Desde" className="w-40">
          {(fieldId) => (
            <input
              id={fieldId}
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={cn(inputClasses, "py-2")}
            />
          )}
        </FormField>
        <FormField label="Hasta" className="w-40">
          {(fieldId) => (
            <input
              id={fieldId}
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={cn(inputClasses, "py-2")}
            />
          )}
        </FormField>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            className="rounded-lg text-gray-300"
          >
            Limpiar filtros
          </Button>
        )}
        <span className="ml-auto text-xs text-gray-400" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "novedad" : "novedades"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={hasFilters ? "ti-search-off" : "ti-speakerphone"}
          title={
            hasFilters
              ? "No hay novedades con esos filtros"
              : "Todavía no hay novedades"
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((n) => {
            const typeStyle = TYPE_STYLE[n.type];
            const statusStyle = STATUS_STYLE[n.status];
            return (
              <li
                key={n.id}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-neutral-800/40 p-4",
                  n.annulled && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={typeStyle.tone} icon={typeStyle.icon}>
                    {NOVEDAD_TYPE_LABELS[n.type]}
                  </StatusBadge>
                  <span className="text-sm font-bold text-white">
                    {n.entityName}
                  </span>
                  {showBranch && (
                    <span className="text-xs text-gray-400">
                      · {branchesMock.find((b) => b.id === n.branchId)?.name}
                    </span>
                  )}
                  <span className="ml-auto">
                    {n.annulled ? (
                      <StatusBadge tone="neutral" icon="ti-ban">
                        Anulada
                      </StatusBadge>
                    ) : (
                      <StatusBadge
                        tone={statusStyle.tone}
                        icon={statusStyle.icon}
                      >
                        {NOVEDAD_STATUS_LABELS[n.status]}
                      </StatusBadge>
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-200">{n.detail}</p>
                <p className="text-xs text-gray-400">
                  {formatDateTime(n.timestamp)} · registró{" "}
                  {getUserName(n.createdBy)}
                  {n.notifyTeacher && " · se avisó al profesor"}
                </p>
                {n.annulled && (
                  <p className="text-xs text-gray-300">
                    Anulada por {getUserName(n.annulled.by)} el{" "}
                    {formatDateTime(n.annulled.at)}: {n.annulled.reason}
                  </p>
                )}
                {!n.annulled && (
                  <div className="flex flex-wrap gap-2">
                    {n.status === "in_progress" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          actions.resolveNovedad(n.id);
                          toast.success("Novedad marcada como resuelta.");
                        }}
                        className="rounded-lg"
                      >
                        <i
                          className="ti ti-circle-check text-sm"
                          aria-hidden="true"
                        />
                        Marcar resuelta
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAnnulling(n);
                        setReason("");
                        setReasonError(undefined);
                      }}
                      className="rounded-lg text-gray-300"
                    >
                      <i className="ti ti-ban text-sm" aria-hidden="true" />
                      Anular
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={!!annulling}
        onOpenChange={(open) => !open && setAnnulling(null)}
      >
        <DialogContent className="max-w-md rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              Anular la novedad
            </DialogTitle>
            <DialogDescription>
              {annulling?.entityName}. No se borra: queda en el historial como
              anulada, con el motivo.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={confirmAnnul}
            noValidate
            className="flex flex-col gap-4"
          >
            <FormField label="Motivo" required error={reasonError}>
              {(fieldId, describedBy) => (
                <textarea
                  id={fieldId}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setReasonError(undefined);
                  }}
                  rows={2}
                  aria-invalid={!!reasonError}
                  aria-describedby={describedBy}
                  className={cn(inputClasses, "resize-y")}
                />
              )}
            </FormField>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAnnulling(null)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl font-bold">
                Anular
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
