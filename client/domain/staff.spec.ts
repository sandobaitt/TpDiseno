import { describe, expect, it } from "vitest";
import { validateEmployee, type EmployeeForm } from "./staff";
import type { Employee } from "@/data/employees";

const staff: Employee[] = [
  {
    id: "em_1",
    branchId: "br_001",
    fullName: "Ana Ruiz",
    email: "ana@squatgym.com",
    dni: "30.111.222",
    role: "reception",
    status: "active",
    createdAt: "2026-01-01T09:00:00",
  },
];
const form = (over: Partial<EmployeeForm> = {}): EmployeeForm => ({
  fullName: "Pedro Gómez",
  email: "pedro@squatgym.com",
  dni: "31222333",
  role: "reception",
  branchId: "br_001",
  ...over,
});

describe("validación del personal (3.1.1)", () => {
  it("acepta datos completos y nuevos", () => {
    expect(validateEmployee(form(), staff)).toEqual({});
  });

  it("no deja repetir el email ni el DNI de otra persona", () => {
    const errors = validateEmployee(
      form({ email: "ANA@squatgym.com", dni: "30111222" }),
      staff,
    );
    expect(errors.email).toMatch(/ya lo usa/);
    expect(errors.dni).toMatch(/ya está cargado/);
  });

  it("al modificar, la misma persona puede conservar sus datos", () => {
    expect(
      validateEmployee(
        form({ email: "ana@squatgym.com", dni: "30.111.222" }),
        staff,
        "em_1",
      ),
    ).toEqual({});
  });

  it("pide nombre, email válido y DNI de 7 u 8 números", () => {
    const errors = validateEmployee(
      form({ fullName: "", email: "mal", dni: "12" }),
      staff,
    );
    expect(Object.keys(errors).sort()).toEqual(["dni", "email", "fullName"]);
  });
});
