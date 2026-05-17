import * as React from "react";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { FilterSelect } from "@/components/common/FilterSelect";
import HeaderPage from "@/components/common/HeaderPage";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentCheckoutContent } from "@/components/cobros/PaymentCheckoutContent";
import { clientsMock } from "@/data/clients";
import { plansMock } from "@/data/plans";
import { paymentsMock } from "@/data/payments";

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
  plan: string;
  amount: number;
  status: "paid" | "debtor";
  initials: string;
  initialsBg: string;
  initialsText: string;
}

const allRows: RowData[] = clientsMock.map((c, i) => {
  const plan = plansMock.find((p) => p.id === c.membership?.planId);
  const planName = plan?.name ?? "Sin plan";
  const membershipPayment = paymentsMock.find(
    (p) => p.clientId === c.id && p.concept === "membership",
  );
  const style = avatarStyles[i % avatarStyles.length];

  const isPaid =
    c.status === "enabled" && membershipPayment?.status === "approved";

  return {
    id: c.id,
    name: c.fullName,
    plan: planName,
    amount: membershipPayment?.amountArs ?? plan?.monthlyPriceArs ?? 0,
    status: isPaid ? "paid" : "debtor",
    initials: getInitials(c.fullName),
    initialsBg: style.bg,
    initialsText: style.text,
  };
});

const uniquePlans = [...new Set(allRows.map((r) => r.plan).filter((p) => p !== "Sin plan"))];

const ITEMS_PER_PAGE = 8;

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("debtors");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [filterPlan, setFilterPlan] = React.useState("");
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);

  React.useEffect(() => { setCurrentPage(1); }, [search, filterPlan, activeTab]);

  const filteredData = React.useMemo(() => {
    const tabData = allRows.filter((r) => r.status === (activeTab === "debtors" ? "debtor" : "paid"));
    const q = search.toLowerCase().trim();
    return tabData.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
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
            ${row.amount.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "ESTADO",
      render: (row: RowData) => {
        const isPaidRow = row.status === "paid";
        return (
          <div
            className={`inline-flex gap-1.5 items-center px-3 py-1 rounded-full ${
              isPaidRow ? "bg-green-900" : "bg-orange-950"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${isPaidRow ? "bg-green-500" : "bg-red-500"}`}
            />
            <span
              className={`text-xs font-semibold ${isPaidRow ? "text-green-500" : "text-red-500"}`}
            >
              {isPaidRow ? "Pagado" : "Deudor"}
            </span>
          </div>
        );
      },
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
            Deudores
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
            Pagados
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
              placeholder="Buscar por nombre..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-900 glass-border text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-lime-400/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer">
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
