import { describe, expect, it } from "vitest";
import {
  activitiesMock,
  appUsersMock,
  attendanceMock,
  bitacorasMock,
  branchesMock,
  clientsMock,
  getPlan,
  novedadesMock,
  paymentsMock,
  replacementsMock,
  scheduleMock,
  teacherAttendanceMock,
  teachersMock,
} from "@/data";
import { SEED_TODAY } from "./seed";
import { getAccountSummary } from "@/domain/billing";

const ids = <T extends { id: string }>(list: T[]) =>
  new Set(list.map((x) => x.id));

describe("los datos de demo son coherentes entre sí", () => {
  const branchIds = ids(branchesMock);
  const activeBranchIds = new Set(
    branchesMock.filter((b) => b.status === "active").map((b) => b.id),
  );
  const teacherIds = ids(teachersMock);
  const clientIds = ids(clientsMock);
  const slotIds = ids(scheduleMock);
  const activityIds = ids(activitiesMock);

  it("cada alumno activo tiene un plan existente y una sede activa", () => {
    for (const c of clientsMock) {
      expect(branchIds.has(c.branchId)).toBe(true);
      if (c.status === "active") {
        expect(getPlan(c.planId)).toBeDefined();
        expect(activeBranchIds.has(c.branchId)).toBe(true);
      }
    }
  });

  it("cada clase del cronograma tiene actividad, sede y un profesor activo que trabaja en esa sede", () => {
    for (const s of scheduleMock) {
      expect(activityIds.has(s.activityId)).toBe(true);
      expect(activeBranchIds.has(s.branchId)).toBe(true);
      const teacher = teachersMock.find((t) => t.id === s.teacherId);
      expect(teacher?.status).toBe("active");
      expect(teacher?.branchIds).toContain(s.branchId);
    }
  });

  it("pagos, asistencias, reemplazos, novedades y observaciones apuntan a registros existentes", () => {
    for (const p of paymentsMock) expect(clientIds.has(p.clientId)).toBe(true);
    for (const a of attendanceMock) {
      expect(clientIds.has(a.clientId)).toBe(true);
      expect(slotIds.has(a.slotId)).toBe(true);
    }
    for (const a of teacherAttendanceMock) {
      expect(teacherIds.has(a.teacherId)).toBe(true);
      expect(slotIds.has(a.slotId)).toBe(true);
    }
    for (const r of replacementsMock) {
      expect(slotIds.has(r.slotId)).toBe(true);
      expect(teacherIds.has(r.originalTeacherId)).toBe(true);
      expect(teacherIds.has(r.candidateTeacherId)).toBe(true);
    }
    for (const n of novedadesMock)
      expect(activeBranchIds.has(n.branchId)).toBe(true);
    for (const b of bitacorasMock)
      expect(teacherIds.has(b.teacherId)).toBe(true);
  });

  it("los usuarios vinculados apuntan a alumnos, profesores y sedes reales", () => {
    for (const u of appUsersMock) {
      if (u.clientId) expect(clientIds.has(u.clientId)).toBe(true);
      if (u.teacherId) expect(teacherIds.has(u.teacherId)).toBe(true);
      if (u.branchId) expect(activeBranchIds.has(u.branchId)).toBe(true);
    }
  });

  it("los alumnos solo tienen asistencias en clases que su plan habilita", () => {
    for (const a of attendanceMock) {
      const client = clientsMock.find((c) => c.id === a.clientId)!;
      const slot = scheduleMock.find((s) => s.id === a.slotId)!;
      expect(getPlan(client.planId)!.activityIds).toContain(slot.activityId);
    }
  });
});

describe("la demo siempre muestra cada situación de cuenta (cualquier día)", () => {
  const statusOf = (clientId: string) => {
    const client = clientsMock.find((c) => c.id === clientId)!;
    return getAccountSummary(
      client,
      paymentsMock,
      getPlan(client.planId),
      SEED_TODAY,
    ).status;
  };

  it("al día, por vencer, deudor, bloqueado e inactivo", () => {
    expect(statusOf("cl_001")).toBe("al_dia");
    expect(statusOf("cl_013")).toBe("por_vencer");
    expect(statusOf("cl_012")).toBe("deudor");
    expect(statusOf("cl_002")).toBe("bloqueado");
    expect(statusOf("cl_004")).toBe("inactivo");
  });
});
