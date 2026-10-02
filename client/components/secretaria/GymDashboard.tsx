import * as React from "react";
import { StatsCards } from "./StatsCard";
import { MembersTable } from "./MembersTable";
import { NuevoSocioModal } from "./NuevoSocioModal";
import HeaderPage from "../common/HeaderPage";
import type { Client } from "@/data/clients";
import { useAppState, useStoreActions } from "@/store/StoreProvider";

export function GymDashboard() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const state = useAppState();
  const actions = useStoreActions();

  // El alumno nuevo queda en el store: aparece en Cobros, Asistencia y en el panel del admin.
  function handleAdd(client: Client) {
    actions.registerClient(client);
  }

  return (
    <>
      <HeaderPage
        title="GESTIÓN DE ALUMNOS"
        subtitle="Inscripciones, estado de cuenta y datos de cada alumno."
      />
      <StatsCards clients={state.clients} />
      <MembersTable onAddClick={() => setModalOpen(true)} />
      <NuevoSocioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}

export default GymDashboard;
