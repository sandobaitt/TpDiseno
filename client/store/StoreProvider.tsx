import * as React from "react";
import { createSeedState, type AppState } from "./state";
import { storeReducer } from "./reducer";
import type { ActionMeta, StoreAction } from "./actions";
import type { Attachment, Client, HealthDeclaration } from "@/data/clients";
import {
  PAYMENT_METHOD_LABELS,
  type Payment,
  type PaymentMethod,
} from "@/data/payments";
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
import { formatDate, todayISO } from "@/lib/dates";
import { formatARS } from "@/lib/format";

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

function nowISO(): string {
  return `${todayISO()}T${new Date().toTimeString().slice(0, 8)}`;
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
          meta: meta(`Inscribió a ${client.fullName}`, "alumno", client.id),
        });
        return client;
      },
      updateClient(clientId: string, changes: Partial<Client>) {
        dispatch({
          type: "client/update",
          clientId,
          changes,
          meta: meta(
            `Modificó los datos de ${clientName(clientId)}`,
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
            `Dio de baja a ${clientName(clientId)}: ${reason}`,
            "alumno",
            clientId,
          ),
        });
      },
      reactivateClient(clientId: string) {
        dispatch({
          type: "client/reactivate",
          clientId,
          meta: meta(`Reactivó a ${clientName(clientId)}`, "alumno", clientId),
        });
      },
      restrictClient(clientId: string, reason: string) {
        dispatch({
          type: "client/restrict",
          clientId,
          reason,
          meta: meta(
            `Restringió el acceso de ${clientName(clientId)}: ${reason}`,
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
            `Quitó la restricción de acceso de ${clientName(clientId)}`,
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
            `Actualizó la declaración jurada de salud de ${clientName(clientId)}`,
            "alumno",
            clientId,
          ),
        });
      },
      addAttachment(clientId: string, attachment: Attachment) {
        const kind =
          attachment.kind === "certificado"
            ? "un certificado médico"
            : "una autorización";
        dispatch({
          type: "client/addAttachment",
          clientId,
          attachment,
          meta: meta(
            `Adjuntó ${kind} (${attachment.fileName}) a la ficha de ${clientName(clientId)}`,
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
            `Registró el pago ${payment.receiptNumber} de ${client?.fullName ?? "alumno"}: ${formatARS(payment.amountArs)} (${PAYMENT_METHOD_LABELS[payment.method]})`,
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
        dispatch({
          type: "attendance/save",
          records,
          meta: meta(
            `Registró la asistencia de ${records.length} alumnos en ${slotLabel(slotId, date)}`,
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
