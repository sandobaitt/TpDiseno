import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { DetailList, type DetailItem } from "@/components/common/DetailList";
import type { Client } from "@/data/clients";
import type { Plan } from "@/data/plans";
import { branchesMock } from "@/data/branches";
import { getUserName } from "@/data/users";
import { ageOn, formatDate, formatDateTime, todayISO } from "@/lib/dates";

interface PersonalDataSectionProps {
  client: Client;
  plan?: Plan;
  onEdit?: () => void;
}

/** Datos personales, de contacto y del adulto responsable. */
export function PersonalDataSection({
  client,
  plan,
  onEdit,
}: PersonalDataSectionProps) {
  const today = todayISO();
  const branch = branchesMock.find((b) => b.id === client.branchId);

  const items: DetailItem[] = [
    { label: "Nombre y apellido", value: client.fullName, icon: "ti-user" },
    { label: "DNI", value: client.dni, icon: "ti-id" },
    {
      label: "Fecha de nacimiento",
      value: client.birthDate
        ? `${formatDate(client.birthDate)} (${ageOn(client.birthDate, today)} años)`
        : "Sin cargar",
      icon: "ti-cake",
    },
    { label: "Email", value: client.email, icon: "ti-mail" },
    { label: "Celular", value: client.phone ?? "Sin cargar", icon: "ti-phone" },
    {
      label: "Dirección",
      value: client.address ?? "Sin cargar",
      icon: "ti-map-pin",
    },
    {
      label: "Contacto de emergencia",
      value: client.health?.emergencyContact ?? "Sin cargar",
      icon: "ti-urgent",
    },
    {
      label: "Sede principal",
      value: branch?.name ?? "—",
      icon: "ti-building",
    },
    { label: "Plan", value: plan?.name ?? "Sin plan", icon: "ti-barbell" },
    {
      label: "Fecha de alta",
      value: formatDate(client.enrolledAt),
      icon: "ti-calendar-plus",
    },
    {
      label: "Inscripción registrada por",
      value: `${getUserName(client.createdBy)} · ${formatDateTime(client.createdAt)}`,
      icon: "ti-user-check",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {client.status === "inactive" && (
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <i
            className="ti ti-user-off text-xl text-gray-300"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-white">
              Inscripción dada de baja
            </span>
            {client.deactivatedAt && ` el ${formatDate(client.deactivatedAt)}`}
            {client.deactivatedBy &&
              ` por ${getUserName(client.deactivatedBy)}`}
            .
            {client.deactivationReason &&
              ` Motivo: ${client.deactivationReason}`}
          </p>
        </div>
      )}

      <SectionCard
        title="Datos personales"
        icon="ti-id"
        actions={
          onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="rounded-xl"
            >
              <i className="ti ti-pencil text-sm" aria-hidden="true" />
              Editar datos
            </Button>
          )
        }
      >
        <DetailList items={items} twoColumns />
      </SectionCard>

      {client.guardian && (
        <SectionCard title="Adulto responsable" icon="ti-user-shield">
          <DetailList
            twoColumns
            items={[
              { label: "Nombre y apellido", value: client.guardian.fullName },
              { label: "Vínculo", value: client.guardian.relationship },
              { label: "DNI", value: client.guardian.dni },
              { label: "Celular", value: client.guardian.phone },
            ]}
          />
        </SectionCard>
      )}
    </div>
  );
}
