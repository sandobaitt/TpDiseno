import * as React from "react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { FilterSelect } from "@/components/common/FilterSelect";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import { getPlan, plansMock } from "@/data/plans";
import { PAYMENT_METHOD_LABELS, type Payment } from "@/data/payments";
import { getUserName } from "@/data/users";
import type { AccountStatus } from "@/domain/billing";
import { diffDays, formatDate, formatPeriod, todayISO } from "@/lib/dates";
import { formatARS, getInitials, matchesPersonSearch } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppState } from "@/store/StoreProvider";
import { selectAccount } from "@/store/selectors";
import { CheckoutDialog } from "./CheckoutDialog";
import { ReceiptDialog } from "./ReceiptDialog";

type TabId = "debtors" | "upToDate" | "today";

interface StudentRow {
  id: string;
  name: string;
  dni: string;
  planId?: string;
  planName: string;
  status: AccountStatus;
  owed: number;
  overdueDays: number;
  dueDate: string;
}

/** Más urgente primero: bloqueados, deudores (más atraso primero) y por vencer. */
const URGENCY: Record<AccountStatus, number> = {
  bloqueado: 0,
  deudor: 1,
  por_vencer: 2,
  al_dia: 3,
  inactivo: 4,
};

const ITEMS_PER_PAGE = 8;
const activePlans = plansMock.filter((p) => p.status === "active");

function NameCell({ name, dni }: { name: string; dni: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
        <span className="text-xs font-bold text-primary">
          {getInitials(name)}
        </span>
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-white">
          {name}
        </span>
        <span className="text-xs text-gray-400">DNI {dni}</span>
      </div>
    </div>
  );
}

/** Cobros (CU 3, 4 y 9): a quién cobrarle, quién está al día y los pagos del día. */
export function CollectionsBoard() {
  const state = useAppState();
  const today = todayISO();
  const [tab, setTab] = React.useState<TabId>("debtors");
  const [search, setSearch] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [checkoutId, setCheckoutId] = React.useState<string | null>(null);
  const [receipt, setReceipt] = React.useState<Payment | null>(null);

  // Solo alumnos activos con plan: los dados de baja no tienen cuota que cobrar.
  const rows = React.useMemo<StudentRow[]>(
    () =>
      state.clients
        .filter((c) => c.status === "active" && c.planId)
        .map((c) => {
          const account = selectAccount(state, c, today);
          return {
            id: c.id,
            name: c.fullName,
            dni: c.dni,
            planId: c.planId,
            planName: getPlan(c.planId)?.name ?? "Sin plan",
            status: account.status,
            owed: account.owedAmount,
            overdueDays: account.overdueDays,
            dueDate: account.nextDueDate,
          };
        })
        .sort(
          (a, b) =>
            URGENCY[a.status] - URGENCY[b.status] ||
            b.overdueDays - a.overdueDays ||
            a.name.localeCompare(b.name),
        ),
    [state, today],
  );

  const todayPayments = state.payments
    .filter((p) => p.status === "approved" && p.createdAt.startsWith(today))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const clientName = (id: string) =>
    state.clients.find((c) => c.id === id)?.fullName ?? "Alumno";

  const debtors = rows.filter((r) => r.owed > 0);
  const upToDate = rows.filter((r) => r.owed === 0);
  const listRows = (tab === "debtors" ? debtors : upToDate).filter(
    (r) =>
      matchesPersonSearch(search, { name: r.name, dni: r.dni }) &&
      (!planFilter || r.planId === planFilter),
  );

  React.useEffect(() => {
    setPage(1);
  }, [tab, search, planFilter]);

  const totalPages = Math.ceil(listRows.length / ITEMS_PER_PAGE);
  const pageRows = listRows.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const debtorColumns: DataTableColumn<StudentRow>[] = [
    {
      key: "name",
      header: "ALUMNO",
      render: (r) => <NameCell name={r.name} dni={r.dni} />,
    },
    { key: "planName", header: "PLAN" },
    {
      key: "owed",
      header: "DEBE",
      render: (r) => (
        <span
          className={cn(
            "text-sm font-bold",
            r.overdueDays > 0 ? "text-danger" : "text-white",
          )}
        >
          {formatARS(r.owed)}
        </span>
      ),
    },
    {
      key: "due",
      header: "VENCIMIENTO",
      render: (r) =>
        r.overdueDays > 0 ? (
          <span className="text-sm text-warning">
            {r.overdueDays} {r.overdueDays === 1 ? "día" : "días"} de atraso
          </span>
        ) : (
          <span className="text-sm text-gray-300">
            Vence el {formatDate(r.dueDate)}
            {diffDays(today, r.dueDate) <= 3 && " (pronto)"}
          </span>
        ),
    },
    {
      key: "status",
      header: "ESTADO",
      render: (r) => <AccountStatusBadge status={r.status} />,
    },
  ];

  const upToDateColumns: DataTableColumn<StudentRow>[] = [
    debtorColumns[0],
    debtorColumns[1],
    {
      key: "due",
      header: "PRÓXIMO VENCIMIENTO",
      render: (r) => (
        <span className="text-sm text-gray-300">{formatDate(r.dueDate)}</span>
      ),
    },
    debtorColumns[4],
  ];

  const paymentColumns: DataTableColumn<Payment>[] = [
    {
      key: "client",
      header: "ALUMNO",
      render: (p) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-white">
            {clientName(p.clientId)}
          </span>
          <span className="text-xs text-gray-400">
            {p.receiptNumber} · {p.createdAt.slice(11, 16)} h
          </span>
        </div>
      ),
    },
    {
      key: "periods",
      header: "CUOTAS",
      render: (p) => (
        <span className="text-sm text-gray-300">
          {p.periods.map(formatPeriod).join(", ")}
        </span>
      ),
    },
    {
      key: "method",
      header: "MEDIO",
      render: (p) => (
        <span className="text-sm text-gray-300">
          {PAYMENT_METHOD_LABELS[p.method]}
        </span>
      ),
    },
    {
      key: "amount",
      header: "TOTAL",
      render: (p) => (
        <span className="text-sm font-bold text-white">
          {formatARS(p.amountArs)}
        </span>
      ),
    },
    {
      key: "by",
      header: "REGISTRÓ",
      render: (p) => (
        <span className="truncate text-sm text-gray-300">
          {getUserName(p.processedBy)}
        </span>
      ),
    },
  ];

  const hasFilters = !!(search || planFilter);
  const clearFilters = () => {
    setSearch("");
    setPlanFilter("");
  };

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Cobros y facturación"
        subtitle="A quién le corresponde pagar, quién está al día y los pagos de hoy. Tocá un alumno para cobrarle."
      />

      <section
        aria-label="Resumen de cobros"
        className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4"
      >
        <StatCard
          icon="ti-alert-triangle"
          value={formatARS(debtors.reduce((sum, r) => sum + r.owed, 0))}
          label={`Adeudado por ${debtors.length} alumnos`}
          tone="warning"
        />
        <StatCard
          icon="ti-cash"
          value={formatARS(
            todayPayments.reduce((sum, p) => sum + p.amountArs, 0),
          )}
          label="Cobrado hoy"
          tone="success"
        />
        <StatCard
          icon="ti-receipt"
          value={todayPayments.length}
          label="Pagos registrados hoy"
          className="col-span-2 lg:col-span-1"
        />
      </section>

      <SegmentedTabs<TabId>
        label="Cobros"
        value={tab}
        onChange={setTab}
        items={[
          {
            id: "debtors",
            label: "A cobrar",
            icon: "ti-alert-triangle",
            count: debtors.length,
          },
          {
            id: "upToDate",
            label: "Al día",
            icon: "ti-circle-check",
            count: upToDate.length,
          },
          {
            id: "today",
            label: "Pagos de hoy",
            icon: "ti-receipt",
            count: todayPayments.length,
          },
        ]}
      />

      {tab !== "today" && (
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Nombre o DNI…"
            label="Buscar alumno por nombre o DNI"
          />
          <FilterSelect
            value={planFilter}
            onChange={setPlanFilter}
            placeholder="Todos los planes"
            options={activePlans.map((p) => ({ value: p.id, label: p.name }))}
          />
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="rounded-lg text-xs text-gray-300"
            >
              Limpiar filtros
            </Button>
          )}
          <span className="ml-auto text-xs text-gray-400" aria-live="polite">
            {listRows.length} {listRows.length === 1 ? "alumno" : "alumnos"}
          </span>
        </div>
      )}

      <div className="rounded-2xl bg-neutral-900 p-5 shadow-card glass-border max-sm:p-3">
        {tab === "today" ? (
          todayPayments.length === 0 ? (
            <EmptyState
              icon="ti-receipt-off"
              title="Todavía no se registraron pagos hoy"
              description="Cuando cobres una cuota, el pago y su recibo aparecen acá."
            />
          ) : (
            <DataTable<Payment>
              columns={paymentColumns}
              data={todayPayments}
              getRowKey={(p) => p.id}
              gridTemplateClass="grid-cols-[minmax(0,_2fr)_1.6fr_1fr_1fr_1.2fr]"
              onRowClick={setReceipt}
              rowActionLabel={(p) => `Ver recibo ${p.receiptNumber}`}
              label="Pagos de hoy"
            />
          )
        ) : listRows.length === 0 ? (
          <EmptyState
            icon={hasFilters ? "ti-search-off" : "ti-mood-smile"}
            title={
              hasFilters
                ? "No hay alumnos con esos filtros"
                : tab === "debtors"
                  ? "No hay cuotas pendientes"
                  : "Todavía nadie está al día este mes"
            }
            action={
              hasFilters && (
                <Button type="button" variant="link" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )
            }
          />
        ) : (
          <DataTable<StudentRow>
            columns={tab === "debtors" ? debtorColumns : upToDateColumns}
            data={pageRows}
            getRowKey={(r) => r.id}
            gridTemplateClass={
              tab === "debtors"
                ? "grid-cols-[minmax(0,_2fr)_1fr_1fr_1.3fr_1.1fr]"
                : "grid-cols-[minmax(0,_2fr)_1fr_1.2fr_1.1fr]"
            }
            onRowClick={(r) => setCheckoutId(r.id)}
            rowActionLabel={(r) => `Cobrar a ${r.name}`}
            label={
              tab === "debtors"
                ? "Alumnos con cuotas a cobrar"
                : "Alumnos al día"
            }
          />
        )}
      </div>

      {tab !== "today" && listRows.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <CheckoutDialog
        clientId={checkoutId}
        onClose={() => setCheckoutId(null)}
      />

      <ReceiptDialog
        payment={receipt}
        clientName={receipt ? clientName(receipt.clientId) : ""}
        onClose={() => setReceipt(null)}
      />
    </div>
  );
}
