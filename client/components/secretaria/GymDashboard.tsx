"use client";
import * as React from "react";
import { StatsCards } from "./StatsCard";
import { MembersTable } from "./MembersTable";
import { NuevoSocioModal } from "./NuevoSocioModal";
import HeaderPage from "../common/HeaderPage";
import type { Client } from "@/data/clients";

export function GymDashboard() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [extraClients, setExtraClients] = React.useState<Client[]>([]);

  function handleAdd(client: Client) {
    setExtraClients((prev) => [client, ...prev]);
  }

  return (
    <>
      <HeaderPage
        title="GESTIÓN DE SOCIOS"
        subtitle="Administración de membresías y estado de cuentas."
      />
      <StatsCards />
      <MembersTable
        extraClients={extraClients}
        onAddClick={() => setModalOpen(true)}
      />
      <NuevoSocioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}

export default GymDashboard;
