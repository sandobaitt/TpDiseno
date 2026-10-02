import { PageHeader } from "@/components/common/PageHeader";
import { TeacherClassAttendance } from "@/components/alumnos/attendance/TeacherClassAttendance";
import { ObservationsPanel } from "@/components/personal/observations/ObservationsPanel";
import { getMockSession } from "@/data/users";

export default function ProfesorAsistenciaPage() {
  const teacherId = getMockSession()?.teacherId;
  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Asistencia de mis clases"
        subtitle="Marcá quién vino a cada clase. Los alumnos bloqueados no se pueden marcar presentes."
      />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_340px]">
        <TeacherClassAttendance teacherId={teacherId} />
        <ObservationsPanel teacherId={teacherId} />
      </div>
    </div>
  );
}
