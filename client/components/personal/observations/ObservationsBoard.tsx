import * as React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterSelect } from "@/components/common/FilterSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { FormField, inputClasses } from "@/components/common/FormField";
import { teachersMock, getTeacher } from "@/data/teachers";
import { branchesMock } from "@/data/branches";
import { getMockSession, getUserName } from "@/data/users";
import { SHIFT_LABELS } from "@/data/bitacoras";
import { Button } from "@/components/ui/button";
import { ShiftObservationForm } from "./ShiftObservationForm";
import { formatDate, formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppState } from "@/store/StoreProvider";
import { observationClassLabel } from "./classLabel";

/**
 * Observaciones de la sede: las de jornada de los profesores (CU 9 de
 * Personal) y las de turno de secretaría (requisito 3.1.16). Secretaría y el
 * encargado ven las de su sede; el admin, todas. Secretaría además las carga.
 */
export function ObservationsBoard() {
  const state = useAppState();
  const session = getMockSession();
  const fixedBranch = session?.branchId;
  const canWrite = session?.role === "secretario";
  const [formOpen, setFormOpen] = React.useState(false);
  const [branch, setBranch] = React.useState("");
  const [origin, setOrigin] = React.useState("");
  const [teacher, setTeacher] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const branchFilter = fixedBranch ?? branch;

  const observations = [...state.bitacoras]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter(
      (b) =>
        (!branchFilter || b.branchId === branchFilter) &&
        (!origin || (origin === "profesor" ? !!b.teacherId : !b.teacherId)) &&
        (!teacher || b.teacherId === teacher || b.aboutTeacherId === teacher) &&
        (!from || b.createdAt.slice(0, 10) >= from) &&
        (!to || b.createdAt.slice(0, 10) <= to),
    );
  const teachers = teachersMock.filter(
    (t) => !branchFilter || t.branchIds.includes(branchFilter),
  );

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Observaciones"
        subtitle={
          fixedBranch
            ? `Lo que anotan los profesores sobre sus clases y secretaría sobre cada turno en ${branchesMock.find((b) => b.id === fixedBranch)?.name ?? "tu sede"}.`
            : "Lo que anotan los profesores sobre sus clases y secretaría sobre cada turno, en todas las sedes."
        }
        actions={
          canWrite ? (
            <Button
              type="button"
              onClick={() => setFormOpen(true)}
              className="h-10 rounded-xl font-bold"
            >
              <i className="ti ti-plus text-base" aria-hidden="true" />
              Nueva observación
            </Button>
          ) : undefined
        }
      />
      {canWrite && (
        <ShiftObservationForm open={formOpen} onOpenChange={setFormOpen} />
      )}
      <div className="flex flex-wrap items-end gap-3">
        {!fixedBranch && (
          <FilterSelect
            value={branch}
            onChange={setBranch}
            placeholder="Todas las sedes"
            options={branchesMock
              .filter((b) => b.status === "active")
              .map((b) => ({ value: b.id, label: b.name }))}
          />
        )}
        <FilterSelect
          value={origin}
          onChange={setOrigin}
          placeholder="Profesores y secretaría"
          options={[
            { value: "profesor", label: "De profesores" },
            { value: "secretaria", label: "De secretaría" },
          ]}
        />
        <FilterSelect
          value={teacher}
          onChange={setTeacher}
          placeholder="Todos los profesores"
          options={teachers.map((t) => ({ value: t.id, label: t.fullName }))}
        />
        <FormField label="Desde" className="w-40">
          {(id) => (
            <input
              id={id}
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={cn(inputClasses, "py-2")}
            />
          )}
        </FormField>
        <FormField label="Hasta" className="w-40">
          {(id) => (
            <input
              id={id}
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={cn(inputClasses, "py-2")}
            />
          )}
        </FormField>
        <span
          className="ml-auto text-xs text-muted-foreground"
          aria-live="polite"
        >
          {observations.length}{" "}
          {observations.length === 1 ? "observación" : "observaciones"}
        </span>
      </div>

      {observations.length === 0 ? (
        <EmptyState
          icon="ti-notes-off"
          title="No hay observaciones con esos filtros"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {observations.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-2 rounded-2xl bg-card p-5 shadow-card glass-border"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-bold text-foreground">
                  {b.title}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(b.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground">{b.content}</p>
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  <i className="ti ti-user-circle mr-1" aria-hidden="true" />
                  {b.teacherId
                    ? (getTeacher(b.teacherId)?.fullName ?? "Profesor")
                    : `Secretaría · ${getUserName(b.authorUserId)}`}
                </span>
                {b.shift && (
                  <span className="text-primary">
                    <i className="ti ti-clock mr-1" aria-hidden="true" />
                    Turno {SHIFT_LABELS[b.shift].toLowerCase()}
                    {b.date ? ` · ${formatDate(b.date)}` : ""}
                  </span>
                )}
                {b.area && (
                  <span>
                    <i className="ti ti-map-pin mr-1" aria-hidden="true" />
                    {b.area}
                  </span>
                )}
                {b.aboutTeacherId && (
                  <span>
                    <i className="ti ti-user mr-1" aria-hidden="true" />
                    {getTeacher(b.aboutTeacherId)?.fullName ?? "Profesor"}
                  </span>
                )}
                {b.notifyAdmin && (
                  <span>
                    <i className="ti ti-bell mr-1" aria-hidden="true" />
                    Avisada al administrador
                  </span>
                )}
                {observationClassLabel(b.slotId, b.date) && (
                  <span className="text-primary">
                    <i
                      className="ti ti-calendar-event mr-1"
                      aria-hidden="true"
                    />
                    {observationClassLabel(b.slotId, b.date)}
                  </span>
                )}
                {b.studentName && (
                  <span>
                    <i className="ti ti-user mr-1" aria-hidden="true" />
                    {b.studentName}
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
