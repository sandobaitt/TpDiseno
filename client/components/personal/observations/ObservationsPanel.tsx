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
import { EmptyState } from "@/components/common/EmptyState";
import { FormField, inputClasses } from "@/components/common/FormField";
import type { Bitacora } from "@/data/bitacoras";
import { getTeacher } from "@/data/teachers";
import { scheduleMock } from "@/data/schedule";
import { sessionsBetween } from "@/domain/schedule";
import { addDays, formatDateTime, nowISO, todayISO } from "@/lib/dates";
import { observationClassLabel } from "./classLabel";
import { cleanText } from "@/lib/format";
import { cn } from "@/lib/utils";
import { dialogDraft } from "@/hooks/use-draft";
import { useAppState, useStoreActions } from "@/store/StoreProvider";

interface ObservationsPanelProps {
  teacherId?: string;
}

/** Clases de los últimos días a las que se puede vincular una observación. */
const LINKABLE_DAYS = 7;

/**
 * Observaciones de jornada del profesor (CU 9 de Personal): se vinculan a una
 * clase y fecha, y las ve el encargado de la sede (y el admin).
 */
export function ObservationsPanel({ teacherId }: ObservationsPanelProps) {
  const state = useAppState();
  const actions = useStoreActions();
  const observations = state.bitacoras.filter((b) => b.teacherId === teacherId);
  const students = state.clients.filter((c) => c.status === "active");
  const [selected, setSelected] = React.useState<Bitacora | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [classKey, setClassKey] = React.useState("");
  const today = todayISO();
  const recentClasses = sessionsBetween(
    addDays(today, -LINKABLE_DAYS),
    today,
    scheduleMock,
    state.replacements,
  )
    .filter((s) => s.teacherId === teacherId)
    .reverse();
  const classLabel = observationClassLabel;
  const [errors, setErrors] = React.useState<{
    title?: string;
    content?: string;
  }>({});

  // Borrador (Wi-Fi inestable): si se cierra sin guardar, se recupera al volver a abrir.
  const draftKey = `observacion_${teacherId ?? "sin_profesor"}`;
  const [restored, setRestored] = React.useState(false);
  type Draft = {
    title: string;
    content: string;
    clientId: string;
    classKey: string;
  };

  function openForm() {
    const saved = dialogDraft.load<Draft>(draftKey);
    setTitle(saved?.title ?? "");
    setContent(saved?.content ?? "");
    setClientId(saved?.clientId ?? "");
    setClassKey(
      saved?.classKey ??
        (recentClasses[0]
          ? `${recentClasses[0].slotId}|${recentClasses[0].date}`
          : ""),
    );
    setRestored(!!saved);
    setErrors({});
    setFormOpen(true);
  }

  React.useEffect(() => {
    if (!formOpen) return;
    if (title.trim() || content.trim())
      dialogDraft.save<Draft>(draftKey, { title, content, clientId, classKey });
  }, [formOpen, title, content, clientId, classKey, draftKey]);

  function save(event: React.FormEvent) {
    event.preventDefault();
    const found = {
      title: cleanText(title) ? undefined : "Poné un título corto.",
      content: cleanText(content) ? undefined : "Escribí la observación.",
    };
    setErrors(found);
    if (found.title || found.content) return;
    const student = students.find((c) => c.id === clientId);
    const [slotId, date] = classKey
      ? classKey.split("|")
      : [undefined, undefined];
    const linked = recentClasses.find(
      (s) => s.slotId === slotId && s.date === date,
    );
    actions.addBitacora({
      id: `bit_${Date.now().toString(36)}`,
      teacherId: teacherId ?? "",
      branchId:
        linked?.branchId ?? getTeacher(teacherId)?.branchIds[0] ?? "br_001",
      slotId: linked?.slotId,
      date: linked?.date,
      title: cleanText(title),
      content: cleanText(content),
      clientId: student?.id,
      studentName: student?.fullName,
      createdAt: nowISO(),
    });
    dialogDraft.clear(draftKey);
    setFormOpen(false);
    toast.success("Observación guardada.");
  }

  return (
    <SectionCard
      title="Observaciones"
      icon="ti-notes"
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openForm}
          className="rounded-xl"
        >
          <i className="ti ti-plus text-sm" aria-hidden="true" />
          Nueva
        </Button>
      }
    >
      {observations.length === 0 ? (
        <EmptyState
          icon="ti-notes-off"
          title="Todavía no hay observaciones"
          description="Anotá lo importante de la jornada: lesiones, progresos o incidentes."
        />
      ) : (
        <ul className="flex max-h-[520px] flex-col gap-2 overflow-y-auto">
          {observations.map((b) => (
            <li key={b.id}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelected(b)}
                className="h-auto w-full flex-col items-start gap-1 whitespace-normal rounded-xl border border-white/[0.06] bg-neutral-800/40 px-3 py-3 text-left font-normal"
              >
                <span className="text-sm font-bold text-white">{b.title}</span>
                <span className="line-clamp-2 text-xs text-gray-300">
                  {b.content}
                </span>
                {classLabel(b.slotId, b.date) && (
                  <span className="text-xs text-primary">
                    {classLabel(b.slotId, b.date)}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {formatDateTime(b.createdAt)}
                  {b.studentName && ` · ${b.studentName}`}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-lg rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold">
                  {selected.title}
                </DialogTitle>
                <DialogDescription>
                  {formatDateTime(selected.createdAt)}
                  {classLabel(selected.slotId, selected.date) &&
                    ` · ${classLabel(selected.slotId, selected.date)}`}
                  {selected.studentName && ` · ${selected.studentName}`}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed text-gray-200">
                {selected.content}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              Nueva observación
            </DialogTitle>
            <DialogDescription>
              Queda guardada con la fecha y la hora de hoy.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} noValidate className="flex flex-col gap-4">
            {restored && (
              <p className="flex items-center gap-2 rounded-xl border border-warning/25 bg-warning/5 px-3 py-2 text-sm text-gray-200">
                <i className="ti ti-history text-warning" aria-hidden="true" />
                Recuperamos una observación que no se guardó.
              </p>
            )}
            <FormField label="Título" required error={errors.title}>
              {(id, describedBy) => (
                <input
                  id={id}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-invalid={!!errors.title}
                  aria-describedby={describedBy}
                  className={inputClasses}
                />
              )}
            </FormField>
            <FormField label="Clase">
              {(fieldId) => (
                <select
                  id={fieldId}
                  value={classKey}
                  onChange={(e) => setClassKey(e.target.value)}
                  className={inputClasses}
                >
                  <option value="">Sin clase en particular</option>
                  {recentClasses.map((c) => (
                    <option
                      key={`${c.slotId}|${c.date}`}
                      value={`${c.slotId}|${c.date}`}
                    >
                      {classLabel(c.slotId, c.date)}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField label="Alumno (opcional)">
              {(id) => (
                <select
                  id={id}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={inputClasses}
                >
                  <option value="">Sin alumno en particular</option>
                  {students.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField label="Observación" required error={errors.content}>
              {(id, describedBy) => (
                <textarea
                  id={id}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  aria-invalid={!!errors.content}
                  aria-describedby={describedBy}
                  className={cn(inputClasses, "resize-y")}
                />
              )}
            </FormField>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  dialogDraft.clear(draftKey);
                  setFormOpen(false);
                }}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl font-bold">
                Guardar observación
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
