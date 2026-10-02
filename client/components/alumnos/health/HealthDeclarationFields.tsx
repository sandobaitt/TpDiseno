import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, inputClasses } from "@/components/common/FormField";
import { BLOOD_TYPES, HEALTH_CONDITIONS } from "@/data/health";
import type { FieldErrors, HealthFormValue } from "@/domain/enrollment";
import { cn } from "@/lib/utils";

interface HealthDeclarationFieldsProps {
  value: HealthFormValue;
  onChange: <K extends keyof HealthFormValue>(
    key: K,
    value: HealthFormValue[K],
  ) => void;
  errors: FieldErrors<HealthFormValue>;
  /** Quién firma la declaración: el alumno o, si es menor, el adulto responsable. */
  signerName: string;
}

/**
 * Declaración jurada de salud (peso, estatura, condiciones y antecedentes).
 * Es la misma en la inscripción, en el legajo y en la app del alumno.
 */
export function HealthDeclarationFields({
  value,
  onChange,
  errors,
  signerName,
}: HealthDeclarationFieldsProps) {
  const id = React.useId();

  function toggleCondition(conditionId: HealthFormValue["conditions"][number]) {
    onChange(
      "conditions",
      value.conditions.includes(conditionId)
        ? value.conditions.filter((c) => c !== conditionId)
        : [...value.conditions, conditionId],
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <FormField label="Peso (kg)" required error={errors.weightKg}>
          {(fieldId, describedBy) => (
            <input
              id={fieldId}
              inputMode="decimal"
              value={value.weightKg}
              onChange={(e) => onChange("weightKg", e.target.value)}
              placeholder="70"
              aria-invalid={!!errors.weightKg}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
        <FormField label="Estatura (cm)" required error={errors.heightCm}>
          {(fieldId, describedBy) => (
            <input
              id={fieldId}
              inputMode="numeric"
              value={value.heightCm}
              onChange={(e) => onChange("heightCm", e.target.value)}
              placeholder="170"
              aria-invalid={!!errors.heightCm}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
        <FormField label="Grupo sanguíneo" className="col-span-2 sm:col-span-1">
          {(fieldId) => (
            <select
              id={fieldId}
              value={value.bloodType}
              onChange={(e) => onChange("bloodType", e.target.value)}
              className={inputClasses}
            >
              <option value="">No sabe</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <fieldset className="flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-neutral-800/40 p-4">
        <legend className="px-1 text-xs font-semibold text-gray-300">
          ¿Tiene o tuvo alguna de estas condiciones?
        </legend>
        <p className="mb-2 text-xs text-muted-foreground">
          Marcá todas las que correspondan. Si no tiene ninguna, dejalas sin
          marcar.
        </p>
        <div className="grid gap-1 sm:grid-cols-2">
          {HEALTH_CONDITIONS.map((condition) => {
            const checkboxId = `${id}-${condition.id}`;
            const checked = value.conditions.includes(condition.id);
            return (
              <label
                key={condition.id}
                htmlFor={checkboxId}
                className={cn(
                  "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-2 text-sm transition-colors hover:bg-white/[0.04]",
                  checked ? "text-white" : "text-gray-300",
                )}
              >
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  onCheckedChange={() => toggleCondition(condition.id)}
                  className="h-5 w-5 rounded-md"
                />
                {condition.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <FormField
        label="Antecedentes o aclaraciones"
        required={value.conditions.length > 0}
        hint="Cirugías, lesiones, medicación, alergias o lo que el profesor tenga que saber."
        error={errors.history}
      >
        {(fieldId, describedBy) => (
          <textarea
            id={fieldId}
            value={value.history}
            onChange={(e) => onChange("history", e.target.value)}
            rows={3}
            aria-invalid={!!errors.history}
            aria-describedby={describedBy}
            className={cn(inputClasses, "resize-y")}
          />
        )}
      </FormField>

      <div className="flex flex-col gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4">
        <p className="flex gap-2 text-xs leading-relaxed text-gray-300">
          <i
            className="ti ti-file-certificate mt-0.5 text-base text-warning"
            aria-hidden="true"
          />
          La declaración jurada tiene valor legal. La información falsa o
          incompleta es responsabilidad de quien la firma.
        </p>
        <label
          htmlFor={`${id}-accepted`}
          className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-white"
        >
          <Checkbox
            id={`${id}-accepted`}
            checked={value.accepted}
            onCheckedChange={(checked) =>
              onChange("accepted", checked === true)
            }
            aria-invalid={!!errors.accepted}
            aria-describedby={
              errors.accepted ? `${id}-accepted-error` : undefined
            }
            className="h-5 w-5 rounded-md"
          />
          {signerName} declara bajo juramento que los datos son verdaderos y que
          está en condiciones de hacer actividad física.
        </label>
        {errors.accepted && (
          <p
            id={`${id}-accepted-error`}
            role="alert"
            className="flex items-center gap-1 text-xs font-medium text-danger"
          >
            <i className="ti ti-alert-circle text-sm" aria-hidden="true" />
            {errors.accepted}
          </p>
        )}
      </div>
    </div>
  );
}
