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
            : "bg-app-bg border-app-border/[0.06] text-app-subtle hover:border-app-border/[0.12] hover:text-app-muted",
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
        <div className={`absolute top-full mt-1.5 z-50 min-w-[152px] rounded-xl bg-app-bg border border-app-border/[0.08] shadow-dropdown overflow-hidden py-1 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100 ${alignRight ? "right-0" : "left-0"}`}>
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={cn(
              "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
              !value
                ? "text-lime-400 bg-lime-400/10"
                : "text-app-subtle hover:bg-app-hover/[0.04] hover:text-app-muted",
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
                  : "text-app-muted hover:bg-app-hover/[0.04] hover:text-app-text",
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
