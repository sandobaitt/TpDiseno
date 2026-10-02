import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WeekNavigator } from "@/components/common/WeekNavigator";
import { FilterSelect } from "@/components/common/FilterSelect";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { scheduleMock } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { branchesMock } from "@/data/branches";
import {
  CONTRACT_TYPE_LABELS,
  getTeacher,
  teachersMock,
  type ContractType,
} from "@/data/teachers";
import { TEACHER_ATTENDANCE_LABELS } from "@/data/teacherAttendance";
import { getUserName } from "@/data/users";
import { sessionsBetween } from "@/domain/schedule";
import {
  SHIFT_STATE_LABELS,
  shiftRows,
  shiftStats,
  type ShiftRow,
  type ShiftState,
} from "@/domain/teacherAttendance";
import {
  addDays,
  formatDate,
  formatDateLong,
  nowISO,
  startOfWeek,
  todayISO,
} from "@/lib/dates";
import { capitalizeFirst } from "@/lib/format";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { CorrectShiftDialog } from "./CorrectShiftDialog";

const STATE_STYLE: Record<ShiftState, { tone: StatusTone; icon: string }> = {
  presente: { tone: "success", icon: "ti-check" },
  ausente: { tone: "danger", icon: "ti-x" },
  sin_registrar: { tone: "warning", icon: "ti-help-circle" },
  programada: { tone: "neutral", icon: "ti-clock" },
};

interface TeacherAttendanceBoardProps {
  /** El encargado confirma y corrige (CU 3); el admin solo consulta. */
  canManage: boolean;
  /** Sede fija (encargado). Sin sede, se puede filtrar (admin). */
  branchId?: string;
}

/**
 * Asistencia de profesores de la semana (CU 2 de Personal): lo programado en
 * el cronograma contra lo registrado, con filtros por profesor y por tipo de
 * contratación. Las semanas anteriores son el historial.
 */
export function TeacherAttendanceBoard({
  canManage,
  branchId,
}: TeacherAttendanceBoardProps) {
  const state = useAppState();
  const actions = useStoreActions();
  const today = todayISO();
  const now = nowISO();
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(today));
  const [branchFilter, setBranchFilter] = React.useState("");
  const [teacherFilter, setTeacherFilter] = React.useState("");
  const [contractFilter, setContractFilter] = React.useState("");
  const [editing, setEditing] = React.useState<ShiftRow | null>(null);
  const branch = branchId ?? branchFilter;

  const sessions = sessionsBetween(
    weekStart,
    addDays(weekStart, 6),
    scheduleMock,
    state.replacements,
  ).filter((s) => {
    const teacher = getTeacher(s.teacherId);
    return (
      (!branch || s.branchId === branch) &&
      (!teacherFilter || s.teacherId === teacherFilter) &&
      (!contractFilter || teacher?.contractType === contractFilter)
    );
  });
  const rows = shiftRows(sessions, state.teacherAttendance, {
    date: now.slice(0, 10),
    time: now.slice(11, 16),
  });
  const stats = shiftStats(rows);
  const toConfirm = rows
    .filter((r) => r.record && !r.record.confirmedAt)
    .map((r) => r.record!.id);
  const days = [...new Set(rows.map((r) => r.session.date))];
  const teachers = teachersMock.filter(
    (t) => !branch || t.branchIds.includes(branch),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
        {!branchId && (
          <FilterSelect
            value={branchFilter}
            onChange={setBranchFilter}
            placeholder="Todas las sedes"
            options={branchesMock
              .filter((b) => b.status === "active")
              .map((b) => ({ value: b.id, label: b.name }))}
          />
        )}
        <FilterSelect
          value={teacherFilter}
          onChange={setTeacherFilter}
          placeholder="Todos los profesores"
          options={teachers.map((t) => ({ value: t.id, label: t.fullName }))}
        />
        <FilterSelect
          value={contractFilter}
          onChange={setContractFilter}
          placeholder="Empleados y contratados"
          options={(Object.keys(CONTRACT_TYPE_LABELS) as ContractType[]).map(
            (c) => ({
              value: c,
              label: `${CONTRACT_TYPE_LABELS[c]}s`,
            }),
          )}
        />
        {canManage && toConfirm.length > 0 && (
          <Button
            type="button"
            onClick={() => {
              actions.confirmTeacherAttendanceMany(toConfirm);
              toast.success(
                `${toConfirm.length} ${toConfirm.length === 1 ? "asistencia confirmada" : "asistencias confirmadas"}.`,
              );
            }}
            className="ml-auto rounded-xl font-bold"
          >
            <i className="ti ti-checks text-base" aria-hidden="true" />
            Confirmar lo registrado ({toConfirm.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon="ti-calendar-check"
          value={`${stats.present} de ${stats.due}`}
          label="Clases dictadas"
          tone="success"
        />
        <StatCard
          icon="ti-user-x"
          value={stats.absent}
          label="Ausencias"
          tone="danger"
        />
        <StatCard
          icon="ti-help-circle"
          value={stats.unregistered}
          label="Sin registrar"
          tone="warning"
        />
        <StatCard
          icon="ti-shield-check"
          value={stats.toConfirm}
          label="Para confirmar"
          tone="info"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="ti-calendar-off"
          title="No hay clases con esos filtros"
          className="rounded-2xl border border-dashed border-white/10"
        />
      ) : (
        days.map((day) => (
          <section
            key={day}
            aria-label={formatDateLong(day)}
            className="flex flex-col gap-2"
          >
            <h2 className="text-sm font-bold text-gray-200">
              {capitalizeFirst(formatDateLong(day))}
              {day === today && (
                <span className="ml-2 text-xs font-semibold normal-case text-primary">
                  (hoy)
                </span>
              )}
            </h2>
            <ul className="flex flex-col divide-y divide-white/[0.05] rounded-2xl bg-neutral-900 shadow-card glass-border">
              {rows
                .filter((r) => r.session.date === day)
                .map((row) => {
                  const { session, record, state: shiftState } = row;
                  const teacher = getTeacher(session.teacherId);
                  const style = STATE_STYLE[shiftState];
                  return (
                    <li
                      key={`${session.slotId}_${day}`}
                      className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white">
                          {session.start} ·{" "}
                          {getActivityName(session.activityId)}
                          {!branchId && (
                            <span className="font-normal text-gray-400">
                              {" "}
                              ·{" "}
                              {
                                branchesMock.find(
                                  (b) => b.id === session.branchId,
                                )?.name
                              }
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">
                          {teacher?.fullName ?? "Sin profesor"}
                          {teacher &&
                            ` · ${CONTRACT_TYPE_LABELS[teacher.contractType]}`}
                          {session.replacementId && " · reemplazo"}
                          {record?.reason && ` · motivo: ${record.reason}`}
                        </p>
                        {record?.correction && (
                          <p className="text-xs text-info">
                            Corregida por {getUserName(record.correction.by)}:
                            antes{" "}
                            {TEACHER_ATTENDANCE_LABELS[
                              record.correction.previousStatus
                            ].toLowerCase()}{" "}
                            ({record.correction.reason})
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={style.tone} icon={style.icon}>
                          {SHIFT_STATE_LABELS[shiftState]}
                        </StatusBadge>
                        {record &&
                          (record.confirmedAt ? (
                            <span className="text-xs text-gray-400">
                              Confirmada por {getUserName(record.confirmedBy)}{" "}
                              el {formatDate(record.confirmedAt)}
                            </span>
                          ) : (
                            <span className="text-xs text-warning">
                              Sin confirmar
                            </span>
                          ))}
                        {canManage && record && !record.confirmedAt && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              actions.confirmTeacherAttendance(record.id);
                              toast.success("Asistencia confirmada.");
                            }}
                            className="rounded-lg"
                          >
                            Confirmar
                          </Button>
                        )}
                        {canManage && shiftState !== "programada" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditing(row)}
                            className="rounded-lg text-primary hover:text-primary"
                          >
                            {record ? "Corregir" : "Registrar"}
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))
      )}

      {canManage && (
        <CorrectShiftDialog row={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
