import { DEMO_TODAY } from "@/data/rules";

/**
 * Fechas sin hora como texto "AAAA-MM-DD" y meses como "AAAA-MM".
 *
 * Importante: `new Date("AAAA-MM-DD")` interpreta la fecha en UTC y en
 * Argentina (UTC-3) muestra el día anterior. Por eso todo pasa por estos
 * helpers, que trabajan en hora local.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Fecha local en formato "AAAA-MM-DD" (no usar `toISOString()`: es UTC). */
export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "AAAA-MM-DD" → Date a la medianoche local. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Hoy en formato "AAAA-MM-DD". Respeta `DEMO_TODAY` si está configurado. */
export function todayISO(): string {
  return DEMO_TODAY ?? toLocalISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
}

/** Días de calendario entre dos fechas (b − a). */
export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round(
    (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / MS_PER_DAY,
  );
}

/** Día de la semana: 1 = lunes … 7 = domingo. */
export function weekdayOf(iso: string): number {
  const day = parseISODate(iso).getDay();
  return day === 0 ? 7 : day;
}

/** Lunes de la semana de la fecha. */
export function startOfWeek(iso: string): string {
  return addDays(iso, 1 - weekdayOf(iso));
}

// ── Meses ("AAAA-MM") ──────────────────────────────────────────────

export function toPeriod(iso: string): string {
  return iso.slice(0, 7);
}

export function addMonths(period: string, months: number): string {
  const [y, m] = period.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

/** Meses desde `from` hasta `to`, inclusive. */
export function periodRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let p = from; p <= to; p = addMonths(p, 1)) out.push(p);
  return out;
}

export function daysInPeriod(period: string): number {
  const [y, m] = period.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** Fecha de un día dado dentro del mes: ("2026-05", 5) → "2026-05-05". */
export function dateInPeriod(period: string, day: number): string {
  return `${period}-${String(day).padStart(2, "0")}`;
}

// ── Formatos para mostrar ──────────────────────────────────────────

/** "15/04/2026" */
export function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** "15 abr 2026" */
export function formatDateShort(iso: string): string {
  return parseISODate(iso)
    .toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(".", "");
}

/** "miércoles 15 de abril" */
export function formatDateLong(iso: string, withYear = false): string {
  return parseISODate(iso).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

/** "mayo de 2026" */
export function formatPeriod(period: string): string {
  return parseISODate(`${period}-01`).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

/** Fecha y hora de un ISO completo: "15/04/2026 18:30". */
export function formatDateTime(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const date = d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
}

/** Suma minutos a una hora "HH:MM". */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Minutos → "1h 30m" / "45m" / "2h". */
export function formatMinutes(minutes: number): string {
  const sign = minutes < 0 ? "-" : "";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  return m === 0 ? `${sign}${h}h` : `${sign}${h}h ${m}m`;
}

/** Edad en años cumplidos a la fecha `onDate`. */
export function ageOn(birthDate: string, onDate: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ty, tm, td] = onDate.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age--;
  return age;
}
