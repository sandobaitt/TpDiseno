import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField, inputClasses } from "@/components/common/FormField";
import type { Branch } from "@/data/branches";
import type { Plan } from "@/data/plans";
import { getActivityName } from "@/data/activities";
import { MAX_START_DAYS_AHEAD, enrollmentCharge } from "@/domain/enrollment";
import { addDays, todayISO } from "@/lib/dates";
import { formatARS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EnrollmentChargeBox } from "./EnrollmentChargeBox";
import type { StepProps } from "./types";

interface PlanStepProps extends StepProps {
  plans: Plan[];
  branches: Branch[];
}

/** Paso 4: plan, sede principal y fecha de inicio, con la cuota de alta calculada. */
export function PlanStep({
  draft,
  errors,
  set,
  plans,
  branches,
}: PlanStepProps) {
  const id = React.useId();
  const today = todayISO();
  const selectedPlan = plans.find((p) => p.id === draft.planId);
  const validStart =
    !!draft.startDate &&
    draft.startDate >= today &&
    draft.startDate <= addDays(today, MAX_START_DAYS_AHEAD);

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-xs font-semibold text-gray-300">
          Plan <span className="text-danger">*</span>
        </legend>
        <RadioGroup
          value={draft.planId}
          onValueChange={(value) => set("planId", value)}
          aria-invalid={!!errors.planId}
          aria-describedby={errors.planId ? `${id}-plan-error` : undefined}
          className="gap-2.5"
        >
          {plans.map((plan) => {
            const selected = plan.id === draft.planId;
            return (
              <label
                key={plan.id}
                htmlFor={`${id}-${plan.id}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  selected
                    ? "border-primary/60 bg-primary/10"
                    : "border-zinc-700 bg-neutral-800/40 hover:border-zinc-500",
                )}
              >
                <RadioGroupItem
                  id={`${id}-${plan.id}`}
                  value={plan.id}
                  className="mt-1 h-5 w-5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span
                      className={cn(
                        "font-bold",
                        selected ? "text-primary" : "text-white",
                      )}
                    >
                      {plan.name}
                    </span>
                    <span className="font-extrabold text-white">
                      {formatARS(plan.monthlyPriceArs)}
                      <span className="text-xs font-medium text-muted-foreground">
                        {" "}
                        por mes
                      </span>
                    </span>
                  </div>
                  {plan.description && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      {plan.description}
                    </p>
                  )}
                  <ul
                    className="mt-2 flex flex-wrap gap-1.5"
                    aria-label={`Actividades de ${plan.name}`}
                  >
                    {plan.activityIds.map((activityId) => (
                      <li
                        key={activityId}
                        className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-gray-300"
                      >
                        {getActivityName(activityId)}
                      </li>
                    ))}
                  </ul>
                </div>
              </label>
            );
          })}
        </RadioGroup>
        {errors.planId && (
          <p
            id={`${id}-plan-error`}
            role="alert"
            className="flex items-center gap-1 text-xs font-medium text-danger"
          >
            <i className="ti ti-alert-circle text-sm" aria-hidden="true" />
            {errors.planId}
          </p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Sede principal"
          required
          hint="Puede entrenar en cualquier sede; esta es la que figura en su ficha."
          error={errors.branchId}
        >
          {(fieldId, describedBy) => (
            <select
              id={fieldId}
              value={draft.branchId}
              onChange={(e) => set("branchId", e.target.value)}
              aria-invalid={!!errors.branchId}
              aria-describedby={describedBy}
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
        <FormField label="Fecha de inicio" required error={errors.startDate}>
          {(fieldId, describedBy) => (
            <input
              id={fieldId}
              type="date"
              min={today}
              max={addDays(today, MAX_START_DAYS_AHEAD)}
              value={draft.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              aria-invalid={!!errors.startDate}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
      </div>

      {selectedPlan && validStart && (
        <EnrollmentChargeBox
          charge={enrollmentCharge(selectedPlan, draft.startDate)}
        />
      )}
    </div>
  );
}
