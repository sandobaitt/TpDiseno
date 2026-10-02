import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Nombre accesible (lo leen los lectores de pantalla). */
  label: string;
  className?: string;
}

/** Buscador con ícono y botón para limpiar. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  label,
  className,
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "relative min-w-[200px] flex-1 sm:max-w-[320px]",
        className,
      )}
    >
      <i
        className="ti ti-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full rounded-xl border border-white/[0.07] bg-neutral-900 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-primary/40 focus:ring-1 focus:ring-primary/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-white"
        >
          <i className="ti ti-x text-xs" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
