import { getMockSession } from "@/data/users";
import { getSlot } from "@/data/schedule";
import { getTeacher } from "@/data/teachers";
import { getActivityName } from "@/data/activities";
import { branchesMock } from "@/data/branches";
import {
  managerNotifications,
  novedadNotifications,
  secretaryNotifications,
  studentNotifications,
  teacherNotifications,
  type AppNotification,
} from "@/domain/notifications";
import { formatDateLong, todayISO } from "@/lib/dates";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";

export interface NotificationItem extends AppNotification {
  read: boolean;
}

/** Avisos del usuario logueado según su rol, con lo que ya leyó. */
export function useNotifications() {
  const state = useAppState();
  const actions = useStoreActions();
  const session = getMockSession();
  const today = todayISO();

  let list: AppNotification[] = [];
  switch (session?.role) {
    case "alumno": {
      const client = state.clients.find((c) => c.id === session.clientId);
      if (client)
        list = studentNotifications({
          client,
          account: selectAccount(state, client, today),
          payments: state.payments,
          communications: state.communications,
          today,
        });
      break;
    }
    case "secretario":
      list = secretaryNotifications({
        branchClients: state.clients.filter(
          (c) => c.branchId === session.branchId,
        ),
        statusOf: (c) => selectAccount(state, c, today).status,
        novedades: state.novedades.filter(
          (n) => n.branchId === session.branchId,
        ),
        today,
      });
      break;
    case "encargado": {
      const inBranch = (slotId: string) =>
        getSlot(slotId)?.branchId === session.branchId;
      list = managerNotifications({
        novedades: state.novedades.filter(
          (n) => n.branchId === session.branchId && !n.annulled,
        ),
        rejectedReplacements: state.replacements
          .filter((r) => r.status === "rejected" && inBranch(r.slotId))
          .map((r) => {
            const slot = getSlot(r.slotId);
            return {
              id: r.id,
              detail: `${slot ? getActivityName(slot.activityId) : "Clase"} del ${formatDateLong(r.date)}: ${getTeacher(r.candidateTeacherId)?.fullName ?? "el profesor"} no puede cubrirla.`,
              date: r.respondedAt ?? r.requestedAt,
            };
          }),
        observations: state.bitacoras
          .filter((b) => b.branchId === session.branchId)
          .map((b) => ({
            id: b.id,
            title: b.title,
            teacherName: getTeacher(b.teacherId)?.fullName ?? "un profesor",
            date: b.createdAt,
          })),
        toConfirm: state.teacherAttendance.filter(
          (a) => !a.confirmedAt && inBranch(a.slotId),
        ).length,
        today,
      });
      break;
    }
    case "admin":
      list = novedadNotifications(state.novedades, "/admin/novedades");
      break;
    case "profesor":
      list = teacherNotifications({
        teacherId: session.teacherId ?? "",
        replacements: state.replacements,
        novedades: state.novedades,
        teacherOfSlot: (slotId) => getSlot(slotId)?.teacherId,
        today,
        describe: (r) => {
          const slot = getSlot(r.slotId);
          const branch = branchesMock.find((b) => b.id === slot?.branchId);
          return `${slot ? getActivityName(slot.activityId) : "Clase"} del ${formatDateLong(r.date)}${slot ? ` a las ${slot.start}` : ""}${branch ? ` en ${branch.name}` : ""}.`;
        },
      });
      break;
  }

  const read = new Set(
    session ? (state.notificationReads[session.id] ?? []) : [],
  );
  const items: NotificationItem[] = list.map((n) => ({
    ...n,
    read: read.has(n.id),
  }));
  const unread = items.filter((n) => !n.read);

  return {
    items,
    unreadCount: unread.length,
    markRead: (id: string) => actions.markNotificationsRead([id]),
    markAllRead: () => actions.markNotificationsRead(unread.map((n) => n.id)),
  };
}
