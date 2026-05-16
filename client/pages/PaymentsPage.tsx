import * as React from "react";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
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

const debtors = allRows.filter((r) => r.status === "debtor");
const paid = allRows.filter((r) => r.status === "paid");

const ITEMS_PER_PAGE = 3;

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("debtors");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(
    null,
  );

  const activeData = activeTab === "debtors" ? debtors : paid;
  const totalPages = Math.ceil(activeData.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = activeData.slice(start, start + ITEMS_PER_PAGE);

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
            className={`inline-flex gap-1.5 items-center px-2.5 py-1 rounded-3xl ${
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
    <DashboardLayout headerNav="Cobros y Facturación">
      <HeaderPage
        title="COBROS Y FACTURACIÓN"
        subtitle="Control de pagos y cuotas mensuales."
      />

      <section className="px-7 pb-7 max-sm:px-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("debtors");
              setCurrentPage(1);
            }}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
              activeTab === "debtors"
                ? "text-lime-400 border-2 border-lime-400 bg-zinc-800 font-semibold"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            <i className="ti ti-alert-triangle text-base mr-2" />
            Deudores
          </button>
          <button
            onClick={() => {
              setActiveTab("paid");
              setCurrentPage(1);
            }}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
              activeTab === "paid"
                ? "text-lime-400 border-2 border-lime-400 bg-zinc-800 font-semibold"
                : "text-stone-500 hover:text-stone-300"
            }`}
          >
            <i className="ti ti-circle-check text-base mr-2" />
            Pagados
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900">
          <DataTable
            columns={columns}
            data={paginatedData}
            getRowKey={(row) => row.id}
            minWidthClass="min-w-[700px] lg:min-w-0"
            gridTemplateClass="grid-cols-[minmax(220px,_1fr)_1fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr]"
            onRowClick={(row) => setSelectedClientId(row.id)}
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>

      <Dialog
        open={!!selectedClientId}
        onOpenChange={(open) => !open && setSelectedClientId(null)}
      >
        <DialogContent className="max-w-6xl bg-stone-950 border-zinc-800 max-h-[90vh] overflow-y-auto text-white [&_.lucide-x]:h-6 [&_.lucide-x]:w-6">
          <div className="p-3">
            {selectedClientId && (
              <PaymentCheckoutContent clientId={selectedClientId} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
