/**
 * Reglas de negocio configurables. Cambiar un valor acá cambia el
 * comportamiento en toda la app (no se repiten números en el código).
 */

/** Día del mes en que vence la cuota (se espera el pago en los primeros 5 días). */
export const PAYMENT_DUE_DAY = 5;

/** Días que tiene un alumno nuevo para pagar la cuota de alta (proporcional). */
export const ENROLLMENT_GRACE_DAYS = 5;

/**
 * Días de atraso, contados desde el vencimiento, a partir de los cuales el
 * alumno queda bloqueado y no puede ingresar (el escenario dice 15 a 20 días).
 */
export const DEBT_BLOCK_DAYS = 15;

/** Edad desde la cual no hace falta autorización de un adulto responsable. */
export const ADULT_AGE = 18;

/** Tamaño máximo de un certificado o autorización adjunta. */
export const MAX_ATTACHMENT_MB = 5;

/**
 * Fecha fija para la demo ("AAAA-MM-DD"). Con `null` se usa la fecha real.
 * Sirve para que la presentación muestre siempre la misma situación.
 */
export const DEMO_TODAY: string | null = null;
