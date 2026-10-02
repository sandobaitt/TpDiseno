import { Link } from "react-router-dom";
import { FormField, inputClasses } from "@/components/common/FormField";
import { FileUpload } from "@/components/common/FileUpload";
import type { Client } from "@/data/clients";
import {
  GUARDIAN_RELATIONSHIPS,
  dniError,
  findClientByDni,
  isMinor,
} from "@/domain/enrollment";
import { ageOn, todayISO } from "@/lib/dates";
import { formatDni, onlyDigits } from "@/lib/format";
import type { StepProps } from "./types";

interface PersonalStepProps extends StepProps {
  clients: Client[];
  /** Ruta de la ficha de un alumno (para ir al duplicado). */
  profilePath: (clientId: string) => string;
}

/** Paso 1: datos personales. Si es menor, pide el adulto responsable y su autorización. */
export function PersonalStep({
  draft,
  errors,
  set,
  clients,
  profilePath,
}: PersonalStepProps) {
  const today = todayISO();
  const minor = isMinor(draft.birthDate, today);
  const validBirthDate = !!draft.birthDate && draft.birthDate <= today;

  // El duplicado se avisa apenas se completa el DNI, sin esperar a "Siguiente".
  const duplicate =
    onlyDigits(draft.dni).length >= 7
      ? findClientByDni(clients, draft.dni)
      : undefined;
  const dniMessage =
    errors.dni ?? (duplicate ? dniError(draft.dni, clients) : undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Nombre" required error={errors.firstName}>
          {(id, describedBy) => (
            <input
              id={id}
              value={draft.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              autoComplete="off"
              aria-invalid={!!errors.firstName}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
        <FormField label="Apellido" required error={errors.lastName}>
          {(id, describedBy) => (
            <input
              id={id}
              value={draft.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              autoComplete="off"
              aria-invalid={!!errors.lastName}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="DNI"
          required
          hint="Con o sin puntos."
          error={
            dniMessage && (
              <>
                {dniMessage}
                {duplicate && duplicate.status === "active" && (
                  <Link
                    to={profilePath(duplicate.id)}
                    className="ml-1 font-semibold text-primary underline underline-offset-2"
                  >
                    Ver ficha
                  </Link>
                )}
              </>
            )
          }
        >
          {(id, describedBy) => (
            <input
              id={id}
              inputMode="numeric"
              value={draft.dni}
              onChange={(e) => set("dni", e.target.value)}
              onBlur={() => set("dni", formatDni(draft.dni))}
              placeholder="34.567.890"
              autoComplete="off"
              aria-invalid={!!dniMessage}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
        <FormField
          label="Fecha de nacimiento"
          required
          hint={
            validBirthDate
              ? `Tiene ${ageOn(draft.birthDate, today)} años${minor ? ": es menor de edad." : "."}`
              : undefined
          }
          error={errors.birthDate}
        >
          {(id, describedBy) => (
            <input
              id={id}
              type="date"
              max={today}
              value={draft.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
              aria-invalid={!!errors.birthDate}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
      </div>

      {minor && (
        <fieldset className="flex flex-col gap-4 rounded-xl border border-info/25 bg-info/5 p-4">
          <legend className="flex items-center gap-2 px-1 text-sm font-bold text-white">
            <i className="ti ti-user-shield text-info" aria-hidden="true" />
            Adulto responsable
          </legend>
          <p className="-mt-2 text-xs text-gray-300">
            Por ser menor de edad, necesita la autorización firmada de un adulto
            responsable.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Nombre y apellido"
              required
              error={errors.guardianName}
            >
              {(id, describedBy) => (
                <input
                  id={id}
                  value={draft.guardianName}
                  onChange={(e) => set("guardianName", e.target.value)}
                  autoComplete="off"
                  aria-invalid={!!errors.guardianName}
                  aria-describedby={describedBy}
                  className={inputClasses}
                />
              )}
            </FormField>
            <FormField label="DNI" required error={errors.guardianDni}>
              {(id, describedBy) => (
                <input
                  id={id}
                  inputMode="numeric"
                  value={draft.guardianDni}
                  onChange={(e) => set("guardianDni", e.target.value)}
                  onBlur={() =>
                    set("guardianDni", formatDni(draft.guardianDni))
                  }
                  autoComplete="off"
                  aria-invalid={!!errors.guardianDni}
                  aria-describedby={describedBy}
                  className={inputClasses}
                />
              )}
            </FormField>
            <FormField label="Celular" required error={errors.guardianPhone}>
              {(id, describedBy) => (
                <input
                  id={id}
                  type="tel"
                  inputMode="tel"
                  value={draft.guardianPhone}
                  onChange={(e) => set("guardianPhone", e.target.value)}
                  placeholder="11 5555-0000"
                  aria-invalid={!!errors.guardianPhone}
                  aria-describedby={describedBy}
                  className={inputClasses}
                />
              )}
            </FormField>
            <FormField
              label="Vínculo con el alumno"
              required
              error={errors.guardianRelationship}
            >
              {(id, describedBy) => (
                <select
                  id={id}
                  value={draft.guardianRelationship}
                  onChange={(e) => set("guardianRelationship", e.target.value)}
                  aria-invalid={!!errors.guardianRelationship}
                  aria-describedby={describedBy}
                  className={inputClasses}
                >
                  <option value="">Elegí una opción</option>
                  {GUARDIAN_RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </div>
          <FileUpload
            label="Autorización firmada"
            required
            value={draft.authorization}
            onChange={(file) => set("authorization", file)}
            error={errors.authorization}
          />
        </fieldset>
      )}
    </div>
  );
}
