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
          className={`${template} gap-4 pb-3 mb-1 border-b border-stone-900`}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={`min-w-0 text-xs font-semibold tracking-widest text-gray-500 uppercase ${
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
                className={`${template} gap-4 items-center py-3.5 border-b border-stone-900 ${rowClassName} ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`min-w-0 text-sm text-gray-400 ${
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
