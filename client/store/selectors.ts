import type { AppState } from "./state";
import type { Client } from "@/data/clients";
import { getPlan } from "@/data/plans";
import { getActivityName } from "@/data/activities";
import { getAccountSummary, type AccountSummary } from "@/domain/billing";
import { checkAccess, type AccessCheck } from "@/domain/access";
import { todayISO } from "@/lib/dates";

/** Estado de cuenta calculado (nunca guardado) de un alumno. */
export function selectAccount(
  state: AppState,
  client: Client,
  today = todayISO(),
): AccountSummary {
  return getAccountSummary(
    client,
    state.payments,
    getPlan(client.planId),
    today,
  );
}

/** ¿Puede ingresar? (opcionalmente, a una clase de cierta actividad). */
export function selectAccess(
  state: AppState,
  client: Client,
  activityId?: string,
  today = todayISO(),
): AccessCheck {
  return checkAccess({
    client,
    account: selectAccount(state, client, today),
    plan: getPlan(client.planId),
    activityId,
    activityName: activityId ? getActivityName(activityId) : undefined,
  });
}

/** Pagos del alumno, del más nuevo al más viejo. */
export function selectClientPayments(state: AppState, clientId: string) {
  return state.payments
    .filter((p) => p.clientId === clientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Fecha y hora del último ingreso registrado. */
export function selectLastAccess(
  state: AppState,
  clientId: string,
): string | undefined {
  return state.attendance
    .filter((a) => a.clientId === clientId && a.status === "present")
    .reduce<
      string | undefined
    >((latest, a) => (!latest || a.recordedAt > latest ? a.recordedAt : latest), undefined);
}

/** Asistencias del alumno, de la más nueva a la más vieja. */
export function selectClientAttendance(state: AppState, clientId: string) {
  return state.attendance
    .filter((a) => a.clientId === clientId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}
