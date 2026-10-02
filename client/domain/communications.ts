import type { Client } from "@/data/clients";
import type { Audience } from "@/data/communications";
import type { AccountStatus } from "./billing";

/**
 * Destinatarios y personalización de las comunicaciones (CU 14). Funciones puras.
 */

/** Alumnos activos que entran en el público elegido. */
export function resolveAudience(
  audience: Audience,
  clients: Client[],
  statusOf: (client: Client) => AccountStatus,
): Client[] {
  const active = clients.filter((c) => c.status === "active");
  switch (audience.kind) {
    case "todos":
      return active;
    case "sede":
      return active.filter((c) => c.branchId === audience.branchId);
    case "plan":
      return active.filter((c) => c.planId === audience.planId);
    case "por_vencer":
      return active.filter((c) => statusOf(c) === "por_vencer");
    case "deudores":
      return active.filter((c) => {
        const status = statusOf(c);
        return status === "deudor" || status === "bloqueado";
      });
    case "alumno":
      return active.filter((c) => c.id === audience.clientId);
  }
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/** Reemplaza {nombre} por el nombre del alumno. */
export function personalize(
  text: string,
  client: Pick<Client, "fullName">,
): string {
  return text.replace(/\{nombre\}/gi, firstName(client.fullName));
}
