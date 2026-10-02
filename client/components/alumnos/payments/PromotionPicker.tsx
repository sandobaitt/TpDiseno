import * as React from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { inputClasses } from "@/components/common/FormField";
import type { Promotion } from "@/data/promotions";
import type { PromotionCheck } from "@/domain/promotions";
import { cn } from "@/lib/utils";

const NONE = "ninguna";

interface PromotionPickerProps {
  /** Promociones vigentes para elegir, con el resultado de sus condiciones. */
  options: { promo: Promotion; check: PromotionCheck }[];
  /** Promoción elegida de la lista ("" = ninguna). */
  selectedId: string;
  onSelect: (id: string) => void;
  /** Cupón aplicado (reemplaza a la de la lista). */
  coupon?: Promotion;
  onApplyCoupon: (code: string) => string | null;
  onRemoveCoupon: () => void;
}

/** Elegir una promoción vigente o escribir un cupón. Se aplica una sola por cobro. */
export function PromotionPicker({
  options,
  selectedId,
  onSelect,
  coupon,
  onApplyCoupon,
  onRemoveCoupon,
}: PromotionPickerProps) {
  const id = React.useId();
  const [code, setCode] = React.useState("");
  const [couponError, setCouponError] = React.useState<string | null>(null);

  function apply() {
    const error = onApplyCoupon(code);
    setCouponError(error);
    if (!error) setCode("");
  }

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        value={coupon ? "" : selectedId || NONE}
        onValueChange={(value) => onSelect(value === NONE ? "" : value)}
        aria-label="Promoción"
        className="gap-2"
      >
        {[
          { promo: undefined, check: { ok: true } as PromotionCheck },
          ...options,
        ].map(({ promo, check }) => {
          const value = promo?.id ?? NONE;
          const itemId = `${id}-${value}`;
          return (
            <label
              key={value}
              htmlFor={itemId}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5",
                check.ok
                  ? "cursor-pointer hover:border-zinc-600"
                  : "cursor-not-allowed opacity-60",
              )}
            >
              <RadioGroupItem
                id={itemId}
                value={value}
                disabled={!check.ok}
                className="mt-0.5 h-5 w-5"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="text-sm font-semibold text-white">
                    {promo ? promo.name : "Sin promoción"}
                  </span>
                  {promo && (
                    <span className="text-sm font-bold text-primary">
                      −{promo.percent}%
                    </span>
                  )}
                </span>
                {promo && (
                  <span
                    className={cn(
                      "block text-xs",
                      check.ok ? "text-gray-400" : "text-warning",
                    )}
                  >
                    {check.ok
                      ? (check.detail ?? promo.description)
                      : check.reason}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </RadioGroup>

      {coupon ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
          <p className="text-sm text-white">
            <i
              className="ti ti-ticket mr-1.5 text-primary"
              aria-hidden="true"
            />
            Cupón <span className="font-bold">{coupon.code}</span> aplicado (−
            {coupon.percent}%)
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemoveCoupon}
            className="rounded-lg text-gray-300"
          >
            Quitar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${id}-coupon`}
            className="text-xs font-semibold text-gray-300"
          >
            ¿Tiene un cupón?
          </label>
          <div className="flex gap-2">
            <input
              id={`${id}-coupon`}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCouponError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
              }}
              placeholder="Código del cupón"
              autoComplete="off"
              aria-invalid={!!couponError}
              aria-describedby={couponError ? `${id}-coupon-error` : undefined}
              className={cn(inputClasses, "uppercase placeholder:normal-case")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={apply}
              disabled={!code.trim()}
              className="h-auto rounded-xl"
            >
              Aplicar
            </Button>
          </div>
          {couponError && (
            <p
              id={`${id}-coupon-error`}
              role="alert"
              className="flex items-center gap-1 text-xs font-medium text-danger"
            >
              <i className="ti ti-alert-circle text-sm" aria-hidden="true" />
              {couponError}
            </p>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Las promociones no se acumulan: se aplica una por cobro.
      </p>
    </div>
  );
}
