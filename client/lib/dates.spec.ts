import { describe, expect, it } from "vitest";
import {
  addDays,
  addMinutesToTime,
  addMonths,
  ageOn,
  dateInPeriod,
  daysInPeriod,
  diffDays,
  formatMinutes,
  formatRelativeDate,
  monthsBetween,
  parseISODate,
  periodRange,
  startOfWeek,
  toLocalISODate,
  weekdayOf,
} from "./dates";

describe("fechas en hora local", () => {
  it("toLocalISODate no se corre a UTC", () => {
    // 23:30 local sigue siendo el mismo día, aunque en UTC ya sea el siguiente.
    expect(toLocalISODate(new Date(2026, 4, 31, 23, 30))).toBe("2026-05-31");
  });

  it("parseISODate devuelve el día correcto (no el anterior)", () => {
    const d = parseISODate("2026-04-15");
    expect(d.getDate()).toBe(15);
    expect(d.getMonth()).toBe(3);
  });

  it("addDays cruza meses y años", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("diffDays cuenta días de calendario", () => {
    expect(diffDays("2026-05-05", "2026-05-20")).toBe(15);
    expect(diffDays("2026-05-20", "2026-05-05")).toBe(-15);
    expect(diffDays("2026-02-25", "2026-03-05")).toBe(8);
  });

  it("semana empieza el lunes", () => {
    expect(weekdayOf("2026-10-01")).toBe(4); // jueves
    expect(startOfWeek("2026-10-01")).toBe("2026-09-28");
    expect(startOfWeek("2026-10-04")).toBe("2026-09-28"); // domingo
  });
});

describe("meses", () => {
  it("addMonths cruza años", () => {
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });

  it("periodRange incluye ambos extremos", () => {
    expect(periodRange("2026-11", "2027-02")).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
  });

  it("días del mes, incluido febrero bisiesto", () => {
    expect(daysInPeriod("2026-02")).toBe(28);
    expect(daysInPeriod("2028-02")).toBe(29);
    expect(dateInPeriod("2026-05", 5)).toBe("2026-05-05");
  });
});

describe("fechas relativas", () => {
  it("dice hoy, ayer o la fecha", () => {
    expect(formatRelativeDate("2026-10-02T18:30:00", "2026-10-02")).toBe(
      "Hoy 18:30",
    );
    expect(formatRelativeDate("2026-10-01", "2026-10-02")).toBe("Ayer");
    expect(formatRelativeDate("2026-09-28", "2026-10-02")).toBe("28/09/2026");
  });
});

describe("antigüedad", () => {
  it("cuenta meses cumplidos", () => {
    expect(monthsBetween("2025-10-12", "2026-10-11")).toBe(11);
    expect(monthsBetween("2025-10-12", "2026-10-12")).toBe(12);
    expect(monthsBetween("2026-10-12", "2026-10-01")).toBe(0);
  });
});

describe("otros helpers", () => {
  it("suma minutos a una hora", () => {
    expect(addMinutesToTime("18:30", 45)).toBe("19:15");
  });

  it("formatea minutos", () => {
    expect(formatMinutes(90)).toBe("1h 30m");
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(120)).toBe("2h");
    expect(formatMinutes(-30)).toBe("-30m");
  });

  it("calcula la edad", () => {
    expect(ageOn("2010-10-02", "2026-10-01")).toBe(15);
    expect(ageOn("2010-10-01", "2026-10-01")).toBe(16);
  });
});
