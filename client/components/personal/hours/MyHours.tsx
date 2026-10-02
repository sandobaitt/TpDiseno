import * as React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { FilterSelect } from "@/components/common/FilterSelect";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { scheduleMock } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { branchesMock } from "@/data/branches";
import { getTeacher } from "@/data/teachers";
import {
  TEACHER_SESSION_STATE_LABELS,
  getTeacherHours,
  summarizeTeacherSessions,
  type TeacherSessionRecord,
  type TeacherSessionState,
} from "@/domain/hours";
import {
  addDays,
  addMonths,
  dateInPeriod,
  daysInPeriod,
  formatDate,
  formatMinutes,
  startOfWeek,
  toPeriod,
  todayISO,
} from "@/lib/dates";
import { useAppState } from "@/store/StoreProvider";

type Period = "semana" | "mes" | "anterior";

const STATE_STYLE: Record<
  TeacherSessionState,
  { tone: StatusTone; icon: string }
> = {
  dictada: { tone: "success", icon: "ti-check" },
  ausente: { tone: "danger", icon: "ti-x" },
  sin_registro: { tone: "warning", icon: "ti-help-circle" },
  programada: { tone: "neutral", icon: "ti-clock" },
};

function rangeFor(period: Period, today: string): [string, string] {
  if (period === "semana") {
    const monday = startOfWeek(today);
    return [monday, addDays(monday, 6)];
  }
  const month =
    period === "mes" ? toPeriod(today) : addMonths(toPeriod(today), -1);
  return [dateInPeriod(month, 1), dateInPeriod(month, daysInPeriod(month))];
}

/**
 * Horas del profesor (CU 6 de Personal): clases del cronograma (con los
 * reemplazos que aceptó) contra lo registrado, y aviso si hay diferencias (CU 10).
 */
export function MyHours({ teacherId }: { teacherId?: string }) {
  const state = useAppState();
  const today = todayISO();
  const teacher = getTeacher(teacherId);
  const [period, setPeriod] = React.useState<Period>("mes");
  const [branch, setBranch] = React.useState("");
  const [activity, setActivity] = React.useState("");

  const [from, to] = rangeFor(period, today);
  const all = getTeacherHours(
    teacherId ?? "",
    from,
    to,
    today,
    scheduleMock,
    state.replacements,
    state.teacherAttendance,
  ).sessions;
  const records = all.filter(
    (r) =>
      (!branch || r.session.branchId === branch) &&
      (!activity || r.session.activityId === activity),
  );
  const summary = summarizeTeacherSessions(records);
  const dictated = records.filter((r) => r.state === "dictada");
  const studentsIn = (r: TeacherSessionRecord) =>
    state.attendance.filter(
      (a) =>
        a.slotId === r.session.slotId &&
        a.date === r.session.date &&
        a.status === "present",
    ).length;
  const average = dictated.length
    ? Math.round(
        dictated.reduce((sum, r) => sum + studentsIn(r), 0) / dictated.length,
      )
    : 0;
  const activities = [...new Set(all.map((r) => r.session.activityId))];

  const columns: DataTableColumn<TeacherSessionRecord>[] = [
    {
      key: "date",
      header: "FECHA",
      render: (r) => (
        <span className="text-sm text-gray-200">
          {formatDate(r.session.date)}
        </span>
      ),
    },
    {
      key: "class",
      header: "CLASE",
      render: (r) => (
        <span className="text-sm font-semibold text-white">
          {getActivityName(r.session.activityId)} · {r.session.start}
          {r.session.replacementId && (
            <span className="font-normal text-warning"> (reemplazo)</span>
          )}
        </span>
      ),
    },
    {
      key: "branch",
      header: "SEDE",
      render: (r) => (
        <span className="text-sm text-gray-300">
          {branchesMock
            .find((b) => b.id === r.session.branchId)
            ?.name.replace("SquatGym ", "")}
        </span>
      ),
    },
    {
      key: "duration",
      header: "DURACIÓN",
      render: (r) => (
        <span className="text-sm text-gray-300">
          {formatMinutes(r.session.durationMin)}
        </span>
      ),
    },
    {
      key: "students",
      header: "ALUMNOS",
      hideOnMobile: true,
      render: (r) => (
        <span className="text-sm text-gray-300">
          {r.state === "dictada" ? studentsIn(r) : "—"}
        </span>
      ),
    },
    {
      key: "state",
      header: "ESTADO",
      render: (r) => (
        <StatusBadge
          tone={STATE_STYLE[r.state].tone}
          icon={STATE_STYLE[r.state].icon}
        >
          {TEACHER_SESSION_STATE_LABELS[r.state]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Mis horas"
        subtitle="Tus clases del cronograma (con los reemplazos que aceptaste) y lo que quedó registrado."
      />

      <div className="flex flex-wrap items-center gap-2">
        <SegmentedTabs<Period>
          label="Período"
          value={period}
          onChange={setPeriod}
          items={[
            { id: "semana", label: "Esta semana" },
            { id: "mes", label: "Este mes" },
            { id: "anterior", label: "Mes anterior" },
          ]}
        />
        {teacher && teacher.branchIds.length > 1 && (
          <FilterSelect
            value={branch}
            onChange={setBranch}
            placeholder="Todas las sedes"
            options={teacher.branchIds.map((id) => ({
              value: id,
              label: branchesMock.find((b) => b.id === id)?.name ?? id,
            }))}
          />
        )}
        {activities.length > 1 && (
          <FilterSelect
            value={activity}
            onChange={setActivity}
            placeholder="Todas las clases"
            options={activities.map((id) => ({
              value: id,
              label: getActivityName(id),
            }))}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon="ti-clock"
          value={formatMinutes(summary.workedMin)}
          label="Horas dictadas"
          tone="success"
        />
        <StatCard
          icon="ti-calendar"
          value={formatMinutes(summary.scheduledMin)}
          label="Programadas hasta hoy"
        />
        <StatCard
          icon={summary.differenceMin < 0 ? "ti-alert-triangle" : "ti-equal"}
          value={
            summary.differenceMin === 0
              ? "Sin diferencia"
              : formatMinutes(summary.differenceMin)
          }
          label="Diferencia con el cronograma"
          tone={summary.differenceMin < 0 ? "warning" : "success"}
        />
        <StatCard
          icon="ti-users"
          value={dictated.length}
          label="Clases dictadas"
          hint={dictated.length ? `Promedio de ${average} alumnos` : undefined}
        />
      </div>

      {summary.differenceMin < 0 && (
        <p
          className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-gray-200"
          role="status"
        >
          <i
            className="ti ti-alert-triangle mt-0.5 text-base text-warning"
            aria-hidden="true"
          />
          Hay {formatMinutes(-summary.differenceMin)} menos que en el
          cronograma: {summary.absences}{" "}
          {summary.absences === 1 ? "ausencia" : "ausencias"} y{" "}
          {summary.unregistered}{" "}
          {summary.unregistered === 1
            ? "clase sin registrar"
            : "clases sin registrar"}
          . Si diste esas clases, avisale a secretaría o al encargado para que
          las registren.
        </p>
      )}
      {summary.upcomingMin > 0 && (
        <p className="text-sm text-muted-foreground">
          Te quedan {formatMinutes(summary.upcomingMin)} programadas en el
          período.
        </p>
      )}

      <div className="rounded-2xl bg-neutral-900 p-5 shadow-card glass-border max-sm:p-3">
        {records.length === 0 ? (
          <EmptyState
            icon="ti-calendar-off"
            title="No tenés clases en ese período"
          />
        ) : (
          <DataTable<TeacherSessionRecord>
            columns={columns}
            data={[...records].reverse()}
            getRowKey={(r) => `${r.session.slotId}_${r.session.date}`}
            gridTemplateClass="grid-cols-[110px_minmax(0,_1.6fr)_1fr_0.8fr_0.7fr_1.1fr]"
            label="Mis clases del período"
          />
        )}
      </div>
    </div>
  );
}
