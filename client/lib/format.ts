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
