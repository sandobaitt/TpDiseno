import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormField, inputClasses } from "@/components/common/FormField";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { scheduleMock } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { CONTRACT_TYPE_LABELS, getTeacher } from "@/data/teachers";
import { branchesMock } from "@/data/branches";
import { getMockSession, getUserName } from "@/data/users";
import type {
  TeacherAttendance,
  TeacherAttendanceStatus,
} from "@/data/teacherAttendance";
import { sessionsBetween } from "@/domain/schedule";
import { ABSENCE_REASONS, shiftRows } from "@/domain/teacherAttendance";
import { ATTENDANCE_CORRECTION_DAYS } from "@/domain/attendance";
import { addDays, formatDate, nowISO, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppState, useStoreActions } from "@/store/StoreProvider";

type Mark = { status: TeacherAttendanceStatus; reason?: string };

interface ShiftRegisterProps {
  /** Sede donde se registra (la de quien está usando el sistema). */
  branchId: string;
  /** Si puede elegir otra sede. */
  allowBranchChange?: boolean;
}

/**
 * Registrar la asistencia de cada profesor en su turno (CU 1 de Personal),
 * según el cronograma del día (con los reemplazos aceptados). Lo confirmado
 * por el encargado ya no se cambia acá: se corrige desde su panel.
 */
export function ShiftRegister({
  branchId,
  allowBranchChange,
}: ShiftRegisterProps) {
  const state = useAppState();
  const today = todayISO();
  const [date, setDate] = React.useState(today);
  const [branch, setBranch] = React.useState(branchId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-neutral-900 p-5 shadow-card glass-border sm:grid-cols-2 max-sm:p-4">
        <FormField
          label="Día"
          hint={`Se puede completar hasta ${ATTENDANCE_CORRECTION_DAYS} días atrás.`}
        >
          {(id, describedBy) => (
            <input
              id={id}
              type="date"
              value={date}
              min={addDays(today, -ATTENDANCE_CORRECTION_DAYS)}
              max={today}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
        <FormField label="Sede">
          {(id) => (
            <select
              id={id}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={!allowBranchChange}
              className={inputClasses}
            >
              {branchesMock
                .filter((b) => b.status === "active")
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          )}
        </FormField>
      </div>
      <ShiftList
        key={`${date}_${branch}`}
        date={date}
        branchId={branch}
        state={state}
      />
    </div>
  );
}

function ShiftList({
  date,
  branchId,
  state,
}: {
  date: string;
  branchId: string;
  state: ReturnType<typeof useAppState>;
}) {
  const actions = useStoreActions();
  const now = nowISO();
  const sessions = sessionsBetween(
    date,
    date,
    scheduleMock,
    state.replacements,
  ).filter((s) => s.branchId === branchId);
  const rows = shiftRows(sessions, state.teacherAttendance, {
    date: now.slice(0, 10),
    time: now.slice(11, 16),
  });
  const saved: Record<string, Mark | undefined> = Object.fromEntries(
    rows.map((r) => [
      r.session.slotId,
      r.record
        ? { status: r.record.status, reason: r.record.reason }
        : undefined,
    ]),
  );
  const [marks, setMarks] = React.useState(saved);
  const changed = rows.filter(
    (r) =>
      !r.record?.confirmedAt &&
      marks[r.session.slotId] &&
      JSON.stringify(marks[r.session.slotId]) !==
        JSON.stringify(saved[r.session.slotId]),
  );

  function save() {
    const userId = getMockSession()?.id ?? "sistema";
    const at = nowISO();
    const records: TeacherAttendance[] = changed.map((r) => {
      const mark = marks[r.session.slotId]!;
      return {
        id: `ta_${r.session.slotId}_${date}`,
        slotId: r.session.slotId,
        date,
        teacherId: r.session.teacherId,
        status: mark.status,
        reason:
          mark.status === "absent" ? (mark.reason ?? "Sin motivo") : undefined,
        recordedBy: userId,
        recordedAt: at,
      };
    });
    actions.saveTeacherAttendance(records, date);
    toast.success(
      `Asistencia de ${records.length} ${records.length === 1 ? "profesor guardada" : "profesores guardada"}.`,
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="ti-calendar-off"
        title="No hay clases ese día en esta sede"
        className="rounded-2xl border border-dashed border-white/10"
      />
    );
  }

  return (
    <section
      aria-label={`Turnos del ${formatDate(date)}`}
      className="flex flex-col gap-3"
    >
      <ul className="flex flex-col divide-y divide-white/[0.05] rounded-2xl bg-neutral-900 shadow-card glass-border">
        {rows.map(({ session, record }) => {
          const teacher = getTeacher(session.teacherId);
          const mark = marks[session.slotId];
          const locked = !!record?.confirmedAt;
          return (
            <li
              key={session.slotId}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">
                  {session.start} a {session.end} ·{" "}
                  {getActivityName(session.activityId)}
                </p>
                <p className="text-xs text-gray-400">
                  {teacher?.fullName ?? "Sin profesor"}
                  {teacher &&
                    ` · ${CONTRACT_TYPE_LABELS[teacher.contractType]}`}
                  {session.replacementId &&
                    ` · reemplaza a ${getTeacher(session.originalTeacherId)?.fullName ?? "el titular"}`}
                </p>
              </div>
              {locked ? (
                <StatusBadge tone="success" icon="ti-shield-check">
                  {record.status === "present" ? "Presente" : "Ausente"} ·
                  confirmada por {getUserName(record.confirmedBy)}
                </StatusBadge>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <ToggleGroup
                    type="single"
                    value={mark?.status ?? ""}
                    onValueChange={(value) =>
                      value &&
                      setMarks((m) => ({
                        ...m,
                        [session.slotId]: {
                          status: value as TeacherAttendanceStatus,
                          reason:
                            value === "absent"
                              ? (m[session.slotId]?.reason ??
                                ABSENCE_REASONS[0])
                              : undefined,
                        },
                      }))
                    }
                    aria-label={`Asistencia de ${teacher?.fullName ?? "profesor"} a las ${session.start}`}
                    className="gap-1.5"
                  >
                    <ToggleGroupItem
                      value="present"
                      variant="outline"
                      className="h-10 gap-1.5 rounded-lg px-3 text-xs font-bold data-[state=on]:border-success/50 data-[state=on]:bg-success/15 data-[state=on]:text-success"
                    >
                      <i className="ti ti-check text-sm" aria-hidden="true" />
                      Presente
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="absent"
                      variant="outline"
                      className="h-10 gap-1.5 rounded-lg px-3 text-xs font-bold data-[state=on]:border-danger/50 data-[state=on]:bg-danger/15 data-[state=on]:text-danger"
                    >
                      <i className="ti ti-x text-sm" aria-hidden="true" />
                      Ausente
                    </ToggleGroupItem>
                  </ToggleGroup>
                  {mark?.status === "absent" && (
                    <select
                      aria-label="Motivo de la ausencia"
                      value={mark.reason}
                      onChange={(e) =>
                        setMarks((m) => ({
                          ...m,
                          [session.slotId]: {
                            status: "absent",
                            reason: e.target.value,
                          },
                        }))
                      }
                      className={cn(inputClasses, "h-10 w-auto py-0")}
                    >
                      {ABSENCE_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-neutral-900/95 px-4 py-3 shadow-card backdrop-blur">
        <p className="text-xs text-gray-400">
          {changed.length > 0 ? (
            <span className="font-semibold text-warning">
              {changed.length}{" "}
              {changed.length === 1
                ? "cambio sin guardar"
                : "cambios sin guardar"}
            </span>
          ) : (
            "Marcá quién vino a dar su clase. Si falta, elegí el motivo."
          )}
        </p>
        <Button
          type="button"
          onClick={save}
          disabled={changed.length === 0}
          className="rounded-xl font-bold"
        >
          <i className="ti ti-device-floppy text-base" aria-hidden="true" />
          Guardar asistencia
        </Button>
      </div>
    </section>
  );
}
