import { DashboardLayout } from "../components/common/DashboardLayout";
import HeaderPage from "../components/common/HeaderPage";

export default function AlumnoPanel() {
  return (
    <DashboardLayout headerNav="Mi Perfil">
      <HeaderPage title="ÁREA DE ALUMNO" subtitle="Tu portal de socio." />
      <div className="flex flex-col items-center justify-center px-7 py-16 text-center">
        <i className="ti ti-user-circle text-6xl text-gray-600 mb-4" />
        <p className="text-sm text-gray-500 max-w-md">
          Vista mock. Aquí irá el portal del socio.
        </p>
      </div>
    </DashboardLayout>
  );
}
