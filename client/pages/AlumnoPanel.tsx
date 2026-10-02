import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { MyAttendance } from "@/components/alumnos/student/MyAttendance";
import { MyHealth } from "@/components/alumnos/student/MyHealth";
import { getMockSession } from "@/data/users";
import { useAppState } from "@/store/StoreProvider";

export default function AlumnoPanel() {
  const state = useAppState();
  const client = state.clients.find((c) => c.id === getMockSession()?.clientId);
  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Mi perfil y asistencia"
        subtitle="Tu historial de clases, tu declaración jurada de salud y tus certificados."
      />
      {client ? (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.7fr_1fr]">
          <MyAttendance clientId={client.id} />
          <div className="flex flex-col gap-5">
            <MyHealth client={client} />
          </div>
        </div>
      ) : (
        <EmptyState
          icon="ti-user-question"
          title="No encontramos tu ficha de alumno"
          description="Consultá en recepción."
        />
      )}
    </div>
  );
}
