import { describe, expect, it } from "vitest";
import { canAccess, studentCapabilities } from "./permissions";
import { getPostLoginPath, type AppUserRole } from "@/data/users";
import { getNavigationByRole } from "@/data/navigation";

const ROLES: AppUserRole[] = [
  "admin",
  "encargado",
  "secretario",
  "profesor",
  "alumno",
];

describe("canAccess: cada rol entra solo a su sección", () => {
  const casos: [AppUserRole, string, boolean][] = [
    ["alumno", "/alumno/pagos", true],
    ["alumno", "/admin/personal", false],
    ["alumno", "/secretaria/cobros", false],
    ["profesor", "/profesor/horas", true],
    ["profesor", "/alumno", false],
    ["secretario", "/secretaria/asistencia", true],
    ["secretario", "/secretaria/alumnos/cl_001", true],
    ["profesor", "/secretaria/alumnos/cl_001", false],
    ["secretario", "/admin", false],
    ["encargado", "/encargado/novedades", true],
    ["encargado", "/admin/asistencia", false],
    ["admin", "/admin/novedades", true],
    ["admin", "/secretaria", false],
  ];

  it.each(casos)("%s → %s = %s", (role, path, esperado) => {
    expect(canAccess(role, path)).toBe(esperado);
  });

  it("no confunde prefijos parecidos", () => {
    expect(canAccess("alumno", "/alumnos-falsos")).toBe(false);
  });

  it("sin rol o con rutas no registradas, niega", () => {
    expect(canAccess(undefined, "/alumno")).toBe(false);
    expect(canAccess("admin", "/otra-cosa")).toBe(false);
  });
});

describe("coherencia entre permisos, inicio y menú", () => {
  it.each(ROLES)("%s puede entrar a su página de inicio", (role) => {
    expect(canAccess(role, getPostLoginPath(role))).toBe(true);
  });

  it.each(ROLES)(
    "todos los ítems del menú de %s son accesibles para ese rol",
    (role) => {
      const links = getNavigationByRole(role)
        .items.filter((item) => item.to)
        .map((item) => item.to!);
      expect(links.length).toBeGreaterThan(0);
      for (const to of links) expect(canAccess(role, to)).toBe(true);
    },
  );
});

describe("permisos dentro de la ficha del alumno", () => {
  it("secretaría edita, adjunta documentos y cobra, pero no da de baja", () => {
    expect(studentCapabilities("secretario")).toEqual({
      editData: true,
      manageDocuments: true,
      collect: true,
      deactivate: false,
    });
  });

  it("solo el administrador da de baja (CU 11)", () => {
    const quienes = ROLES.filter((r) => studentCapabilities(r).deactivate);
    expect(quienes).toEqual(["admin"]);
  });

  it("el encargado solo consulta", () => {
    expect(Object.values(studentCapabilities("encargado"))).not.toContain(true);
  });
});
