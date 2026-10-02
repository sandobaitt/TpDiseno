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
import { HealthDeclarationFields } from "@/components/alumnos/health/HealthDeclarationFields";
import type { Client } from "@/data/clients";
import {
  isMinor,
  parseDecimal,
  validateHealth,
  type FieldErrors,
  type HealthFormValue,
} from "@/domain/enrollment";
import { todayISO } from "@/lib/dates";
import { cleanText } from "@/lib/format";
import { dialogDraft } from "@/hooks/use-draft";
import { useStoreActions } from "@/store/StoreProvider";

function toForm(client: Client): HealthFormValue {
  const health = client.health;
  return {
    weightKg: health?.weightKg ? String(health.weightKg) : "",
    heightCm: health?.heightCm ? String(health.heightCm) : "",
    conditions: health?.conditions ?? [],
    history: health?.history ?? "",
    bloodType: health?.bloodType ?? "",
    // Al actualizarla, hay que volver a aceptar la declaración.
    accepted: false,
  };
}

interface HealthEditDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Completar o actualizar la declaración jurada desde la ficha. */
export function HealthEditDialog({
  client,
  open,
  onOpenChange,
}: HealthEditDialogProps) {
  const actions = useStoreActions();
  const [form, setForm] = React.useState<HealthFormValue>(() => toForm(client));
  const [errors, setErrors] = React.useState<FieldErrors<HealthFormValue>>({});
  const formRef = React.useRef<HTMLFormElement>(null);

  // Borrador (Wi-Fi inestable): si se cierra sin guardar, lo cargado no se pierde.
  const draftKey = `ddjj_${client.id}`;
  const initial = React.useRef<HealthFormValue>(toForm(client));
  const [restored, setRestored] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      initial.current = toForm(client);
      const saved = dialogDraft.load<HealthFormValue>(draftKey);
      setForm(saved ?? initial.current);
      setRestored(!!saved);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client.id]);

  React.useEffect(() => {
    if (!open) return;
    if (JSON.stringify(form) !== JSON.stringify(initial.current))
      dialogDraft.save(draftKey, form);
  }, [open, form, draftKey]);

  function discardDraft() {
    dialogDraft.clear(draftKey);
    setForm(initial.current);
    setRestored(false);
  }

  React.useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [errors]);

  const guardian = client.guardian;
  const signedBy =
    isMinor(client.birthDate, todayISO()) && guardian
      ? `${guardian.fullName} (${guardian.relationship.toLowerCase()})`
      : client.fullName;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validateHealth(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    actions.saveHealth(client.id, {
      ...client.health,
      weightKg: parseDecimal(form.weightKg),
      heightCm: parseDecimal(form.heightCm),
      conditions: form.conditions,
      history: cleanText(form.history) || undefined,
      bloodType: form.bloodType || undefined,
      signedAt: todayISO(),
      signedBy,
    });
    dialogDraft.clear(draftKey);
    toast.success("Declaración jurada actualizada.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">
            Declaración jurada de salud
          </DialogTitle>
          <DialogDescription>
            {client.fullName}. Completala junto con quien la firma.
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          {restored && (
            <p className="flex flex-wrap items-center gap-2 rounded-xl border border-warning/25 bg-warning/5 px-3 py-2 text-sm text-gray-200">
              <i className="ti ti-history text-warning" aria-hidden="true" />
              Recuperamos lo que habías cargado y no se guardó.
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={discardDraft}
                className="ml-auto h-auto px-0 text-warning"
              >
                Descartar
              </Button>
            </p>
          )}
          <HealthDeclarationFields
            value={form}
            onChange={(key, value) => setForm((f) => ({ ...f, [key]: value }))}
            errors={errors}
            signerName={signedBy}
          />
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                dialogDraft.clear(draftKey);
                onOpenChange(false);
              }}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="submit" className="rounded-xl font-bold">
              Guardar declaración
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
