/**
 * Única lista de condiciones de salud de la declaración jurada (la usan la
 * inscripción, la DDJJ del alumno y el legajo médico).
 */
export const HEALTH_CONDITIONS = [
  { id: "cardiaca", label: "Enfermedad o antecedentes cardíacos" },
  { id: "presion", label: "Presión arterial alta o baja" },
  { id: "diabetes", label: "Diabetes o problemas metabólicos" },
  { id: "respiratoria", label: "Asma o problemas respiratorios" },
  { id: "epilepsia", label: "Epilepsia o convulsiones" },
  { id: "lesion", label: "Lesión, cirugía reciente o limitación física" },
  { id: "medicacion", label: "Toma medicación de forma habitual" },
] as const;

export type HealthConditionId = (typeof HEALTH_CONDITIONS)[number]["id"];

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];
