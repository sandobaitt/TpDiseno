import { ENROLLMENT_STEPS } from "@/domain/enrollment";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  current: number;
  /** Volver a un paso anterior (los siguientes se habilitan al validar). */
  onGoTo: (step: number) => void;
}

/** Pasos de la inscripción: hechos, actual y pendientes. */
export function StepIndicator({ current, onGoTo }: StepIndicatorProps) {
  const currentStep = ENROLLMENT_STEPS.find((s) => s.id === current);
  return (
    <nav aria-label="Pasos de la inscripción" className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-muted-foreground sm:hidden">
        Paso {current} de {ENROLLMENT_STEPS.length}: {currentStep?.label}
      </p>
      <ol className="flex items-center gap-1.5">
        {ENROLLMENT_STEPS.map((step, index) => {
          const done = step.id < current;
          const active = step.id === current;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-1.5",
                index < ENROLLMENT_STEPS.length - 1 && "flex-1",
              )}
            >
              <button
                type="button"
                onClick={() => onGoTo(step.id)}
                disabled={!done}
                aria-current={active ? "step" : undefined}
                aria-label={`Paso ${step.id}: ${step.label}${done ? " (completo)" : ""}`}
                className="flex shrink-0 items-center gap-2 rounded-lg p-1 disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    done && "bg-primary text-primary-foreground",
                    active &&
                      "border-2 border-primary bg-primary/15 text-primary",
                    !done &&
                      !active &&
                      "border border-zinc-700 bg-zinc-800 text-gray-400",
                  )}
                >
                  {done ? (
                    <i className="ti ti-check text-sm" aria-hidden="true" />
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-semibold lg:block",
                    active ? "text-primary" : "text-gray-400",
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < ENROLLMENT_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px flex-1",
                    done ? "bg-primary/50" : "bg-zinc-800",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
