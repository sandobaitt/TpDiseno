import { PageHeader } from "@/components/common/PageHeader";
import { getMockSession } from "@/data/users";
import { useAppState } from "@/store/StoreProvider";
import { NovedadForm } from "./NovedadForm";
import { NovedadesHistory } from "./NovedadesHistory";

/** Novedades internas (CU 4 y 5 de Personal): secretaría y encargado ven su sede; el admin, todas. */
export function NovedadesBoard() {
  const { novedades } = useAppState();
  const branchId = getMockSession()?.branchId;
  const visible = branchId
    ? novedades.filter((n) => n.branchId === branchId)
    : novedades;
  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Novedades"
        subtitle="Ausencias, incidentes y cambios de turno de profesores o clases. Quedan con sede, autor y fecha."
      />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[400px_1fr]">
        <NovedadForm />
        <NovedadesHistory novedades={visible} showBranch={!branchId} />
      </div>
    </div>
  );
}
