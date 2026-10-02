import { describe, expect, it } from "vitest";
import { dueDateFor, getAccountSummary, proratedAmount } from "./billing";
import type { Client } from "@/data/clients";
import type { Payment } from "@/data/payments";
import type { Plan } from "@/data/plans";

const plan: Plan = {
  id: "pl_x",
  name: "Musculación",
  status: "active",
  monthlyPriceArs: 30000,
  activityIds: ["ac_musc"],
};

function client(enrolledAt: string, extra: Partial<Client> = {}): Client {
  return {
    id: "cl_x",
    branchId: "br_001",
    fullName: "Alumno de prueba",
    email: "a@b.com",
    dni: "1",
    planId: plan.id,
    enrolledAt,
    status: "active",
    createdAt: `${enrolledAt}T10:00:00`,
    ...extra,
  };
}

function paid(...periods: string[]): Payment[] {
  return periods.map((period) => ({
    id: `p_${period}`,
    receiptNumber: "R-1",
    clientId: "cl_x",
    branchId: "br_001",
    createdAt: `${period}-02T10:00:00`,
    periods: [period],
    concept: "membership",
    subtotalArs: plan.monthlyPriceArs,
    discountArs: 0,
    amountArs: plan.monthlyPriceArs,
    method: "cash",
    status: "approved",
    processedBy: "us_se_001",
  }));
}

describe("prorrateo del mes de alta", () => {
  it("inscripto el día 1 paga el mes completo", () => {
    expect(proratedAmount(30000, "2026-04-01")).toBe(30000);
  });

  it("inscripto el 16 de un mes de 30 días paga 15/30", () => {
    expect(proratedAmount(30000, "2026-04-16")).toBe(15000);
  });

  it("inscripto el último día paga un día", () => {
    expect(proratedAmount(31000, "2026-05-31")).toBe(1000);
  });
});

describe("vencimientos", () => {
  it("la cuota mensual vence el día 5", () => {
    expect(dueDateFor("2026-06", "2026-01-10")).toBe("2026-06-05");
  });

  it("la cuota de alta vence 5 días después de inscribirse", () => {
    expect(dueDateFor("2026-04", "2026-04-16")).toBe("2026-04-21");
  });

  it("si se inscribe antes del día 5, igual vence el 5", () => {
    expect(dueDateFor("2026-04", "2026-04-01")).toBe("2026-04-06");
  });
});

describe("estado de cuenta", () => {
  const alumno = client("2026-01-01");

  it("al día si pagó todo", () => {
    const s = getAccountSummary(
      alumno,
      paid("2026-01", "2026-02", "2026-03"),
      plan,
      "2026-03-10",
    );
    expect(s.status).toBe("al_dia");
    expect(s.owedAmount).toBe(0);
    expect(s.nextDueDate).toBe("2026-04-05");
  });

  it("por vencer entre el día 1 y el 5 sin pagar el mes", () => {
    const s = getAccountSummary(
      alumno,
      paid("2026-01", "2026-02"),
      plan,
      "2026-03-05",
    );
    expect(s.status).toBe("por_vencer");
    expect(s.owedAmount).toBe(30000);
    expect(s.overdueDays).toBe(0);
  });

  it("deudor desde el día 6 (puede ingresar)", () => {
    const s = getAccountSummary(
      alumno,
      paid("2026-01", "2026-02"),
      plan,
      "2026-03-06",
    );
    expect(s.status).toBe("deudor");
    expect(s.overdueDays).toBe(1);
    expect(s.blockDate).toBe("2026-03-20");
  });

  it("todavía deudor el día 19 (14 días de atraso)", () => {
    const s = getAccountSummary(
      alumno,
      paid("2026-01", "2026-02"),
      plan,
      "2026-03-19",
    );
    expect(s.status).toBe("deudor");
    expect(s.overdueDays).toBe(14);
  });

  it("bloqueado el día 20 (15 días de atraso), sin intereses", () => {
    const s = getAccountSummary(
      alumno,
      paid("2026-01", "2026-02"),
      plan,
      "2026-03-20",
    );
    expect(s.status).toBe("bloqueado");
    expect(s.overdueDays).toBe(15);
    expect(s.owedAmount).toBe(30000);
  });

  it("suma todas las cuotas adeudadas y cuenta el atraso desde la más vieja", () => {
    const s = getAccountSummary(alumno, paid("2026-01"), plan, "2026-03-03");
    expect(s.unpaid.map((c) => c.period)).toEqual(["2026-02", "2026-03"]);
    expect(s.owedAmount).toBe(60000);
    expect(s.overdueAmount).toBe(30000);
    expect(s.overdueDays).toBe(26);
    expect(s.status).toBe("bloqueado");
  });

  it("un pago rechazado no cuenta como pagado", () => {
    const rechazado = paid("2026-03").map((p) => ({
      ...p,
      status: "rejected" as const,
    }));
    const s = getAccountSummary(
      alumno,
      [...paid("2026-01", "2026-02"), ...rechazado],
      plan,
      "2026-03-08",
    );
    expect(s.status).toBe("deudor");
  });

  it("el alta a mitad de mes cobra proporcional y da 5 días para pagar", () => {
    const nuevo = client("2026-04-16");
    const s = getAccountSummary(nuevo, [], plan, "2026-04-18");
    expect(s.charges).toHaveLength(1);
    expect(s.charges[0]).toMatchObject({
      prorated: true,
      amount: 15000,
      dueDate: "2026-04-21",
    });
    expect(s.status).toBe("por_vencer");
  });

  it("dado de baja queda inactivo", () => {
    const baja = client("2026-01-01", {
      status: "inactive",
      deactivatedAt: "2026-02-20",
    });
    const s = getAccountSummary(
      baja,
      paid("2026-01", "2026-02"),
      plan,
      "2026-05-10",
    );
    expect(s.status).toBe("inactivo");
    expect(s.charges.map((c) => c.period)).toEqual(["2026-01", "2026-02"]);
  });
});
