import * as React from "react";
import { Button } from "@/components/ui/button";
import { MAX_ATTACHMENT_MB } from "@/data/rules";
import {
  DOCUMENT_ACCEPT,
  checkDocumentFile,
  formatFileSize,
  type FileMeta,
} from "@/lib/files";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  /** Qué se adjunta ("Certificado médico"). */
  label: string;
  value: FileMeta | null;
  onChange: (file: FileMeta | null) => void;
  hint?: string;
  /** Error que viene del formulario (por ejemplo, si es obligatorio). */
  error?: string;
  required?: boolean;
  maxMb?: number;
  className?: string;
}

/**
 * Adjuntar un documento (PDF, JPG o PNG): con botón o arrastrando el archivo.
 * Controla formato y tamaño. En la demo solo se guardan el nombre y el peso.
 */
export function FileUpload({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  maxMb = MAX_ATTACHMENT_MB,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const [dragActive, setDragActive] = React.useState(false);
  const [fileError, setFileError] = React.useState<string | null>(null);

  const shownError = fileError ?? error;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint && !shownError && hintId, shownError && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  function pick(file: File | undefined) {
    if (!file) return;
    const problem = checkDocumentFile(file.name, file.size, maxMb);
    setFileError(problem);
    if (!problem) {
      onChange({
        fileName: file.name,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
      });
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }

  function handleDrop(e: React.DragEvent) {
    handleDrag(e);
    setDragActive(false);
    pick(e.dataTransfer.files?.[0]);
  }

  const chooseButton = (text: string) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => inputRef.current?.click()}
      aria-label={`${text}: ${label}`}
      aria-describedby={describedBy}
      className="rounded-xl"
    >
      <i className="ti ti-upload text-sm" aria-hidden="true" />
      {text}
    </Button>
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p className="text-xs font-semibold text-gray-300">
        {label}
        {required && <span className="text-danger"> *</span>}
      </p>

      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
          <i
            className="ti ti-file-check text-xl text-success"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {value.fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(value.sizeKb)} · listo para adjuntar
            </p>
          </div>
          <div className="flex gap-2">
            {chooseButton("Cambiar")}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFileError(null);
                onChange(null);
              }}
              aria-label={`Quitar ${value.fileName}`}
              className="rounded-xl text-gray-300"
            >
              Quitar
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors sm:flex-row sm:text-left",
            dragActive
              ? "border-primary bg-primary/5"
              : shownError
                ? "border-danger/50 bg-danger/5"
                : "border-zinc-700 bg-zinc-800/50",
          )}
        >
          <i
            className="ti ti-file-upload text-2xl text-gray-400"
            aria-hidden="true"
          />
          <p className="flex-1 text-sm text-gray-300">
            Arrastrá el archivo acá o elegilo desde el equipo.
            <span className="block text-xs text-muted-foreground">
              PDF, JPG o PNG de hasta {maxMb} MB.
            </span>
          </p>
          {chooseButton("Elegir archivo")}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={DOCUMENT_ACCEPT}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          // Permite volver a elegir el mismo archivo después de quitarlo.
          e.target.value = "";
        }}
      />

      {hint && !shownError && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {shownError && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-danger"
        >
          <i className="ti ti-alert-circle text-sm" aria-hidden="true" />
          {shownError}
        </p>
      )}
    </div>
  );
}
