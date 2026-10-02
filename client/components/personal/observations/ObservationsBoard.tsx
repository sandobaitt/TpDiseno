import * as React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterSelect } from "@/components/common/FilterSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { FormField, inputClasses } from "@/components/common/FormField";
import { teachersMock, getTeacher } from "@/data/teachers";
import { branchesMock } from "@/data/branches";
import { getMockSession } from "@/data/users";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppState } from "@/store/StoreProvider";
import { observationClassLabel } from "./classLabel";

/**
 * Observaciones de jornada de los profesores (CU 9 de Personal), para el
 * encargado (las de su sede) y el admin (todas). Solo consulta.
 */
export function ObservationsBoard() {
  const state = useAppState();
  const fixedBranch = getMockSession()?.branchId;
  const [branch, setBranch] = React.useState("");
  const [teacher, setTeacher] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const branchFilter = fixedBranch ?? branch;

  const observations = [...state.bitacoras]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter(
      (b) =>
        (!branchFilter || b.branchId === branchFilter) &&
        (!teacher || b.teacherId === teacher) &&
        (!from || b.createdAt.slice(0, 10) >= from) &&
        (!to || b.createdAt.slice(0, 10) <= to),
    );
  const teachers = teachersMock.filter(
    (t) => !branchFilter || t.branchIds.includes(branchFilter),
  );

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Observaciones de profesores"
        subtitle={
          fixedBranch
            ? `Lo que anotan los profesores de ${branchesMock.find((b) => b.id === fixedBranch)?.name ?? "tu sede"} sobre sus clases.`
            : "Lo que anotan los profesores de todas las sedes sobre sus clases."
        }
      />
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
        <span className="ml-auto text-xs text-gray-400" aria-live="polite">
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
              className="flex flex-col gap-2 rounded-2xl bg-neutral-900 p-5 shadow-card glass-border"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-bold text-white">{b.title}</h2>
                <span className="text-xs text-gray-400">
                  {formatDateTime(b.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-200">{b.content}</p>
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                <span>
                  <i className="ti ti-user-circle mr-1" aria-hidden="true" />
                  {getTeacher(b.teacherId)?.fullName ?? "Profesor"}
                </span>
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
