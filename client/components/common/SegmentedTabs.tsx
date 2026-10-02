import { cn } from "@/lib/utils";

export interface SegmentedTabItem<T extends string> {
  id: T;
  label: string;
  icon?: string;
  count?: number;
}

interface SegmentedTabsProps<T extends string> {
  items: SegmentedTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Nombre accesible del grupo de pestañas. */
  label: string;
  className?: string;
}

/** Pestañas accesibles (rol tablist) con contador opcional. */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-transparent text-gray-400 hover:bg-white/[0.04] hover:text-gray-200",
            )}
          >
            {item.icon && (
              <i className={cn("ti text-base", item.icon)} aria-hidden="true" />
            )}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                  active
                    ? "bg-primary/20 text-primary"
                    : "bg-zinc-800 text-gray-400",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
