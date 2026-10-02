import * as React from "react";
import { useLocation } from "react-router-dom";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { FilterSelect } from "@/components/common/FilterSelect";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentCheckoutContent } from "@/components/cobros/PaymentCheckoutContent";
import { getPlan } from "@/data/plans";
import { formatARS, matchesPersonSearch } from "@/lib/format";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import type { AccountStatus } from "@/domain/billing";
import { useAppState } from "@/store/StoreProvider";
import type { AppState } from "@/store/state";
import { selectAccount } from "@/store/selectors";

type TabId = "debtors" | "paid";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return `${first}${second}`.toUpperCase();
}

const avatarStyles = [
  { bg: "bg-zinc-800", text: "text-lime-400" },
  { bg: "bg-gray-800", text: "text-violet-400" },
  { bg: "bg-slate-800", text: "text-blue-400" },
  { bg: "bg-zinc-800", text: "text-gray-400" },
];

interface RowData {
  id: string;
  name: string;
  dni: string;
  plan: string;
  amount: number;
  /** "debtor" = tiene cuotas sin pagar (por vencer, vencidas o bloqueado). */
  status: "paid" | "debtor";
  accountStatus: AccountStatus;
  initials: string;
  initialsBg: string;
  initialsText: string;
}

// Solo alumnos activos con plan: los dados de baja no tienen cuota que cobrar.
function buildRows(state: AppState): RowData[] {
  return state.clients
    .filter((c) => c.status === "active" && c.planId)
    .map((c, i) => {
      const account = selectAccount(state, c);
      const style = avatarStyles[i % avatarStyles.length];
      return {
        id: c.id,
        name: c.fullName,
        dni: c.dni,
        plan: getPlan(c.planId)?.name ?? "Sin plan",
        // Lo que debe (todas las cuotas sin pagar), o la próxima cuota si está al día.
        amount:
          account.owedAmount > 0
            ? account.owedAmount
            : (getPlan(c.planId)?.monthlyPriceArs ?? 0),
        status: account.owedAmount > 0 ? "debtor" : "paid",
        accountStatus: account.status,
        initials: getInitials(c.fullName),
        initialsBg: style.bg,
        initialsText: style.text,
      };
    });
}

const ITEMS_PER_PAGE = 8;

export default function PaymentsPage() {
  const location = useLocation();
  const state = useAppState();
  // Se recalcula cuando cambia el store (por ejemplo, después de cobrar).
  const allRows = React.useMemo(() => buildRows(state), [state]);
  const uniquePlans = React.useMemo(
    () => [
      ...new Set(allRows.map((r) => r.plan).filter((p) => p !== "Sin plan")),
    ],
    [allRows],
  );
  const [activeTab, setActiveTab] = React.useState<TabId>("debtors");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [filterPlan, setFilterPlan] = React.useState("");
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    const state = location.state as { clientId?: string } | null;
    if (state?.clientId) setSelectedClientId(state.clientId);
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterPlan, activeTab]);

  const filteredData = React.useMemo(() => {
    const tabData = allRows.filter(
      (r) => r.status === (activeTab === "debtors" ? "debtor" : "paid"),
    );
    return tabData.filter((r) => {
      if (!matchesPersonSearch(search, { name: r.name, dni: r.dni }))
        return false;
      if (filterPlan && r.plan !== filterPlan) return false;
      return true;
    });
  }, [allRows, activeTab, search, filterPlan]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(start, start + ITEMS_PER_PAGE);

  const debtorCount = allRows.filter((r) => r.status === "debtor").length;
  const paidCount = allRows.filter((r) => r.status === "paid").length;
  const hasFilters = search.length > 0 || filterPlan.length > 0;

  const columns = [
    {
      key: "name",
      header: "NOMBRE",
      render: (row: RowData) => (
        <div className="flex gap-3 items-center min-w-0">
          <div
            className={`flex justify-center items-center w-9 h-9 rounded-lg shrink-0 ${row.initialsBg}`}
          >
            <span className={`text-xs font-bold ${row.initialsText}`}>
              {row.initials}
            </span>
          </div>
          <span className="text-sm font-semibold text-white truncate">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "PLAN",
    },
    {
      key: "amount",
      header: "MONTO",
      render: (row: RowData) => {
        const isPaidRow = row.status === "paid";
        return (
          <span
            className={`text-sm font-bold ${isPaidRow ? "text-lime-400" : "text-red-400"}`}
          >
            {formatARS(row.amount)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "ESTADO",
      render: (row: RowData) => (
        <AccountStatusBadge status={row.accountStatus} />
      ),
    },
  ];

  return (
    <>
      <section className="px-7 pb-7 max-sm:px-4 flex flex-col gap-4">
        <PageHeader
          title="Cobros y facturación"
          subtitle="Cuotas a cobrar y alumnos al día. Hacé clic en un alumno para cobrarle."
        />

        <SegmentedTabs
          label="Estado de las cuotas"
          value={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
            setSearch("");
            setFilterPlan("");
          }}
          items={[
            {
              id: "debtors",
              label: "A cobrar",
              icon: "ti-alert-triangle",
              count: debtorCount,
            },
            {
              id: "paid",
              label: "Al día",
              icon: "ti-circle-check",
              count: paidCount,
            },
          ]}
        />

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Nombre o DNI…"
            label="Buscar alumno por nombre o DNI"
          />

          <FilterSelect
            value={filterPlan}
            onChange={setFilterPlan}
            placeholder="Todos los planes"
            options={uniquePlans.map((p) => ({ value: p, label: p }))}
          />

          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setFilterPlan("");
              }}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-pointer ml-1"
            >
              Limpiar
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto">
            {filteredData.length} alumnos
          </span>
        </div>

        {/* Table */}
        <div className="p-5 rounded-2xl bg-neutral-900 glass-border shadow-card">
          {filteredData.length === 0 ? (
            <EmptyState
              icon="ti-search-off"
              title="No hay alumnos con esos filtros"
              action={
                <button
                  onClick={() => {
                    setSearch("");
                    setFilterPlan("");
                  }}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Limpiar filtros
                </button>
              }
            />
          ) : (
            <DataTable
              columns={columns}
              data={paginatedData}
              getRowKey={(row) => row.id}
              minWidthClass="min-w-[700px] lg:min-w-0"
              gridTemplateClass="grid-cols-[minmax(220px,_1fr)_1fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]"
              onRowClick={(row) => setSelectedClientId(row.id)}
              rowActionLabel={(row) => `Cobrar a ${row.name}`}
              label="Alumnos y cuotas"
            />
          )}
        </div>

        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </section>

      <Dialog
        open={!!selectedClientId}
        onOpenChange={(open) => !open && setSelectedClientId(null)}
      >
        <DialogContent className="max-w-6xl bg-stone-950 border-zinc-800 max-h-[90vh] overflow-y-auto text-white [&_.lucide-x]:h-6 [&_.lucide-x]:w-6">
          <DialogTitle className="sr-only">Cobrar cuota</DialogTitle>
          <DialogDescription className="sr-only">
            Detalle de lo adeudado, medio de pago y confirmación.
          </DialogDescription>
          <div className="p-3">
            {selectedClientId && (
              <PaymentCheckoutContent
                clientId={selectedClientId}
                onClose={() => setSelectedClientId(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
