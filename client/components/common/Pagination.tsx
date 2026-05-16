import * as React from "react";

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
  if (start > 3) pages.push(-1); // ellipsis

  for (let i = start; i <= end; i++) pages.push(i);

  if (end < total - 1) pages.push(-1); // ellipsis
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
    <div className="flex items-center justify-between pt-2">
      {currentPage > 1 ? (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="text-gray-500 text-xs font-semibold hover:text-gray-300 transition-colors cursor-pointer"
        >
          ← Anterior
        </button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2">
        {visiblePages(currentPage, totalPages).map((p, i) =>
          p === -1 ? (
            <span key={`e-${i}`} className="text-gray-600 text-xs px-1">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                p === currentPage
                  ? "bg-lime-400/10 text-lime-400"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      {currentPage < totalPages ? (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="text-gray-500 text-xs font-semibold hover:text-gray-300 transition-colors cursor-pointer"
        >
          Siguiente →
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}
