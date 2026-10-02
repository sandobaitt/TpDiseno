/**
 * Fecha local en formato "AAAA-MM-DD".
 * No usar `toISOString()` para esto: convierte a UTC y en Argentina (UTC-3),
 * después de las 21 h, devuelve el día siguiente.
 */
export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Hoy en formato "AAAA-MM-DD" (hora local). */
export function todayISO(): string {
  return toLocalISODate(new Date());
}
