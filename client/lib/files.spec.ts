import { describe, expect, it } from "vitest";
import { checkDocumentFile, formatFileSize } from "./files";

describe("checkDocumentFile", () => {
  it("acepta PDF, JPG y PNG hasta el tamaño máximo", () => {
    expect(checkDocumentFile("apto.PDF", 400 * 1024, 5)).toBeNull();
    expect(checkDocumentFile("foto.jpeg", 5 * 1024 * 1024, 5)).toBeNull();
  });

  it("rechaza otros formatos", () => {
    expect(checkDocumentFile("apto.docx", 1000, 5)).toMatch(/formato/);
  });

  it("rechaza archivos más pesados que el máximo", () => {
    expect(checkDocumentFile("apto.pdf", 7 * 1024 * 1024, 5)).toMatch(
      /máximo es 5 MB/,
    );
  });
});

describe("formatFileSize", () => {
  it("muestra KB o MB", () => {
    expect(formatFileSize(412)).toBe("412 KB");
    expect(formatFileSize(1536)).toBe("1,5 MB");
  });
});
