import { getActivityName } from "@/data/activities";
import { getTeacher } from "@/data/teachers";
import { branchName } from "@/components/cronograma/weekView";
import type { Session } from "@/domain/schedule";
import { formatDateLong } from "@/lib/dates";

/** Datos de la clase elegida: actividad, horario, sede, profesor y cupo. */
export function SessionSummary({ session }: { session: Session }) {
  const teacher = getTeacher(session.teacherId);
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl bg-neutral-900 px-5 py-4 shadow-card glass-border">
      <h2 className="text-xl font-black text-white">
        {getActivityName(session.activityId)}
      </h2>
      <span className="flex items-center gap-1.5 text-sm text-gray-300">
        <i className="ti ti-calendar text-primary" aria-hidden="true" />
        {formatDateLong(session.date)}
      </span>
      <span className="flex items-center gap-1.5 text-sm text-gray-300">
        <i className="ti ti-clock text-primary" aria-hidden="true" />
        {session.start} a {session.end}
      </span>
      <span className="flex items-center gap-1.5 text-sm text-gray-300">
        <i className="ti ti-map-pin text-primary" aria-hidden="true" />
        {branchName(session.branchId)}
      </span>
      <span className="flex items-center gap-1.5 text-sm text-gray-300">
        <i className="ti ti-user-circle text-primary" aria-hidden="true" />
        {teacher?.fullName ?? "Sin profesor"}
        {session.replacementId && (
          <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
            reemplazo
          </span>
        )}
      </span>
      <span className="flex items-center gap-1.5 text-sm text-gray-300">
        <i className="ti ti-users text-primary" aria-hidden="true" />
        Cupo de {session.capacity}
      </span>
    </div>
  );
}
