import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Texto de la opción "todos" (valor vacío). */
  placeholder: string;
  options: Option[];
}

const ALL = "__todos__";

/** Filtro desplegable accesible (teclado y lectores de pantalla), basado en el Select de Radix. */
export function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: FilterSelectProps) {
  return (
    <Select
      value={value || ALL}
      onValueChange={(v) => onChange(v === ALL ? "" : v)}
    >
      <SelectTrigger
        aria-label={placeholder}
        className={cn(
          "h-10 w-auto min-w-[140px] gap-2 rounded-xl text-xs font-semibold",
          value
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-white/[0.07] bg-neutral-900 text-gray-300",
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-white/[0.08] bg-neutral-900 text-gray-200">
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
