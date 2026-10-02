import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FileUpload } from "@/components/common/FileUpload";
import { DetailList } from "@/components/common/DetailList";
import { HealthEditDialog } from "@/components/alumnos/health/HealthEditDialog";
import {
  ATTACHMENT_KIND_LABELS,
  ATTACHMENT_STATUS_LABELS,
  type Client,
} from "@/data/clients";
import { HEALTH_CONDITIONS } from "@/data/health";
import { getPlan } from "@/data/plans";
import { branchesMock } from "@/data/branches";
import { getMockSession } from "@/data/users";
import { formatDate, todayISO } from "@/lib/dates";
import type { FileMeta } from "@/lib/files";
import { formatFileSize } from "@/lib/files";
import { useStoreActions } from "@/store/StoreProvider";

/**
 * Lo que completa el alumno (CU 2): su declaración jurada de salud y sus
 * certificados. Lo que sube queda "Pendiente de revisión" para recepción.
 */
export function MyHealth({ client }: { client: Client }) {
  const actions = useStoreActions();
  const [ddjjOpen, setDdjjOpen] = React.useState(false);
  const [file, setFile] = React.useState<FileMeta | null>(null);
  const health = client.health;
  const conditions = HEALTH_CONDITIONS.filter((c) =>
    health?.conditions.includes(c.id),
  );

  function sendCertificate() {
    if (!file) return;
    const today = todayISO();
    actions.addAttachment(client.id, {
      id: `doc_${Date.now().toString(36)}`,
      kind: "certificado",
      fileName: file.fileName,
      sizeKb: file.sizeKb,
      uploadedAt: today,
      status: "pending",
      uploadedBy: getMockSession()?.id,
    });
    setFile(null);
    toast.success("Certificado enviado. Recepción lo va a revisar.");
  }

  return (
    <>
      <SectionCard
        title="Declaración jurada de salud"
        icon="ti-heartbeat"
        actions={
          <Button
            type="button"
            variant={health?.signedAt ? "outline" : "default"}
            size="sm"
            onClick={() => setDdjjOpen(true)}
            className="rounded-xl font-bold"
          >
            {health?.signedAt ? "Actualizar" : "Completar"}
          </Button>
        }
      >
        {health?.signedAt ? (
          <>
            <StatusBadge
              tone="success"
              icon="ti-circle-check"
              className="self-start"
            >
              Firmada el {formatDate(health.signedAt)}
            </StatusBadge>
            <p className="text-sm text-gray-300">
              {conditions.length > 0
                ? `Declaraste: ${conditions.map((c) => c.label.toLowerCase()).join(", ")}.`
                : "No declaraste condiciones de salud."}
            </p>
          </>
        ) : (
          <p className="flex items-start gap-2 text-sm text-warning">
            <i
              className="ti ti-alert-triangle mt-0.5 text-base"
              aria-hidden="true"
            />
            Todavía no la completaste. Es obligatoria para entrenar.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Certificados" icon="ti-certificate">
        {(client.attachments ?? []).length > 0 && (
          <ul className="flex flex-col gap-2">
            {client.attachments!.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center gap-2 rounded-xl bg-neutral-800/40 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {ATTACHMENT_KIND_LABELS[doc.kind]}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {doc.fileName} · {formatFileSize(doc.sizeKb)} ·{" "}
                    {formatDate(doc.uploadedAt)}
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
              </li>
            ))}
          </ul>
        )}
        <FileUpload
          label="Subir certificado médico (apto físico)"
          value={file}
          onChange={setFile}
          hint="Recepción lo revisa y te avisa por acá."
        />
        {file && (
          <Button
            type="button"
            onClick={sendCertificate}
            className="self-start rounded-xl font-bold"
          >
            <i className="ti ti-send text-base" aria-hidden="true" />
            Enviar certificado
          </Button>
        )}
      </SectionCard>

      <SectionCard title="Mis datos" icon="ti-id">
        <DetailList
          items={[
            { label: "Nombre", value: client.fullName },
            { label: "DNI", value: client.dni },
            { label: "Email", value: client.email },
            { label: "Celular", value: client.phone ?? "Sin cargar" },
            {
              label: "Plan",
              value: getPlan(client.planId)?.name ?? "Sin plan",
            },
            {
              label: "Sede principal",
              value:
                branchesMock.find((b) => b.id === client.branchId)?.name ?? "—",
            },
          ]}
        />
        <p className="text-xs text-muted-foreground">
          ¿Hay algún dato mal? Avisá en recepción y lo corrigen.
        </p>
      </SectionCard>

      <HealthEditDialog
        client={client}
        open={ddjjOpen}
        onOpenChange={setDdjjOpen}
      />
    </>
  );
}
