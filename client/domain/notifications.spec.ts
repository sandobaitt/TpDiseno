import { describe, expect, it } from "vitest";
import {
  managerNotifications,
  secretaryNotifications,
  studentNotifications,
  teacherNotifications,
} from "./notifications";
import { personalize, resolveAudience } from "./communications";
import type { AccountSummary } from "./billing";
import type { Client } from "@/data/clients";
import type { Communication } from "@/data/communications";
import type { Replacement } from "@/data/replacements";

const TODAY = "2026-10-02";

function alumno(id: string, extra: Partial<Client> = {}): Client {
  return {
    id,
    branchId: "br_001",
    fullName: `${id} Pérez`,
    email: `${id}@m.com`,
    dni: id,
    planId: "pl_002",
    enrolledAt: "2026-01-10",
    status: "active",
    health: { conditions: [], signedAt: "2026-01-10" },
    createdAt: "2026-01-10T10:00:00",
    ...extra,
  };
}

function cuenta(status: AccountSummary["status"]): AccountSummary {
  return {
    status,
    charges: [],
    unpaid: [],
    owedAmount: status === "al_dia" ? 0 : 27990,
    overdueAmount: 0,
    overdueDays: status === "bloqueado" ? 20 : status === "deudor" ? 3 : 0,
    nextDueDate: "2026-10-05",
    blockDate: "2026-10-20",
  };
}

const base = { payments: [], communications: [], today: TODAY };

describe("avisos del alumno (CU 10)", () => {
  it("avisa la cuota por vencer, la vencida y el acceso suspendido", () => {
    const client = alumno("Ana");
    expect(
      studentNotifications({
        ...base,
        client,
        account: cuenta("por_vencer"),
      })[0],
    ).toMatchObject({
      title: "Tu cuota vence pronto",
      link: "/alumno/pagos",
    });
    expect(
      studentNotifications({ ...base, client, account: cuenta("deudor") })[0]
        .detail,
    ).toMatch(/se suspende el 20\/10\/2026/);
    expect(
      studentNotifications({
        ...base,
        client,
        account: cuenta("bloqueado"),
      })[0],
    ).toMatchObject({
      tone: "danger",
      title: "Acceso suspendido por deuda",
    });
  });

  it("al día y con todo completo, no hay avisos", () => {
    expect(
      studentNotifications({
        ...base,
        client: alumno("Ana"),
        account: cuenta("al_dia"),
      }),
    ).toEqual([]);
  });

  it("pide la DDJJ si falta y muestra los mensajes de secretaría personalizados", () => {
    const client = alumno("Ana", { health: undefined });
    const message: Communication = {
      id: "com_x",
      templateId: "libre",
      subject: "Hola",
      body: "Hola {nombre}, te esperamos.",
      audience: { kind: "todos" },
      audienceLabel: "Todos",
      recipientIds: ["Ana"],
      byEmail: false,
      sentBy: "us_se_001",
      sentAt: `${TODAY}T09:00:00`,
    };
    const list = studentNotifications({
      ...base,
      client,
      account: cuenta("al_dia"),
      communications: [message],
    });
    expect(list.map((n) => n.title)).toEqual([
      "Hola",
      "Completá tu declaración jurada de salud",
    ]);
    expect(list[0].detail).toBe("Hola Ana, te esperamos.");
  });
});

describe("avisos de secretaría y profesor", () => {
  it("resume deudores, bloqueados y documentos para revisar de la sede", () => {
    const clients = [
      alumno("a"),
      alumno("b"),
      alumno("c", {
        attachments: [
          {
            id: "d",
            kind: "certificado",
            fileName: "apto.pdf",
            sizeKb: 1,
            uploadedAt: TODAY,
            status: "pending",
          },
        ],
      }),
    ];
    const status: Record<string, AccountSummary["status"]> = {
      a: "deudor",
      b: "bloqueado",
      c: "al_dia",
    };
    const list = secretaryNotifications({
      branchClients: clients,
      statusOf: (c) => status[c.id],
      novedades: [],
      today: TODAY,
    });
    expect(list.map((n) => n.title)).toEqual([
      "1 alumno con la cuota vencida en tu sede",
      "1 alumno bloqueado por deuda",
      "Documento para revisar",
    ]);
  });

  it("al profesor le avisa los reemplazos que esperan respuesta", () => {
    const pedido: Replacement = {
      id: "rep_x",
      slotId: "sl_c11",
      date: "2026-10-09",
      originalTeacherId: "tc_002",
      candidateTeacherId: "tc_001",
      status: "pending",
      reason: "Viaje",
      requestedBy: "us_en_001",
      requestedAt: "2026-10-01",
    } as Replacement;
    const list = teacherNotifications({
      teacherId: "tc_001",
      replacements: [
        pedido,
        { ...pedido, id: "rep_y", status: "accepted" } as Replacement,
      ],
      describe: () => "Yoga del viernes",
    });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      title: "Te pidieron un reemplazo",
      link: "/profesor/reemplazos",
    });
  });
});

describe("comunicaciones (CU 14)", () => {
  const clients = [
    alumno("a", { branchId: "br_001" }),
    alumno("b", { branchId: "br_002", planId: "pl_001" }),
    alumno("c", { status: "inactive" }),
  ];
  const statusOf = (c: Client) =>
    (c.id === "b" ? "deudor" : "al_dia") as AccountSummary["status"];

  it("elige los destinatarios activos según el criterio", () => {
    expect(
      resolveAudience({ kind: "todos" }, clients, statusOf).map((c) => c.id),
    ).toEqual(["a", "b"]);
    expect(
      resolveAudience(
        { kind: "sede", branchId: "br_002" },
        clients,
        statusOf,
      ).map((c) => c.id),
    ).toEqual(["b"]);
    expect(
      resolveAudience(
        { kind: "plan", planId: "pl_002" },
        clients,
        statusOf,
      ).map((c) => c.id),
    ).toEqual(["a"]);
    expect(
      resolveAudience({ kind: "deudores" }, clients, statusOf).map((c) => c.id),
    ).toEqual(["b"]);
    expect(
      resolveAudience({ kind: "alumno", clientId: "c" }, clients, statusOf),
    ).toEqual([]);
  });

  it("personaliza el mensaje con el nombre", () => {
    expect(
      personalize("Hola {nombre}!", { fullName: "Martín Rodríguez" }),
    ).toBe("Hola Martín!");
  });
});

describe("avisos de novedades y del encargado (CU 7 de Personal)", () => {
  const novedad = {
    id: "nov_x",
    type: "change" as const,
    entityType: "clase" as const,
    entityId: "sl_c11",
    entityName: "Yoga · Centro",
    branchId: "br_001",
    timestamp: `${TODAY}T09:00:00`,
    detail: "La clase pasa a las 18:30.",
    status: "in_progress" as const,
    createdBy: "us_en_001",
    notifyTeacher: true,
  };

  it("al profesor le llegan las novedades de sus clases si se pidió avisarle", () => {
    const base = {
      teacherId: "tc_002",
      replacements: [],
      describe: () => "",
      teacherOfSlot: () => "tc_002",
      today: TODAY,
    };
    expect(
      teacherNotifications({ ...base, novedades: [novedad] })[0].title,
    ).toBe("Novedad: Yoga · Centro");
    expect(
      teacherNotifications({
        ...base,
        novedades: [{ ...novedad, notifyTeacher: false }],
      }),
    ).toEqual([]);
    expect(
      teacherNotifications({
        ...base,
        novedades: [
          { ...novedad, annulled: { by: "x", at: TODAY, reason: "error" } },
        ],
      }),
    ).toEqual([]);
  });

  it("al encargado le avisa reemplazos rechazados, observaciones y turnos para confirmar", () => {
    const list = managerNotifications({
      novedades: [],
      rejectedReplacements: [
        { id: "r1", detail: "Yoga del viernes", date: TODAY },
      ],
      observations: [
        {
          id: "b1",
          title: "Molestia en rodilla",
          teacherName: "Micaela Sosa",
          date: `${TODAY}T10:00:00`,
        },
      ],
      toConfirm: 3,
      today: TODAY,
    });
    expect(list.map((n) => n.title).sort()).toEqual(
      [
        "3 turnos de profesores para confirmar",
        "Observación de Micaela Sosa",
        "Reemplazo rechazado: la clase quedó sin cubrir",
      ].sort(),
    );
  });
});
