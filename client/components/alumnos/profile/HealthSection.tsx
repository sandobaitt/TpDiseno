import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { DetailList } from "@/components/common/DetailList";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  ATTACHMENT_KIND_LABELS,
  ATTACHMENT_STATUS_LABELS,
  type Client,
} from "@/data/clients";
import { HEALTH_CONDITIONS } from "@/data/health";
import { getUserName } from "@/data/users";
import { formatDate } from "@/lib/dates";
import { formatFileSize } from "@/lib/files";

interface HealthSectionProps {
  client: Client;
  onEditHealth?: () => void;
  onAddDocument?: () => void;
  onReviewDocument?: (attachmentId: string) => void;
}

/** Legajo médico: declaración jurada y documentos adjuntos (CU 1 y 2). */
export function HealthSection({
  client,
  onEditHealth,
  onAddDocument,
  onReviewDocument,
}: HealthSectionProps) {
  const health = client.health;
  const conditions = HEALTH_CONDITIONS.filter((c) =>
    health?.conditions.includes(c.id),
  );
  const documents = client.attachments ?? [];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SectionCard
        title="Declaración jurada de salud"
        icon="ti-heartbeat"
        actions={
          onEditHealth &&
          health?.signedAt && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEditHealth}
              className="rounded-xl"
            >
              <i className="ti ti-pencil text-sm" aria-hidden="true" />
              Actualizar
            </Button>
          )
        }
      >
        {!health?.signedAt ? (
          <EmptyState
            icon="ti-file-alert"
            title="Todavía no completó la declaración jurada"
            description="Es obligatoria para entrenar. Se completa con peso, estatura y antecedentes de salud."
            action={
              onEditHealth && (
                <Button
                  type="button"
                  onClick={onEditHealth}
                  className="rounded-xl font-bold"
                >
                  Completar declaración
                </Button>
              )
            }
          />
        ) : (
          <DetailList
            items={[
              {
                label: "Peso y estatura",
                value: `${health.weightKg ?? "—"} kg · ${health.heightCm ?? "—"} cm`,
              },
              {
                label: "Grupo sanguíneo",
                value: health.bloodType ?? "No sabe",
              },
              {
                label: "Condiciones declaradas",
                value:
                  conditions.length > 0 ? (
                    <ul className="flex flex-col gap-1">
                      {conditions.map((c) => (
                        <li key={c.id} className="flex items-start gap-2">
                          <i
                            className="ti ti-alert-triangle mt-0.5 text-sm text-warning"
                            aria-hidden="true"
                          />
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No declara condiciones"
                  ),
              },
              ...(health.history
                ? [{ label: "Antecedentes", value: health.history }]
                : []),
              {
                label: "Firmada",
                value: `${formatDate(health.signedAt)}${health.signedBy ? ` por ${health.signedBy}` : ""}`,
              },
            ]}
          />
        )}
      </SectionCard>

      <SectionCard
        title="Documentos"
        icon="ti-files"
        actions={
          onAddDocument && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddDocument}
              className="rounded-xl"
            >
              <i className="ti ti-paperclip text-sm" aria-hidden="true" />
              Adjuntar
            </Button>
          )
        }
      >
        {documents.length === 0 ? (
          <EmptyState
            icon="ti-file-off"
            title="Sin documentos adjuntos"
            description="Acá aparecen el certificado médico y, si es menor, la autorización firmada."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center gap-3 rounded-xl bg-neutral-800/40 px-4 py-3"
              >
                <i
                  className="ti ti-file-text text-xl text-gray-400"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {ATTACHMENT_KIND_LABELS[doc.kind]}
                  </p>
                  <p className="break-words text-xs text-gray-400">
                    {doc.fileName} · {formatFileSize(doc.sizeKb)} · subido el{" "}
                    {formatDate(doc.uploadedAt)}
                    {doc.uploadedBy && ` por ${getUserName(doc.uploadedBy)}`}
                  </p>
                </div>
                <StatusBadge
                  tone={doc.status === "approved" ? "success" : "warning"}
                  icon={
                    doc.status === "approved" ? "ti-circle-check" : "ti-clock"
                  }
                >
                  {ATTACHMENT_STATUS_LABELS[doc.status]}
                </StatusBadge>
                {doc.status === "pending" && onReviewDocument && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onReviewDocument(doc.id)}
                    className="rounded-xl font-bold"
                  >
                    Marcar como revisado
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
