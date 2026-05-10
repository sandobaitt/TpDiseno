import { DashboardLayout } from "../components/common/DashboardLayout";
import HeaderPage from "../components/common/HeaderPage";

export default function AdminPanel() {
  return (
    <DashboardLayout headerNav="Panel de Administración">
      <HeaderPage
        title="PANEL ADMINISTRADOR"
        subtitle="Gestión general del gimnasio."
      />
      <div className="flex flex-col items-center justify-center px-7 py-16 text-center">
        <i className="ti ti-tools text-6xl text-gray-600 mb-4" />
        <p className="text-sm text-gray-500 max-w-md">
          Vista mock. Aquí irá la administración del gimnasio.
        </p>
      </div>
    </DashboardLayout>
  );
}
