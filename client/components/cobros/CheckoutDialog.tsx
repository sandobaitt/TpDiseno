import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentCheckoutContent } from "./PaymentCheckoutContent";

interface CheckoutDialogProps {
  /** Alumno al que se le cobra (null = cerrado). */
  clientId: string | null;
  onClose: () => void;
}

/** Cobro de cuota en un diálogo: se usa desde Cobros y desde la ficha del alumno. */
export function CheckoutDialog({ clientId, onClose }: CheckoutDialogProps) {
  return (
    <Dialog open={!!clientId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto border-zinc-800 bg-stone-950 text-white [&_.lucide-x]:h-6 [&_.lucide-x]:w-6">
        <DialogTitle className="sr-only">Cobrar cuota</DialogTitle>
        <DialogDescription className="sr-only">
          Detalle de lo adeudado, medio de pago y confirmación.
        </DialogDescription>
        <div className="p-3">
          {clientId && (
            <PaymentCheckoutContent clientId={clientId} onClose={onClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
