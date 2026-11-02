import * as React from "react";
import { useSearchParams } from "react-router-dom";
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
import {
  branchEnrollmentHistory,
  branchInconsistencies,
} from "@/domain/enrollment";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { BranchPayments } from "./BranchPayments";
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

type TabId = "inscripciones" | "pagos" | "revisar";

/**
 * Inscripciones y pagos de la sede del encargado (CU 12 y requisito 3.1.6):
 * solo consulta. Altas y bajas por mes, por plan y el detalle de cada alumno;
 * los pagos que registró secretaría; y lo que no cierra o falta, para revisar.
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
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab: TabId =
    tabParam === "pagos" || tabParam === "revisar" ? tabParam : "inscripciones";
  const setTab = (id: TabId) =>
    setParams(id === "inscripciones" ? {} : { tab: id }, { replace: true });

  const ofBranch = state.clients.filter((c) => c.branchId === branchId);
  const toReview = branchInconsistencies(
    ofBranch,
    state.payments.filter((p) => p.branchId === branchId),
    today,
  );
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
          <span className="truncate text-sm font-semibold text-foreground">
            {c.fullName}
          </span>
          <span className="text-xs text-muted-foreground">DNI {c.dni}</span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "PLAN",
      render: (c) => (
        <span className="text-sm text-foreground/80">
          {getPlan(c.planId)?.name ?? "Sin plan"}
        </span>
      ),
    },
    {
      key: "date",
      header: "ALTA",
      render: (c) => (
        <span className="text-sm text-foreground/80">
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
        <span className="truncate text-sm text-foreground/80">
          {getUserName(c.createdBy)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Inscripciones y pagos"
        subtitle={`${branch?.name ?? "Sede"}: altas y bajas de alumnos, pagos registrados y lo que hay que revisar. Es solo de consulta.`}
        actions={
          <div className="flex items-center gap-2">
            <label
              htmlFor="inscripciones-mes"
              className="text-xs font-semibold text-foreground/80"
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

      <SegmentedTabs<TabId>
        label="Secciones"
        value={tab}
        onChange={setTab}
        items={[
          { id: "inscripciones", label: "Inscripciones", icon: "ti-user-plus" },
          { id: "pagos", label: "Pagos", icon: "ti-receipt" },
          {
            id: "revisar",
            label: "Para revisar",
            icon: "ti-alert-triangle",
            count: toReview.length,
          },
        ]}
      />

      {tab === "pagos" && (
        <BranchPayments branchId={branchId} period={period} />
      )}

      {tab === "revisar" && (
        <SectionCard
          title="Inconsistencias y datos faltantes"
          icon="ti-alert-triangle"
        >
          {toReview.length === 0 ? (
            <EmptyState
              icon="ti-circle-check"
              title="No hay nada para revisar"
              description="Las inscripciones y los pagos de la sede están completos."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {toReview.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl bg-warning/10 px-4 py-3"
                >
                  <i
                    className={cn(
                      "ti mt-0.5 text-lg text-warning",
                      item.paymentId ? "ti-receipt" : "ti-user-exclamation",
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-sm text-foreground/80">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">
            Secretaría lo completa desde la ficha del alumno o desde Cobros.
          </p>
        </SectionCard>
      )}

      {tab === "inscripciones" && (
        <>
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
                      className="border-t border-border text-foreground/80"
                    >
                      <th
                        scope="row"
                        className="py-1.5 font-medium text-foreground"
                      >
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
                      className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3"
                    >
                      <span className="text-sm text-foreground">
                        {plan.name}
                      </span>
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
        </>
      )}
    </div>
  );
}
