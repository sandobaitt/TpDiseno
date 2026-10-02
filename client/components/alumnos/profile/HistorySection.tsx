import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { StudentAttendance } from "@/data/attendance";
import { getSlot } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { branchesMock } from "@/data/branches";
import { getUserName } from "@/data/users";
import type { ActivityEntry } from "@/store/actions";
import { formatDate, formatDateTime } from "@/lib/dates";

const RECENT_ATTENDANCE = 10;

interface HistorySectionProps {
  attendance: StudentAttendance[];
  activity: ActivityEntry[];
}

/** Últimas clases y registro de actividad de la ficha (quién hizo qué y cuándo). */
export function HistorySection({ attendance, activity }: HistorySectionProps) {
  const recent = attendance.slice(0, RECENT_ATTENDANCE);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard title="Asistencia reciente" icon="ti-calendar-check">
        {recent.length === 0 ? (
          <EmptyState
            icon="ti-calendar-off"
            title="Todavía no tiene asistencias registradas"
          />
        ) : (
          <ul className="flex flex-col divide-y divide-white/[0.05]">
            {recent.map((record) => {
              const slot = getSlot(record.slotId);
              const branch = branchesMock.find((b) => b.id === record.branchId);
              return (
                <li
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {slot ? getActivityName(slot.activityId) : "Clase"}
                      {slot && (
                        <span className="font-normal text-gray-400">
                          {" "}
                          · {slot.start} h
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(record.date)} · {branch?.name ?? "—"}
                    </p>
                  </div>
                  {record.status === "present" ? (
                    <StatusBadge tone="success" icon="ti-check">
                      Asistió
                    </StatusBadge>
                  ) : record.justified ? (
                    <StatusBadge tone="info" icon="ti-file-check">
                      Ausencia justificada
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral" icon="ti-x">
                      Ausencia sin justificar
                    </StatusBadge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Registro de actividad" icon="ti-history">
        {activity.length === 0 ? (
          <EmptyState
            icon="ti-history-off"
            title="Sin movimientos registrados"
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {activity.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/70"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm text-white">{entry.summary}</p>
                  <p className="text-xs text-gray-400">
                    {getUserName(entry.userId)} · {formatDateTime(entry.at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>
    </div>
  );
}
