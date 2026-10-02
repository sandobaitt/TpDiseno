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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUpload } from "@/components/common/FileUpload";
import {
  ATTACHMENT_KIND_LABELS,
  type AttachmentKind,
  type Client,
} from "@/data/clients";
import { getMockSession } from "@/data/users";
import { isMinor } from "@/domain/enrollment";
import { todayISO } from "@/lib/dates";
import type { FileMeta } from "@/lib/files";
import { useStoreActions } from "@/store/StoreProvider";

interface AttachmentDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Adjuntar un certificado médico o la autorización del menor desde la ficha. */
export function AttachmentDialog({
  client,
  open,
  onOpenChange,
}: AttachmentDialogProps) {
  const actions = useStoreActions();
  const id = React.useId();
  const today = todayISO();
  const kinds: AttachmentKind[] = isMinor(client.birthDate, today)
    ? ["certificado", "autorizacion"]
    : ["certificado"];
  const [kind, setKind] = React.useState<AttachmentKind>("certificado");
  const [file, setFile] = React.useState<FileMeta | null>(null);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (open) {
      setKind("certificado");
      setFile(null);
      setError(undefined);
    }
  }, [open]);

  function handleSave() {
    if (!file) {
      setError("Elegí el archivo que querés adjuntar.");
      return;
    }
    const userId = getMockSession()?.id ?? "sistema";
    // Lo adjunta secretaría con el papel a la vista: queda revisado.
    actions.addAttachment(client.id, {
      id: `doc_${Date.now().toString(36)}`,
      kind,
      fileName: file.fileName,
      sizeKb: file.sizeKb,
      uploadedAt: today,
      status: "approved",
      uploadedBy: userId,
      reviewedBy: userId,
      reviewedAt: today,
    });
    toast.success("Documento adjuntado a la ficha.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">
            Adjuntar documento
          </DialogTitle>
          <DialogDescription>
            Se guarda en el legajo de {client.fullName}.
          </DialogDescription>
        </DialogHeader>

        {kinds.length > 1 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-semibold text-gray-300">
              ¿Qué documento es?
            </legend>
            <RadioGroup
              value={kind}
              onValueChange={(value) => setKind(value as AttachmentKind)}
            >
              {kinds.map((k) => (
                <label
                  key={k}
                  htmlFor={`${id}-${k}`}
                  className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 px-3 text-sm text-gray-200 hover:border-zinc-500"
                >
                  <RadioGroupItem
                    id={`${id}-${k}`}
                    value={k}
                    className="h-5 w-5"
                  />
                  {ATTACHMENT_KIND_LABELS[k]}
                </label>
              ))}
            </RadioGroup>
          </fieldset>
        )}

        <FileUpload
          label={ATTACHMENT_KIND_LABELS[kind]}
          required
          value={file}
          onChange={(f) => {
            setFile(f);
            setError(undefined);
          }}
          error={error}
        />

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
            type="button"
            onClick={handleSave}
            className="rounded-xl font-bold"
          >
            Adjuntar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
