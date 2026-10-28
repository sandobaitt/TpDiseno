import type { Client } from "@/data/clients";
import type { Audience } from "@/data/communications";
import type { AccountStatus } from "./billing";

/**
 * Destinatarios y personalización de las comunicaciones (CU 14). Funciones puras.
 */

export type CommunicationTemplateId =
  | "vencimiento"
  | "cambio_clase"
  | "promocion"
  | "general";

export interface CommunicationTemplate {
  id: CommunicationTemplateId;
  label: string;
  subject: string;
  body: string;
}

export const COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: "vencimiento",
    label: "Vencimiento de cuota",
    subject: "Recordatorio: cuota por vencer o vencida",
    body: "Hola {nombre}, te recordamos que tu cuota vence el {fecha}. El monto a abonar es {monto}. Podés regularizarlo en secretaría o desde el módulo de cobros. No hay recargos.",
  },
  {
    id: "cambio_clase",
    label: "Cambio de clase / reemplazo",
    subject: "Cambio en tu cronograma",
    body: "Hola {nombre}, hubo un cambio en tu clase programada. Revisá el cronograma actualizado en la app para conocer el nuevo horario, sede o profesor.",
  },
  {
    id: "promocion",
    label: "Promoción vigente",
    subject: "Promoción disponible",
    body: "Hola {nombre}, tenemos una promoción vigente: {promocion}. Consultá en recepción los detalles y condiciones para aprovecharla.",
  },
  {
    id: "general",
    label: "Mensaje general",
    subject: "Comunicado SQUATGYM",
    body: "Hola {nombre}, {mensaje}.",
  },
];

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
