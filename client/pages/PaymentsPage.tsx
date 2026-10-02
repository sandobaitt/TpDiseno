import * as React from "react";
import { useLocation } from "react-router-dom";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { FilterSelect } from "@/components/common/FilterSelect";
import HeaderPage from "@/components/common/HeaderPage";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentCheckoutContent } from "@/components/cobros/PaymentCheckoutContent";
import { getPlan } from "@/data/plans";
import { formatARS, matchesPersonSearch } from "@/lib/format";
import { AccountStatusBadge } from "@/components/common/AccountStatusBadge";
import type { AccountStatus } from "@/domain/billing";
import { seedState } from "@/store/state";
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
const allRows: RowData[] = seedState.clients
  .filter((c) => c.status === "active" && c.planId)
  .map((c, i) => {
    const account = selectAccount(seedState, c);
    const style = avatarStyles[i % avatarStyles.length];
    return {
      id: c.id,
      name: c.fullName,
      dni: c.dni,
      plan: getPlan(c.planId)?.name ?? "Sin plan",
      // Lo que debe (todas las cuotas sin pagar), o la próxima cuota si está al día.
      amount: account.owedAmount > 0 ? account.owedAmount : (getPlan(c.planId)?.monthlyPriceArs ?? 0),
      status: account.owedAmount > 0 ? "debtor" : "paid",
      accountStatus: account.status,
      initials: getInitials(c.fullName),
      initialsBg: style.bg,
      initialsText: style.text,
    };
  });

const uniquePlans = [...new Set(allRows.map((r) => r.plan).filter((p) => p !== "Sin plan"))];

const ITEMS_PER_PAGE = 8;

export default function PaymentsPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState<TabId>("debtors");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [filterPlan, setFilterPlan] = React.useState("");
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const state = location.state as { clientId?: string } | null;
    if (state?.clientId) setSelectedClientId(state.clientId);
  }, []);

  React.useEffect(() => { setCurrentPage(1); }, [search, filterPlan, activeTab]);

  const filteredData = React.useMemo(() => {
    const tabData = allRows.filter((r) => r.status === (activeTab === "debtors" ? "debtor" : "paid"));
    return tabData.filter((r) => {
      if (!matchesPersonSearch(search, { name: r.name, dni: r.dni })) return false;
      if (filterPlan && r.plan !== filterPlan) return false;
      return true;
    });
  }, [activeTab, search, filterPlan]);

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
      render: (row: RowData) => <AccountStatusBadge status={row.accountStatus} />,
    },
  ];

  return (
    <>
      <HeaderPage
        title="COBROS Y FACTURACIÓN"
        subtitle="Control de pagos y cuotas mensuales."
      />

      <section className="px-7 pb-7 max-sm:px-4 flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("debtors"); setCurrentPage(1); setSearch(""); setFilterPlan(""); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-150 ${
              activeTab === "debtors"
                ? "text-lime-400 border border-lime-400/60 bg-lime-400/10 shadow-[0_0_10px_rgba(149,253,0,0.08)]"
                : "text-stone-500 hover:text-stone-300 hover:bg-white/[0.03]"
            }`}
          >
            <i className="ti ti-alert-triangle text-base" />
            A cobrar
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === "debtors" ? "bg-lime-400/20 text-lime-400" : "bg-zinc-800 text-gray-500"}`}>
              {debtorCount}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab("paid"); setCurrentPage(1); setSearch(""); setFilterPlan(""); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-150 ${
              activeTab === "paid"
                ? "text-lime-400 border border-lime-400/60 bg-lime-400/10 shadow-[0_0_10px_rgba(149,253,0,0.08)]"
                : "text-stone-500 hover:text-stone-300 hover:bg-white/[0.03]"
            }`}
          >
            <i className="ti ti-circle-check text-base" />
            Al día
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === "paid" ? "bg-lime-400/20 text-lime-400" : "bg-zinc-800 text-gray-500"}`}>
              {paidCount}
            </span>
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre o DNI..."
              aria-label="Buscar alumno por nombre o DNI"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-900 glass-border text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-lime-400/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer">
                <i className="ti ti-x text-xs" />
              </button>
            )}
          </div>

          <FilterSelect
            value={filterPlan}
            onChange={setFilterPlan}
            placeholder="Todos los planes"
            options={uniquePlans.map((p) => ({ value: p, label: p }))}
          />

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setFilterPlan(""); }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer ml-1"
            >
              Limpiar
            </button>
          )}

          <span className="text-xs text-gray-600 ml-auto">{filteredData.length} registros</span>
        </div>

        {/* Table */}
        <div className="p-5 rounded-2xl bg-neutral-900 glass-border shadow-card">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <i className="ti ti-search-off text-3xl text-gray-700" />
              <p className="text-sm text-gray-600 font-medium">Sin resultados para los filtros aplicados</p>
              <button
                onClick={() => { setSearch(""); setFilterPlan(""); }}
                className="text-xs text-lime-400 hover:text-lime-300 transition-colors cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={paginatedData}
              getRowKey={(row) => row.id}
              minWidthClass="min-w-[700px] lg:min-w-0"
              gridTemplateClass="grid-cols-[minmax(220px,_1fr)_1fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]"
              onRowClick={(row) => setSelectedClientId(row.id)}
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
