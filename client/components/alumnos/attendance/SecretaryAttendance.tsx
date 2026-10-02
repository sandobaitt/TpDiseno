import * as React from "react";
import { FormField, inputClasses } from "@/components/common/FormField";
import { EmptyState } from "@/components/common/EmptyState";
import { scheduleMock } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { getTeacher } from "@/data/teachers";
import { branchesMock } from "@/data/branches";
import { getMockSession } from "@/data/users";
import { ATTENDANCE_CORRECTION_DAYS } from "@/domain/attendance";
import { sessionsBetween, type Session } from "@/domain/schedule";
import { addDays, nowISO, todayISO } from "@/lib/dates";
import { useAppState } from "@/store/StoreProvider";
import { ClassRoster } from "./ClassRoster";
import { SessionSummary } from "./SessionSummary";

/** La clase que está por empezar o en curso (o la primera del día si ya pasó la fecha). */
function defaultSlot(sessions: Session[], date: string): string {
  if (sessions.length === 0) return "";
  if (date !== todayISO()) return sessions[0].slotId;
  const now = nowISO().slice(11, 16);
  return (
    sessions.find((s) => s.end > now)?.slotId ??
    sessions[sessions.length - 1].slotId
  );
}

/**
 * Asistencia por clase y sede para secretaría (CU 6): se elige el día, la sede
 * y la clase del cronograma. Se pueden corregir días anteriores.
 */
export function SecretaryAttendance() {
  const state = useAppState();
  const today = todayISO();
  const activeBranches = branchesMock.filter((b) => b.status === "active");
  const [date, setDate] = React.useState(today);
  const [branchId, setBranchId] = React.useState(
    getMockSession()?.branchId ?? activeBranches[0].id,
  );

  const sessions = sessionsBetween(
    date,
    date,
    scheduleMock,
    state.replacements,
  ).filter((s) => s.branchId === branchId);
  const [slotId, setSlotId] = React.useState(() => defaultSlot(sessions, date));
  const session =
    sessions.find((s) => s.slotId === slotId) ??
    sessions.find((s) => s.slotId === defaultSlot(sessions, date));

  function changeDay(nextDate: string, nextBranch = branchId) {
    setDate(nextDate);
    setBranchId(nextBranch);
    const next = sessionsBetween(
      nextDate,
      nextDate,
      scheduleMock,
      state.replacements,
    ).filter((s) => s.branchId === nextBranch);
    setSlotId(defaultSlot(next, nextDate));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-neutral-900 p-5 shadow-card glass-border sm:grid-cols-3 max-sm:p-4">
        <FormField
          label="Día"
          hint={`Podés corregir hasta ${ATTENDANCE_CORRECTION_DAYS} días para atrás.`}
        >
          {(id, describedBy) => (
            <input
              id={id}
              type="date"
              value={date}
              min={addDays(today, -ATTENDANCE_CORRECTION_DAYS)}
              max={today}
              onChange={(e) => e.target.value && changeDay(e.target.value)}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>
        <FormField label="Sede">
          {(id) => (
            <select
              id={id}
              value={branchId}
              onChange={(e) => changeDay(date, e.target.value)}
              className={inputClasses}
            >
              {activeBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField label="Clase">
          {(id) => (
            <select
              id={id}
              value={session?.slotId ?? ""}
              onChange={(e) => setSlotId(e.target.value)}
              disabled={sessions.length === 0}
              className={inputClasses}
            >
              {sessions.length === 0 && <option value="">Sin clases</option>}
              {sessions.map((s) => (
                <option key={s.slotId} value={s.slotId}>
                  {s.start} · {getActivityName(s.activityId)} ·{" "}
                  {getTeacher(s.teacherId)?.fullName ?? "Profesor"}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      {session ? (
        <>
          <SessionSummary session={session} />
          <ClassRoster
            key={`${session.slotId}_${session.date}`}
            session={session}
            profilePath={(clientId) => `/secretaria/alumnos/${clientId}`}
          />
        </>
      ) : (
        <EmptyState
          icon="ti-calendar-off"
          title="No hay clases ese día en esta sede"
          description="Elegí otro día u otra sede."
          className="rounded-2xl border border-dashed border-white/10"
        />
      )}
    </div>
  );
}
