import { SectionCard } from "@/components/common/SectionCard";
import type { Client } from "@/data/clients";
import type { Plan } from "@/data/plans";
import { getActivityName } from "@/data/activities";
import { getUserName } from "@/data/users";
import { DEBT_BLOCK_DAYS } from "@/data/rules";
import type { AccessCheck } from "@/domain/access";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface AccessCardProps {
  client: Client;
  plan?: Plan;
  access: AccessCheck;
}

/** ¿Puede ingresar? Se calcula solo con la deuda, el plan y las restricciones (CU 5 y 13). */
export function AccessCard({ client, plan, access }: AccessCardProps) {
  return (
    <SectionCard title="Habilitación para ingresar" icon="ti-door-enter">
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4",
          access.allowed
            ? "border-success/30 bg-success/5"
            : "border-danger/30 bg-danger/5",
        )}
      >
        <i
          className={cn(
            "ti text-2xl",
            access.allowed
              ? "ti-circle-check text-success"
              : "ti-lock text-danger",
          )}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="font-bold text-white">{access.title}</p>
          <p className="text-sm text-gray-300">{access.detail}</p>
        </div>
      </div>

      {access.warning && (
        <p className="flex items-start gap-2 text-sm text-warning">
          <i
            className="ti ti-alert-triangle mt-0.5 text-base"
            aria-hidden="true"
          />
          {access.warning}
        </p>
      )}

      {client.manualRestriction && (
        <p className="text-xs text-muted-foreground">
          Restricción aplicada por{" "}
          {getUserName(client.manualRestriction.byUserId)} el{" "}
          {formatDate(client.manualRestriction.at)}.
        </p>
      )}

      {plan && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Su plan incluye
          </p>
          <ul
            className="flex flex-wrap gap-1.5"
            aria-label="Actividades del plan"
          >
            {plan.activityIds.map((activityId) => (
              <li
                key={activityId}
                className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-gray-300"
              >
                {getActivityName(activityId)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Se calcula solo: cuota paga (se bloquea con {DEBT_BLOCK_DAYS} días de
        atraso), plan vigente y restricciones de secretaría.
      </p>
    </SectionCard>
  );
}
