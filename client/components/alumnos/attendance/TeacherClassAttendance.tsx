import * as React from "react";
import { Button } from "@/components/ui/button";
import { FormField, inputClasses } from "@/components/common/FormField";
import { EmptyState } from "@/components/common/EmptyState";
import { scheduleMock } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { branchName } from "@/components/cronograma/weekView";
import { ATTENDANCE_CORRECTION_DAYS } from "@/domain/attendance";
import { sessionsBetween } from "@/domain/schedule";
import { addDays, nowISO, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppState } from "@/store/StoreProvider";
import { ClassRoster } from "./ClassRoster";
import { SessionSummary } from "./SessionSummary";

/**
 * Asistencia de las clases del profesor (CU 6): ve solo las suyas, incluidos
 * los reemplazos que aceptó. Pensado para usar en el celular.
 */
export function TeacherClassAttendance({ teacherId }: { teacherId?: string }) {
  const state = useAppState();
  const today = todayISO();
  const [date, setDate] = React.useState(today);
  const sessions = sessionsBetween(
    date,
    date,
    scheduleMock,
    state.replacements,
  ).filter((s) => s.teacherId === teacherId);

  const now = nowISO().slice(11, 16);
  const preferred =
    date === today
      ? (sessions.find((s) => s.end > now) ?? sessions[sessions.length - 1])
      : sessions[0];
  const [slotId, setSlotId] = React.useState(preferred?.slotId ?? "");
  const session =
    sessions.find((s) => s.slotId === slotId) ?? preferred ?? undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-neutral-900 p-5 shadow-card glass-border max-sm:p-4">
        <FormField
          label="Día"
          hint={`Podés corregir clases de hasta ${ATTENDANCE_CORRECTION_DAYS} días atrás.`}
          className="sm:max-w-xs"
        >
          {(id, describedBy) => (
            <input
              id={id}
              type="date"
              value={date}
              min={addDays(today, -ATTENDANCE_CORRECTION_DAYS)}
              max={today}
              onChange={(e) => {
                if (!e.target.value) return;
                setDate(e.target.value);
                setSlotId("");
              }}
              aria-describedby={describedBy}
              className={inputClasses}
            />
          )}
        </FormField>

        {sessions.length > 0 && (
          <div
            role="group"
            aria-label="Mis clases del día"
            className="flex flex-wrap gap-2"
          >
            {sessions.map((s) => {
              const active = s.slotId === session?.slotId;
              return (
                <Button
                  key={s.slotId}
                  type="button"
                  variant="outline"
                  aria-pressed={active}
                  onClick={() => setSlotId(s.slotId)}
                  className={cn(
                    "h-auto flex-col items-start gap-0 rounded-xl px-4 py-2.5 text-left",
                    active
                      ? "border-primary/60 bg-primary/10 hover:bg-primary/15"
                      : "border-white/[0.07]",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-bold",
                      active ? "text-primary" : "text-white",
                    )}
                  >
                    {s.start} · {getActivityName(s.activityId)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {branchName(s.branchId)}
                    {s.replacementId && " · reemplazo"}
                  </span>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {session ? (
        <>
          <SessionSummary session={session} />
          <ClassRoster
            key={`${session.slotId}_${session.date}`}
            session={session}
          />
        </>
      ) : (
        <EmptyState
          icon="ti-calendar-off"
          title="No tenés clases este día"
          description="Elegí otro día para ver o corregir la asistencia."
          className="rounded-2xl border border-dashed border-white/10"
        />
      )}
    </div>
  );
}
