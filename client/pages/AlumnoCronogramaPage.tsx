import * as React from "react";
import { DayColumn } from "@/components/cronograma/DayColumn";
import { weekMock } from "@/data/schedule";
import { getMockSession } from "@/data/users";
import { clientsMock } from "@/data/clients";
import { classStudentsMock } from "@/data/classStudents";
import { workoutTypesMock, type WorkoutType } from "@/data/workoutTypes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MONTHS = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const BASE_MONDAY = new Date(2025, 4, 12);

function buildWeek(offset: number) {
  return weekMock.map((day, i) => {
    const d = new Date(BASE_MONDAY);
    d.setDate(BASE_MONDAY.getDate() + offset * 7 + i);
    return { ...day, date: d.getDate(), month: MONTHS[d.getMonth()] };
  });
}

function weekLabel(offset: number) {
  const first = new Date(BASE_MONDAY);
  first.setDate(BASE_MONDAY.getDate() + offset * 7);
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  return `${MONTHS[first.getMonth()]} ${first.getDate()} - ${MONTHS[last.getMonth()]} ${last.getDate()}`;
}

function getAllowedWorkoutTypes(planName: string): WorkoutType[] {
  if (planName === "Musculación") return workoutTypesMock.filter((wt) => wt.name === "Musculación");
  if (planName === "Pase Libre") return workoutTypesMock.filter((wt) => !wt.isProOnly);
  if (planName === "Crossfit") return workoutTypesMock.filter((wt) => wt.category === "crossfit" && !wt.isProOnly);
  return [];
}

export default function AlumnoCronogramaPage() {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [activeDay, setActiveDay] = React.useState(weekMock.find((d) => d.isActive)?.dayAbbr ?? "");

  const session = React.useMemo(() => getMockSession(), []);

  const { studentIds, planName } = React.useMemo(() => {
    if (!session) return { studentIds: [], planName: "" };
    const client = clientsMock.find((c) => c.fullName === session.fullName);
    if (!client) return { studentIds: [], planName: "" };
    const studentRecords = classStudentsMock.filter((s) => s.clientId === client.id);
    return {
      studentIds: studentRecords.map((s) => s.id),
      planName: studentRecords[0]?.plan ?? "",
    };
  }, [session]);

  const allowedWorkoutTypes = React.useMemo(() => getAllowedWorkoutTypes(planName), [planName]);

  const week = React.useMemo(() => {
    const w = buildWeek(weekOffset);
    return w.map((d) => ({
      ...d,
      isActive: d.dayAbbr === activeDay,
      classes: d.classes.filter((cls) =>
        cls.enrolledStudentIds.some((id) => studentIds.includes(id)),
      ),
    }));
  }, [weekOffset, activeDay, studentIds]);

  const handleSelectDay = (dayAbbr: string) => setActiveDay(dayAbbr);
  const isEmpty = week.every((d) => d.classes.length === 0);

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-app-text text-3xl md:text-4xl font-extrabold leading-tight mt-1">
            CRONOGRAMA DE CLASES
          </h1>
          <p className="text-app-faint text-sm mt-1">
            Consulta tus sesiones de entrenamiento.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {allowedWorkoutTypes.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 bg-app-card/80 hover:bg-app-card border border-app-border/[0.12]/50 text-app-subtle hover:text-app-text rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer">
                  <i className="ti ti-list-check text-sm" />
                  Ver clases habilitadas
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-app-text text-lg font-bold">
                    Clases habilitadas con tu plan
                  </DialogTitle>
                  <p className="text-app-faint text-xs mt-0.5">Plan: <span className="text-app-subtle font-semibold">{planName}</span></p>
                </DialogHeader>
                <ul className="flex flex-col gap-2 mt-2 max-h-[60vh] overflow-y-auto pr-1">
                  {allowedWorkoutTypes.map((wt) => (
                    <li
                      key={wt.id}
                      className="flex items-start gap-3 bg-app-card/60 border border-app-border/[0.12]/40 rounded-xl px-4 py-3"
                    >
                      <span className="mt-0.5 text-app-accent text-xl">
                        <i className={`ti ${wt.icon}`} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-app-text text-sm font-semibold leading-tight">{wt.name}</p>
                        <p className="text-app-faint text-xs mt-0.5 leading-snug">{wt.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </DialogContent>
            </Dialog>
          )}

          <div className="flex items-center gap-2 bg-app-card/80 rounded-xl px-4 py-2.5 border border-app-border/[0.12]/50">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="text-app-subtle hover:text-app-text transition-colors cursor-pointer"
          >
            <i className="ti ti-chevron-left text-sm" />
          </button>
          <span className="text-app-text text-xs font-bold tracking-wider px-3">
            {weekLabel(weekOffset)}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="text-app-subtle hover:text-app-text transition-colors cursor-pointer"
          >
            <i className="ti ti-chevron-right text-sm" />
          </button>
        </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-app-faint">
          <i className="ti ti-calendar-off text-4xl" />
          <p className="text-base font-medium">No tenés clases asignadas esta semana</p>
          <p className="text-sm">Consultá con la recepción para inscribirte a una clase.</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {week.map((day) => (
            <DayColumn key={day.dayAbbr} day={day} onSelect={handleSelectDay} />
          ))}
        </div>
      )}
    </div>
  );
}
