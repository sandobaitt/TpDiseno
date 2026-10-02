import { PageHeader } from "@/components/common/PageHeader";
import { TeacherAttendanceBoard } from "@/components/personal/attendance/TeacherAttendanceBoard";

export default function AdminAsistenciaPage() {
  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Asistencia de profesores"
        subtitle="Todas las sedes: lo programado contra lo registrado. La confirmación la hace el encargado de cada sede."
      />
      <TeacherAttendanceBoard canManage={false} />
    </div>
  );
}
