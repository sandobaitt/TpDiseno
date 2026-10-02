import { describe, expect, it } from "vitest";
import { toLocalISODate } from "./dates";

describe("toLocalISODate", () => {
  it("usa la fecha local, no la de UTC", () => {
    // 23:30 hora local sigue siendo el mismo día, aunque en UTC ya sea el siguiente.
    expect(toLocalISODate(new Date(2026, 4, 31, 23, 30))).toBe("2026-05-31");
  });

  it("completa mes y día con cero", () => {
    expect(toLocalISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
