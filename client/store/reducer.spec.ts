import { describe, expect, it } from "vitest";
import { storeReducer } from "./reducer";
import { createSeedState, type AppState } from "./state";
import { selectAccess, selectAccount } from "./selectors";
import type { ActionMeta, StoreAction } from "./actions";
import type { Payment } from "@/data/payments";
import { scheduleMock } from "@/data/schedule";
import { sessionsBetween } from "@/domain/schedule";
import { SEED_TODAY } from "@/data/seed";

const meta = (summary = "acción de prueba"): ActionMeta => ({
  userId: "us_se_001",
  at: `${SEED_TODAY}T10:00:00`,
  summary,
  entity: "pago",
  entityId: "x",
});

/** Omit que se aplica a cada variante de la unión de acciones. */
type ActionWithoutMeta = StoreAction extends infer A
  ? A extends StoreAction
    ? Omit<A, "meta">
    : never
  : never;

function dispatch(state: AppState, action: ActionWithoutMeta): AppState {
  return storeReducer(state, { ...action, meta: meta() } as StoreAction);
}

describe("flujo conectado: pago → estado de cuenta → habilitación", () => {
  it("cobrar lo adeudado desbloquea a la alumna y queda registrado", () => {
    let state = createSeedState();
    const laura = state.clients.find((c) => c.id === "cl_002")!;
    const before = selectAccount(state, laura, SEED_TODAY);
    expect(before.status).toBe("bloqueado");
    expect(selectAccess(state, laura, undefined, SEED_TODAY).allowed).toBe(
      false,
    );

    const payment: Payment = {
      id: "pay_test",
      receiptNumber: "R-999999",
      clientId: laura.id,
      branchId: laura.branchId,
      createdAt: `${SEED_TODAY}T10:00:00`,
      periods: before.unpaid.map((c) => c.period),
      concept: "membership",
      subtotalArs: before.owedAmount,
      discountArs: 0,
      amountArs: before.owedAmount,
      method: "cash",
      status: "approved",
      processedBy: "us_se_001",
    };
    state = dispatch(state, { type: "payment/register", payment });

    expect(selectAccount(state, laura, SEED_TODAY).status).toBe("al_dia");
    expect(selectAccess(state, laura, undefined, SEED_TODAY).allowed).toBe(
      true,
    );
    expect(state.activity[0]).toMatchObject({
      userId: "us_se_001",
      entity: "pago",
    });
  });
});

describe("otras acciones del store", () => {
  it("la baja es lógica: el alumno queda inactivo y conserva su historial", () => {
    let state = createSeedState();
    const pagosAntes = state.payments.filter(
      (p) => p.clientId === "cl_001",
    ).length;
    state = dispatch(state, {
      type: "client/deactivate",
      clientId: "cl_001",
      reason: "Prueba",
    });
    const martin = state.clients.find((c) => c.id === "cl_001")!;
    expect(martin).toMatchObject({
      status: "inactive",
      deactivationReason: "Prueba",
    });
    expect(state.payments.filter((p) => p.clientId === "cl_001")).toHaveLength(
      pagosAntes,
    );
    expect(selectAccount(state, martin, SEED_TODAY).status).toBe("inactivo");

    state = dispatch(state, { type: "client/reactivate", clientId: "cl_001" });
    expect(state.clients.find((c) => c.id === "cl_001")!.status).toBe("active");
  });

  it("la restricción manual bloquea el acceso aunque esté al día", () => {
    let state = createSeedState();
    state = dispatch(state, {
      type: "client/restrict",
      clientId: "cl_001",
      reason: "Falta apto físico",
    });
    const martin = state.clients.find((c) => c.id === "cl_001")!;
    expect(selectAccess(state, martin, undefined, SEED_TODAY)).toMatchObject({
      allowed: false,
      reason: "restriccion_manual",
    });
  });

  it("aceptar un reemplazo cambia quién dicta la clase ese día", () => {
    let state = createSeedState();
    const pendiente = state.replacements.find((r) => r.status === "pending")!;
    state = dispatch(state, {
      type: "replacement/respond",
      id: pendiente.id,
      accept: true,
    });
    const [session] = sessionsBetween(
      pendiente.date,
      pendiente.date,
      scheduleMock,
      state.replacements,
    ).filter((s) => s.slotId === pendiente.slotId);
    expect(session.teacherId).toBe(pendiente.candidateTeacherId);
  });

  it("guardar asistencia reemplaza el registro del mismo alumno, clase y día", () => {
    let state = createSeedState();
    const registro = state.attendance[0];
    const total = state.attendance.length;
    state = dispatch(state, {
      type: "attendance/save",
      records: [
        {
          ...registro,
          status: registro.status === "present" ? "absent" : "present",
        },
      ],
    });
    expect(state.attendance).toHaveLength(total);
    expect(state.attendance[0].status).not.toBe(registro.status);
  });

  it("cada acción agrega una línea al registro de actividad", () => {
    let state = createSeedState();
    const before = state.activity.length;
    state = dispatch(state, { type: "novedad/resolve", id: "nov_001" });
    state = dispatch(state, {
      type: "novedad/annul",
      id: "nov_002",
      reason: "Cargada por error",
    });
    expect(state.activity).toHaveLength(before + 2);
  });

  it("las novedades no se borran: se anulan con motivo", () => {
    let state = createSeedState();
    const total = state.novedades.length;
    state = dispatch(state, {
      type: "novedad/annul",
      id: "nov_001",
      reason: "Duplicada",
    });
    expect(state.novedades).toHaveLength(total);
    expect(
      state.novedades.find((n) => n.id === "nov_001")?.annulled,
    ).toMatchObject({
      by: "us_se_001",
      reason: "Duplicada",
    });
  });

  it("la semilla ya trae la historia de cada alumno (inscripción y pagos)", () => {
    const state = createSeedState();
    const deMartin = state.activity.filter(
      (a) =>
        a.entityId === "cl_001" ||
        state.payments.some(
          (p) => p.id === a.entityId && p.clientId === "cl_001",
        ),
    );
    expect(deMartin.some((a) => a.summary.startsWith("Inscribió"))).toBe(true);
    expect(deMartin.some((a) => a.summary.startsWith("Registró el pago"))).toBe(
      true,
    );
  });

  it("una comunicación queda guardada y marcar avisos como leídos no ensucia el registro", () => {
    let state = createSeedState();
    const before = state.activity.length;
    state = dispatch(state, {
      type: "communication/send",
      communication: {
        id: "com_test",
        templateId: "libre",
        subject: "Prueba",
        body: "Hola {nombre}",
        audience: { kind: "todos" },
        audienceLabel: "Todos",
        recipientIds: ["cl_001"],
        byEmail: false,
        sentBy: "us_se_001",
        sentAt: `${SEED_TODAY}T10:00:00`,
      },
    });
    state = dispatch(state, {
      type: "notification/markRead",
      userId: "us_al_001",
      ids: ["com_test", "com_test"],
    });
    expect(state.communications[0].id).toBe("com_test");
    expect(state.notificationReads.us_al_001).toEqual(["com_test"]);
    expect(state.activity).toHaveLength(before + 1);
  });

  it("reactivar guarda el período de baja (no se cobra)", () => {
    let state = createSeedState();
    const ana = state.clients.find((c) => c.id === "cl_004")!;
    expect(ana.status).toBe("inactive");
    state = dispatch(state, { type: "client/reactivate", clientId: ana.id });
    const back = state.clients.find((c) => c.id === ana.id)!;
    expect(back.status).toBe("active");
    expect(back.inactivePeriods).toEqual([
      { from: ana.deactivatedAt, to: SEED_TODAY },
    ]);
    // no queda con deuda por los meses en que no vino
    expect(selectAccount(state, back, SEED_TODAY).status).not.toBe("bloqueado");
  });

  it("el encargado confirma varias asistencias de profesores juntas", () => {
    let state = createSeedState();
    const pending = state.teacherAttendance
      .filter((a) => !a.confirmedAt)
      .slice(0, 3)
      .map((a) => a.id);
    expect(pending.length).toBeGreaterThan(0);
    state = dispatch(state, {
      type: "teacherAttendance/confirmMany",
      ids: pending,
    });
    const confirmed = state.teacherAttendance.filter((a) =>
      pending.includes(a.id),
    );
    expect(
      confirmed.every(
        (a) => a.confirmedBy === "us_se_001" && a.confirmedAt === SEED_TODAY,
      ),
    ).toBe(true);
  });

  it("la inscripción guarda quién la registró", () => {
    let state = createSeedState();
    const nuevo = { ...state.clients[0], id: "cl_nuevo", createdBy: undefined };
    state = dispatch(state, { type: "client/register", client: nuevo });
    expect(state.clients[0]).toMatchObject({
      id: "cl_nuevo",
      createdBy: "us_se_001",
    });
  });

  it("revisar un certificado pendiente lo marca como revisado", () => {
    let state = createSeedState();
    const malena = state.clients.find((c) => c.id === "cl_012")!;
    const doc = malena.attachments!.find((d) => d.status === "pending")!;
    state = dispatch(state, {
      type: "client/reviewAttachment",
      clientId: malena.id,
      attachmentId: doc.id,
    });
    const reviewed = state.clients
      .find((c) => c.id === malena.id)!
      .attachments!.find((d) => d.id === doc.id)!;
    expect(reviewed).toMatchObject({
      status: "approved",
      reviewedBy: "us_se_001",
      reviewedAt: SEED_TODAY,
    });
  });
});
