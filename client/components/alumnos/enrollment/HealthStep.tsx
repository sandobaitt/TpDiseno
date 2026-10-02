import { FileUpload } from "@/components/common/FileUpload";
import { HealthDeclarationFields } from "@/components/alumnos/health/HealthDeclarationFields";
import { isMinor } from "@/domain/enrollment";
import { todayISO } from "@/lib/dates";
import { cleanText } from "@/lib/format";
import type { StepProps } from "./types";

/** Paso 3: declaración jurada de salud y certificado médico (opcional). */
export function HealthStep({ draft, errors, set }: StepProps) {
  const signerName = isMinor(draft.birthDate, todayISO())
    ? cleanText(draft.guardianName) || "El adulto responsable"
    : cleanText(draft.firstName) || "El alumno";

  return (
    <div className="flex flex-col gap-5">
      <HealthDeclarationFields
        value={draft}
        onChange={set}
        errors={errors}
        signerName={signerName}
      />
      <FileUpload
        label="Certificado médico (apto físico)"
        value={draft.certificate}
        onChange={(file) => set("certificate", file)}
        hint="Es opcional. Si lo trae más adelante, se adjunta desde su ficha."
      />
    </div>
  );
}
