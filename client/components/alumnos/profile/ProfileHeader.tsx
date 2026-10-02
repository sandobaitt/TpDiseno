import * as React from "react";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Client } from "@/data/clients";
import type { Plan } from "@/data/plans";
import { branchesMock } from "@/data/branches";
import type { AccountStatus } from "@/domain/billing";
import { isMinor } from "@/domain/enrollment";
import { todayISO } from "@/lib/dates";
import { getInitials } from "@/lib/format";

interface ProfileHeaderProps {
  client: Client;
  status: AccountStatus;
  plan?: Plan;
  /** Botones (Cobrar, Editar…). */
  actions?: React.ReactNode;
}

/** Encabezado de la ficha: quién es, en qué estado está y qué se puede hacer. */
export function ProfileHeader({
  client,
  status,
  plan,
  actions,
}: ProfileHeaderProps) {
  const branch = branchesMock.find((b) => b.id === client.branchId);
  return (
    <header className="flex flex-col gap-4 rounded-2xl bg-neutral-900 p-5 shadow-card glass-border sm:flex-row sm:items-center max-sm:p-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-xl font-black text-primary"
          aria-hidden="true"
        >
          {getInitials(client.fullName)}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
            {client.fullName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-400">
            <AccountStatusBadge status={status} />
            {isMinor(client.birthDate, todayISO()) && (
              <StatusBadge tone="info" icon="ti-user-shield">
                Menor de edad
              </StatusBadge>
            )}
            <span>DNI {client.dni}</span>
            <span aria-hidden="true">·</span>
            <span>{plan?.name ?? "Sin plan"}</span>
            {branch && (
              <>
                <span aria-hidden="true">·</span>
                <span>{branch.name}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
