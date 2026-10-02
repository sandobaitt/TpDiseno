import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { inputClasses } from "@/components/common/FormField";
import type { Client } from "@/data/clients";
import { getPlan, plansMock } from "@/data/plans";
import { branchesMock } from "@/data/branches";
import { getMockSession, getUserName } from "@/data/users";
import { branchEnrollmentHistory } from "@/domain/enrollment";
import {
  addMonths,
  formatDate,
  formatPeriod,
  parseISODate,
  toPeriod,
  todayISO,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppState } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";

const MONTHS_TO_CHOOSE = 12;
const MONTHS_IN_CHART = 6;

const chartConfig = {
  enrolled: { label: "Inscripciones", color: "hsl(var(--primary))" },
  deactivated: { label: "Bajas", color: "hsl(var(--danger))" },
} satisfies ChartConfig;

const shortMonth = (period: string) =>
  parseISODate(`${period}-01`)
    .toLocaleDateString("es-AR", { month: "short" })
    .replace(".", "");

/**
 * Inscripciones de la sede del encargado (CU 12): solo consulta. Altas y bajas
 * por mes, por plan y el detalle de cada alumno inscripto.
 */
export function BranchEnrollments() {
  const state = useAppState();
  const today = todayISO();
  const branchId = getMockSession()?.branchId ?? branchesMock[0].id;
  const branch = branchesMock.find((b) => b.id === branchId);
  const periods = Array.from({ length: MONTHS_TO_CHOOSE }, (_, i) =>
    addMonths(toPeriod(today), -i),
  );
  const [period, setPeriod] = React.useState(periods[0]);

  const ofBranch = state.clients.filter((c) => c.branchId === branchId);
  const enrolled = ofBranch
    .filter((c) => toPeriod(c.enrolledAt) === period)
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));
  const [selected] = branchEnrollmentHistory(state.clients, branchId, [period]);
  const history = branchEnrollmentHistory(
    state.clients,
    branchId,
    periods.slice(0, MONTHS_IN_CHART).reverse(),
  ).map((m) => ({ ...m, label: shortMonth(m.period) }));
  const active = ofBranch.filter((c) => c.status === "active").length;
  const byPlan = plansMock
    .map((plan) => ({
      plan,
      count: enrolled.filter((c) => c.planId === plan.id).length,
    }))
    .filter((p) => p.count > 0);

  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      header: "ALUMNO",
      render: (c) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-white">
            {c.fullName}
          </span>
          <span className="text-xs text-gray-400">DNI {c.dni}</span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "PLAN",
      render: (c) => (
        <span className="text-sm text-gray-300">
          {getPlan(c.planId)?.name ?? "Sin plan"}
        </span>
      ),
    },
    {
      key: "date",
      header: "ALTA",
      render: (c) => (
        <span className="text-sm text-gray-300">
          {formatDate(c.enrolledAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "ESTADO",
      render: (c) => (
        <AccountStatusBadge status={selectAccount(state, c, today).status} />
      ),
    },
    {
      key: "by",
      header: "INSCRIPTO POR",
      hideOnMobile: true,
      render: (c) => (
        <span className="truncate text-sm text-gray-300">
          {getUserName(c.createdBy)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Inscripciones de mi sede"
        subtitle={`${branch?.name ?? "Sede"}: altas y bajas de alumnos por mes. Es solo de consulta.`}
        actions={
          <div className="flex items-center gap-2">
            <label
              htmlFor="inscripciones-mes"
              className="text-xs font-semibold text-gray-300"
            >
              Mes
            </label>
            <select
              id="inscripciones-mes"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={cn(inputClasses, "w-auto py-2")}
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {formatPeriod(p)}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <StatCard
          icon="ti-user-plus"
          value={selected.enrolled}
          label={`Inscripciones de ${shortMonth(period)}`}
          tone="success"
        />
        <StatCard
          icon="ti-user-minus"
          value={selected.deactivated}
          label={`Bajas de ${shortMonth(period)}`}
          tone="danger"
        />
        <StatCard
          icon="ti-users"
          value={active}
          label="Alumnos activos hoy"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Últimos 6 meses" icon="ti-chart-bar">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-64 w-full"
            aria-hidden="true"
          >
            <BarChart data={history} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                allowDecimals={false}
                width={28}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="enrolled"
                isAnimationActive={false}
                fill="var(--color-enrolled)"
                radius={4}
              />
              <Bar
                dataKey="deactivated"
                isAnimationActive={false}
                fill="var(--color-deactivated)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
          {/* Los mismos datos en una tabla (accesible para lectores de pantalla). */}
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Inscripciones y bajas de los últimos 6 meses
            </caption>
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th scope="col" className="py-1 font-semibold">
                  Mes
                </th>
                <th scope="col" className="py-1 font-semibold">
                  Inscripciones
                </th>
                <th scope="col" className="py-1 font-semibold">
                  Bajas
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((m) => (
                <tr
                  key={m.period}
                  className="border-t border-white/[0.05] text-gray-300"
                >
                  <th scope="row" className="py-1.5 font-medium text-white">
                    {formatPeriod(m.period)}
                  </th>
                  <td className="py-1.5">{m.enrolled}</td>
                  <td className="py-1.5">{m.deactivated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard
          title={`Por plan en ${formatPeriod(period)}`}
          icon="ti-barbell"
        >
          {byPlan.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hubo inscripciones ese mes.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {byPlan.map(({ plan, count }) => (
                <li
                  key={plan.id}
                  className="flex items-center justify-between rounded-xl bg-neutral-800/40 px-4 py-3"
                >
                  <span className="text-sm text-white">{plan.name}</span>
                  <span className="text-sm font-bold text-primary">
                    {count} {count === 1 ? "alumno" : "alumnos"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title={`Alumnos inscriptos en ${formatPeriod(period)}`}
        icon="ti-list"
      >
        {enrolled.length === 0 ? (
          <EmptyState
            icon="ti-user-off"
            title="No hubo inscripciones ese mes"
            description="Probá con otro mes."
          />
        ) : (
          <DataTable<Client>
            columns={columns}
            data={enrolled}
            getRowKey={(c) => c.id}
            gridTemplateClass="grid-cols-[minmax(0,_2fr)_1fr_1fr_1.2fr_1.3fr]"
            label="Alumnos inscriptos"
          />
        )}
      </SectionCard>
    </div>
  );
}
