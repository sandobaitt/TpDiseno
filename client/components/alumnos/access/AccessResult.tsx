import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Client } from "@/data/clients";
import { getPlan } from "@/data/plans";
import { getActivityName } from "@/data/activities";
import { branchesMock } from "@/data/branches";
import type { AccessCheck } from "@/domain/access";
import type { AccountSummary } from "@/domain/billing";
import type { Session } from "@/domain/schedule";
import { formatARS } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AccessResultProps {
  client: Client;
  access: AccessCheck;
  account: AccountSummary;
  /** Clase elegida (si la hay). */
  session?: Session;
  alreadyPresent: boolean;
  profilePath: string;
  onCollect?: () => void;
  onRegisterAttendance?: () => void;
  onReset: () => void;
}

/** Resultado grande y claro (texto + ícono, no solo color) de la verificación de acceso. */
export function AccessResult({
  client,
  access,
  account,
  session,
  alreadyPresent,
  profilePath,
  onCollect,
  onRegisterAttendance,
  onReset,
}: AccessResultProps) {
  const plan = getPlan(client.planId);
  const branch = branchesMock.find((b) => b.id === client.branchId);
  const className = session
    ? `${getActivityName(session.activityId)} de las ${session.start}`
    : undefined;

  return (
    <section
      aria-live="polite"
      aria-label="Resultado del control de acceso"
      className={cn(
        "flex flex-col gap-5 rounded-2xl border-2 p-6 max-sm:p-4",
        access.allowed
          ? "border-success/50 bg-success/5"
          : "border-danger/50 bg-danger/5",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
            access.allowed ? "bg-success/15" : "bg-danger/15",
          )}
        >
          <i
            className={cn(
              "ti text-4xl",
              access.allowed
                ? "ti-circle-check text-success"
                : "ti-hand-stop text-danger",
            )}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-widest",
              access.allowed ? "text-success" : "text-danger",
            )}
          >
            {access.allowed ? "Puede ingresar" : "No puede ingresar"}
            {className && ` · ${className}`}
          </p>
          <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">
            {access.title}
          </h2>
          <p className="mt-1 text-sm text-gray-200">{access.detail}</p>
        </div>
      </div>

      {access.warning && (
        <p className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          <i
            className="ti ti-alert-triangle mt-0.5 text-base"
            aria-hidden="true"
          />
          {access.warning}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-neutral-900/70 px-4 py-3 text-sm text-gray-300">
        <span className="font-semibold text-white">{client.fullName}</span>
        <span>DNI {client.dni}</span>
        <span aria-hidden="true">·</span>
        <span>{plan?.name ?? "Sin plan"}</span>
        {branch && (
          <>
            <span aria-hidden="true">·</span>
            <span>{branch.name}</span>
          </>
        )}
        <AccountStatusBadge status={account.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        {onCollect && account.owedAmount > 0 && (
          <Button
            type="button"
            onClick={onCollect}
            className="rounded-xl font-bold"
          >
            <i className="ti ti-cash text-base" aria-hidden="true" />
            Cobrar {formatARS(account.owedAmount)}
          </Button>
        )}
        {session &&
          access.allowed &&
          (alreadyPresent ? (
            <StatusBadge tone="success" icon="ti-check" className="py-2">
              Asistencia registrada en {className}
            </StatusBadge>
          ) : (
            onRegisterAttendance && (
              <Button
                type="button"
                variant="outline"
                onClick={onRegisterAttendance}
                className="rounded-xl"
              >
                <i className="ti ti-user-check text-base" aria-hidden="true" />
                Registrar asistencia
              </Button>
            )
          ))}
        <Button asChild variant="outline" className="rounded-xl">
          <Link to={profilePath}>
            <i className="ti ti-id text-base" aria-hidden="true" />
            Ver ficha
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="rounded-xl text-gray-300"
        >
          Nueva búsqueda
        </Button>
      </div>
    </section>
  );
}
