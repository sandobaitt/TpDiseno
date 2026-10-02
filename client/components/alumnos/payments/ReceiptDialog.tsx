import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/data/payments";
import { ReceiptDetails } from "./ReceiptDetails";

interface ReceiptDialogProps {
  /** Pago a mostrar (null = cerrado). */
  payment: Payment | null;
  clientName: string;
  onClose: () => void;
}

/** Ver o imprimir el recibo digital de un pago. */
export function ReceiptDialog({
  payment,
  clientName,
  onClose,
}: ReceiptDialogProps) {
  return (
    <Dialog open={!!payment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
        {payment && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-extrabold">
                Recibo {payment.receiptNumber}
              </DialogTitle>
              <DialogDescription>
                Comprobante del pago de {clientName}.
              </DialogDescription>
            </DialogHeader>
            <ReceiptDetails payment={payment} clientName={clientName} />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 rounded-xl"
              >
                <i className="ti ti-printer text-base" aria-hidden="true" />
                Imprimir
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl font-bold"
              >
                Cerrar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
