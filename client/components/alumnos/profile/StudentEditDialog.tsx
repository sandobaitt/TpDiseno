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
import { FormField, inputClasses } from "@/components/common/FormField";
import type { Client } from "@/data/clients";
import { branchesMock } from "@/data/branches";
import {
  GUARDIAN_RELATIONSHIPS,
  birthDateError,
  dniError,
  emailError,
  isMinor,
  nameError,
  phoneError,
  type FieldErrors,
} from "@/domain/enrollment";
import { todayISO } from "@/lib/dates";
import { cleanText, formatDni, onlyDigits } from "@/lib/format";
import { useAppState, useStoreActions } from "@/store/StoreProvider";

interface EditForm {
  fullName: string;
  dni: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  branchId: string;
  guardianName: string;
  guardianDni: string;
  guardianPhone: string;
  guardianRelationship: string;
}

function toForm(client: Client): EditForm {
  return {
    fullName: client.fullName,
    dni: client.dni,
    birthDate: client.birthDate ?? "",
    email: client.email,
    phone: client.phone ?? "",
    address: client.address ?? "",
    emergencyContact: client.health?.emergencyContact ?? "",
    branchId: client.branchId,
    guardianName: client.guardian?.fullName ?? "",
    guardianDni: client.guardian?.dni ?? "",
    guardianPhone: client.guardian?.phone ?? "",
    guardianRelationship: client.guardian?.relationship ?? "",
  };
}

interface StudentEditDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modificar los datos del alumno, con las mismas validaciones que la inscripción. */
export function StudentEditDialog({
  client,
  open,
  onOpenChange,
}: StudentEditDialogProps) {
  const state = useAppState();
  const actions = useStoreActions();
  const today = todayISO();
  const [form, setForm] = React.useState<EditForm>(() => toForm(client));
  const [errors, setErrors] = React.useState<FieldErrors<EditForm>>({});
  const formRef = React.useRef<HTMLFormElement>(null);

  // Cada vez que se abre, arranca con los datos actuales.
  React.useEffect(() => {
    if (open) {
      setForm(toForm(client));
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client.id]);

  React.useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [errors]);

  const minor = isMinor(form.birthDate, today);
  const branches = branchesMock.filter(
    (b) => b.status === "active" || b.id === client.branchId,
  );

  function set<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): FieldErrors<EditForm> {
    const e: FieldErrors<EditForm> = {};
    const add = (key: keyof EditForm, message?: string) => {
      if (message) e[key] = message;
    };
    add("fullName", nameError(form.fullName, "el nombre y apellido"));
    add("dni", dniError(form.dni, state.clients, client.id));
    add("birthDate", birthDateError(form.birthDate, today));
    add("email", emailError(form.email, state.clients, client.id));
    add("phone", phoneError(form.phone, false));
    if (minor) {
      add(
        "guardianName",
        nameError(form.guardianName, "el nombre del adulto responsable"),
      );
      const digits = onlyDigits(form.guardianDni);
      if (digits.length < 7 || digits.length > 8)
        e.guardianDni = "El DNI tiene que tener 7 u 8 números.";
      add("guardianPhone", phoneError(form.guardianPhone, true));
      if (!form.guardianRelationship)
        e.guardianRelationship = "Elegí el vínculo con el alumno.";
    }
    return e;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const fullName = cleanText(form.fullName);
    actions.updateClient(client.id, {
      fullName,
      dni: formatDni(form.dni),
      birthDate: form.birthDate,
      email: form.email.trim().toLowerCase(),
      phone: cleanText(form.phone) || undefined,
      address: cleanText(form.address) || undefined,
      branchId: form.branchId,
      health: {
        ...(client.health ?? { conditions: [] }),
        emergencyContact: cleanText(form.emergencyContact) || undefined,
      },
      guardian: minor
        ? {
            fullName: cleanText(form.guardianName),
            dni: formatDni(form.guardianDni),
            phone: cleanText(form.guardianPhone),
            relationship: form.guardianRelationship,
          }
        : client.guardian,
    });
    toast.success(`Datos de ${fullName} actualizados.`);
    onOpenChange(false);
  }

  const field = (
    key: keyof EditForm,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    required = false,
  ) => (
    <FormField label={label} required={required} error={errors[key]}>
      {(id, describedBy) => (
        <input
          id={id}
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={describedBy}
          className={inputClasses}
          {...props}
        />
      )}
    </FormField>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">
            Editar datos de {client.fullName}
          </DialogTitle>
          <DialogDescription>
            Los cambios quedan en el registro de actividad de la ficha.
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field(
              "fullName",
              "Nombre y apellido",
              { autoComplete: "off" },
              true,
            )}
            {field(
              "dni",
              "DNI",
              {
                inputMode: "numeric",
                onBlur: () => set("dni", formatDni(form.dni)),
              },
              true,
            )}
            {field(
              "birthDate",
              "Fecha de nacimiento",
              { type: "date", max: today },
              true,
            )}
            {field("email", "Email", { type: "email" }, true)}
            {field("phone", "Celular", { type: "tel", inputMode: "tel" })}
            {field("address", "Dirección")}
          </div>
          {field("emergencyContact", "Contacto de emergencia", {
            placeholder: "Nombre, vínculo y teléfono",
          })}
          <FormField label="Sede principal" required>
            {(id) => (
              <select
                id={id}
                value={form.branchId}
                onChange={(e) => set("branchId", e.target.value)}
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

          {minor && (
            <fieldset className="flex flex-col gap-4 rounded-xl border border-info/25 bg-info/5 p-4">
              <legend className="px-1 text-sm font-bold text-white">
                Adulto responsable
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field("guardianName", "Nombre y apellido", {}, true)}
                {field(
                  "guardianDni",
                  "DNI",
                  {
                    inputMode: "numeric",
                    onBlur: () =>
                      set("guardianDni", formatDni(form.guardianDni)),
                  },
                  true,
                )}
                {field("guardianPhone", "Celular", { type: "tel" }, true)}
                <FormField
                  label="Vínculo con el alumno"
                  required
                  error={errors.guardianRelationship}
                >
                  {(id, describedBy) => (
                    <select
                      id={id}
                      value={form.guardianRelationship}
                      onChange={(e) =>
                        set("guardianRelationship", e.target.value)
                      }
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
            </fieldset>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="submit" className="rounded-xl font-bold">
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
