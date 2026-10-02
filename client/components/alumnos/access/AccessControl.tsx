import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { FormField, inputClasses } from "@/components/common/FormField";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { CheckoutDialog } from "@/components/alumnos/payments/CheckoutDialog";
import { scheduleMock } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { getTeacher } from "@/data/teachers";
import { branchesMock } from "@/data/branches";
import { getMockSession } from "@/data/users";
import { studentCapabilities } from "@/domain/permissions";
import { sessionsBetween } from "@/domain/schedule";
import { nowISO, todayISO } from "@/lib/dates";
import { matchesPersonSearch, onlyDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import { selectAccess, selectAccount } from "@/store/selectors";
import { AccessResult } from "./AccessResult";

interface CheckRecord {
  key: number;
  clientId: string;
  name: string;
  allowed: boolean;
  title: string;
  time: string;
}

const MAX_MATCHES = 6;
const MAX_HISTORY = 8;

/**
 * Control de acceso (CU 13): ¿puede ingresar? Combina cuota al día (bloqueo
 * automático por deuda), restricción manual y, si se elige una clase, que
 * esté incluida en su plan. Pensado para la secretaria con gente esperando.
 */
export function AccessControl() {
  const state = useAppState();
  const actions = useStoreActions();
  const user = getMockSession();
  const caps = studentCapabilities(user?.role);
  const today = todayISO();
  const branchId = user?.branchId ?? branchesMock[0].id;
  const branch = branchesMock.find((b) => b.id === branchId);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const historyKey = React.useRef(0);

  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [slotId, setSlotId] = React.useState("");
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [history, setHistory] = React.useState<CheckRecord[]>([]);

  const sessions = sessionsBetween(
    today,
    today,
    scheduleMock,
    state.replacements,
  ).filter((s) => s.branchId === branchId);
  const session = sessions.find((s) => s.slotId === slotId);

  const client = state.clients.find((c) => c.id === selectedId);
  const access = client
    ? selectAccess(state, client, session?.activityId, today)
    : undefined;
  const account = client ? selectAccount(state, client, today) : undefined;
  const matches =
    !client && query.trim().length >= 2
      ? state.clients
          .filter((c) =>
            matchesPersonSearch(query, { name: c.fullName, dni: c.dni }),
          )
          .slice(0, MAX_MATCHES)
      : [];

  function select(clientId: string) {
    setSelectedId(clientId);
    const found = state.clients.find((c) => c.id === clientId);
    if (!found) return;
    const check = selectAccess(state, found, session?.activityId, today);
    historyKey.current += 1;
    setHistory((current) =>
      [
        {
          key: historyKey.current,
          clientId,
          name: found.fullName,
          allowed: check.allowed,
          title: check.title,
          time: nowISO().slice(11, 16),
        },
        ...current,
      ].slice(0, MAX_HISTORY),
    );
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedId(null);
    // Con el DNI completo, se elige solo (lo más rápido en la puerta).
    const digits = onlyDigits(value);
    if (digits.length >= 7) {
      const exact = state.clients.find((c) => onlyDigits(c.dni) === digits);
      if (exact) select(exact.id);
    }
  }

  function reset() {
    setQuery("");
    setSelectedId(null);
    inputRef.current?.focus();
  }

  const alreadyPresent =
    !!client &&
    !!session &&
    state.attendance.some(
      (a) =>
        a.clientId === client.id &&
        a.slotId === session.slotId &&
        a.date === today &&
        a.status === "present",
    );

  function registerAttendance() {
    if (!client || !session) return;
    actions.saveAttendance(
      [
        {
          id: `at_${client.id}_${session.slotId}_${today}`,
          clientId: client.id,
          slotId: session.slotId,
          date: today,
          branchId: session.branchId,
          status: "present",
          recordedBy: user?.id ?? "sistema",
          recordedAt: nowISO(),
        },
      ],
      session.slotId,
      today,
    );
    toast.success(
      `Asistencia de ${client.fullName} registrada en ${getActivityName(session.activityId)}.`,
    );
  }

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Control de acceso"
        subtitle={`Verificá si un alumno puede ingresar${branch ? ` a ${branch.name}` : ""}. Puede entrenar en cualquier sede.`}
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-5">
          <SectionCard title="Buscar alumno" icon="ti-search">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="acceso-busqueda"
                className="text-xs font-semibold text-gray-300"
              >
                DNI o nombre del alumno
              </label>
              <div className="relative">
                <i
                  className="ti ti-id pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="acceso-busqueda"
                  ref={inputRef}
                  autoFocus
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && matches[0]) {
                      e.preventDefault();
                      select(matches[0].id);
                    }
                    if (e.key === "Escape") reset();
                  }}
                  placeholder="Ej.: 34567890 o Rodríguez"
                  autoComplete="off"
                  className={cn(inputClasses, "h-14 pl-12 text-lg")}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Con el DNI completo aparece el resultado solo. Con un nombre,
                elegí de la lista o tocá Enter.
              </p>
            </div>

            <FormField
              label="Clase (opcional)"
              hint={
                sessions.length > 0
                  ? "Si elegís una clase, también se controla que esté incluida en su plan."
                  : "Hoy no hay clases en esta sede: se controla solo el ingreso."
              }
            >
              {(id, describedBy) => (
                <select
                  id={id}
                  value={slotId}
                  onChange={(e) => setSlotId(e.target.value)}
                  aria-describedby={describedBy}
                  disabled={sessions.length === 0}
                  className={inputClasses}
                >
                  <option value="">Ingreso a la sede (sin clase)</option>
                  {sessions.map((s) => (
                    <option key={s.slotId} value={s.slotId}>
                      {s.start} · {getActivityName(s.activityId)} ·{" "}
                      {getTeacher(s.teacherId)?.fullName ?? "Profesor"}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            {matches.length > 0 && (
              <ul className="flex flex-col gap-1.5" aria-label="Coincidencias">
                {matches.map((c) => (
                  <li key={c.id}>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => select(c.id)}
                      className="h-auto w-full justify-between gap-3 whitespace-normal rounded-xl border border-white/[0.06] bg-neutral-800/40 px-4 py-3 text-left font-normal hover:border-zinc-500"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">
                          {c.fullName}
                        </span>
                        <span className="text-xs text-gray-400">
                          DNI {c.dni}
                        </span>
                      </span>
                      <AccountStatusBadge
                        status={selectAccount(state, c, today).status}
                      />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {query.trim().length >= 2 && !client && matches.length === 0 && (
              <p className="text-sm text-warning" role="status">
                No encontramos ningún alumno con «{query.trim()}». Revisá el DNI
                o probá con el apellido.
              </p>
            )}
          </SectionCard>

          {client && access && account ? (
            <AccessResult
              client={client}
              access={access}
              account={account}
              session={session}
              alreadyPresent={alreadyPresent}
              profilePath={`/secretaria/alumnos/${client.id}`}
              onCollect={
                caps.collect && client.status === "active"
                  ? () => setCheckoutOpen(true)
                  : undefined
              }
              onRegisterAttendance={registerAttendance}
              onReset={reset}
            />
          ) : (
            <EmptyState
              icon="ti-door-enter"
              title="Esperando un DNI o un nombre"
              description="El resultado aparece acá, en grande: si puede ingresar y por qué."
              className="rounded-2xl border border-dashed border-white/10"
            />
          )}
        </div>

        <SectionCard title="Últimos controles" icon="ti-history">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hiciste controles en esta sesión.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map((h) => (
                <li key={h.key}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setQuery(h.name);
                      setSelectedId(h.clientId);
                    }}
                    className="h-auto w-full justify-between gap-2 whitespace-normal rounded-xl px-3 py-2 text-left font-normal"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-white">
                        {h.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {h.time} h · {h.title}
                      </span>
                    </span>
                    <StatusBadge
                      tone={h.allowed ? "success" : "danger"}
                      icon={h.allowed ? "ti-check" : "ti-x"}
                    >
                      {h.allowed ? "Habilitado" : "No habilitado"}
                    </StatusBadge>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <CheckoutDialog
        clientId={checkoutOpen && client ? client.id : null}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}
