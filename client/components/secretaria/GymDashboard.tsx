"use client";
import * as React from "react";
import { DashboardLayout } from "../common/DashboardLayout";
import { StatsCards } from "./StatsCard";
import { MembersTable } from "./MembersTable";
import HeaderPage from "../common/HeaderPage";

export function GymDashboard() {
  return (
    <DashboardLayout headerNav="Gestión de Socios">
      <HeaderPage
        title="GESTIÓN DE SOCIOS"
        subtitle="Administración de membresías y estado de cuentas."
      />
      <StatsCards />
      <MembersTable />
    </DashboardLayout>
  );
}

export default GymDashboard;
