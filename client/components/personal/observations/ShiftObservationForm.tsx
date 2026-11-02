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
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, inputClasses } from "@/components/common/FormField";
import {
  OBSERVATION_AREAS,
  SHIFT_LABELS,
  type ObservationShift,
} from "@/data/bitacoras";
import { teachersMock } from "@/data/teachers";
import { getMockSession } from "@/data/users";
import { dialogDraft } from "@/hooks/use-draft";
import { nowISO, todayISO } from "@/lib/dates";
import { cleanText } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppState, useStoreActions } from "@/store/StoreProvider";

/** Turno según la hora actual: hasta las 13 mañana, hasta las 18 tarde, después noche. */
function currentShift(): ObservationShift {
  const hour = Number(nowISO().slice(11, 13));
  if (hour < 13) return "manana";
  if (hour < 18) return "tarde";
  return "noche";
}

type Draft = {
  shift: ObservationShift;
  area: string;
  about: string;
  title: string;
  content: string;
  notifyAdmin: boolean;
};

interface ShiftObservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Observación de turno de secretaría (requisito 3.1.16): se asocia a un área o
 * a una persona (profesor o alumno). Le llega al encargado de la sede y, si se
 * marca, también al administrador.
 */
export function ShiftObservationForm({
  open,
  onOpenChange,
}: ShiftObservationFormProps) {
  const state = useAppState();
  const actions = useStoreActions();
  const session = getMockSession();
  const branchId = session?.branchId ?? "br_001";
  const draftKey = `observacion_turno_${session?.id ?? "anon"}`;
  const empty = (): Draft => ({
    shift: currentShift(),
    area: OBSERVATION_AREAS[0],
    about: "",
    title: "",
    content: "",
    notifyAdmin: false,
  });
  const [form, setForm] = React.useState<Draft>(empty);
  const [restored, setRestored] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    title?: string;
    content?: string;
  }>({});

  const teachers = teachersMock.filter(
    (t) => t.status === "active" && t.branchIds.includes(branchId),
  );
  const students = state.clients.filter((c) => c.status === "active");

  // Al abrir, recupera el borrador si había (Wi-Fi inestable).
  React.useEffect(() => {
    if (!open) return;
    const saved = dialogDraft.load<Draft>(draftKey);
    setForm(saved ? { ...empty(), ...saved } : empty());
    setRestored(!!saved);
    setErrors({});
  }, [open, draftKey]);

  React.useEffect(() => {
    if (!open) return;
    if (form.title.trim() || form.content.trim())
      dialogDraft.save<Draft>(draftKey, form);
  }, [open, form, draftKey]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function save(event: React.FormEvent) {
    event.preventDefault();
    const found = {
      title: cleanText(form.title) ? undefined : "Poné un título corto.",
      content: cleanText(form.content) ? undefined : "Escribí la observación.",
    };
    setErrors(found);
    if (found.title || found.content) return;
    const [kind, id] = form.about.split(":");
    const student =
      kind === "c" ? students.find((c) => c.id === id) : undefined;
    actions.addBitacora({
      id: `bit_${Date.now().toString(36)}`,
      authorUserId: session?.id,
      branchId,
      date: todayISO(),
      shift: form.shift,
      area: form.area,
      aboutTeacherId: kind === "t" ? id : undefined,
      clientId: student?.id,
      studentName: student?.fullName,
      title: cleanText(form.title),
      content: cleanText(form.content),
      notifyAdmin: form.notifyAdmin,
      createdAt: nowISO(),
    });
    dialogDraft.clear(draftKey);
    onOpenChange(false);
    toast.success(
      form.notifyAdmin
        ? "Observación guardada. Les avisamos al encargado y al administrador."
        : "Observación guardada. Le avisamos al encargado de la sede.",
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-border bg-card text-foreground">
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              Nueva observación del turno
            </DialogTitle>
            <DialogDescription>
              {restored
                ? "Recuperamos lo que habías escrito."
                : "La ve el encargado de la sede en sus avisos."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Turno" required>
              {(id) => (
                <select
                  id={id}
                  value={form.shift}
                  onChange={(e) =>
                    set("shift", e.target.value as ObservationShift)
                  }
                  className={inputClasses}
                >
                  {(Object.keys(SHIFT_LABELS) as ObservationShift[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {SHIFT_LABELS[s]}
                      </option>
                    ),
                  )}
                </select>
              )}
            </FormField>
            <FormField label="Área" required>
              {(id) => (
                <select
                  id={id}
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  className={inputClasses}
                >
                  {OBSERVATION_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </div>

          <FormField label="Persona (opcional)">
            {(id) => (
              <select
                id={id}
                value={form.about}
                onChange={(e) => set("about", e.target.value)}
                className={inputClasses}
              >
                <option value="">Nadie en particular</option>
                <optgroup label="Profesores">
                  {teachers.map((t) => (
                    <option key={t.id} value={`t:${t.id}`}>
                      {t.fullName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Alumnos">
                  {students.map((c) => (
                    <option key={c.id} value={`c:${c.id}`}>
                      {c.fullName}
                    </option>
                  ))}
                </optgroup>
              </select>
            )}
          </FormField>

          <FormField label="Título" required error={errors.title}>
            {(id) => (
              <input
                id={id}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                maxLength={80}
                className={cn(inputClasses, errors.title && "border-danger")}
              />
            )}
          </FormField>
          <FormField label="Observación" required error={errors.content}>
            {(id) => (
              <textarea
                id={id}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                rows={4}
                maxLength={600}
                className={cn(
                  inputClasses,
                  "resize-y",
                  errors.content && "border-danger",
                )}
              />
            )}
          </FormField>

          <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm text-foreground/80">
            <Checkbox
              checked={form.notifyAdmin}
              onCheckedChange={(v) => set("notifyAdmin", v === true)}
              className="h-5 w-5 rounded-[4px]"
            />
            Avisarle también al administrador
          </label>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
  );
}
