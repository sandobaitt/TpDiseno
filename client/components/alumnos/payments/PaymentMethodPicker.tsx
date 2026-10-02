import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/data/payments";
import { cn } from "@/lib/utils";

const METHOD_ICONS: Record<PaymentMethod, string> = {
  cash: "ti-cash",
  debit: "ti-credit-card",
  transfer: "ti-building-bank",
  qr: "ti-qrcode",
};

interface PaymentMethodPickerProps {
  methods: PaymentMethod[];
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

/** Medios de pago aceptados (efectivo, débito, transferencia y QR). */
export function PaymentMethodPicker({
  methods,
  value,
  onChange,
}: PaymentMethodPickerProps) {
  const id = React.useId();
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as PaymentMethod)}
      aria-label="Medio de pago"
      className="grid grid-cols-2 gap-3"
    >
      {methods.map((method) => {
        const selected = method === value;
        return (
          <label
            key={method}
            htmlFor={`${id}-${method}`}
            className={cn(
              // El radio está oculto: el foco del teclado se marca en la tarjeta.
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              selected
                ? "border-primary/70 bg-primary/10"
                : "border-white/[0.07] bg-neutral-900 hover:border-zinc-600",
            )}
          >
            <RadioGroupItem
              id={`${id}-${method}`}
              value={method}
              className="sr-only"
            />
            <i
              className={cn(
                "ti text-2xl",
                METHOD_ICONS[method],
                selected ? "text-primary" : "text-gray-400",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-sm",
                selected ? "font-bold text-white" : "font-medium text-gray-300",
              )}
            >
              {PAYMENT_METHOD_LABELS[method]}
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}
