import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SectionCard } from "@/components/common/SectionCard";
import { FormField, inputClasses } from "@/components/common/FormField";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  COMMUNICATION_TEMPLATES,
  type AudienceKind,
  type CommunicationTemplateId,
} from "@/data/communications";
import { branchesMock } from "@/data/branches";
import { plansMock } from "@/data/plans";
import { getMockSession } from "@/data/users";
import { personalize, resolveAudience } from "@/domain/communications";
import { useDraft } from "@/hooks/use-draft";
import { nowISO, todayISO } from "@/lib/dates";
import { cleanText } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";

const AUDIENCES: { kind: AudienceKind; label: string }[] = [
  { kind: "todos", label: "Todos los alumnos activos" },
  { kind: "sede", label: "Los de una sede" },
  { kind: "plan", label: "Los de un plan" },
  { kind: "por_vencer", label: "Con la cuota por vencer" },
  { kind: "deudores", label: "Con cuota vencida o bloqueados" },
  { kind: "alumno", label: "Un alumno en particular" },
];

interface Draft {
  templateId: CommunicationTemplateId;
  subject: string;
  body: string;
  kind: AudienceKind;
  branchId: string;
  planId: string;
  clientId: string;
  byEmail: boolean;
}

const PREVIEW_NAMES = 5;

/** Redactar y enviar una comunicación (CU 14). Se guarda como borrador mientras se escribe. */
export function ComposeMessage() {
  const state = useAppState();
  const actions = useStoreActions();
  const session = getMockSession();
  const id = React.useId();
  const today = todayISO();
  const branches = branchesMock.filter((b) => b.status === "active");
  const plans = plansMock.filter((p) => p.status === "active");
  const firstTemplate = COMMUNICATION_TEMPLATES[0];
  const draft = useDraft<Draft>("comunicacion", {
    templateId: firstTemplate.id,
    subject: firstTemplate.subject,
    body: firstTemplate.body,
    kind: "por_vencer",
    branchId: session?.branchId ?? branches[0].id,
    planId: plans[0].id,
    clientId: "",
    byEmail: true,
  });
  const form = draft.value;
  const [errors, setErrors] = React.useState<{
    subject?: string;
    body?: string;
    recipients?: string;
  }>({});
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    draft.setValue((d) => ({ ...d, [key]: value }));

  const audience = {
    kind: form.kind,
    branchId: form.kind === "sede" ? form.branchId : undefined,
    planId: form.kind === "plan" ? form.planId : undefined,
    clientId: form.kind === "alumno" ? form.clientId : undefined,
  };
  const recipients = resolveAudience(
    audience,
    state.clients,
    (c) => selectAccount(state, c, today).status,
  );
  const activeClients = state.clients
    .filter((c) => c.status === "active")
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  function audienceLabel(): string {
    switch (form.kind) {
      case "sede":
        return `Sede ${branches.find((b) => b.id === form.branchId)?.name ?? ""}`;
      case "plan":
        return `Plan ${plans.find((p) => p.id === form.planId)?.name ?? ""}`;
      case "alumno":
        return recipients[0]?.fullName ?? "Un alumno";
      default:
        return AUDIENCES.find((a) => a.kind === form.kind)!.label;
    }
  }

  function chooseTemplate(templateId: CommunicationTemplateId) {
    const template = COMMUNICATION_TEMPLATES.find((t) => t.id === templateId)!;
    draft.setValue((d) => ({
      ...d,
      templateId,
      subject: template.subject,
      body: template.body,
    }));
    setErrors({});
  }

  function review() {
    const found = {
      subject: cleanText(form.subject) ? undefined : "Escribí el asunto.",
      body:
        cleanText(form.body.replace(/\{nombre\}/gi, "")).length > 5
          ? undefined
          : "Escribí el mensaje.",
      recipients:
        recipients.length > 0 ? undefined : "No hay alumnos con ese criterio.",
    };
    setErrors(found);
    if (!found.subject && !found.body && !found.recipients)
      setConfirmOpen(true);
  }

  function send() {
    actions.sendCommunication({
      id: `com_${Date.now().toString(36)}`,
      templateId: form.templateId,
      subject: cleanText(form.subject),
      body: form.body.trim(),
      audience,
      audienceLabel: audienceLabel(),
      recipientIds: recipients.map((c) => c.id),
      byEmail: form.byEmail,
      sentBy: session?.id ?? "sistema",
      sentAt: nowISO(),
    });
    toast.success(
      `Comunicación enviada a ${recipients.length} ${recipients.length === 1 ? "alumno" : "alumnos"}.`,
    );
    draft.clear();
    setErrors({});
  }

  return (
    <SectionCard title="Nueva comunicación" icon="ti-send">
      {draft.restored && (
        <p className="flex items-center gap-2 rounded-xl border border-warning/25 bg-warning/5 px-3 py-2 text-sm text-gray-200">
          <i className="ti ti-history text-warning" aria-hidden="true" />
          Recuperamos un mensaje que quedó sin enviar.
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

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-xs font-semibold text-gray-300">
          Plantilla
        </legend>
        <RadioGroup
          value={form.templateId}
          onValueChange={(v) => chooseTemplate(v as CommunicationTemplateId)}
          className="grid grid-cols-2 gap-2 lg:grid-cols-4"
        >
          {COMMUNICATION_TEMPLATES.map((t) => (
            <label
              key={t.id}
              htmlFor={`${id}-${t.id}`}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-1.5 rounded-xl border p-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                form.templateId === t.id
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
                  "ti text-xl",
                  t.icon,
                  form.templateId === t.id ? "text-primary" : "text-gray-400",
                )}
                aria-hidden="true"
              />
              <span className="font-semibold">{t.label}</span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Destinatarios" required error={errors.recipients}>
          {(fieldId, describedBy) => (
            <select
              id={fieldId}
              value={form.kind}
              onChange={(e) => set("kind", e.target.value as AudienceKind)}
              aria-describedby={describedBy}
              aria-invalid={!!errors.recipients}
              className={inputClasses}
            >
              {AUDIENCES.map((a) => (
                <option key={a.kind} value={a.kind}>
                  {a.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
        {form.kind === "sede" && (
          <FormField label="Sede">
            {(fieldId) => (
              <select
                id={fieldId}
                value={form.branchId}
                onChange={(e) => set("branchId", e.target.value)}
                className={inputClasses}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}
        {form.kind === "plan" && (
          <FormField label="Plan">
            {(fieldId) => (
              <select
                id={fieldId}
                value={form.planId}
                onChange={(e) => set("planId", e.target.value)}
                className={inputClasses}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}
        {form.kind === "alumno" && (
          <FormField label="Alumno">
            {(fieldId) => (
              <select
                id={fieldId}
                value={form.clientId}
                onChange={(e) => set("clientId", e.target.value)}
                className={inputClasses}
              >
                <option value="">Elegí un alumno</option>
                {activeClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} · DNI {c.dni}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}
      </div>

      <p
        className="rounded-xl bg-neutral-800/50 px-4 py-3 text-sm text-gray-300"
        aria-live="polite"
      >
        <i className="ti ti-users mr-1.5 text-primary" aria-hidden="true" />
        Le llega a{" "}
        <span className="font-bold text-white">{recipients.length}</span>{" "}
        {recipients.length === 1 ? "alumno" : "alumnos"}
        {recipients.length > 0 &&
          `: ${recipients
            .slice(0, PREVIEW_NAMES)
            .map((c) => c.fullName)
            .join(
              ", ",
            )}${recipients.length > PREVIEW_NAMES ? ` y ${recipients.length - PREVIEW_NAMES} más` : ""}.`}
      </p>

      <FormField label="Asunto" required error={errors.subject}>
        {(fieldId, describedBy) => (
          <input
            id={fieldId}
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            aria-invalid={!!errors.subject}
            aria-describedby={describedBy}
            className={inputClasses}
          />
        )}
      </FormField>
      <FormField
        label="Mensaje"
        required
        hint="Escribí {nombre} y cada alumno ve su nombre."
        error={errors.body}
      >
        {(fieldId, describedBy) => (
          <textarea
            id={fieldId}
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            rows={4}
            aria-invalid={!!errors.body}
            aria-describedby={describedBy}
            className={cn(inputClasses, "resize-y")}
          />
        )}
      </FormField>

      <label
        htmlFor={`${id}-email`}
        className="flex min-h-[40px] cursor-pointer items-center gap-3 text-sm text-gray-200"
      >
        <Checkbox
          id={`${id}-email`}
          checked={form.byEmail}
          onCheckedChange={(checked) => set("byEmail", checked === true)}
          className="h-5 w-5 rounded-md"
        />
        Mandarlo también por email (además de la app)
      </label>

      {recipients[0] && cleanText(form.body) && (
        <div className="rounded-xl border border-white/[0.06] p-4">
          <p className="mb-1 text-xs font-semibold text-muted-foreground">
            Vista previa para {recipients[0].fullName}
          </p>
          <p className="text-sm font-bold text-white">
            {form.subject || "(sin asunto)"}
          </p>
          <p className="mt-1 text-sm text-gray-300">
            {personalize(form.body, recipients[0])}
          </p>
        </div>
      )}

      <Button
        type="button"
        onClick={review}
        className="self-start rounded-xl font-bold"
      >
        <i className="ti ti-send text-base" aria-hidden="true" />
        Enviar
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`¿Enviar a ${recipients.length} ${recipients.length === 1 ? "alumno" : "alumnos"}?`}
        description={`«${cleanText(form.subject)}» · ${audienceLabel()}${form.byEmail ? " · también por email" : ""}.`}
        confirmLabel="Enviar"
        iconClassName="ti ti-send"
        onConfirm={send}
      />
    </SectionCard>
  );
}
