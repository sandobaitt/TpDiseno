import { NovedadesSidebar } from "@/components/novedades/NovedadesSidebar";
import { NovedadesHistory } from "@/components/novedades/NovedadesHistory";
import { getMockSession } from "@/data/users";
import { PageHeader } from "@/components/common/PageHeader";
import { useAppState, useStoreActions } from "@/store/StoreProvider";

export default function NovedadesPage() {
  const { novedades } = useAppState();
  const actions = useStoreActions();
  // El encargado (y la secretaría) ven solo las novedades de su sede; el admin ve todas.
  const branchId = getMockSession()?.branchId;
  const visible = branchId
    ? novedades.filter((n) => n.branchId === branchId)
    : novedades;

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
      <PageHeader
        title="Novedades"
        subtitle="Ausencias, incidentes y cambios de turno vinculados a profesores o clases."
      />
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <NovedadesSidebar onAdd={actions.addNovedad} />
        <NovedadesHistory
          novedades={visible}
          onResolve={actions.resolveNovedad}
          onDelete={actions.removeNovedad}
        />
      </div>
    </div>
  );
}
