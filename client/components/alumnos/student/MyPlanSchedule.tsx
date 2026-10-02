import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { WeekNavigator } from "@/components/common/WeekNavigator";
import { FilterSelect } from "@/components/common/FilterSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { UnifiedCalendar } from "@/components/cronograma/UnifiedCalendar";
import { ClassCard } from "@/components/cronograma/ClassCard";
import { buildWeekDays, toClassCard } from "@/components/cronograma/weekView";
import { scheduleMock } from "@/data/schedule";
import { getPlan } from "@/data/plans";
import { getActivityName } from "@/data/activities";
import { branchesMock } from "@/data/branches";
import { describeAccount } from "@/domain/billing";
import { sessionsBetween } from "@/domain/schedule";
import { addDays, startOfWeek, todayISO } from "@/lib/dates";
import { formatARS } from "@/lib/format";
import { useAppState } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";

/**
 * Plan contratado y cronograma (CU 8): las clases de su plan aparecen
 * resaltadas y las demás, marcadas como no incluidas. Se puede filtrar por sede.
 */
export function MyPlanSchedule({ clientId }: { clientId?: string }) {
  const state = useAppState();
  const today = todayISO();
  const client = state.clients.find((c) => c.id === clientId);
  const plan = getPlan(client?.planId);
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(today));
  const [activeDate, setActiveDate] = React.useState(today);
  const [branchFilter, setBranchFilter] = React.useState("");
  const [onlyMine, setOnlyMine] = React.useState(false);
  const branches = branchesMock.filter((b) => b.status === "active");

  const sessions = sessionsBetween(
    weekStart,
    addDays(weekStart, 6),
    scheduleMock,
    state.replacements,
  ).filter(
    (s) =>
      (!branchFilter || s.branchId === branchFilter) &&
      (!onlyMine || !!plan?.activityIds.includes(s.activityId)),
  );
  const days = buildWeekDays(weekStart, activeDate);

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Mi plan y cronograma"
        subtitle="Tu plan, qué clases incluye y en qué horarios se dan en cada sede."
        actions={
          <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
        }
      />

      {client && plan ? (
        <SectionCard title="Mi plan" icon="ti-barbell">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-2xl font-black text-white">{plan.name}</p>
              {plan.description && (
                <p className="mt-1 text-sm text-gray-300">{plan.description}</p>
              )}
            </div>
            <p className="text-xl font-extrabold text-white">
              {formatARS(plan.monthlyPriceArs)}
              <span className="text-sm font-medium text-muted-foreground">
                {" "}
                por mes
              </span>
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Clases incluidas
            </p>
            <ul
              className="flex flex-wrap gap-1.5"
              aria-label="Clases incluidas en tu plan"
            >
              {plan.activityIds.map((id) => (
                <li
                  key={id}
                  className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                >
                  {getActivityName(id)}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-300">
            <i className="ti ti-map-pin mr-1 text-primary" aria-hidden="true" />
            Podés entrenar en cualquier sede:{" "}
            {branches.map((b) => b.name).join(" y ")}.
          </p>
          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-sm text-gray-300">
            <AccountStatusBadge
              status={selectAccount(state, client, today).status}
            />
            {describeAccount(selectAccount(state, client, today))}
          </div>
        </SectionCard>
      ) : (
        <EmptyState
          icon="ti-barbell"
          title="Todavía no tenés un plan asignado"
          description="Acercate a recepción para elegir uno."
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          value={branchFilter}
          onChange={setBranchFilter}
          placeholder="Todas las sedes"
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
        />
        {plan && (
          <label
            htmlFor="solo-mis-clases"
            className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm text-gray-200"
          >
            <Switch
              id="solo-mis-clases"
              checked={onlyMine}
              onCheckedChange={setOnlyMine}
            />
            Ver solo las clases de mi plan
          </label>
        )}
      </div>

      <UnifiedCalendar
        days={days}
        getItemsForDay={(day) =>
          sessions
            .filter((s) => s.date === day.iso)
            .map((s) => ({
              ...toClassCard(s),
              inPlan: plan
                ? plan.activityIds.includes(s.activityId)
                : undefined,
            }))
        }
        renderItem={(card) => <ClassCard key={card.id} classItem={card} />}
        onSelectDay={(abbr) =>
          setActiveDate(days.find((d) => d.dayAbbr === abbr)?.iso ?? activeDate)
        }
      />
    </div>
  );
}
