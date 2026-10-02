import * as React from "react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => React.ReactNode;
  /** Ocultar esta columna en la vista de tarjetas (celular). */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  gridTemplateClass: string;
  minWidthClass?: string;
  rowClassName?: string;
  getRowKey?: (row: T, index: number) => React.Key;
  onRowClick?: (row: T) => void;
  /** Texto para lectores de pantalla al abrir una fila (ej. "Ver ficha de"). */
  rowActionLabel?: (row: T) => string;
  /** Nombre accesible de la tabla. */
  label?: string;
}

function cellContent<T>(column: DataTableColumn<T>, row: T): React.ReactNode {
  return column.render
    ? column.render(row)
    : String((row as Record<string, unknown>)[column.key] ?? "");
}

/**
 * Tabla genérica con CSS Grid. Debajo de 1024 px se muestra como tarjetas
 * (la primera columna es el título y el resto quedan como "Rótulo: valor").
 */
export function DataTable<T>({
  columns,
  data,
  gridTemplateClass,
  minWidthClass = "min-w-0",
  rowClassName = "",
  getRowKey,
  onRowClick,
  rowActionLabel,
  label,
}: DataTableProps<T>) {
  const template = `grid ${gridTemplateClass}`;
  const [first, ...rest] = columns;

  const interactiveProps = (row: T) =>
    onRowClick
      ? {
          role: "button",
          tabIndex: 0,
          "aria-label": rowActionLabel?.(row),
          onClick: () => onRowClick(row),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onRowClick(row);
            }
          },
        }
      : {};

  return (
    <>
      {/* Escritorio: tabla */}
      <div className="hidden w-full overflow-x-auto lg:block">
        <div className={minWidthClass} role="table" aria-label={label}>
          <div role="rowgroup">
            <div
              role="row"
              className={`${template} mb-1 gap-4 border-b border-white/[0.06] pb-3`}
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  role="columnheader"
                  className={cn(
                    "min-w-0 text-[11px] font-semibold uppercase tracking-widest text-gray-400",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </div>
              ))}
            </div>
          </div>
          <div role="rowgroup" className="flex flex-col">
            {data.map((row, index) => (
              <div
                key={getRowKey ? getRowKey(row, index) : index}
                {...interactiveProps(row)}
                className={cn(
                  template,
                  "items-center gap-4 border-b border-white/[0.04] py-3.5 transition-colors duration-100",
                  onRowClick && "cursor-pointer hover:bg-white/[0.03]",
                  rowClassName,
                )}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    role="cell"
                    className={cn(
                      "min-w-0 text-sm text-gray-300",
                      column.cellClassName,
                    )}
                  >
                    {cellContent(column, row)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Celular y tablet: tarjetas */}
      <ul className="flex flex-col gap-3 lg:hidden" aria-label={label}>
        {data.map((row, index) => (
          <li key={getRowKey ? getRowKey(row, index) : index}>
            <div
              {...interactiveProps(row)}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4",
                onRowClick && "cursor-pointer active:bg-white/[0.05]",
              )}
            >
              {first && (
                <div className="min-w-0 text-sm text-gray-200">
                  {cellContent(first, row)}
                </div>
              )}
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
                {rest
                  .filter((column) => !column.hideOnMobile && column.header)
                  .map((column) => (
                    <React.Fragment key={column.key}>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        {column.header}
                      </dt>
                      <dd className="min-w-0 text-sm text-gray-300">
                        {cellContent(column, row)}
                      </dd>
                    </React.Fragment>
                  ))}
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
