/** Datos de un archivo adjunto (en la demo no se sube el archivo: solo se guardan nombre y tamaño). */
export interface FileMeta {
  fileName: string;
  sizeKb: number;
}

/** Formatos aceptados para certificados y autorizaciones. */
export const DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

/** Para el atributo `accept` del input de archivos. */
export const DOCUMENT_ACCEPT = DOCUMENT_EXTENSIONS.map((ext) => `.${ext}`).join(
  ",",
);

/** Devuelve el problema del archivo (formato o tamaño) o null si se puede adjuntar. */
export function checkDocumentFile(
  fileName: string,
  sizeBytes: number,
  maxMb: number,
): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!DOCUMENT_EXTENSIONS.includes(ext)) {
    return "Ese formato no se acepta. Subí un PDF, JPG o PNG.";
  }
  if (sizeBytes > maxMb * 1024 * 1024) {
    return `El archivo pesa ${formatFileSize(Math.round(sizeBytes / 1024))}. El máximo es ${maxMb} MB.`;
  }
  return null;
}

/** 412 → "412 KB"; 1536 → "1,5 MB". */
export function formatFileSize(sizeKb: number): string {
  if (sizeKb < 1024) return `${Math.max(1, Math.round(sizeKb))} KB`;
  const mb = sizeKb / 1024;
  return `${mb.toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`;
}
