import * as React from "react";

export type MemberStatus = "enabled" | "debtor" | "inactive";

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

const statusConfig: Record<
  MemberStatus,
  { label: string; container: string; dot: string; text: string; icon: string }
> = {
  enabled: {
    label: "HABILITADO",
    container: "bg-green-500/15",
    dot: "bg-green-500",
    text: "text-green-500",
    icon: "ti ti-circle-check",
  },
  debtor: {
    label: "DEUDOR",
    container: "bg-orange-500/15",
    dot: "bg-red-500",
    text: "text-red-500",
    icon: "ti ti-alert-triangle",
  },
  inactive: {
    label: "INACTIVO",
    container: "bg-app-surface border border-app-border/[0.15]",
    dot: "bg-app-subtle",
    text: "text-app-subtle",
    icon: "ti ti-circle-minus",
  },
};

export function MemberHeader({
  id = "#----",
  fullName = "Nombre del Socio",
  email = "socio@email.com",
  dni = "--.---.---",
  planName = "Sin plan",
  status = "inactive",
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

  const cfg = statusConfig[status];

  return (
    <section className="flex gap-6 items-center max-sm:flex-col max-sm:items-start">
      <div className="overflow-hidden rounded-xl bg-app-card flex items-center justify-center flex-[shrink] h-[120px] w-[120px]">
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
          <div className="px-3 py-1 text-xs font-medium rounded-md bg-app-card text-app-muted">
            ID {id}
          </div>
          <div
            className={`flex gap-1.5 items-center px-3 py-1 text-xs font-semibold rounded-md ${cfg.container} ${cfg.text}`}
          >
            <i className={`${cfg.icon} text-sm`} />
            {cfg.label}
          </div>
          {dni && (
            <div className="px-3 py-1 text-xs font-medium rounded-md bg-app-card text-app-muted">
              DNI: {dni}
            </div>
          )}
        </div>

        <h2 className="text-5xl font-black leading-none text-app-text max-sm:text-4xl">
          {fullName.split(" ").map((part, i) =>
            i === 0 ? (
              part
            ) : (
              <React.Fragment key={i}>
                <span className="text-app-faint">{part}</span>{" "}
              </React.Fragment>
            ),
          )}
        </h2>

        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <i className="ti ti-run text-base text-app-subtle" />
            <span className="text-sm text-app-subtle">
              Plan: <span className="font-semibold text-app-text">{planName}</span>
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <i className="ti ti-mail text-base text-app-subtle" />
            <span className="text-sm text-app-subtle">{email}</span>
          </div>
        </div>
      </div>

      {onEditProfile && (
        <div className="ml-auto">
          <button
            onClick={onEditProfile}
            className="flex gap-2 items-center px-4 py-2.5 text-sm font-medium text-app-text rounded-lg border cursor-pointer bg-app-card border-app-border/[0.07] hover:bg-app-elevated"
          >
            <i className="ti ti-pencil text-sm" />
            Editar Perfil
          </button>
        </div>
      )}
    </section>
  );
}
