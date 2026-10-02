import { describe, expect, it } from "vitest";
import {
  buildClientFromDraft,
  dniError,
  emailError,
  emptyEnrollment,
  enrollmentCharge,
  firstInvalidStep,
  getRecordChecklist,
  isMinor,
  validateEnrollmentStep,
  validateHealth,
  type EnrollmentDraft,
} from "./enrollment";
import type { Client } from "@/data/clients";
import type { Plan } from "@/data/plans";

const TODAY = "2026-10-02";

const plan: Plan = {
  id: "pl_m",
  name: "Musculación",
  status: "active",
  monthlyPriceArs: 31000,
  activityIds: ["ac_musc"],
};

const existing: Client[] = [
  {
    id: "cl_a",
    branchId: "br_001",
    fullName: "Martín Rodríguez",
    email: "martin.r@email.com",
    dni: "34.567.890",
    enrolledAt: "2026-01-10",
    status: "active",
    createdAt: "2026-01-10T10:00:00",
  },
  {
    id: "cl_b",
    branchId: "br_001",
    fullName: "Ana Pérez",
    email: "ana.p@email.com",
    dni: "40.111.222",
    enrolledAt: "2025-01-10",
    status: "inactive",
    createdAt: "2025-01-10T10:00:00",
  },
];

const ctx = {
  clients: existing,
  planIds: [plan.id],
  branchIds: ["br_001", "br_002"],
  today: TODAY,
};

/** Una inscripción completa y válida de un adulto. */
function validDraft(changes: Partial<EnrollmentDraft> = {}): EnrollmentDraft {
  return {
    ...emptyEnrollment("br_001", TODAY),
    firstName: "Lucía",
    lastName: "Fernández",
    dni: "41234111",
    birthDate: "1998-05-20",
    email: "Lucia.F@Email.com",
    phone: "11 5555 0000",
    weightKg: "60,5",
    heightCm: "165",
    accepted: true,
    planId: plan.id,
    ...changes,
  };
}

describe("duplicados (CU 1)", () => {
  it("detecta el DNI repetido aunque se escriba sin puntos", () => {
    expect(dniError("34567890", existing)).toMatch(/Martín Rodríguez/);
  });

  it("si el duplicado está dado de baja, avisa que hay que reactivarlo", () => {
    expect(dniError("40111222", existing)).toMatch(/dada de baja/);
  });

  it("detecta el email repetido sin importar mayúsculas", () => {
    expect(emailError("MARTIN.R@email.com", existing)).toMatch(/registrado/);
  });

  it("al editar, no se compara con el propio alumno", () => {
    expect(dniError("34.567.890", existing, "cl_a")).toBeUndefined();
  });

  it("valida el formato del DNI y del email", () => {
    expect(dniError("123", existing)).toMatch(/7 u 8/);
    expect(emailError("lucia@", existing)).toMatch(/Revisá/);
  });
});

describe("validación por pasos", () => {
  it("una inscripción completa no tiene errores", () => {
    expect(firstInvalidStep(validDraft(), ctx)).toBeNull();
  });

  it("no deja avanzar sin nombre, DNI ni fecha de nacimiento", () => {
    const errors = validateEnrollmentStep(
      1,
      validDraft({ firstName: " ", dni: "", birthDate: "" }),
      ctx,
    );
    expect(Object.keys(errors).sort()).toEqual(
      ["birthDate", "dni", "firstName"].sort(),
    );
  });

  it("un menor necesita adulto responsable y autorización firmada", () => {
    const minor = validDraft({ birthDate: "2012-03-10" });
    const errors = validateEnrollmentStep(1, minor, ctx);
    expect(errors).toHaveProperty("guardianName");
    expect(errors).toHaveProperty("authorization");

    const complete = validDraft({
      birthDate: "2012-03-10",
      guardianName: "Patricia Fernández",
      guardianDni: "25.678.901",
      guardianPhone: "11 5555 1499",
      guardianRelationship: "Madre",
      authorization: { fileName: "autorizacion.pdf", sizeKb: 180 },
    });
    expect(validateEnrollmentStep(1, complete, ctx)).toEqual({});
  });

  it("pide peso, estatura y aceptar la declaración jurada", () => {
    const errors = validateEnrollmentStep(
      3,
      validDraft({ weightKg: "", heightCm: "50", accepted: false }),
      ctx,
    );
    expect(Object.keys(errors).sort()).toEqual(
      ["accepted", "heightCm", "weightKg"].sort(),
    );
  });

  it("si declara una condición, pide el detalle", () => {
    const value = {
      ...validDraft(),
      conditions: ["lesion" as const],
      history: "",
    };
    expect(validateHealth(value)).toHaveProperty("history");
  });

  it("la fecha de inicio no puede ser anterior a hoy", () => {
    const errors = validateEnrollmentStep(
      4,
      validDraft({ startDate: "2026-09-30" }),
      ctx,
    );
    expect(errors).toHaveProperty("startDate");
  });

  it("vuelve al primer paso con errores", () => {
    expect(firstInvalidStep(validDraft({ phone: "" }), ctx)).toBe(2);
  });
});

describe("cuota de alta proporcional", () => {
  it("el día 1 se cobra el mes completo", () => {
    const charge = enrollmentCharge(plan, "2026-10-01");
    expect(charge).toMatchObject({
      amount: 31000,
      prorated: false,
      dueDate: "2026-10-06",
    });
  });

  it("a mitad de mes se cobran los días que quedan", () => {
    const charge = enrollmentCharge(plan, "2026-10-17");
    expect(charge).toMatchObject({
      amount: 15000,
      prorated: true,
      daysCharged: 15,
      daysInMonth: 31,
      dueDate: "2026-10-22",
    });
  });
});

describe("armado del alumno", () => {
  it("guarda los datos limpios, la DDJJ y quién lo inscribió", () => {
    const client = buildClientFromDraft(
      validDraft({
        certificate: { fileName: "apto.pdf", sizeKb: 300 },
        conditions: ["respiratoria"],
        history: "Asma leve",
      }),
      { id: "cl_new", now: `${TODAY}T10:30:00`, userId: "us_se_001" },
    );
    expect(client).toMatchObject({
      fullName: "Lucía Fernández",
      dni: "41.234.111",
      email: "lucia.f@email.com",
      enrolledAt: TODAY,
      status: "active",
      createdBy: "us_se_001",
      health: {
        weightKg: 60.5,
        heightCm: 165,
        conditions: ["respiratoria"],
        signedBy: "Lucía Fernández",
      },
    });
    expect(client.guardian).toBeUndefined();
    expect(client.attachments).toEqual([
      expect.objectContaining({ kind: "certificado", status: "approved" }),
    ]);
  });

  it("en un menor firma el adulto responsable", () => {
    const client = buildClientFromDraft(
      validDraft({
        birthDate: "2012-03-10",
        guardianName: "Patricia Fernández",
        guardianDni: "25678901",
        guardianPhone: "11 5555 1499",
        guardianRelationship: "Madre",
        authorization: { fileName: "autorizacion.pdf", sizeKb: 180 },
      }),
      { id: "cl_new", now: `${TODAY}T10:30:00`, userId: "us_se_001" },
    );
    expect(isMinor(client.birthDate, TODAY)).toBe(true);
    expect(client.guardian?.dni).toBe("25.678.901");
    expect(client.health?.signedBy).toBe("Patricia Fernández (madre)");
    expect(client.attachments?.[0].kind).toBe("autorizacion");
  });
});

describe("estado del legajo", () => {
  it("marca lo pendiente y lo que falta", () => {
    const checklist = getRecordChecklist(
      {
        ...existing[0],
        birthDate: "2012-03-10",
        health: { conditions: [], signedAt: "2026-01-10" },
        attachments: [
          {
            id: "d1",
            kind: "certificado",
            fileName: "apto.pdf",
            sizeKb: 100,
            uploadedAt: "2026-01-10",
            status: "pending",
          },
        ],
      },
      TODAY,
    );
    expect(checklist.map((i) => [i.id, i.state])).toEqual([
      ["ddjj", "ok"],
      ["certificado", "pending"],
      ["autorizacion", "missing"],
    ]);
  });
});
