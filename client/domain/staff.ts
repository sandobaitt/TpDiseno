import type { Employee, EmployeeRole } from "@/data/employees";
import { onlyDigits } from "@/lib/format";
import { dniError, emailError, nameError } from "./enrollment";

/** Datos que se cargan al dar de alta o modificar a alguien del personal. */
export interface EmployeeForm {
  fullName: string;
  email: string;
  dni: string;
  role: EmployeeRole;
  branchId: string;
}

export type EmployeeErrors = Partial<Record<keyof EmployeeForm, string>>;

/**
 * Validación del personal (requisito 3.1.1): nombre, email y DNI con el mismo
 * formato que la inscripción de alumnos, y sin repetir el email ni el DNI de
 * otra persona del personal.
 */
export function validateEmployee(
  form: EmployeeForm,
  staff: Employee[],
  excludeId?: string,
): EmployeeErrors {
  const others = staff.filter((e) => e.id !== excludeId);
  const errors: EmployeeErrors = {
    fullName: nameError(form.fullName, "el nombre y apellido"),
    email: emailError(form.email, []),
    dni: dniError(form.dni, []),
  };
  if (
    !errors.email &&
    others.some(
      (e) => e.email.trim().toLowerCase() === form.email.trim().toLowerCase(),
    )
  )
    errors.email = "Ese email ya lo usa otra persona del personal.";
  if (
    !errors.dni &&
    others.some((e) => e.dni && onlyDigits(e.dni) === onlyDigits(form.dni))
  )
    errors.dni = "Ese DNI ya está cargado en el personal.";
  if (!form.branchId) errors.branchId = "Elegí la sede.";
  return Object.fromEntries(
    Object.entries(errors).filter(([, v]) => v),
  ) as EmployeeErrors;
}
