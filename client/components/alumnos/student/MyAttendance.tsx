import * as React from "react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import { inputClasses } from "@/components/common/FormField";
import { getSlot } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { getTeacher } from "@/data/teachers";
import { branchName } from "@/components/cronograma/weekView";
import {
  ATTENDANCE_MARK_LABELS,
  markOf,
  summarizeAttendance,
  toCsv,
  type AttendanceMark,
} from "@/domain/attendance";
import type { StudentAttendance } from "@/data/attendance";
import { formatDate, formatPeriod, toPeriod } from "@/lib/dates";
import { downloadTextFile } from "@/lib/download";
import { cn } from "@/lib/utils";
import { useAppState } from "@/store/StoreProvider";
import { selectClientAttendance } from "@/store/selectors";

const MARK_STYLE: Record<AttendanceMark, { tone: StatusTone; icon: string }> = {
  present: { tone: "success", icon: "ti-check" },
  absent_justified: { tone: "info", icon: "ti-file-check" },
  absent: { tone: "danger", icon: "ti-x" },
};

const ALL = "todo";
const ITEMS_PER_PAGE = 8;

interface Row extends StudentAttendance {
  className: string;
  teacher: string;
  mark: AttendanceMark;
}

/**
 * Historial de asistencia del alumno (CU 7): cada clase con fecha, sede y
 * estado (asistió, ausencia justificada o sin justificar), resumen del mes y
 * exportación a CSV o impresión.
 */
export function MyAttendance({ clientId }: { clientId?: string }) {
  const state = useAppState();
  const records = clientId ? selectClientAttendance(state, clientId) : [];
  const periods = [...new Set(records.map((r) => toPeriod(r.date)))];
  const [period, setPeriod] = React.useState(periods[0] ?? ALL);
  const [page, setPage] = React.useState(1);

  const filtered = records.filter(
    (r) => period === ALL || toPeriod(r.date) === period,
  );
  const rows: Row[] = filtered.map((r) => {
    const slot = getSlot(r.slotId);
    return {
      ...r,
      className: slot
        ? `${getActivityName(slot.activityId)} · ${slot.start} h`
        : "Clase",
      teacher: getTeacher(slot?.teacherId)?.fullName ?? "—",
      mark: markOf(r),
    };
  });
  const summary = summarizeAttendance(filtered);
  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);
  const pageRows = rows.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function exportCsv() {
    const csv = toCsv(
      ["Fecha", "Clase", "Sede", "Profesor", "Estado"],
      rows.map((r) => [
        formatDate(r.date),
        r.className,
        branchName(r.branchId),
        r.teacher,
        ATTENDANCE_MARK_LABELS[r.mark],
      ]),
    );
    downloadTextFile(
      `mi-asistencia-${period === ALL ? "completa" : period}.csv`,
      csv,
    );
  }

  const columns: DataTableColumn<Row>[] = [
    {
      key: "date",
      header: "FECHA",
      render: (r) => (
        <span className="text-sm text-gray-200">{formatDate(r.date)}</span>
      ),
    },
    {
      key: "className",
      header: "CLASE",
      render: (r) => (
        <span className="text-sm font-semibold text-white">{r.className}</span>
      ),
    },
    {
      key: "branch",
      header: "SEDE",
      render: (r) => (
        <span className="text-sm text-gray-300">{branchName(r.branchId)}</span>
      ),
    },
    { key: "teacher", header: "PROFESOR", hideOnMobile: true },
    {
      key: "mark",
      header: "ESTADO",
      render: (r) => (
        <StatusBadge
          tone={MARK_STYLE[r.mark].tone}
          icon={MARK_STYLE[r.mark].icon}
        >
          {ATTENDANCE_MARK_LABELS[r.mark]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <SectionCard
      title="Mi asistencia"
      icon="ti-calendar-check"
      actions={
        records.length > 0 && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportCsv}
              className="rounded-xl"
            >
              <i
                className="ti ti-file-spreadsheet text-sm"
                aria-hidden="true"
              />
              Exportar CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl"
            >
              <i className="ti ti-printer text-sm" aria-hidden="true" />
              Imprimir
            </Button>
          </>
        )
      }
    >
      {records.length === 0 ? (
        <EmptyState
          icon="ti-calendar-off"
          title="Todavía no tenés asistencias registradas"
          description="Cuando vayas a tu primera clase, va a aparecer acá."
        />
      ) : (
        <div className="print-area flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="mi-asistencia-mes"
              className="text-xs font-semibold text-gray-300"
            >
              Mes
            </label>
            <select
              id="mi-asistencia-mes"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setPage(1);
              }}
              className={cn(inputClasses, "w-auto py-2")}
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {formatPeriod(p)}
                </option>
              ))}
              <option value={ALL}>Todo el historial</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon="ti-check"
              value={summary.present}
              label="Asistencias"
              tone="success"
            />
            <StatCard
              icon="ti-file-check"
              value={summary.justified}
              label="Ausencias justificadas"
              tone="info"
            />
            <StatCard
              icon="ti-x"
              value={summary.unjustified}
              label="Ausencias sin justificar"
              tone="danger"
            />
            <StatCard
              icon="ti-chart-pie"
              value={`${summary.rate}%`}
              label="Asistencia"
            />
          </div>

          <DataTable<Row>
            columns={columns}
            data={pageRows}
            getRowKey={(r) => r.id}
            gridTemplateClass="grid-cols-[110px_minmax(0,_1.6fr)_1fr_1.2fr_1.4fr]"
            label="Historial de asistencia"
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </SectionCard>
  );
}
