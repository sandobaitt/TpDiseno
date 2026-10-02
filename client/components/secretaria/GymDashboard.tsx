import * as React from "react";
import { StatsCards } from "./StatsCard";
import { MembersTable } from "./MembersTable";
import { NuevoSocioModal } from "./NuevoSocioModal";
import HeaderPage from "../common/HeaderPage";
import type { Client } from "@/data/clients";
import { seedState } from "@/store/state";

export function GymDashboard() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [extraClients, setExtraClients] = React.useState<Client[]>([]);

  function handleAdd(client: Client) {
    setExtraClients((prev) => [client, ...prev]);
  }

  return (
    <>
      <HeaderPage
        title="GESTIÓN DE ALUMNOS"
        subtitle="Inscripciones, estado de cuenta y datos de cada alumno."
      />
      <StatsCards clients={[...extraClients, ...seedState.clients]} />
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
