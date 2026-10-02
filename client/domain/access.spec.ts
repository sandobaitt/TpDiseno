import { describe, expect, it } from "vitest";
import { checkAccess } from "./access";
import type { AccountSummary } from "./billing";
import type { Client } from "@/data/clients";
import type { Plan } from "@/data/plans";

const plan: Plan = {
  id: "pl_m",
  name: "Musculación",
  status: "active",
  monthlyPriceArs: 30000,
  activityIds: ["ac_musc"],
};

const baseClient: Client = {
  id: "cl_x",
  branchId: "br_001",
  fullName: "Alumno",
  email: "a@b.com",
  dni: "1",
  planId: plan.id,
  enrolledAt: "2026-01-01",
  status: "active",
  createdAt: "2026-01-01T10:00:00",
};

function account(
  status: AccountSummary["status"],
  overdueDays = 0,
): AccountSummary {
  return {
    status,
    charges: [],
    unpaid: [],
    owedAmount: status === "al_dia" ? 0 : 30000,
    overdueAmount: 0,
    overdueDays,
    nextDueDate: "2026-04-05",
    blockDate: "2026-04-20",
  };
}

describe("habilitación para ingresar", () => {
  it("habilitado si está al día y la clase está en su plan", () => {
    const r = checkAccess({
      client: baseClient,
      account: account("al_dia"),
      plan,
      activityId: "ac_musc",
    });
    expect(r.allowed).toBe(true);
    expect(r.warning).toBeUndefined();
  });

  it("deudor puede ingresar, pero con aviso de cuándo se bloquea", () => {
    const r = checkAccess({
      client: baseClient,
      account: account("deudor", 4),
      plan,
    });
    expect(r.allowed).toBe(true);
    expect(r.warning).toContain("4 días");
  });

  it("bloqueado por deuda no puede ingresar", () => {
    const r = checkAccess({
      client: baseClient,
      account: account("bloqueado", 15),
      plan,
    });
    expect(r).toMatchObject({ allowed: false, reason: "deuda" });
  });

  it("no puede entrar a una clase que su plan no incluye", () => {
    const r = checkAccess({
      client: baseClient,
      account: account("al_dia"),
      plan,
      activityId: "ac_zumba",
      activityName: "Zumba",
    });
    expect(r).toMatchObject({ allowed: false, reason: "plan_no_incluye" });
    expect(r.detail).toContain("Zumba");
  });

  it("la restricción manual bloquea aunque esté al día", () => {
    const restringido = {
      ...baseClient,
      manualRestriction: {
        reason: "Falta apto físico",
        byUserId: "us_se_001",
        at: "2026-03-01",
      },
    };
    const r = checkAccess({
      client: restringido,
      account: account("al_dia"),
      plan,
    });
    expect(r).toMatchObject({
      allowed: false,
      reason: "restriccion_manual",
      detail: "Falta apto físico",
    });
  });

  it("dado de baja no puede ingresar", () => {
    const r = checkAccess({
      client: { ...baseClient, status: "inactive" },
      account: account("inactivo"),
      plan,
    });
    expect(r).toMatchObject({ allowed: false, reason: "inactivo" });
  });
});
