import * as React from "react";
import { cn } from "@/lib/utils";

export interface DetailItem {
  label: string;
  value: React.ReactNode;
  icon?: string;
}

interface DetailListProps {
  items: DetailItem[];
  /** En pantallas medianas o más grandes, muestra los datos en dos columnas. */
  twoColumns?: boolean;
  className?: string;
}

/** Lista de datos "Rótulo: valor" (fichas, recibos, resúmenes). */
export function DetailList({ items, twoColumns, className }: DetailListProps) {
  return (
    <dl
      className={cn(
        "grid gap-x-6",
        twoColumns ? "sm:grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start gap-3 border-b border-white/[0.05] py-3"
        >
          {item.icon && (
            <i
              className={cn("ti mt-0.5 text-base text-gray-400", item.icon)}
              aria-hidden="true"
            />
          )}
          <div className="min-w-0 flex-1">
            <dt className="text-xs font-semibold text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-white">
              {item.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
