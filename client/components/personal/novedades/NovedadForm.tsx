import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SectionCard } from "@/components/common/SectionCard";
import { FormField, inputClasses } from "@/components/common/FormField";
import { NOVEDAD_TYPE_LABELS, type NovedadType } from "@/data/novedades";
import { scheduleMock } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { getTeacher, teachersMock } from "@/data/teachers";
import { branchesMock } from "@/data/branches";
import { getMockSession } from "@/data/users";
import { branchName } from "@/components/cronograma/weekView";
import { useDraft } from "@/hooks/use-draft";
import { nowISO, todayISO } from "@/lib/dates";
import { cleanText } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useStoreActions } from "@/store/StoreProvider";

const TYPES: { id: NovedadType; icon: string; hint: string }[] = [
  {
    id: "absence",
    icon: "ti-user-off",
    hint: "Un profesor no viene a su turno.",
  },
  {
    id: "incident",
    icon: "ti-alert-triangle",
    hint: "Algo que pasó en la sede o en una clase.",
  },
  {
    id: "change",
    icon: "ti-arrows-exchange",
    hint: "Cambio de horario, de sala o de profesor.",
  },
  {
    id: "normal",
    icon: "ti-info-circle",
    hint: "Cualquier otro aviso interno.",
  },
];

const WEEKDAYS = ["", "lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

interface Draft {
  type: NovedadType | "";
  link: string; // "profesor:tc_001" o "clase:sl_c01"
  branchId: string;
  date: string;
  time: string;
  detail: string;
  notifyTeacher: boolean;
}

/** Registrar una novedad interna (CU 4 de Personal). Queda con sede y autor. */
export function NovedadForm() {
  const actions = useStoreActions();
  const session = getMockSession();
  const id = React.useId();
  const fixedBranch = session?.branchId;
  const now = nowISO();
  const draft = useDraft<Draft>("novedad", {
    type: "",
    link: "",
    branchId: fixedBranch ?? branchesMock[0].id,
    date: now.slice(0, 10),
    time: now.slice(11, 16),
    detail: "",
    notifyTeacher: true,
  });
  const form = draft.value;
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof Draft, string>>
  >({});
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    draft.setValue((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const branch = fixedBranch ?? form.branchId;
  const teachers = teachersMock.filter(
    (t) => t.status === "active" && t.branchIds.includes(branch),
  );
  const slots = scheduleMock.filter((s) => s.branchId === branch);
  const [linkType, linkId] = form.link.split(":") as [
    "profesor" | "clase" | "",
    string,
  ];
  const linkedTeacher =
    linkType === "profesor"
      ? getTeacher(linkId)
      : linkType === "clase"
        ? getTeacher(slots.find((s) => s.id === linkId)?.teacherId)
        : undefined;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const found: Partial<Record<keyof Draft, string>> = {
      type: form.type ? undefined : "Elegí el tipo de novedad.",
      link: form.link ? undefined : "Elegí el profesor o la clase.",
      detail:
        cleanText(form.detail).length >= 5 ? undefined : "Contá qué pasó.",
      date:
        form.date && form.date <= todayISO()
          ? undefined
          : "La fecha no puede ser futura.",
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    const slot =
      linkType === "clase" ? slots.find((s) => s.id === linkId) : undefined;
    const entityName =
      linkType === "profesor"
        ? (linkedTeacher?.fullName ?? "Profesor")
        : `${slot ? getActivityName(slot.activityId) : "Clase"} · ${branchName(branch)}`;
    actions.addNovedad({
      id: `nov_${Date.now().toString(36)}`,
      type: form.type as NovedadType,
      entityType: linkType === "clase" ? "clase" : "profesor",
      entityId: linkId,
      entityName,
      branchId: branch,
      timestamp: `${form.date}T${form.time || "00:00"}:00`,
      detail: cleanText(form.detail),
      status: "in_progress",
      createdBy: session?.id ?? "sistema",
      notifyTeacher: !!linkedTeacher && form.notifyTeacher,
    });
    toast.success(
      linkedTeacher && form.notifyTeacher
        ? `Novedad registrada. Le avisamos a ${linkedTeacher.fullName}.`
        : "Novedad registrada.",
    );
    draft.clear();
    setErrors({});
  }

  return (
    <SectionCard title="Registrar novedad" icon="ti-speakerphone">
      {draft.restored && (
        <p className="flex items-center gap-2 rounded-xl border border-warning/25 bg-warning/5 px-3 py-2 text-sm text-gray-200">
          <i className="ti ti-history text-warning" aria-hidden="true" />
          Recuperamos una novedad sin guardar.
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => draft.clear()}
            className="ml-auto h-auto px-0 text-warning"
          >
            Descartar
          </Button>
        </p>
      )}
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-semibold text-gray-300">
            Tipo <span className="text-danger">*</span>
          </legend>
          <RadioGroup
            value={form.type}
            onValueChange={(v) => set("type", v as NovedadType)}
            aria-invalid={!!errors.type}
            className="grid grid-cols-2 gap-2"
          >
            {TYPES.map((t) => (
              <label
                key={t.id}
                htmlFor={`${id}-${t.id}`}
                title={t.hint}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  form.type === t.id
                    ? "border-primary/60 bg-primary/10 text-white"
                    : "border-white/[0.07] text-gray-300 hover:border-zinc-500",
                )}
              >
                <RadioGroupItem
                  id={`${id}-${t.id}`}
                  value={t.id}
                  className="sr-only"
                />
                <i
                  className={cn(
                    "ti text-lg",
                    t.icon,
                    form.type === t.id ? "text-primary" : "text-gray-400",
                  )}
                  aria-hidden="true"
                />
                {NOVEDAD_TYPE_LABELS[t.id]}
              </label>
            ))}
          </RadioGroup>
          {errors.type && (
            <p role="alert" className="text-xs font-medium text-danger">
              {errors.type}
            </p>
          )}
        </fieldset>

        {!fixedBranch && (
          <FormField label="Sede">
            {(fieldId) => (
              <select
                id={fieldId}
                value={form.branchId}
                onChange={(e) => {
                  set("branchId", e.target.value);
                  set("link", "");
                }}
                className={inputClasses}
              >
                {branchesMock
                  .filter((b) => b.status === "active")
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            )}
          </FormField>
        )}

        <FormField
          label="¿Sobre quién o qué clase?"
          required
          error={errors.link}
        >
          {(fieldId, describedBy) => (
            <select
              id={fieldId}
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              aria-invalid={!!errors.link}
              aria-describedby={describedBy}
              className={inputClasses}
            >
              <option value="">Elegí un profesor o una clase</option>
              <optgroup label="Profesores">
                {teachers.map((t) => (
                  <option key={t.id} value={`profesor:${t.id}`}>
                    {t.fullName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Clases">
                {slots.map((s) => (
                  <option key={s.id} value={`clase:${s.id}`}>
                    {getActivityName(s.activityId)} · {WEEKDAYS[s.weekday]}{" "}
                    {s.start} · {getTeacher(s.teacherId)?.fullName}
                  </option>
                ))}
              </optgroup>
            </select>
          )}
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Fecha" error={errors.date}>
            {(fieldId, describedBy) => (
              <input
                id={fieldId}
                type="date"
                value={form.date}
                max={todayISO()}
                onChange={(e) => set("date", e.target.value)}
                aria-invalid={!!errors.date}
                aria-describedby={describedBy}
                className={inputClasses}
              />
            )}
          </FormField>
          <FormField label="Hora">
            {(fieldId) => (
              <input
                id={fieldId}
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className={inputClasses}
              />
            )}
          </FormField>
        </div>

        <FormField label="Detalle" required error={errors.detail}>
          {(fieldId, describedBy) => (
            <textarea
              id={fieldId}
              value={form.detail}
              onChange={(e) => set("detail", e.target.value)}
              rows={4}
              aria-invalid={!!errors.detail}
              aria-describedby={describedBy}
              className={cn(inputClasses, "resize-y")}
            />
          )}
        </FormField>

        {linkedTeacher && (
          <label
            htmlFor={`${id}-notify`}
            className="flex min-h-[40px] cursor-pointer items-center gap-3 text-sm text-gray-200"
          >
            <Checkbox
              id={`${id}-notify`}
              checked={form.notifyTeacher}
              onCheckedChange={(checked) =>
                set("notifyTeacher", checked === true)
              }
              className="h-5 w-5 rounded-md"
            />
            Avisarle a {linkedTeacher.fullName} (le aparece en su campana)
          </label>
        )}
        {form.type === "absence" && (
          <p className="text-xs text-muted-foreground">
            Acordate de marcar también la ausencia en Asistencia docente.
          </p>
        )}

        <Button type="submit" className="self-start rounded-xl font-bold">
          <i className="ti ti-device-floppy text-base" aria-hidden="true" />
          Registrar novedad
        </Button>
      </form>
    </SectionCard>
  );
}
