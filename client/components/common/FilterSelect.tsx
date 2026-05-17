import * as React from "react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Option[];
}

export function FilterSelect({ value, onChange, placeholder, options }: FilterSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [alignRight, setAlignRight] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAlignRight(window.innerWidth - rect.left < 180);
    }
    setOpen((o) => !o);
  };

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer whitespace-nowrap",
          value
            ? "bg-lime-400/10 border-lime-400/40 text-lime-400"
            : "bg-neutral-900 border-white/[0.06] text-gray-500 hover:border-white/[0.12] hover:text-gray-300",
        )}
      >
        {selected?.label ?? placeholder}
        <i
          className={cn(
            "ti ti-chevron-down text-[10px] transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className={`absolute top-full mt-1.5 z-50 min-w-[152px] rounded-xl bg-neutral-900 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden py-1 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100 ${alignRight ? "right-0" : "left-0"}`}>
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={cn(
              "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
              !value
                ? "text-lime-400 bg-lime-400/10"
                : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300",
            )}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
                value === opt.value
                  ? "text-lime-400 bg-lime-400/10"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
