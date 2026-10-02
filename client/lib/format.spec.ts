import { describe, expect, it } from "vitest";
import {
  formatARS,
  matchesPersonSearch,
  normalizeText,
  onlyDigits,
} from "./format";

describe("normalizeText", () => {
  it("ignora tildes y mayúsculas", () => {
    expect(normalizeText("  Martín RODRÍGUEZ ")).toBe("martin rodriguez");
  });
});

describe("onlyDigits", () => {
  it("quita puntos y espacios del DNI", () => {
    expect(onlyDigits("34.567.890")).toBe("34567890");
  });
});

describe("matchesPersonSearch", () => {
  const alumno = {
    name: "Martín Rodríguez",
    dni: "34.567.890",
    email: "martin.r@email.com",
  };

  it("encuentra por nombre sin tildes", () => {
    expect(matchesPersonSearch("martin", alumno)).toBe(true);
  });

  it("encuentra por DNI con o sin puntos", () => {
    expect(matchesPersonSearch("34567890", alumno)).toBe(true);
    expect(matchesPersonSearch("34.567", alumno)).toBe(true);
  });

  it("encuentra por email", () => {
    expect(matchesPersonSearch("martin.r@", alumno)).toBe(true);
  });

  it("no encuentra si no coincide nada", () => {
    expect(matchesPersonSearch("laura", alumno)).toBe(false);
    expect(matchesPersonSearch("99999", alumno)).toBe(false);
  });

  it("una búsqueda vacía muestra a todos", () => {
    expect(matchesPersonSearch("   ", alumno)).toBe(true);
  });
});

describe("formatARS", () => {
  it("usa el separador de miles argentino", () => {
    expect(formatARS(34990)).toBe("$34.990");
  });
});
