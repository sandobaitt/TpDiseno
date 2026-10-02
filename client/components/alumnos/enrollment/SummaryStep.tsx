import * as React from "react";
import { Button } from "@/components/ui/button";
import { DetailList, type DetailItem } from "@/components/common/DetailList";
import type { Branch } from "@/data/branches";
import type { Plan } from "@/data/plans";
import { HEALTH_CONDITIONS } from "@/data/health";
import { enrollmentCharge, isMinor } from "@/domain/enrollment";
import { ageOn, formatDate, todayISO } from "@/lib/dates";
import { cleanText, formatDni } from "@/lib/format";
import { EnrollmentChargeBox } from "./EnrollmentChargeBox";
import type { StepProps } from "./types";

interface SummaryStepProps extends Pick<StepProps, "draft"> {
  plans: Plan[];
  branches: Branch[];
  onEditStep: (step: number) => void;
}

function Section({
  title,
  step,
  items,
  onEditStep,
}: {
  title: string;
  step: number;
  items: DetailItem[];
  onEditStep: (step: number) => void;
}) {
  return (
    <section className="rounded-xl border border-white/[0.06] p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(step)}
          aria-label={`Corregir ${title.toLowerCase()}`}
          className="rounded-lg text-primary hover:text-primary"
        >
          <i className="ti ti-pencil text-sm" aria-hidden="true" />
          Corregir
        </Button>
      </div>
      <DetailList items={items} twoColumns />
    </section>
  );
}

/** Paso 5: resumen de todo lo cargado antes de registrar. */
export function SummaryStep({
  draft,
  plans,
  branches,
  onEditStep,
}: SummaryStepProps) {
  const today = todayISO();
  const minor = isMinor(draft.birthDate, today);
  const plan = plans.find((p) => p.id === draft.planId);
  const branch = branches.find((b) => b.id === draft.branchId);
  const conditions = HEALTH_CONDITIONS.filter((c) =>
    draft.conditions.includes(c.id),
  ).map((c) => c.label);

  const personal: DetailItem[] = [
    {
      label: "Nombre",
      value: `${cleanText(draft.firstName)} ${cleanText(draft.lastName)}`,
    },
    { label: "DNI", value: formatDni(draft.dni) },
    {
      label: "Fecha de nacimiento",
      value: draft.birthDate
        ? `${formatDate(draft.birthDate)} (${ageOn(draft.birthDate, today)} años)`
        : "—",
    },
  ];
  if (minor) {
    personal.push(
      {
        label: "Adulto responsable",
        value: `${cleanText(draft.guardianName)} (${draft.guardianRelationship.toLowerCase()}) · DNI ${formatDni(draft.guardianDni)}`,
      },
      {
        label: "Autorización firmada",
        value: draft.authorization?.fileName ?? "Falta adjuntarla",
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Section
        title="Datos personales"
        step={1}
        items={personal}
        onEditStep={onEditStep}
      />
      <Section
        title="Contacto"
        step={2}
        onEditStep={onEditStep}
        items={[
          { label: "Email", value: draft.email.trim().toLowerCase() },
          { label: "Celular", value: cleanText(draft.phone) },
          {
            label: "Dirección",
            value:
              [draft.address, draft.city]
                .map(cleanText)
                .filter(Boolean)
                .join(", ") || "Sin cargar",
          },
          {
            label: "Contacto de emergencia",
            value: cleanText(draft.emergencyContact) || "Sin cargar",
          },
        ]}
      />
      <Section
        title="Salud"
        step={3}
        onEditStep={onEditStep}
        items={[
          {
            label: "Peso y estatura",
            value: `${draft.weightKg} kg · ${draft.heightCm} cm`,
          },
          {
            label: "Condiciones declaradas",
            value:
              conditions.length > 0
                ? conditions.join(", ")
                : "No declara condiciones",
          },
          ...(draft.history.trim()
            ? [{ label: "Antecedentes", value: cleanText(draft.history) }]
            : []),
          {
            label: "Certificado médico",
            value: draft.certificate?.fileName ?? "Sin adjuntar (opcional)",
          },
        ]}
      />
      <Section
        title="Plan y sede"
        step={4}
        onEditStep={onEditStep}
        items={[
          { label: "Plan", value: plan?.name ?? "—" },
          { label: "Sede principal", value: branch?.name ?? "—" },
          {
            label: "Fecha de inicio",
            value: draft.startDate ? formatDate(draft.startDate) : "—",
          },
        ]}
      />
      {plan && draft.startDate && (
        <>
          <EnrollmentChargeBox
            charge={enrollmentCharge(plan, draft.startDate)}
          />
          <p className="text-xs text-muted-foreground">
            Hasta que pague, su cuota figura como "Por vencer". Puede ingresar
            mientras no pase la fecha de bloqueo.
          </p>
        </>
      )}
    </div>
  );
}
