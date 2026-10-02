import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  /** Recibe el id que hay que poner en el control (así el label queda asociado). */
  children: (id: string, describedBy?: string) => React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

/** Campo de formulario: label asociado, ayuda y error en línea (claro y accesible). */
export function FormField({
  label,
  children,
  hint,
  error,
  required,
  className,
}: FormFieldProps) {
  const id = React.useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-xs font-semibold text-gray-300">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children(id, describedBy)}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1 text-xs font-medium text-danger"
          role="alert"
        >
          <i className="ti ti-alert-circle text-sm" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Clases comunes para inputs, selects y textareas de formularios. */
export const inputClasses =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30 aria-[invalid=true]:border-danger/60";
