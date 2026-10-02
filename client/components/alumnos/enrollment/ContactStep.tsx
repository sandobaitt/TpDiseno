import { FormField, inputClasses } from "@/components/common/FormField";
import type { Client } from "@/data/clients";
import { emailError, findClientByEmail } from "@/domain/enrollment";
import type { StepProps } from "./types";

interface ContactStepProps extends StepProps {
  clients: Client[];
}

/** Paso 2: contacto y contacto de emergencia. */
export function ContactStep({ draft, errors, set, clients }: ContactStepProps) {
  const duplicate = draft.email.includes("@")
    ? findClientByEmail(clients, draft.email)
    : undefined;
  const emailMessage =
    errors.email ?? (duplicate ? emailError(draft.email, clients) : undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Email"
          required
          hint="Ahí le llegan los avisos de vencimiento y los recibos."
          error={emailMessage}
        >
          {(id, describedBy) => (
            <input
              id={id}
              type="email"
              value={draft.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="nombre@correo.com"
              autoComplete="off"
              aria-invalid={!!emailMessage}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
        <FormField label="Celular" required error={errors.phone}>
          {(id, describedBy) => (
            <input
              id={id}
              type="tel"
              inputMode="tel"
              value={draft.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="11 5555-0000"
              aria-invalid={!!errors.phone}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Dirección">
          {(id) => (
            <input
              id={id}
              value={draft.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Av. Corrientes 1234"
              className={inputClasses}
            />
          )}
        </FormField>
        <FormField label="Localidad">
          {(id) => (
            <input
              id={id}
              value={draft.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="CABA"
              className={inputClasses}
            />
          )}
        </FormField>
      </div>

      <FormField
        label="Contacto de emergencia"
        hint="Recomendado: a quién llamar si le pasa algo mientras entrena."
      >
        {(id, describedBy) => (
          <input
            id={id}
            value={draft.emergencyContact}
            onChange={(e) => set("emergencyContact", e.target.value)}
            placeholder="Nombre, vínculo y teléfono"
            aria-describedby={describedBy}
            className={inputClasses}
          />
        )}
      </FormField>
    </div>
  );
}
