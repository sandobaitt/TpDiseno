import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const visiblePages = (current: number, total: number): number[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: number[] = [];
  const start = Math.max(1, current - 1);
  const end = Math.min(total, current + 1);

  if (start > 2) pages.push(1);
  if (start > 3) pages.push(-1); // puntos suspensivos

  for (let i = start; i <= end; i++) pages.push(i);

  if (end < total - 1) pages.push(-1);
  if (end < total - 1) pages.push(total);
  if (end === total - 1) pages.push(total);

  return pages;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between pt-3"
    >
      {currentPage > 1 ? (
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-gray-200"
        >
          ← Anterior
        </button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1">
        {visiblePages(currentPage, totalPages).map((p, i) =>
          p === -1 ? (
            <span
              key={`e-${i}`}
              className="px-1 text-xs text-gray-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Página ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                p === currentPage
                  ? "bg-primary/10 text-primary"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200",
              )}
            >
              {p}
            </button>
          ),
        )}
      </div>

      {currentPage < totalPages ? (
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-gray-200"
        >
          Siguiente →
        </button>
      ) : (
        <div />
      )}
    </nav>
  );
}
