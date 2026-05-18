// DataTable.tsx
import * as React from "react";

interface DataTableColumn<T> {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  gridTemplateClass: string;
  minWidthClass?: string;
  rowClassName?: string;
  getRowKey?: (row: T, index: number) => React.Key;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  gridTemplateClass,
  minWidthClass = "min-w-0",
  rowClassName = "",
  getRowKey,
  onRowClick,
}: DataTableProps<T>) {
  const template = `grid ${gridTemplateClass}`;

  return (
    <div className="w-full overflow-x-auto lg:overflow-visible">
      <div className={minWidthClass}>
        {/* HEADER */}
        <header
          className={`${template} gap-4 pb-3 mb-1 border-b border-app-border/[0.06]`}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={`min-w-0 text-[11px] font-semibold tracking-widest text-app-subtle uppercase ${
                column.headerClassName ?? ""
              }`}
            >
              {column.header}
            </div>
          ))}
        </header>

        {/* ROWS */}
        <div className="flex flex-col">
          {data.map((row, index) => {
            const key = getRowKey ? getRowKey(row, index) : index;

            return (
              <div
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`${template} gap-4 items-center py-3.5 border-b border-app-border/[0.04] transition-colors duration-100 ${onRowClick ? "hover:bg-app-hover/[0.025] cursor-pointer" : ""} ${rowClassName}`}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`min-w-0 text-sm text-app-muted ${
                      column.cellClassName ?? ""
                    }`}
                  >
                    {column.render
                      ? column.render(row)
                      : (row as any)[column.key]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
