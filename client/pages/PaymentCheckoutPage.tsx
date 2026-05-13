import * as React from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import HeaderPage from "@/components/common/HeaderPage";
import { PaymentCheckoutContent } from "@/components/cobros/PaymentCheckoutContent";

export default function PaymentCheckoutPage() {
  const { id } = useParams();

  return (
    <DashboardLayout headerNav="Cobros y Facturación">
      <HeaderPage
        title="CENTRO DE TRANSACCIONES"
        subtitle="Detalle de cotización y cobro."
      />
      <section className="px-7 pb-7 max-sm:px-4">
        <PaymentCheckoutContent clientId={id || "cl_002"} />
      </section>
    </DashboardLayout>
  );
}
