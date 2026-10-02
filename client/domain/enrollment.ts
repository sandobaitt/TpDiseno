import { ADULT_AGE } from "@/data/rules";
import type { Attachment, Client } from "@/data/clients";
import type { HealthConditionId } from "@/data/health";
import type { Plan } from "@/data/plans";
import { addDays, ageOn, daysInPeriod, toPeriod } from "@/lib/dates";
import type { FileMeta } from "@/lib/files";
import { cleanText, formatDni, normalizeText, onlyDigits } from "@/lib/format";
import { dueDateFor, proratedAmount } from "./billing";

/**
 * Inscripción y legajo del alumno (CU 1, 2 y 11): validaciones, control de
 * duplicados y cuota de alta. Funciones puras, con tests.
 */

/** Hasta cuántos días para adelante se puede poner la fecha de inicio. */
export const MAX_START_DAYS_AHEAD = 60;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function isMinor(birthDate: string | undefined, today: string): boolean {
  return !!birthDate && ageOn(birthDate, today) < ADULT_AGE;
}

/** Otro alumno (activo o dado de baja) con el mismo DNI, con o sin puntos. */
export function findClientByDni(
  clients: Client[],
  dni: string,
  excludeId?: string,
): Client | undefined {
  const digits = onlyDigits(dni);
  if (!digits) return undefined;
  return clients.find(
    (c) => c.id !== excludeId && onlyDigits(c.dni) === digits,
  );
}

/** Otro alumno con el mismo email, sin importar mayúsculas. */
export function findClientByEmail(
  clients: Client[],
  email: string,
  excludeId?: string,
): Client | undefined {
  const wanted = normalizeText(email);
  if (!wanted) return undefined;
  return clients.find(
    (c) => c.id !== excludeId && normalizeText(c.email) === wanted,
  );
}

function duplicateMessage(field: "DNI" | "email", other: Client): string {
  return other.status === "inactive"
    ? `Ese ${field} ya está registrado: ${other.fullName}, con la inscripción dada de baja. Pedile a un administrador que la reactive.`
    : `Ese ${field} ya está registrado: ${other.fullName}.`;
}

// Validadores de campo: devuelven el mensaje de error, o undefined si está bien.

export function nameError(value: string, label: string): string | undefined {
  if (cleanText(value).length < 2) return `Ingresá ${label}.`;
  return undefined;
}

export function dniError(
  dni: string,
  clients: Client[],
  excludeId?: string,
): string | undefined {
  const digits = onlyDigits(dni);
  if (!digits) return "Ingresá el DNI.";
  if (digits.length < 7 || digits.length > 8)
    return "El DNI tiene que tener 7 u 8 números.";
  const other = findClientByDni(clients, dni, excludeId);
  return other ? duplicateMessage("DNI", other) : undefined;
}

export function emailError(
  email: string,
  clients: Client[],
  excludeId?: string,
): string | undefined {
  if (!email.trim()) return "Ingresá el email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
    return "Revisá el email: tiene que ser como nombre@correo.com.";
  const other = findClientByEmail(clients, email, excludeId);
  return other ? duplicateMessage("email", other) : undefined;
}

export function phoneError(
  phone: string,
  required: boolean,
): string | undefined {
  const digits = onlyDigits(phone);
  if (!digits) return required ? "Ingresá un celular." : undefined;
  if (digits.length < 8 || digits.length > 15)
    return "Revisá el número: tiene que tener entre 8 y 15 dígitos.";
  return undefined;
}

export function birthDateError(
  birthDate: string,
  today: string,
): string | undefined {
  if (!birthDate) return "Ingresá la fecha de nacimiento.";
  if (birthDate > today) return "La fecha de nacimiento no puede ser futura.";
  if (ageOn(birthDate, today) > 110) return "Revisá la fecha de nacimiento.";
  return undefined;
}

/** "78,5" → 78.5; vacío o inválido → NaN. */
export function parseDecimal(value: string): number {
  const normalized = value.trim().replace(",", ".");
  return normalized ? Number(normalized) : NaN;
}

// --- Declaración jurada de salud (la usan la inscripción, el legajo y, en E9, el alumno)

export interface HealthFormValue {
  weightKg: string;
  heightCm: string;
  conditions: HealthConditionId[];
  history: string;
  bloodType: string;
  accepted: boolean;
}

export function validateHealth(
  value: HealthFormValue,
): FieldErrors<HealthFormValue> {
  const errors: FieldErrors<HealthFormValue> = {};
  const weight = parseDecimal(value.weightKg);
  if (!(weight >= 20 && weight <= 300))
    errors.weightKg = "Ingresá el peso en kg (entre 20 y 300).";
  const height = parseDecimal(value.heightCm);
  if (!(height >= 90 && height <= 230))
    errors.heightCm = "Ingresá la estatura en cm (entre 90 y 230).";
  if (value.conditions.length > 0 && !value.history.trim())
    errors.history =
      "Contá brevemente cuál es la condición (por ejemplo, qué lesión o qué medicación).";
  if (!value.accepted)
    errors.accepted = "Falta aceptar la declaración jurada para continuar.";
  return errors;
}

// --- Formulario de inscripción

export interface EnrollmentDraft extends HealthFormValue {
  step: number;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  guardianName: string;
  guardianDni: string;
  guardianPhone: string;
  guardianRelationship: string;
  authorization: FileMeta | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  emergencyContact: string;
  certificate: FileMeta | null;
  planId: string;
  branchId: string;
  startDate: string;
}

export const ENROLLMENT_STEPS = [
  { id: 1, label: "Datos personales" },
  { id: 2, label: "Contacto" },
  { id: 3, label: "Salud" },
  { id: 4, label: "Plan y sede" },
  { id: 5, label: "Confirmar" },
] as const;

export const GUARDIAN_RELATIONSHIPS = [
  "Madre",
  "Padre",
  "Tutor o tutora legal",
  "Otro familiar",
];

export function emptyEnrollment(
  branchId: string,
  today: string,
): EnrollmentDraft {
  return {
    step: 1,
    firstName: "",
    lastName: "",
    dni: "",
    birthDate: "",
    guardianName: "",
    guardianDni: "",
    guardianPhone: "",
    guardianRelationship: "",
    authorization: null,
    email: "",
    phone: "",
    address: "",
    city: "",
    emergencyContact: "",
    weightKg: "",
    heightCm: "",
    conditions: [],
    history: "",
    bloodType: "",
    accepted: false,
    certificate: null,
    planId: "",
    branchId,
    startDate: today,
  };
}

interface ValidationContext {
  clients: Client[];
  /** Planes y sedes que se pueden elegir. */
  planIds: string[];
  branchIds: string[];
  today: string;
}

/** Errores del paso indicado (vacío = se puede avanzar). */
export function validateEnrollmentStep(
  step: number,
  draft: EnrollmentDraft,
  ctx: ValidationContext,
): FieldErrors<EnrollmentDraft> {
  const errors: FieldErrors<EnrollmentDraft> = {};
  const set = (key: keyof EnrollmentDraft, message: string | undefined) => {
    if (message) errors[key] = message;
  };

  if (step === 1) {
    set("firstName", nameError(draft.firstName, "el nombre"));
    set("lastName", nameError(draft.lastName, "el apellido"));
    set("dni", dniError(draft.dni, ctx.clients));
    set("birthDate", birthDateError(draft.birthDate, ctx.today));
    if (isMinor(draft.birthDate, ctx.today)) {
      set(
        "guardianName",
        nameError(draft.guardianName, "el nombre del adulto responsable"),
      );
      const guardianDigits = onlyDigits(draft.guardianDni);
      if (guardianDigits.length < 7 || guardianDigits.length > 8)
        errors.guardianDni = "El DNI tiene que tener 7 u 8 números.";
      else if (guardianDigits === onlyDigits(draft.dni))
        errors.guardianDni =
          "El DNI del adulto responsable no puede ser el mismo que el del alumno.";
      set("guardianPhone", phoneError(draft.guardianPhone, true));
      if (!draft.guardianRelationship)
        errors.guardianRelationship = "Elegí el vínculo con el alumno.";
      if (!draft.authorization)
        errors.authorization =
          "Adjuntá la autorización firmada por el adulto responsable.";
    }
  }

  if (step === 2) {
    set("email", emailError(draft.email, ctx.clients));
    set("phone", phoneError(draft.phone, true));
  }

  if (step === 3) {
    Object.assign(errors, validateHealth(draft));
  }

  if (step === 4) {
    if (!ctx.planIds.includes(draft.planId))
      errors.planId = "Elegí el plan que contrata.";
    if (!ctx.branchIds.includes(draft.branchId))
      errors.branchId = "Elegí la sede principal.";
    if (!draft.startDate) errors.startDate = "Ingresá la fecha de inicio.";
    else if (draft.startDate < ctx.today)
      errors.startDate = "La fecha de inicio no puede ser anterior a hoy.";
    else if (draft.startDate > addDays(ctx.today, MAX_START_DAYS_AHEAD))
      errors.startDate = `Elegí una fecha dentro de los próximos ${MAX_START_DAYS_AHEAD} días.`;
  }

  return errors;
}

/** Primer paso con errores (para volver ahí antes de registrar), o null si todo está bien. */
export function firstInvalidStep(
  draft: EnrollmentDraft,
  ctx: ValidationContext,
): number | null {
  for (const { id } of ENROLLMENT_STEPS) {
    if (Object.keys(validateEnrollmentStep(id, draft, ctx)).length > 0)
      return id;
  }
  return null;
}

/** Cuota de alta: proporcional a los días que quedan del mes de inicio. */
export interface EnrollmentCharge {
  period: string;
  amount: number;
  fullPrice: number;
  prorated: boolean;
  daysCharged: number;
  daysInMonth: number;
  dueDate: string;
}

export function enrollmentCharge(
  plan: Plan,
  startDate: string,
): EnrollmentCharge {
  const period = toPeriod(startDate);
  const daysInMonth = daysInPeriod(period);
  const day = Number(startDate.slice(8, 10));
  return {
    period,
    amount: proratedAmount(plan.monthlyPriceArs, startDate),
    fullPrice: plan.monthlyPriceArs,
    prorated: day > 1,
    daysCharged: daysInMonth - day + 1,
    daysInMonth,
    dueDate: dueDateFor(period, startDate),
  };
}

/** Arma el alumno a partir del formulario. Los documentos que carga secretaría quedan revisados. */
export function buildClientFromDraft(
  draft: EnrollmentDraft,
  { id, now, userId }: { id: string; now: string; userId: string },
): Client {
  const today = now.slice(0, 10);
  const fullName = `${cleanText(draft.firstName)} ${cleanText(draft.lastName)}`;
  const minor = isMinor(draft.birthDate, today);
  const relationship = cleanText(draft.guardianRelationship);

  const toAttachment = (
    file: FileMeta,
    kind: Attachment["kind"],
  ): Attachment => ({
    id: `${id}_${kind}`,
    kind,
    fileName: file.fileName,
    sizeKb: file.sizeKb,
    uploadedAt: today,
    status: "approved",
    uploadedBy: userId,
    reviewedBy: userId,
    reviewedAt: today,
  });
  const attachments: Attachment[] = [];
  if (minor && draft.authorization)
    attachments.push(toAttachment(draft.authorization, "autorizacion"));
  if (draft.certificate)
    attachments.push(toAttachment(draft.certificate, "certificado"));

  return {
    id,
    branchId: draft.branchId,
    fullName,
    email: draft.email.trim().toLowerCase(),
    dni: formatDni(draft.dni),
    phone: cleanText(draft.phone),
    birthDate: draft.birthDate,
    address:
      [draft.address, draft.city].map(cleanText).filter(Boolean).join(", ") ||
      undefined,
    planId: draft.planId,
    enrolledAt: draft.startDate,
    status: "active",
    guardian: minor
      ? {
          fullName: cleanText(draft.guardianName),
          dni: formatDni(draft.guardianDni),
          phone: cleanText(draft.guardianPhone),
          relationship,
        }
      : undefined,
    health: {
      weightKg: parseDecimal(draft.weightKg),
      heightCm: parseDecimal(draft.heightCm),
      conditions: draft.conditions,
      history: cleanText(draft.history) || undefined,
      bloodType: draft.bloodType || undefined,
      emergencyContact: cleanText(draft.emergencyContact) || undefined,
      signedAt: today,
      signedBy: minor
        ? `${cleanText(draft.guardianName)} (${relationship.toLowerCase()})`
        : fullName,
    },
    attachments: attachments.length > 0 ? attachments : undefined,
    createdAt: now,
    createdBy: userId,
  };
}

/** Estado del legajo: qué tiene y qué le falta (DDJJ, certificado y, si es menor, autorización). */
export interface RecordChecklistItem {
  id: "ddjj" | "certificado" | "autorizacion";
  label: string;
  state: "ok" | "pending" | "missing";
  /** El certificado es opcional ("se pueden adjuntar"); la DDJJ y la autorización del menor, no. */
  required: boolean;
  detail: string;
}

export function getRecordChecklist(
  client: Client,
  today: string,
): RecordChecklistItem[] {
  const docs = client.attachments ?? [];
  const docState = (kind: Attachment["kind"]) => {
    const ofKind = docs.filter((d) => d.kind === kind);
    if (ofKind.some((d) => d.status === "approved")) return "ok" as const;
    if (ofKind.length > 0) return "pending" as const;
    return "missing" as const;
  };

  const items: RecordChecklistItem[] = [
    {
      id: "ddjj",
      label: "Declaración jurada de salud",
      state: client.health?.signedAt ? "ok" : "missing",
      required: true,
      detail: client.health?.signedAt ? "Firmada" : "Sin completar",
    },
  ];
  const cert = docState("certificado");
  items.push({
    id: "certificado",
    label: "Certificado médico",
    state: cert,
    required: false,
    detail:
      cert === "ok"
        ? "Revisado"
        : cert === "pending"
          ? "Pendiente de revisión"
          : "Sin adjuntar",
  });
  if (isMinor(client.birthDate, today)) {
    const auth = docState("autorizacion");
    items.push({
      id: "autorizacion",
      label: "Autorización del adulto responsable",
      state: auth,
      required: true,
      detail:
        auth === "ok"
          ? "Revisada"
          : auth === "pending"
            ? "Pendiente de revisión"
            : "Falta (es menor de edad)",
    });
  }
  return items;
}

/** Inscripciones y bajas de una sede, mes a mes (CU 12). */
export interface BranchEnrollmentMonth {
  period: string;
  enrolled: number;
  deactivated: number;
}

export function branchEnrollmentHistory(
  clients: Client[],
  branchId: string,
  periods: string[],
): BranchEnrollmentMonth[] {
  const ofBranch = clients.filter((c) => c.branchId === branchId);
  return periods.map((period) => ({
    period,
    enrolled: ofBranch.filter((c) => toPeriod(c.enrolledAt) === period).length,
    deactivated: ofBranch.filter(
      (c) => !!c.deactivatedAt && toPeriod(c.deactivatedAt) === period,
    ).length,
  }));
}
