import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import type { StudentAttendance } from "@/data/attendance";
import { getPlan } from "@/data/plans";
import { branchesMock } from "@/data/branches";
import { getMockSession, getUserName } from "@/data/users";
import { classRoster, markOf, type AttendanceMark } from "@/domain/attendance";
import type { Session } from "@/domain/schedule";
import { formatDateTime, nowISO } from "@/lib/dates";
import { getInitials, matchesPersonSearch } from "@/lib/format";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { selectAccess, selectAccount } from "@/store/selectors";

interface ClassRosterProps {
  /** La clase concreta (slot + fecha). */
  session: Session;
  /** Si se pasa, el nombre lleva a la ficha del alumno. */
  profilePath?: (clientId: string) => string;
}

type Marks = Record<string, AttendanceMark | undefined>;

/**
 * Lista de una clase (CU 6): presente o ausente (justificada o no), con la
 * misma verificación de acceso del CU 13: quien está bloqueado no puede
 * quedar presente. Se guarda y se puede corregir después.
 */
export function ClassRoster({ session, profilePath }: ClassRosterProps) {
  const state = useAppState();
  const actions = useStoreActions();
  const [search, setSearch] = React.useState("");

  const records = state.attendance.filter(
    (a) => a.slotId === session.slotId && a.date === session.date,
  );
  const saved: Marks = Object.fromEntries(
    records.map((r) => [r.clientId, markOf(r)]),
  );
  const [marks, setMarks] = React.useState<Marks>(saved);

  const roster = classRoster(session, state.clients, state.attendance, getPlan);
  const rows = roster.map((client) => ({
    client,
    access: selectAccess(state, client, session.activityId, session.date),
    account: selectAccount(state, client, session.date),
  }));
  const visible = rows.filter(({ client }) =>
    matchesPersonSearch(search, { name: client.fullName, dni: client.dni }),
  );

  const dirty = roster.some((c) => marks[c.id] !== saved[c.id]);
  const marked = roster.filter((c) => marks[c.id]);
  const presentCount = marked.filter((c) => marks[c.id] === "present").length;
  const absentCount = marked.length - presentCount;
  const lastRecord = records.reduce<StudentAttendance | undefined>(
    (latest, r) => (!latest || r.recordedAt > latest.recordedAt ? r : latest),
    undefined,
  );

  function setMark(clientId: string, mark: AttendanceMark | undefined) {
    setMarks((current) => ({ ...current, [clientId]: mark }));
  }

  function markAllAllowedPresent() {
    setMarks((current) => {
      const next = { ...current };
      for (const { client, access } of rows) {
        if (access.allowed && !next[client.id]) next[client.id] = "present";
      }
      return next;
    });
  }

  function save() {
    const userId = getMockSession()?.id ?? "sistema";
    const at = nowISO();
    const toSave: StudentAttendance[] = marked.map((client) => {
      const mark = marks[client.id]!;
      return {
        id: `at_${client.id}_${session.slotId}_${session.date}`,
        clientId: client.id,
        slotId: session.slotId,
        date: session.date,
        branchId: session.branchId,
        status: mark === "present" ? "present" : "absent",
        justified: mark === "present" ? undefined : mark === "absent_justified",
        recordedBy: userId,
        recordedAt: at,
      };
    });
    actions.saveAttendance(toSave, session.slotId, session.date);
    toast.success(
      `Asistencia guardada: ${presentCount} ${presentCount === 1 ? "presente" : "presentes"} y ${absentCount} ${absentCount === 1 ? "ausente" : "ausentes"}.`,
    );
  }

  if (roster.length === 0) {
    return (
      <EmptyState
        icon="ti-users-minus"
        title="Ningún alumno tiene esta clase en su plan"
        className="rounded-2xl border border-dashed border-white/10"
      />
    );
  }

  return (
    <section
      aria-label="Lista de alumnos de la clase"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar en la lista…"
          label="Buscar alumno en la lista de la clase"
        />
        <Button
          type="button"
          variant="outline"
          onClick={markAllAllowedPresent}
          className="rounded-xl"
        >
          <i className="ti ti-checks text-base" aria-hidden="true" />
          Marcar presentes a los habilitados
        </Button>
        <p className="ml-auto text-xs text-gray-400" aria-live="polite">
          {presentCount} presentes · {absentCount} ausentes ·{" "}
          {roster.length - marked.length} sin marcar
        </p>
      </div>

      <ul className="flex flex-col divide-y divide-white/[0.05] rounded-2xl bg-neutral-900 shadow-card glass-border">
        {visible.map(({ client, access, account }) => {
          const mark = marks[client.id];
          const otherBranch = client.branchId !== session.branchId;
          return (
            <li
              key={client.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                  <span className="text-xs font-bold text-primary">
                    {getInitials(client.fullName)}
                  </span>
                </div>
                <div className="min-w-0">
                  {profilePath ? (
                    <Link
                      to={profilePath(client.id)}
                      className="block truncate text-sm font-semibold text-white hover:underline"
                    >
                      {client.fullName}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-semibold text-white">
                      {client.fullName}
                    </p>
                  )}
                  <p className="truncate text-xs text-gray-400">
                    DNI {client.dni} ·{" "}
                    {getPlan(client.planId)?.name ?? "Sin plan"}
                    {otherBranch &&
                      ` · de ${branchesMock.find((b) => b.id === client.branchId)?.name ?? "otra sede"}`}
                  </p>
                  {!access.allowed && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-danger">
                      <i className="ti ti-lock text-sm" aria-hidden="true" />
                      {access.title}: no se puede marcar presente
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                {account.status !== "al_dia" && (
                  <AccountStatusBadge status={account.status} />
                )}
                <ToggleGroup
                  type="single"
                  value={mark === "present" ? "present" : mark ? "absent" : ""}
                  onValueChange={(value) =>
                    value &&
                    setMark(
                      client.id,
                      value === "present"
                        ? "present"
                        : mark === "absent_justified"
                          ? "absent_justified"
                          : "absent",
                    )
                  }
                  aria-label={`Asistencia de ${client.fullName}`}
                  className="gap-1.5"
                >
                  <ToggleGroupItem
                    value="present"
                    disabled={!access.allowed}
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
                {mark && mark !== "present" && (
                  <label
                    htmlFor={`just-${client.id}`}
                    className="flex min-h-[40px] cursor-pointer items-center gap-2 text-xs text-gray-300"
                  >
                    <Checkbox
                      id={`just-${client.id}`}
                      checked={mark === "absent_justified"}
                      onCheckedChange={(checked) =>
                        setMark(
                          client.id,
                          checked === true ? "absent_justified" : "absent",
                        )
                      }
                      className="h-5 w-5 rounded-md"
                    />
                    Justificada
                  </label>
                )}
              </div>
            </li>
          );
        })}
        {visible.length === 0 && (
          <li>
            <EmptyState
              icon="ti-search-off"
              title="Nadie coincide con la búsqueda"
            />
          </li>
        )}
      </ul>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-neutral-900/95 px-4 py-3 shadow-card backdrop-blur">
        <p className="text-xs text-gray-400">
          {dirty ? (
            <span className="font-semibold text-warning">
              <i className="ti ti-pencil mr-1" aria-hidden="true" />
              Hay cambios sin guardar
            </span>
          ) : lastRecord ? (
            `Último registro: ${getUserName(lastRecord.recordedBy)} · ${formatDateTime(lastRecord.recordedAt)}`
          ) : (
            "Todavía no se guardó la asistencia de esta clase."
          )}
        </p>
        <Button
          type="button"
          onClick={save}
          disabled={!dirty}
          className="rounded-xl font-bold"
        >
          <i className="ti ti-device-floppy text-base" aria-hidden="true" />
          Guardar asistencia
        </Button>
      </div>
    </section>
  );
}
