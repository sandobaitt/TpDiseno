import { useParams, useNavigate } from "react-router-dom";
import { clientsMock } from "@/data/clients";
import { plansMock } from "@/data/plans";
import { paymentsMock } from "@/data/payments";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { MemberDetail } from "@/components/member-detail/MemberDetail";
import HeaderPage from "@/components/common/HeaderPage";

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = clientsMock.find((c) => c.id === id);

  if (!client) {
    return (
      <DashboardLayout headerNav="Gestión de Socios">
        <div className="flex flex-col items-center justify-center px-7 py-16 text-center">
          <i className="ti ti-user-off text-6xl text-gray-600 mb-4" />
          <p className="text-sm text-gray-500">Socio no encontrado.</p>
        </div>
      </DashboardLayout>
    );
  }

  const planName = plansMock.find(
    (p) => p.id === client.membership?.planId,
  )?.name;

  const memberPayments = paymentsMock.filter((p) => p.clientId === client.id);

  const transactions =
    memberPayments.length > 0
      ? memberPayments.map((p) => ({
          id: p.id,
          type: (p.status === "rejected" || p.status === "pending"
            ? "unpaid"
            : "payment") as "payment" | "unpaid",
          title: p.description || p.concept,
          date: new Date(p.createdAt).toLocaleDateString("es-AR"),
          amount: p.amountArs,
          status:
            p.status === "approved"
              ? "Aprobado"
              : p.status === "rejected"
                ? "Rechazado"
                : p.status === "pending"
                  ? "Pendiente"
                  : "Reintegrado",
          paymentMethod:
            p.method === "mp"
              ? "MercadoPago"
              : p.method === "cash"
                ? "Efectivo"
                : p.method === "debit"
                  ? "Débito"
                  : p.method === "credit"
                    ? "Crédito"
                    : "Transferencia",
        }))
      : undefined;

  const pendingAmount = memberPayments
    .filter((p) => p.status === "rejected" || p.status === "pending")
    .reduce((sum, p) => sum + p.amountArs, 0);

  return (
    <DashboardLayout headerNav="Gestión de Socios">
      <HeaderPage
        title={client.fullName.toUpperCase()}
        subtitle={`${planName || "Sin plan"} · ${client.dni}`}
      />
      <div className="px-7 pb-7 max-sm:px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex gap-2 items-center text-sm text-gray-500 hover:text-gray-300 mb-4 cursor-pointer"
        >
          <i className="ti ti-arrow-left text-base" />
          Volver
        </button>

        <div className="p-6 rounded-2xl bg-neutral-900">
          <MemberDetail
            member={{
              id: client.id,
              fullName: client.fullName,
              email: client.email,
              dni: client.dni,
              status: client.status,
              planName,
            }}
            pendingPayment={{
              amount: client.status === "debtor" ? pendingAmount || 28500 : 0,
              overdueDays: client.status === "debtor" ? 14 : 0,
            }}
            transactions={transactions}
            onEditProfile={() => {}}
            onCollectPayment={() => {}}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
