import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { WeekNavigator } from "@/components/common/WeekNavigator";
import { FilterSelect } from "@/components/common/FilterSelect";
import { SectionCard } from "@/components/common/SectionCard";
import { DetailList } from "@/components/common/DetailList";
import { StatCard } from "@/components/common/StatCard";
import { UnifiedCalendar } from "./UnifiedCalendar";
import { ClassCard } from "./ClassCard";
import { branchName, buildWeekDays, toClassCard } from "./weekView";
import { scheduleMock } from "@/data/schedule";
import { branchesMock } from "@/data/branches";
import {
  CONTRACT_TYPE_LABELS,
  getTeacher,
  teachersMock,
} from "@/data/teachers";
import { activitiesMock, getActivityName } from "@/data/activities";
import { getPlan } from "@/data/plans";
import { getMockSession } from "@/data/users";
import { findOverlaps, sessionsBetween, type Session } from "@/domain/schedule";
import {
  addDays,
  formatDateLong,
  formatMinutes,
  startOfWeek,
  todayISO,
} from "@/lib/dates";
import { capitalizeFirst } from "@/lib/format";
import { useAppState } from "@/store/StoreProvider";

const keyOf = (s: Session) => `${s.slotId}_${s.date}`;
const teacherName = (id?: string) => getTeacher(id)?.fullName ?? "Sin asignar";
const describe = (s: Session) =>
  `${getActivityName(s.activityId)} (${branchName(s.branchId)}, ${s.start}–${s.end})`;

/**
 * Cronograma de clases para el personal (requisito 3.1.17; CU "Consultar
 * Cronograma", extendido por "Consultar Detalle de Clase"): horarios y
 * profesores por clase, disponibilidad por día y sede, y aviso de
 * superposiciones y cambios (reemplazos y cambios de turno).
 */
export function StaffSchedule() {
  const state = useAppState();
  const today = todayISO();
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(today));
  const [activeDate, setActiveDate] = React.useState(today);
  const [branch, setBranch] = React.useState(
    () => getMockSession()?.branchId ?? "",
  );
  const [teacher, setTeacher] = React.useState("");
  const [activity, setActivity] = React.useState("");
  const [detailKey, setDetailKey] = React.useState<string | null>(null);

  // Toda la semana (todas las sedes): un profesor puede superponerse entre sedes.
  const weekSessions = React.useMemo(
    () =>
      sessionsBetween(
        weekStart,
        addDays(weekStart, 6),
        scheduleMock,
        state.replacements,
      ),
    [weekStart, state.replacements],
  );
  const overlaps = findOverlaps(weekSessions);
  const conflictOf = new Map<string, Session>();
  for (const [a, b] of overlaps) {
    conflictOf.set(keyOf(a), b);
    conflictOf.set(keyOf(b), a);
  }

  const visible = weekSessions.filter(
    (s) =>
      (!branch || s.branchId === branch) &&
      (!teacher || s.teacherId === teacher) &&
      (!activity || s.activityId === activity),
  );
  const visibleKeys = new Set(visible.map(keyOf));
  const visibleOverlaps = overlaps.filter(
    ([a, b]) => visibleKeys.has(keyOf(a)) || visibleKeys.has(keyOf(b)),
  );
  const replacements = visible.filter(
    (s) => s.replacementId || s.pendingReplacementId,
  );
  const weekEnd = addDays(weekStart, 6);
  const shiftChanges = state.novedades.filter(
    (n) =>
      n.type === "change" &&
      !n.annulled &&
      (!branch || n.branchId === branch) &&
      n.timestamp.slice(0, 10) >= weekStart &&
      n.timestamp.slice(0, 10) <= weekEnd,
  );

  const pendingCandidate = (s: Session) =>
    state.replacements.find((r) => r.id === s.pendingReplacementId)
      ?.candidateTeacherId;
  const toCard = (s: Session) => {
    const other = conflictOf.get(keyOf(s));
    const candidate = pendingCandidate(s);
    return {
      ...toClassCard(s),
      pendingNote: candidate
        ? `Reemplazo pedido a ${teacherName(candidate)}`
        : undefined,
      conflictNote: other
        ? `Se superpone con ${getActivityName(other.activityId)} (${branchName(other.branchId)})`
        : undefined,
    };
  };

  const days = buildWeekDays(weekStart, activeDate);
  const totalMins = visible.reduce((sum, s) => sum + s.durationMin, 0);
  const detail = weekSessions.find((s) => keyOf(s) === detailKey);

  const teacherOptions = teachersMock
    .filter((t) => !branch || t.branchIds.includes(branch))
    .map((t) => ({ value: t.id, label: t.fullName }));

  return (
    <div className="flex flex-col gap-6 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Cronogramas"
        subtitle="Clases, horarios y profesores de cada sede. Tocá una clase para ver el detalle."
        actions={
          <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          value={branch}
          onChange={setBranch}
          placeholder="Todas las sedes"
          options={branchesMock.map((b) => ({ value: b.id, label: b.name }))}
        />
        <FilterSelect
          value={teacher}
          onChange={setTeacher}
          placeholder="Todos los profesores"
          options={teacherOptions}
        />
        <FilterSelect
          value={activity}
          onChange={setActivity}
          placeholder="Todas las actividades"
          options={activitiesMock.map((a) => ({ value: a.id, label: a.name }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon="ti-calendar-event"
          value={visible.length}
          label="Clases de la semana"
        />
        <StatCard
          icon="ti-clock"
          value={formatMinutes(totalMins)}
          label="Horas de clase"
        />
        <StatCard
          icon="ti-arrows-exchange"
          tone="info"
          value={replacements.length + shiftChanges.length}
          label="Cambios"
        />
        <StatCard
          icon="ti-alert-triangle"
          tone={visibleOverlaps.length > 0 ? "danger" : "success"}
          value={visibleOverlaps.length}
          label="Superposiciones"
        />
      </div>

      <SectionCard
        title="Cambios y superposiciones de la semana"
        icon="ti-bell"
      >
        {visibleOverlaps.length + replacements.length + shiftChanges.length ===
        0 ? (
          <p className="text-sm text-muted-foreground">
            No hay cambios ni superposiciones esta semana.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleOverlaps.map(([a, b]) => (
              <li
                key={`ov_${keyOf(a)}_${keyOf(b)}`}
                className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-foreground"
              >
                <i
                  className="ti ti-alert-triangle mt-0.5 text-danger"
                  aria-hidden="true"
                />
                <span>
                  <b className="text-danger">Superposición:</b>{" "}
                  {teacherName(a.teacherId)} tiene {describe(a)} y {describe(b)}{" "}
                  el {formatDateLong(a.date)}.
                </span>
              </li>
            ))}
            {replacements.map((s) => (
              <li
                key={`rp_${keyOf(s)}`}
                className="flex items-start gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground"
              >
                <i
                  className={`ti ${s.replacementId ? "ti-arrows-exchange text-warning" : "ti-hourglass text-info"} mt-0.5`}
                  aria-hidden="true"
                />
                <span>
                  {s.replacementId ? (
                    <>
                      <b>Reemplazo confirmado:</b> {teacherName(s.teacherId)} da{" "}
                      {describe(s)} el {formatDateLong(s.date)} en lugar de{" "}
                      {teacherName(s.originalTeacherId)}.
                    </>
                  ) : (
                    <>
                      <b>Reemplazo pendiente:</b> se le pidió a{" "}
                      {teacherName(pendingCandidate(s))} que cubra {describe(s)}{" "}
                      el {formatDateLong(s.date)}.
                    </>
                  )}
                </span>
              </li>
            ))}
            {shiftChanges.map((n) => (
              <li
                key={n.id}
                className="flex items-start gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground"
              >
                <i
                  className="ti ti-clock-edit mt-0.5 text-info"
                  aria-hidden="true"
                />
                <span>
                  <b>Cambio de turno:</b> {n.entityName} ·{" "}
                  {branchName(n.branchId)}. {n.detail}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <UnifiedCalendar
        days={days}
        getItemsForDay={(day) =>
          visible.filter((s) => s.date === day.iso).map(toCard)
        }
        renderItem={(card) => (
          <ClassCard
            key={card.id}
            classItem={card}
            onSelect={() => setDetailKey(card.id)}
          />
        )}
        onSelectDay={(abbr) =>
          setActiveDate(days.find((d) => d.dayAbbr === abbr)?.iso ?? activeDate)
        }
        emptyMessage="Sin clases"
      />

      <ClassDetailDialog
        session={detail}
        conflict={detail ? conflictOf.get(keyOf(detail)) : undefined}
        pendingTeacherId={detail ? pendingCandidate(detail) : undefined}
        onClose={() => setDetailKey(null)}
      />
    </div>
  );
}

/** Consultar Detalle de Clase: todo lo de una clase concreta en una fecha. */
function ClassDetailDialog({
  session: s,
  conflict,
  pendingTeacherId,
  onClose,
}: {
  session?: Session;
  conflict?: Session;
  pendingTeacherId?: string;
  onClose: () => void;
}) {
  const state = useAppState();
  const today = todayISO();
  if (!s) return <Dialog open={false} onOpenChange={() => onClose()} />;

  const t = getTeacher(s.teacherId);
  const enabled = state.clients.filter(
    (c) =>
      c.status === "active" &&
      getPlan(c.planId)?.activityIds.includes(s.activityId),
  ).length;
  const records = state.attendance.filter(
    (a) => a.slotId === s.slotId && a.date === s.date,
  );
  const present = records.filter((a) => a.status === "present").length;
  const attendance =
    records.length > 0
      ? `${present} presentes de ${records.length} registrados`
      : s.date > today
        ? "Todavía no se dio"
        : "Sin registrar";
  const notes = state.novedades.filter(
    (n) =>
      !n.annulled &&
      n.timestamp.slice(0, 10) === s.date &&
      (n.entityId === s.slotId || n.entityId === s.teacherId),
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">
            {getActivityName(s.activityId)}
          </DialogTitle>
          <DialogDescription>
            {capitalizeFirst(formatDateLong(s.date))} · {s.start} a {s.end}
          </DialogDescription>
        </DialogHeader>
        <DetailList
          items={[
            { label: "Sede", value: branchName(s.branchId) },
            { label: "Duración", value: `${s.durationMin} minutos` },
            {
              label: "Profesor",
              value: s.replacementId
                ? `${t?.fullName ?? "Sin asignar"} (reemplaza a ${teacherName(s.originalTeacherId)})`
                : `${t?.fullName ?? "Sin asignar"}${t ? ` · ${CONTRACT_TYPE_LABELS[t.contractType]}` : ""}`,
            },
            { label: "Cupo", value: `${s.capacity} personas` },
            {
              label: "Alumnos con esta clase en su plan",
              value: `${enabled}`,
            },
            { label: "Asistencia", value: attendance },
          ]}
        />
        {(conflict || pendingTeacherId || notes.length > 0) && (
          <ul className="flex flex-col gap-2 text-sm">
            {conflict && (
              <li className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2">
                <i
                  className="ti ti-alert-triangle mt-0.5 text-danger"
                  aria-hidden="true"
                />
                <span>
                  <b className="text-danger">Superposición:</b> a la misma hora{" "}
                  {t?.fullName ?? "el profesor"} tiene {describe(conflict)}.
                </span>
              </li>
            )}
            {pendingTeacherId && (
              <li className="flex items-start gap-2 rounded-xl bg-info/10 px-3 py-2">
                <i
                  className="ti ti-hourglass mt-0.5 text-info"
                  aria-hidden="true"
                />
                <span>
                  Se le pidió a {teacherName(pendingTeacherId)} que la cubra;
                  todavía no respondió.
                </span>
              </li>
            )}
            {notes.map((n) => (
              <li
                key={n.id}
                className="flex items-start gap-2 rounded-xl bg-secondary/60 px-3 py-2"
              >
                <i
                  className="ti ti-speakerphone mt-0.5 text-warning"
                  aria-hidden="true"
                />
                <span>Novedad: {n.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
