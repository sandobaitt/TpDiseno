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
import { FormField, inputClasses } from "@/components/common/FormField";
import type { Client } from "@/data/clients";
import { cleanText } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useStoreActions } from "@/store/StoreProvider";

const REASONS = [
  "Se mudó",
  "Motivos económicos",
  "Motivos de salud",
  "Se cambió de gimnasio",
  "Otro motivo",
];

interface DeactivateDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Baja lógica con motivo (CU 11): queda inactivo y conserva su historial. */
export function DeactivateDialog({
  client,
  open,
  onOpenChange,
}: DeactivateDialogProps) {
  const actions = useStoreActions();
  const [reason, setReason] = React.useState("");
  const [detail, setDetail] = React.useState("");
  const [errors, setErrors] = React.useState<{
    reason?: string;
    detail?: string;
  }>({});

  React.useEffect(() => {
    if (open) {
      setReason("");
      setDetail("");
      setErrors({});
    }
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = {
      reason: reason ? undefined : "Elegí el motivo de la baja.",
      detail:
        reason === "Otro motivo" && cleanText(detail).length < 3
          ? "Contá brevemente el motivo."
          : undefined,
    };
    setErrors(found);
    if (found.reason || found.detail) return;
    const text = cleanText(detail) ? `${reason}: ${cleanText(detail)}` : reason;
    actions.deactivateClient(client.id, text);
    toast.success(
      `Baja de ${client.fullName} registrada. Se conserva el historial.`,
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">
            Dar de baja a {client.fullName}
          </DialogTitle>
          <DialogDescription>
            La inscripción queda inactiva: no puede ingresar y no se le generan
            cuotas nuevas. Su historial se conserva y se puede reactivar.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField label="Motivo" required error={errors.reason}>
            {(id, describedBy) => (
              <select
                id={id}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                aria-invalid={!!errors.reason}
                aria-describedby={describedBy}
                className={inputClasses}
              >
                <option value="">Elegí una opción</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
          </FormField>
          <FormField
            label="Detalle"
            required={reason === "Otro motivo"}
            hint="Opcional, salvo que elijas «Otro motivo»."
            error={errors.detail}
          >
            {(id, describedBy) => (
              <textarea
                id={id}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={2}
                aria-invalid={!!errors.detail}
                aria-describedby={describedBy}
                className={cn(inputClasses, "resize-y")}
              />
            )}
          </FormField>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-danger font-bold text-neutral-950 hover:bg-danger/90"
            >
              Dar de baja
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
