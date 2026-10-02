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

interface RestrictDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Restricción de acceso manual (CU 5): además del bloqueo automático por deuda. */
export function RestrictDialog({
  client,
  open,
  onOpenChange,
}: RestrictDialogProps) {
  const actions = useStoreActions();
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (open) {
      setReason("");
      setError(undefined);
    }
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const clean = cleanText(reason);
    if (clean.length < 5) {
      setError("Escribí el motivo (por ejemplo, «Falta el apto físico»).");
      return;
    }
    actions.restrictClient(client.id, clean);
    toast.success(`Acceso de ${client.fullName} restringido.`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">
            Restringir el acceso de {client.fullName}
          </DialogTitle>
          <DialogDescription>
            No va a poder ingresar ni marcar asistencia hasta que se quite la
            restricción. Queda registrado quién la aplicó.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField label="Motivo" required error={error}>
            {(id, describedBy) => (
              <textarea
                id={id}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(undefined);
                }}
                rows={3}
                autoFocus
                aria-invalid={!!error}
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
              Restringir acceso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
