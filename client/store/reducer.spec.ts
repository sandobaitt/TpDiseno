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
    state = dispatch(state, { type: "novedad/resolve", id: "nov_001" });
    state = dispatch(state, { type: "novedad/remove", id: "nov_002" });
    expect(state.activity).toHaveLength(2);
  });
});
