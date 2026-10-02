import * as React from "react";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import type { AccountStatus } from "@/domain/billing";

export type MemberStatus = AccountStatus;

interface MemberHeaderProps {
  id?: string;
  fullName?: string;
  email?: string;
  dni?: string;
  planName?: string;
  status?: MemberStatus;
  avatarUrl?: string;
  onEditProfile?: () => void;
}

export function MemberHeader({
  id = "#----",
  fullName = "Nombre del Socio",
  email = "socio@email.com",
  dni = "--.---.---",
  planName = "Sin plan",
  status = "inactivo",
  avatarUrl,
  onEditProfile,
}: MemberHeaderProps) {
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="flex gap-6 items-center max-sm:flex-col max-sm:items-start">
      <div className="overflow-hidden rounded-xl bg-zinc-800 flex items-center justify-center flex-[shrink] h-[120px] w-[120px]">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl font-bold text-lime-400">{initials}</span>
        )}
      </div>

      <div className="flex flex-col flex-1 gap-2">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-800 text-neutral-400">
            ID {id}
          </div>
          <AccountStatusBadge status={status} />
          {dni && (
            <div className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-800 text-neutral-400">
              DNI: {dni}
            </div>
          )}
        </div>

        <h2 className="text-5xl font-black leading-none text-white max-sm:text-4xl">
          {fullName.split(" ").map((part, i) =>
            i === 0 ? (
              part
            ) : (
              <React.Fragment key={i}>
                <span className="text-neutral-700">{part}</span>{" "}
              </React.Fragment>
            ),
          )}
        </h2>

        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <i className="ti ti-run text-base text-zinc-500" />
            <span className="text-sm text-zinc-500">
              Plan: <span className="font-semibold text-white">{planName}</span>
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <i className="ti ti-mail text-base text-zinc-500" />
            <span className="text-sm text-zinc-500">{email}</span>
          </div>
        </div>
      </div>

      {onEditProfile && (
        <div className="ml-auto">
          <button
            onClick={onEditProfile}
            className="flex gap-2 items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg border cursor-pointer bg-zinc-800 border-zinc-800 hover:bg-zinc-700"
          >
            <i className="ti ti-pencil text-sm" />
            Editar Perfil
          </button>
        </div>
      )}
    </section>
  );
}
