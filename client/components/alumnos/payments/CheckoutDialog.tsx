import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutPanel } from "./CheckoutPanel";

interface CheckoutDialogProps {
  /** Alumno al que se le cobra (null = cerrado). */
  clientId: string | null;
  onClose: () => void;
  mode?: "staff" | "online";
}

/** Cobro de cuotas en un diálogo: se usa desde Cobros, la ficha y la cuenta del alumno. */
export function CheckoutDialog({
  clientId,
  onClose,
  mode = "staff",
}: CheckoutDialogProps) {
  return (
    <Dialog open={!!clientId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl border-white/[0.08] bg-background p-5 text-white sm:p-6">
        <DialogTitle className="text-lg font-extrabold">
          {mode === "online" ? "Pagar cuota" : "Cobrar cuota"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Cuotas a cobrar, promoción, medio de pago y confirmación.
        </DialogDescription>
        {clientId && (
          <CheckoutPanel clientId={clientId} mode={mode} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
