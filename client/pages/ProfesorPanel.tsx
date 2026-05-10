import { DashboardLayout } from "../components/common/DashboardLayout";
import HeaderPage from "../components/common/HeaderPage";

export default function ProfesorPanel() {
  return (
    <DashboardLayout headerNav="Mis Clases">
      <HeaderPage
        title="ÁREA DE PROFESOR"
        subtitle="Gestión de clases y alumnos."
      />
      <div className="flex flex-col items-center justify-center px-7 py-16 text-center">
        <i className="ti ti-barbell text-6xl text-gray-600 mb-4" />
        <p className="text-sm text-gray-500 max-w-md">
          Vista mock. Aquí irá la gestión de clases y alumnos.
        </p>
      </div>
    </DashboardLayout>
  );
}
