import { getMockSession, getUserName } from "@/data/users";
import type { Bitacora } from "@/data/bitacoras";
import { getSlot, scheduleMock } from "@/data/schedule";
import { promotionsMock } from "@/data/promotions";
import { getTeacher } from "@/data/teachers";
import { getActivityName } from "@/data/activities";
import { branchesMock } from "@/data/branches";
import {
  debtNotifications,
  frequentAbsenceNotifications,
  inconsistencyNotifications,
  managerNotifications,
  novedadNotifications,
  observationNotifications,
  promotionNotifications,
  scheduleNotifications,
  secretaryNotifications,
  sortNotifications,
  studentNotifications,
  teacherAbsenceNotifications,
  teacherNotifications,
  type AppNotification,
} from "@/domain/notifications";
import { findOverlaps, sessionsBetween, type Session } from "@/domain/schedule";
import { frequentAbsences } from "@/domain/attendance";
import { unjustifiedTeacherAbsences } from "@/domain/teacherAttendance";
import { branchInconsistencies } from "@/domain/enrollment";
import { branchName } from "@/components/cronograma/weekView";
import { addDays, formatDateLong, todayISO } from "@/lib/dates";
import type { AppState } from "@/store/state";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";

export interface NotificationItem extends AppNotification {
  read: boolean;
}

const teacherName = (id?: string) => getTeacher(id)?.fullName ?? "el profesor";
/** Quién escribió la observación: un profesor o alguien de secretaría. */
const observationAuthor = (b: Bitacora) =>
  b.teacherId
    ? (getTeacher(b.teacherId)?.fullName ?? "un profesor")
    : `${getUserName(b.authorUserId)} (secretaría)`;
const describeSession = (s: Session) =>
  `${getActivityName(s.activityId)} (${branchName(s.branchId)}, ${s.start}–${s.end})`;

/** Reemplazos confirmados y superposiciones de las próximas dos semanas en una sede. */
function scheduleAlerts(
  state: AppState,
  branchId: string | undefined,
  today: string,
  link: string,
): AppNotification[] {
  const sessions = sessionsBetween(
    today,
    addDays(today, 13),
    scheduleMock,
    state.replacements,
  );
  const inBranch = (s: Session) => !branchId || s.branchId === branchId;
  return scheduleNotifications({
    changes: sessions
      .filter((s) => s.replacementId && inBranch(s))
      .map((s) => ({
        id: s.replacementId!,
        date:
          state.replacements.find((r) => r.id === s.replacementId)
            ?.respondedAt ?? today,
        detail: `${getActivityName(s.activityId)} del ${formatDateLong(s.date)} a las ${s.start}: la da ${teacherName(s.teacherId)} en lugar de ${teacherName(s.originalTeacherId)}.`,
      })),
    overlaps: findOverlaps(sessions)
      .filter(([a, b]) => inBranch(a) || inBranch(b))
      .map(([a, b]) => ({
        id: `${a.slotId}-${b.slotId}-${a.date}`,
        detail: `${teacherName(a.teacherId)} tiene ${describeSession(a)} y ${describeSession(b)} el ${formatDateLong(a.date)}.`,
      })),
    today,
    link,
  });
}

/** Alumnos de la sede que faltan seguido sin justificar (requisito 3.1.20c). */
function absenceAlerts(
  state: AppState,
  branchId: string | undefined,
  today: string,
  prefix: string,
  link?: string,
): AppNotification[] {
  const students = frequentAbsences(
    state.attendance.filter((a) => !branchId || a.branchId === branchId),
    today,
  ).map((f) => ({
    ...f,
    name: state.clients.find((c) => c.id === f.clientId)?.fullName ?? "Alumno",
  }));
  return frequentAbsenceNotifications({ students, today, prefix, link });
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
      list = sortNotifications([
        ...secretaryNotifications({
          branchClients: state.clients.filter(
            (c) => c.branchId === session.branchId,
          ),
          statusOf: (c) => selectAccount(state, c, today).status,
          novedades: state.novedades.filter(
            (n) => n.branchId === session.branchId,
          ),
          today,
        }),
        ...scheduleAlerts(
          state,
          session.branchId,
          today,
          "/secretaria/cronograma",
        ),
        ...absenceAlerts(
          state,
          session.branchId,
          today,
          "sec",
          "/secretaria/alumnos",
        ),
      ]);
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
            teacherName: observationAuthor(b),
            date: b.createdAt,
          })),
        toConfirm: state.teacherAttendance.filter(
          (a) => !a.confirmedAt && inBranch(a.slotId),
        ).length,
        today,
      });
      list = sortNotifications([
        ...list,
        // 3.1.8a: alumnos con deuda de la sede y promociones vencidas o por vencer.
        ...debtNotifications({
          branchClients: state.clients.filter(
            (c) => c.branchId === session.branchId,
          ),
          statusOf: (c) => selectAccount(state, c, today).status,
          today,
          prefix: "enc",
          link: "/encargado/inscripciones",
        }),
        ...promotionNotifications({ promotions: promotionsMock, today }),
        // 3.1.8b y 3.1.17c: reemplazos confirmados y superposiciones.
        ...scheduleAlerts(
          state,
          session.branchId,
          today,
          "/encargado/asistencia",
        ),
        // 3.1.7c: ausencias de profesores sin justificar.
        ...teacherAbsenceNotifications({
          absences: unjustifiedTeacherAbsences(
            state.teacherAttendance.filter((a) => inBranch(a.slotId)),
            today,
          ).map((a) => {
            const slot = getSlot(a.slotId);
            return {
              id: a.id,
              date: a.recordedAt,
              detail: `${teacherName(a.teacherId)} no dio ${slot ? getActivityName(slot.activityId) : "su clase"} del ${formatDateLong(a.date)} y no hay justificación.`,
            };
          }),
          link: "/encargado/asistencia",
        }),
        // 3.1.20c: alumnos con inasistencias frecuentes.
        ...absenceAlerts(state, session.branchId, today, "enc"),
        // 3.1.6c: inconsistencias o datos faltantes en inscripciones y pagos.
        ...inconsistencyNotifications({
          count: branchInconsistencies(
            state.clients.filter((c) => c.branchId === session.branchId),
            state.payments.filter((p) => p.branchId === session.branchId),
            today,
          ).length,
          today,
          link: "/encargado/inscripciones?tab=revisar",
        }),
      ]);
      break;
    }
    case "admin":
      list = sortNotifications([
        ...novedadNotifications(state.novedades, "/admin/novedades"),
        // 3.1.16c: observaciones de secretaría que piden avisarle al administrador.
        ...observationNotifications({
          observations: state.bitacoras
            .filter((b) => b.notifyAdmin)
            .map((b) => ({
              id: b.id,
              title: b.title,
              teacherName: observationAuthor(b),
              date: b.createdAt,
            })),
          today,
          link: "/admin/observaciones",
        }),
      ]);
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
