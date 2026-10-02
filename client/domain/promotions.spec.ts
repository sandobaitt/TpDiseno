import { describe, expect, it } from "vitest";
import {
  checkPromotion,
  findCoupon,
  listedPromotions,
  promotionDiscount,
  type PromotionContext,
} from "./promotions";
import type { Client } from "@/data/clients";
import type { Promotion } from "@/data/promotions";

const TODAY = "2026-10-02";

function alumno(id: string, extra: Partial<Client> = {}): Client {
  return {
    id,
    branchId: "br_001",
    fullName: `Alumno ${id}`,
    email: `${id}@mail.com`,
    dni: id,
    planId: "pl_002",
    enrolledAt: "2026-02-10",
    status: "active",
    createdAt: "2026-02-10T10:00:00",
    ...extra,
  };
}

const promo = (extra: Partial<Promotion>): Promotion => ({
  id: "p",
  name: "Promo",
  description: "",
  percent: 10,
  active: true,
  ...extra,
});

function ctx(extra: Partial<PromotionContext> = {}): PromotionContext {
  const client = alumno("cl_a");
  return {
    client,
    clients: [client],
    method: "debit",
    periods: ["2026-10"],
    today: TODAY,
    ...extra,
  };
}

describe("condiciones de las promociones", () => {
  it("el descuento por efectivo solo vale pagando en efectivo", () => {
    const efectivo = promo({ method: "cash" });
    expect(checkPromotion(efectivo, ctx()).ok).toBe(false);
    expect(checkPromotion(efectivo, ctx()).reason).toMatch(/efectivo/);
    expect(checkPromotion(efectivo, ctx({ method: "cash" })).ok).toBe(true);
  });

  it("respeta la antigüedad mínima", () => {
    const antiguo = promo({ minMonthsEnrolled: 12 });
    expect(checkPromotion(antiguo, ctx()).reason).toMatch(/tiene 7/);
    const veterano = alumno("cl_v", { enrolledAt: "2025-01-15" });
    expect(
      checkPromotion(antiguo, ctx({ client: veterano, clients: [veterano] }))
        .ok,
    ).toBe(true);
  });

  it("la cuota semestral pide 6 cuotas en el mismo pago", () => {
    const semestral = promo({ minPeriods: 6 });
    expect(checkPromotion(semestral, ctx()).ok).toBe(false);
    const seis = [
      "2026-10",
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
      "2027-03",
    ];
    expect(checkPromotion(semestral, ctx({ periods: seis })).ok).toBe(true);
  });

  it("el plan familiar necesita otro integrante activo de la familia", () => {
    const familiar = promo({ family: true });
    const yo = alumno("cl_a", { familyGroupId: "fam" });
    const hermano = alumno("cl_b", { familyGroupId: "fam", fullName: "Juan" });
    const bajaDelHermano = { ...hermano, status: "inactive" as const };
    expect(
      checkPromotion(
        familiar,
        ctx({ client: yo, clients: [yo, bajaDelHermano] }),
      ).ok,
    ).toBe(false);
    const ok = checkPromotion(
      familiar,
      ctx({ client: yo, clients: [yo, hermano] }),
    );
    expect(ok).toEqual({ ok: true, detail: "Familia: Juan" });
  });

  it("controla la vigencia", () => {
    expect(
      checkPromotion(promo({ validTo: "2026-09-30" }), ctx()).reason,
    ).toMatch(/Venció el 30\/09\/2026/);
    expect(checkPromotion(promo({ validFrom: "2026-10-10" }), ctx()).ok).toBe(
      false,
    );
  });

  it("la de primer mes solo aplica a la cuota de alta", () => {
    const primerMes = promo({ enrollmentOnly: true });
    expect(checkPromotion(primerMes, ctx()).ok).toBe(false);
    const nuevo = alumno("cl_n", { enrolledAt: "2026-10-01" });
    expect(
      checkPromotion(primerMes, ctx({ client: nuevo, clients: [nuevo] })).ok,
    ).toBe(true);
  });
});

describe("cupones y lista", () => {
  const catalogo = [
    promo({ id: "c1", code: "TRAEUNAMIGO" }),
    promo({ id: "l1" }),
    promo({ id: "l2", active: false }),
    promo({ id: "l3", validTo: "2026-01-01" }),
  ];

  it("encuentra el cupón sin importar mayúsculas ni espacios", () => {
    expect(findCoupon(catalogo, " trae un amigo ")?.id).toBe("c1");
    expect(findCoupon(catalogo, "OTRO")).toBeUndefined();
  });

  it("la lista muestra solo las vigentes sin código", () => {
    expect(listedPromotions(catalogo, TODAY).map((p) => p.id)).toEqual(["l1"]);
  });

  it("calcula el descuento redondeado", () => {
    expect(promotionDiscount(promo({ percent: 15 }), 27990)).toBe(4199);
  });
});
