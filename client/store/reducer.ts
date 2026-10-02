import type { AppState } from "./state";
import type { ActivityEntry, StoreAction } from "./actions";

function upsertBy<T>(
  list: T[],
  items: T[],
  sameKey: (a: T, b: T) => boolean,
): T[] {
  const rest = list.filter(
    (existing) => !items.some((item) => sameKey(existing, item)),
  );
  return [...items, ...rest];
}

function updateClient(
  state: AppState,
  clientId: string,
  changes: Partial<AppState["clients"][number]>,
): AppState {
  return {
    ...state,
    clients: state.clients.map((c) =>
      c.id === clientId ? { ...c, ...changes } : c,
    ),
  };
}

/** Aplica el cambio de datos (sin el registro de actividad). Función pura. */
function applyAction(state: AppState, action: StoreAction): AppState {
  switch (action.type) {
    case "client/register":
      return {
        ...state,
        clients: [
          {
            ...action.client,
            createdBy: action.client.createdBy ?? action.meta.userId,
          },
          ...state.clients,
        ],
      };
    case "client/update":
      return updateClient(state, action.clientId, action.changes);
    case "client/deactivate":
      return updateClient(state, action.clientId, {
        status: "inactive",
        deactivatedAt: action.meta.at.slice(0, 10),
        deactivationReason: action.reason,
        deactivatedBy: action.meta.userId,
      });
    case "client/reactivate": {
      const client = state.clients.find((c) => c.id === action.clientId);
      const back = action.meta.at.slice(0, 10);
      return updateClient(state, action.clientId, {
        status: "active",
        // El tiempo que estuvo de baja queda registrado y no se cobra.
        inactivePeriods: client?.deactivatedAt
          ? [
              ...(client.inactivePeriods ?? []),
              { from: client.deactivatedAt, to: back },
            ]
          : client?.inactivePeriods,
        deactivatedAt: undefined,
        deactivationReason: undefined,
        deactivatedBy: undefined,
      });
    }
    case "client/restrict":
      return updateClient(state, action.clientId, {
        manualRestriction: {
          reason: action.reason,
          byUserId: action.meta.userId,
          at: action.meta.at.slice(0, 10),
        },
      });
    case "client/unrestrict":
      return updateClient(state, action.clientId, {
        manualRestriction: undefined,
      });
    case "client/saveHealth":
      return updateClient(state, action.clientId, { health: action.health });
    case "client/addAttachment": {
      const client = state.clients.find((c) => c.id === action.clientId);
      const attachment = {
        ...action.attachment,
        uploadedBy: action.attachment.uploadedBy ?? action.meta.userId,
      };
      return updateClient(state, action.clientId, {
        attachments: [attachment, ...(client?.attachments ?? [])],
      });
    }
    case "client/reviewAttachment": {
      const client = state.clients.find((c) => c.id === action.clientId);
      return updateClient(state, action.clientId, {
        attachments: client?.attachments?.map((doc) =>
          doc.id === action.attachmentId
            ? {
                ...doc,
                status: "approved",
                reviewedBy: action.meta.userId,
                reviewedAt: action.meta.at.slice(0, 10),
              }
            : doc,
        ),
      });
    }
    case "payment/register":
      return { ...state, payments: [action.payment, ...state.payments] };
    case "attendance/save":
      return {
        ...state,
        attendance: upsertBy(
          state.attendance,
          action.records,
          (a, b) =>
            a.clientId === b.clientId &&
            a.slotId === b.slotId &&
            a.date === b.date,
        ),
      };
    case "teacherAttendance/save":
      return {
        ...state,
        teacherAttendance: upsertBy(
          state.teacherAttendance,
          action.records,
          (a, b) => a.slotId === b.slotId && a.date === b.date,
        ),
      };
    case "teacherAttendance/confirm":
      return {
        ...state,
        teacherAttendance: state.teacherAttendance.map((a) =>
          a.id === action.id
            ? {
                ...a,
                confirmedBy: action.meta.userId,
                confirmedAt: action.meta.at.slice(0, 10),
              }
            : a,
        ),
      };
    case "teacherAttendance/correct":
      return {
        ...state,
        teacherAttendance: state.teacherAttendance.map((a) =>
          a.id === action.id
            ? {
                ...a,
                status: action.status,
                correction: {
                  by: action.meta.userId,
                  at: action.meta.at,
                  reason: action.reason,
                  previousStatus: a.status,
                },
                confirmedBy: action.meta.userId,
                confirmedAt: action.meta.at.slice(0, 10),
              }
            : a,
        ),
      };
    case "replacement/respond":
      return {
        ...state,
        replacements: state.replacements.map((r) =>
          r.id === action.id
            ? {
                ...r,
                status: action.accept ? "accepted" : "rejected",
                respondedAt: action.meta.at.slice(0, 10),
              }
            : r,
        ),
      };
    case "novedad/add":
      return { ...state, novedades: [action.novedad, ...state.novedades] };
    case "novedad/resolve":
      return {
        ...state,
        novedades: state.novedades.map((n) =>
          n.id === action.id ? { ...n, status: "resolved" } : n,
        ),
      };
    case "novedad/remove":
      return {
        ...state,
        novedades: state.novedades.filter((n) => n.id !== action.id),
      };
    case "bitacora/add":
      return { ...state, bitacoras: [action.bitacora, ...state.bitacoras] };
    case "communication/send":
      return {
        ...state,
        communications: [action.communication, ...state.communications],
      };
    case "notification/markRead": {
      const current = state.notificationReads[action.userId] ?? [];
      return {
        ...state,
        notificationReads: {
          ...state.notificationReads,
          [action.userId]: [...new Set([...current, ...action.ids])],
        },
      };
    }
  }
}

let activityCounter = 0;

/** Reducer del store: aplica el cambio y deja constancia en el registro de actividad. */
export function storeReducer(state: AppState, action: StoreAction): AppState {
  const next = applyAction(state, action);
  // Marcar avisos como leídos no es una operación del negocio: no va al registro.
  if (action.type === "notification/markRead") return next;
  activityCounter += 1;
  const entry: ActivityEntry = {
    id: `act_${activityCounter}`,
    at: action.meta.at,
    userId: action.meta.userId,
    summary: action.meta.summary,
    entity: action.meta.entity,
    entityId: action.meta.entityId,
  };
  return { ...next, activity: [entry, ...next.activity] };
}
