import * as React from "react";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterSelect } from "@/components/common/FilterSelect";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { ReceiptDialog } from "@/components/alumnos/payments/ReceiptDialog";
import {
  PAYMENT_METHOD_LABELS,
  type Payment,
  type PaymentMethod,
} from "@/data/payments";
import { getPlan, plansMock } from "@/data/plans";
import { getUserName } from "@/data/users";
import { formatDateTime, formatPeriod, toPeriod } from "@/lib/dates";
import { formatARS, matchesPersonSearch } from "@/lib/format";
import { useAppState } from "@/store/StoreProvider";

interface BranchPaymentsProps {
  branchId: string;
  /** Mes que se consulta ("AAAA-MM"). */
  period: string;
}

/**
 * Pagos registrados en la sede del encargado (requisito 3.1.6a y b): solo
 * consulta, del mes elegido, con filtros por alumno, plan y medio de pago.
 */
export function BranchPayments({ branchId, period }: BranchPaymentsProps) {
  const state = useAppState();
  const [search, setSearch] = React.useState("");
  const [plan, setPlan] = React.useState("");
  const [method, setMethod] = React.useState("");
  const [receipt, setReceipt] = React.useState<Payment | null>(null);
  const clientOf = (id: string) => state.clients.find((c) => c.id === id);

  const ofMonth = state.payments
    .filter(
      (p) =>
        p.branchId === branchId &&
        p.status === "approved" &&
        toPeriod(p.createdAt.slice(0, 10)) === period,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = ofMonth.filter((p) => {
    const c = clientOf(p.clientId);
    return (
      (!plan || c?.planId === plan) &&
      (!method || p.method === method) &&
      matchesPersonSearch(search, {
        name: c?.fullName ?? "",
        dni: c?.dni,
        email: c?.email,
      })
    );
  });
  const total = ofMonth.reduce((sum, p) => sum + p.amountArs, 0);
  const withPromo = ofMonth.filter((p) => p.discountArs > 0).length;

  const columns: DataTableColumn<Payment>[] = [
    {
      key: "client",
      header: "ALUMNO",
      render: (p) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">
            {clientOf(p.clientId)?.fullName ?? "Alumno"}
          </span>
          <span className="text-xs text-muted-foreground">
            {p.receiptNumber}
          </span>
        </div>
      ),
    },
    {
      key: "date",
      header: "FECHA",
      render: (p) => (
        <span className="text-sm text-foreground/80">
          {formatDateTime(p.createdAt)}
        </span>
      ),
    },
    {
      key: "plan",
      header: "PLAN",
      render: (p) => (
        <span className="text-sm text-foreground/80">
          {getPlan(clientOf(p.clientId)?.planId)?.name ?? "Sin plan"}
        </span>
      ),
    },
    {
      key: "periods",
      header: "CUOTAS",
      hideOnMobile: true,
      render: (p) => (
        <span className="truncate text-sm text-foreground/80">
          {p.periods.map(formatPeriod).join(", ")}
        </span>
      ),
    },
    {
      key: "method",
      header: "MEDIO",
      render: (p) => (
        <span className="text-sm text-foreground/80">
          {PAYMENT_METHOD_LABELS[p.method]}
        </span>
      ),
    },
    {
      key: "amount",
      header: "TOTAL",
      render: (p) => (
        <span className="text-sm font-bold text-foreground">
          {formatARS(p.amountArs)}
          {p.discountArs > 0 && (
            <span className="block text-xs font-normal text-primary">
              con promoción
            </span>
          )}
        </span>
      ),
    },
    {
      key: "by",
      header: "REGISTRADO POR",
      hideOnMobile: true,
      render: (p) => (
        <span className="truncate text-sm text-foreground/80">
          {getUserName(p.processedBy)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <StatCard
          icon="ti-cash"
          value={formatARS(total)}
          label={`Cobrado en ${formatPeriod(period)}`}
          tone="success"
        />
        <StatCard
          icon="ti-receipt"
          value={ofMonth.length}
          label="Pagos registrados"
        />
        <StatCard
          icon="ti-discount"
          value={withPromo}
          label="Con promoción"
          tone="info"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <SectionCard title={`Pagos de ${formatPeriod(period)}`} icon="ti-list">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Nombre o DNI…"
            label="Buscar pagos por alumno"
          />
          <FilterSelect
            value={plan}
            onChange={setPlan}
            placeholder="Todos los planes"
            options={plansMock.map((p) => ({ value: p.id, label: p.name }))}
          />
          <FilterSelect
            value={method}
            onChange={setMethod}
            placeholder="Todos los medios"
            options={(
              Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
            ).map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] }))}
          />
          <span
            className="ml-auto text-xs text-muted-foreground"
            aria-live="polite"
          >
            {rows.length} {rows.length === 1 ? "pago" : "pagos"}
          </span>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            icon="ti-receipt-off"
            title="No hay pagos con esos filtros"
            description="Probá con otro mes o sacá los filtros."
          />
        ) : (
          <DataTable<Payment>
            columns={columns}
            data={rows}
            getRowKey={(p) => p.id}
            gridTemplateClass="grid-cols-[minmax(0,_1.6fr)_1.1fr_1fr_1.3fr_0.8fr_1fr_1.2fr]"
            onRowClick={setReceipt}
            rowActionLabel={(p) => `Ver el recibo ${p.receiptNumber}`}
            label="Pagos de la sede"
          />
        )}
      </SectionCard>

      <ReceiptDialog
        payment={receipt}
        clientName={
          receipt ? (clientOf(receipt.clientId)?.fullName ?? "Alumno") : ""
        }
        onClose={() => setReceipt(null)}
      />
    </div>
  );
}
