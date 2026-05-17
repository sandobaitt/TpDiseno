"use client";
import * as React from "react";
import { StatsCards } from "./StatsCard";
import { MembersTable } from "./MembersTable";
import HeaderPage from "../common/HeaderPage";

export function GymDashboard() {
  return (
    <>
      <HeaderPage
        title="GESTIÓN DE SOCIOS"
        subtitle="Administración de membresías y estado de cuentas."
      />
      <StatsCards />
      <MembersTable />
    </>
  );
}

export default GymDashboard;
