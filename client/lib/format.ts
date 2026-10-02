/** Pasa a minúsculas y quita tildes, para comparar textos sin importar cómo se escribieron. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Deja solo los dígitos (sirve para comparar DNI con o sin puntos). */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

interface SearchableFields {
  name: string;
  dni?: string;
  email?: string;
}

/**
 * Búsqueda tolerante para listas de personas: nombre (sin importar tildes ni
 * mayúsculas), email o DNI con o sin puntos.
 */
export function matchesPersonSearch(
  query: string,
  fields: SearchableFields,
): boolean {
  const q = normalizeText(query);
  if (!q) return true;
  if (normalizeText(fields.name).includes(q)) return true;
  if (fields.email && normalizeText(fields.email).includes(q)) return true;
  const qDigits = onlyDigits(query);
  return (
    qDigits.length > 0 &&
    !!fields.dni &&
    onlyDigits(fields.dni).includes(qDigits)
  );
}

const arsFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

/** Monto en pesos con separador de miles argentino: 34990 → "$34.990". */
export function formatARS(amount: number): string {
  return `$${arsFormatter.format(amount)}`;
}

/** Iniciales para el avatar: "Martín Rodríguez" → "MR". */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
}

/** DNI con puntos: "34567890" → "34.567.890". Si no tiene 7 u 8 números, lo deja como está. */
export function formatDni(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length < 7 || digits.length > 8) return value.trim();
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Saca espacios de más: "  Ana   María " → "Ana María". */
export function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
