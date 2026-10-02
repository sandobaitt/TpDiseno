import { describe, expect, it } from "vitest";
import { classRoster, markOf, summarizeAttendance, toCsv } from "./attendance";
import type { Client } from "@/data/clients";
import type { Plan } from "@/data/plans";
import type { StudentAttendance } from "@/data/attendance";

const plans: Record<string, Plan> = {
  libre: {
    id: "libre",
    name: "Pase Libre",
    status: "active",
    monthlyPriceArs: 1,
    activityIds: ["ac_musc", "ac_yoga"],
  },
  musc: {
    id: "musc",
    name: "Musculación",
    status: "active",
    monthlyPriceArs: 1,
    activityIds: ["ac_musc"],
  },
};
const getPlan = (id?: string) => (id ? plans[id] : undefined);

function alumno(id: string, extra: Partial<Client> = {}): Client {
  return {
    id,
    branchId: "br_001",
    fullName: id,
    email: `${id}@m.com`,
    dni: id,
    planId: "libre",
    enrolledAt: "2026-01-01",
    status: "active",
    createdAt: "2026-01-01T10:00:00",
    ...extra,
  };
}

function registro(
  clientId: string,
  status: "present" | "absent",
  justified?: boolean,
): StudentAttendance {
  return {
    id: `at_${clientId}`,
    clientId,
    slotId: "sl_yoga",
    date: "2026-10-02",
    branchId: "br_001",
    status,
    justified,
    recordedBy: "us_se_001",
    recordedAt: "2026-10-02T18:00:00",
  };
}

const yoga = {
  slotId: "sl_yoga",
  date: "2026-10-02",
  activityId: "ac_yoga",
  branchId: "br_001",
};

describe("lista de una clase", () => {
  it("incluye a quienes tienen la actividad en su plan, de cualquier sede", () => {
    const roster = classRoster(
      yoga,
      [
        alumno("Zoe", { branchId: "br_002" }),
        alumno("Ana"),
        alumno("Beto", { planId: "musc" }),
        alumno("Baja", { status: "inactive" }),
        alumno("Futuro", { enrolledAt: "2026-11-01" }),
      ],
      [],
      getPlan,
    );
    // primero los de la sede de la clase
    expect(roster.map((c) => c.id)).toEqual(["Ana", "Zoe"]);
  });

  it("muestra también a quien ya tiene un registro en esa clase", () => {
    const roster = classRoster(
      yoga,
      [alumno("Beto", { planId: "musc" })],
      [registro("Beto", "present")],
      getPlan,
    );
    expect(roster.map((c) => c.id)).toEqual(["Beto"]);
  });
});

describe("historial del alumno", () => {
  const registros = [
    registro("a", "present"),
    registro("a", "present"),
    registro("a", "absent", true),
    registro("a", "absent", false),
  ];

  it("distingue ausencias justificadas y sin justificar", () => {
    expect(registros.map(markOf)).toEqual([
      "present",
      "present",
      "absent_justified",
      "absent",
    ]);
    expect(summarizeAttendance(registros)).toEqual({
      present: 2,
      justified: 1,
      unjustified: 1,
      rate: 50,
    });
  });

  it("sin registros el porcentaje es 0", () => {
    expect(summarizeAttendance([]).rate).toBe(0);
  });
});

describe("exportar a CSV", () => {
  it("usa ; como separador, escapa comillas y agrega BOM", () => {
    const csv = toCsv(
      ["Fecha", "Clase"],
      [["02/10/2026", 'Yoga "suave"; nivel 1']],
    );
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1)).toBe(
      'Fecha;Clase\r\n02/10/2026;"Yoga ""suave""; nivel 1"',
    );
  });
});
