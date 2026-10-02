import * as React from "react";
import { createSeedState, type AppState } from "./state";
import { storeReducer } from "./reducer";
import type { ActionMeta, StoreAction } from "./actions";
import { activityText } from "./activityText";
import type { Attachment, Client, HealthDeclaration } from "@/data/clients";
import type { Payment, PaymentMethod } from "@/data/payments";
import type { StudentAttendance } from "@/data/attendance";
import {
  TEACHER_ATTENDANCE_LABELS,
  type TeacherAttendance,
  type TeacherAttendanceStatus,
} from "@/data/teacherAttendance";
import type { Novedad } from "@/data/novedades";
import type { Bitacora } from "@/data/bitacoras";
import { getMockSession } from "@/data/users";
import { getSlot } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { getTeacher } from "@/data/teachers";
import { formatDate, nowISO } from "@/lib/dates";

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<StoreAction>;
  stateRef: React.MutableRefObject<AppState>;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

/**
 * Store central en memoria: todas las pantallas leen y modifican los mismos
 * datos, así los flujos quedan conectados (cobrar → estado de cuenta →
 * habilitación). No se guarda entre recargas: recargar reinicia la demo.
 */
export function StoreProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: AppState;
}) {
  const [state, dispatch] = React.useReducer(
    storeReducer,
    initialState,
    (init) => init ?? createSeedState(),
  );
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const value = React.useMemo(() => ({ state, dispatch, stateRef }), [state]);
  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

function useStoreContext(): StoreContextValue {
  const ctx = React.useContext(StoreContext);
  if (!ctx)
    throw new Error(
      "useAppState/useStoreActions deben usarse dentro de <StoreProvider>.",
    );
  return ctx;
}

/** Datos actuales (alumnos, pagos, asistencias…). */
export function useAppState(): AppState {
  return useStoreContext().state;
}

let idCounter = 0;
function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter}`;
}

function nextReceiptNumber(payments: Payment[]): string {
  const max = payments.reduce(
    (m, p) => Math.max(m, Number(p.receiptNumber.replace(/\D/g, "")) || 0),
    0,
  );
  return `R-${String(max + 1).padStart(6, "0")}`;
}

export interface RegisterPaymentInput {
  clientId: string;
  periods: string[];
  subtotalArs: number;
  discountArs: number;
  promoId?: string;
  method: PaymentMethod;
  /** Pago hecho por el alumno desde la app. */
  online?: boolean;
  description?: string;
}

/** Acciones del store. Cada una deja registro de quién la hizo, qué y cuándo. */
export function useStoreActions() {
  const { dispatch, stateRef } = useStoreContext();

  return React.useMemo(() => {
    const meta = (
      summary: string,
      entity: ActionMeta["entity"],
      entityId: string,
    ): ActionMeta => ({
      userId: getMockSession()?.id ?? "sistema",
      at: nowISO(),
      summary,
      entity,
      entityId,
    });
    const clientName = (id: string) =>
      stateRef.current.clients.find((c) => c.id === id)?.fullName ?? "alumno";
    const slotLabel = (slotId: string, date: string) => {
      const slot = getSlot(slotId);
      return `${slot ? getActivityName(slot.activityId) : "clase"} del ${formatDate(date)}`;
    };

    return {
      registerClient(client: Client): Client {
        dispatch({
          type: "client/register",
          client,
          meta: meta(
            activityText.registerClient(client.fullName),
            "alumno",
            client.id,
          ),
        });
        return client;
      },
      updateClient(clientId: string, changes: Partial<Client>) {
        dispatch({
          type: "client/update",
          clientId,
          changes,
          meta: meta(
            activityText.updateClient(clientName(clientId)),
            "alumno",
            clientId,
          ),
        });
      },
      deactivateClient(clientId: string, reason: string) {
        dispatch({
          type: "client/deactivate",
          clientId,
          reason,
          meta: meta(
            activityText.deactivateClient(clientName(clientId), reason),
            "alumno",
            clientId,
          ),
        });
      },
      reactivateClient(clientId: string) {
        dispatch({
          type: "client/reactivate",
          clientId,
          meta: meta(
            activityText.reactivateClient(clientName(clientId)),
            "alumno",
            clientId,
          ),
        });
      },
      restrictClient(clientId: string, reason: string) {
        dispatch({
          type: "client/restrict",
          clientId,
          reason,
          meta: meta(
            activityText.restrictClient(clientName(clientId), reason),
            "alumno",
            clientId,
          ),
        });
      },
      unrestrictClient(clientId: string) {
        dispatch({
          type: "client/unrestrict",
          clientId,
          meta: meta(
            activityText.unrestrictClient(clientName(clientId)),
            "alumno",
            clientId,
          ),
        });
      },
      saveHealth(clientId: string, health: HealthDeclaration) {
        dispatch({
          type: "client/saveHealth",
          clientId,
          health,
          meta: meta(
            activityText.saveHealth(clientName(clientId)),
            "alumno",
            clientId,
          ),
        });
      },
      addAttachment(clientId: string, attachment: Attachment) {
        dispatch({
          type: "client/addAttachment",
          clientId,
          attachment,
          meta: meta(
            activityText.addAttachment(attachment, clientName(clientId)),
            "alumno",
            clientId,
          ),
        });
      },
      reviewAttachment(clientId: string, attachmentId: string) {
        const doc = stateRef.current.clients
          .find((c) => c.id === clientId)
          ?.attachments?.find((d) => d.id === attachmentId);
        if (!doc) return;
        dispatch({
          type: "client/reviewAttachment",
          clientId,
          attachmentId,
          meta: meta(
            activityText.reviewAttachment(doc, clientName(clientId)),
            "alumno",
            clientId,
          ),
        });
      },
      registerPayment(input: RegisterPaymentInput): Payment {
        const client = stateRef.current.clients.find(
          (c) => c.id === input.clientId,
        );
        const userId = getMockSession()?.id ?? "sistema";
        const payment: Payment = {
          id: newId("pay"),
          receiptNumber: nextReceiptNumber(stateRef.current.payments),
          clientId: input.clientId,
          branchId: client?.branchId ?? "br_001",
          createdAt: nowISO(),
          periods: input.periods,
          concept: "membership",
          description: input.description,
          subtotalArs: input.subtotalArs,
          discountArs: input.discountArs,
          promoId: input.promoId,
          amountArs: input.subtotalArs - input.discountArs,
          method: input.method,
          status: "approved",
          processedBy: input.online ? "online" : userId,
        };
        dispatch({
          type: "payment/register",
          payment,
          meta: meta(
            activityText.payment(payment, client?.fullName ?? "alumno"),
            "pago",
            payment.id,
          ),
        });
        return payment;
      },
      saveAttendance(
        records: StudentAttendance[],
        slotId: string,
        date: string,
      ) {
        // Si la clase ya tenía registros, es una corrección (queda dicho en el registro).
        const correction = stateRef.current.attendance.some(
          (a) => a.slotId === slotId && a.date === date,
        );
        dispatch({
          type: "attendance/save",
          records,
          meta: meta(
            activityText.saveAttendance(
              records.length,
              slotLabel(slotId, date),
              correction,
            ),
            "asistencia",
            `${slotId}_${date}`,
          ),
        });
      },
      saveTeacherAttendance(records: TeacherAttendance[], date: string) {
        dispatch({
          type: "teacherAttendance/save",
          records,
          meta: meta(
            `Registró la asistencia de ${records.length} profesores del ${formatDate(date)}`,
            "asistencia_profesor",
            date,
          ),
        });
      },
      confirmTeacherAttendance(id: string) {
        const record = stateRef.current.teacherAttendance.find(
          (a) => a.id === id,
        );
        dispatch({
          type: "teacherAttendance/confirm",
          id,
          meta: meta(
            `Confirmó la asistencia de ${getTeacher(record?.teacherId)?.fullName ?? "profesor"} en ${record ? slotLabel(record.slotId, record.date) : "una clase"}`,
            "asistencia_profesor",
            id,
          ),
        });
      },
      correctTeacherAttendance(
        id: string,
        status: TeacherAttendanceStatus,
        reason: string,
      ) {
        const record = stateRef.current.teacherAttendance.find(
          (a) => a.id === id,
        );
        dispatch({
          type: "teacherAttendance/correct",
          id,
          status,
          reason,
          meta: meta(
            `Corrigió la asistencia de ${getTeacher(record?.teacherId)?.fullName ?? "profesor"} a "${TEACHER_ATTENDANCE_LABELS[status]}": ${reason}`,
            "asistencia_profesor",
            id,
          ),
        });
      },
      respondReplacement(id: string, accept: boolean) {
        const replacement = stateRef.current.replacements.find(
          (r) => r.id === id,
        );
        dispatch({
          type: "replacement/respond",
          id,
          accept,
          meta: meta(
            `${accept ? "Aceptó" : "Rechazó"} el reemplazo de ${replacement ? slotLabel(replacement.slotId, replacement.date) : "una clase"}`,
            "reemplazo",
            id,
          ),
        });
      },
      addNovedad(novedad: Novedad) {
        dispatch({
          type: "novedad/add",
          novedad,
          meta: meta(
            `Registró una novedad sobre ${novedad.entityName}`,
            "novedad",
            novedad.id,
          ),
        });
      },
      resolveNovedad(id: string) {
        const novedad = stateRef.current.novedades.find((n) => n.id === id);
        dispatch({
          type: "novedad/resolve",
          id,
          meta: meta(
            `Marcó como resuelta la novedad sobre ${novedad?.entityName ?? "-"}`,
            "novedad",
            id,
          ),
        });
      },
      removeNovedad(id: string) {
        const novedad = stateRef.current.novedades.find((n) => n.id === id);
        dispatch({
          type: "novedad/remove",
          id,
          meta: meta(
            `Eliminó la novedad sobre ${novedad?.entityName ?? "-"}`,
            "novedad",
            id,
          ),
        });
      },
      addBitacora(bitacora: Bitacora) {
        dispatch({
          type: "bitacora/add",
          bitacora,
          meta: meta(
            `Registró una observación: ${bitacora.title}`,
            "observacion",
            bitacora.id,
          ),
        });
      },
    };
  }, [dispatch, stateRef]);
}

export type StoreActions = ReturnType<typeof useStoreActions>;
