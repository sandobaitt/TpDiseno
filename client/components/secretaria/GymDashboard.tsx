import * as React from "react";
import { StatsCards } from "./StatsCard";
import { MembersTable } from "./MembersTable";
import { NuevoSocioModal } from "./NuevoSocioModal";
import { PageHeader } from "../common/PageHeader";
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
      <div className="px-7 pb-6 max-sm:px-4">
        <PageHeader
          title="Gestión de alumnos"
          subtitle="Inscripciones, estado de cuenta y datos de cada alumno."
        />
      </div>
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
