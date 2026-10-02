import {
  addDays,
  addMonths,
  dateInPeriod,
  daysInPeriod,
  toPeriod,
  todayISO,
  weekdayOf,
} from "@/lib/dates";

/**
 * Ayudas para armar los datos de demo. Las fechas son relativas a "hoy"
 * (o a `DEMO_TODAY`), así la demo siempre muestra situaciones vigentes:
 * alumnos al día, por vencer, deudores y bloqueados.
 */

export const SEED_TODAY = todayISO();
export const SEED_PERIOD = toPeriod(SEED_TODAY);

/** Fecha de hace `days` días. */
export function daysAgo(days: number): string {
  return addDays(SEED_TODAY, -days);
}

/** Fecha dentro de `days` días. */
export function daysAhead(days: number): string {
  return addDays(SEED_TODAY, days);
}

/** Día `day` del mes de hace `months` meses (se ajusta si el mes es más corto). */
export function monthsAgo(months: number, day: number): string {
  const period = addMonths(SEED_PERIOD, -months);
  return dateInPeriod(period, Math.min(day, daysInPeriod(period)));
}

/**
 * Próxima fecha (a partir de mañana) que cae en el día de semana indicado,
 * más `weeksAhead` semanas.
 */
export function nextWeekday(weekday: number, weeksAhead = 0): string {
  let date = addDays(SEED_TODAY, 1);
  while (weekdayOf(date) !== weekday) date = addDays(date, 1);
  return addDays(date, weeksAhead * 7);
}

/** Última fecha (hasta ayer) que cayó en el día de semana indicado, menos `weeksBack` semanas. */
export function lastWeekday(weekday: number, weeksBack = 0): string {
  let date = addDays(SEED_TODAY, -1);
  while (weekdayOf(date) !== weekday) date = addDays(date, -1);
  return addDays(date, -weeksBack * 7);
}

/** "Azar" determinista: el mismo texto siempre da el mismo número (0–99). */
export function seededPercent(...parts: string[]): number {
  let hash = 2166136261;
  for (const ch of parts.join("|")) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 100;
}

/** Secretaría de cada sede (quien carga pagos y asistencias en la demo). */
export const BRANCH_SECRETARY: Record<string, string> = {
  br_001: "us_se_001",
  br_002: "us_se_002",
};

/** Encargado de cada sede (quien confirma asistencias de profesores). */
export const BRANCH_MANAGER: Record<string, string> = {
  br_001: "us_en_001",
  br_002: "us_en_002",
};
