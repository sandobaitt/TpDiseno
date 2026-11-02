import { describe, expect, it } from "vitest";
import {
  needsBankValidation,
  validateWithBank,
  BANK_REJECTION_REASON,
} from "./bank";

describe("validación con la entidad bancaria", () => {
  it("el efectivo no pasa por el banco", () => {
    expect(needsBankValidation("cash")).toBe(false);
    expect(
      validateWithBank({
        method: "cash",
        amountArs: 1000,
        simulateRejection: true,
      }),
    ).toEqual({ approved: true });
  });

  it("débito, transferencia y QR se validan con el banco", () => {
    for (const method of ["debit", "transfer", "qr"] as const) {
      expect(needsBankValidation(method)).toBe(true);
      expect(validateWithBank({ method, amountArs: 27990 })).toEqual({
        approved: true,
      });
    }
  });

  it("si la entidad rechaza, informa el motivo", () => {
    expect(
      validateWithBank({
        method: "debit",
        amountArs: 27990,
        simulateRejection: true,
      }),
    ).toEqual({
      approved: false,
      reason: BANK_REJECTION_REASON,
    });
  });

  it("rechaza un monto que no es válido", () => {
    expect(validateWithBank({ method: "qr", amountArs: 0 }).approved).toBe(
      false,
    );
  });
});
