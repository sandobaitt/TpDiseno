import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { plansMock } from "@/data/plans";
import { branchesMock } from "@/data/branches";
import { getMockSession } from "@/data/users";
import {
  ENROLLMENT_STEPS,
  buildClientFromDraft,
  emptyEnrollment,
  firstInvalidStep,
  validateEnrollmentStep,
  type EnrollmentDraft,
  type FieldErrors,
} from "@/domain/enrollment";
import { useDraft } from "@/hooks/use-draft";
import { nowISO, todayISO } from "@/lib/dates";
import { useAppState, useStoreActions } from "@/store/StoreProvider";
import type { StudentProfileLocationState } from "@/components/alumnos/profile/StudentProfile";
import { StepIndicator } from "./StepIndicator";
import { PersonalStep } from "./PersonalStep";
import { ContactStep } from "./ContactStep";
import { HealthStep } from "./HealthStep";
import { PlanStep } from "./PlanStep";
import { SummaryStep } from "./SummaryStep";

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: "Nombre, DNI y fecha de nacimiento. Si es menor, los datos del adulto responsable.",
  2: "Cómo contactarlo y a quién llamar en una emergencia.",
  3: "Declaración jurada de salud. Completala junto con el alumno.",
  4: "Qué plan contrata, en qué sede y desde cuándo.",
  5: "Revisá los datos antes de registrar la inscripción.",
};

interface EnrollmentFormProps {
  /** Lista de alumnos (cancelar vuelve acá; la ficha es `${basePath}/${id}`). */
  basePath: string;
  /** Ofrecer "Registrar e ir a cobrar" (solo si el rol cobra cuotas). */
  offerCollect?: boolean;
}

/**
 * Inscripción de un alumno (CU 1) en 5 pasos. Lo cargado se guarda como
 * borrador en el navegador: si se corta el Wi-Fi o se sale, no se pierde.
 */
export function EnrollmentForm({
  basePath,
  offerCollect = false,
}: EnrollmentFormProps) {
  const state = useAppState();
  const actions = useStoreActions();
  const navigate = useNavigate();
  const session = getMockSession();
  const today = todayISO();

  const plans = React.useMemo(
    () => plansMock.filter((p) => p.status === "active"),
    [],
  );
  const branches = React.useMemo(
    () => branchesMock.filter((b) => b.status === "active"),
    [],
  );
  const draft = useDraft<EnrollmentDraft>(
    "inscripcion_alumno",
    emptyEnrollment(session?.branchId ?? branches[0].id, today),
  );
  const form = draft.value;
  const [errors, setErrors] = React.useState<FieldErrors<EnrollmentDraft>>({});
  const [leaveOpen, setLeaveOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const firstRender = React.useRef(true);

  const ctx = {
    clients: state.clients,
    planIds: plans.map((p) => p.id),
    branchIds: branches.map((b) => b.id),
    today,
  };

  function set<K extends keyof EnrollmentDraft>(
    key: K,
    value: EnrollmentDraft[K],
  ) {
    draft.setValue((d) => ({ ...d, [key]: value }));
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  function goTo(step: number, stepErrors: FieldErrors<EnrollmentDraft> = {}) {
    draft.setValue((d) => ({ ...d, step }));
    setErrors(stepErrors);
  }

  // Al cambiar de paso, el foco va al título (teclado y lectores de pantalla).
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [form.step]);

  // Si hay errores, el foco va al primer campo marcado.
  React.useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    contentRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [errors]);

  function next() {
    const stepErrors = validateEnrollmentStep(form.step, form, ctx);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    goTo(form.step + 1);
  }

  function register(goCollect: boolean) {
    const invalid = firstInvalidStep(form, ctx);
    if (invalid) {
      goTo(invalid, validateEnrollmentStep(invalid, form, ctx));
      toast.error("Revisá los datos marcados antes de registrar.");
      return;
    }
    const client = buildClientFromDraft(form, {
      id: `cl_${Date.now().toString(36)}`,
      now: nowISO(),
      userId: session?.id ?? "sistema",
    });
    actions.registerClient(client);
    draft.clear();
    toast.success(`Inscripción de ${client.fullName} registrada.`);
    const navState: StudentProfileLocationState = { openCheckout: goCollect };
    navigate(`${basePath}/${client.id}`, { state: navState });
  }

  function leave() {
    if (draft.isDirty) setLeaveOpen(true);
    else navigate(basePath);
  }

  const stepInfo = ENROLLMENT_STEPS.find((s) => s.id === form.step)!;
  const stepProps = { draft: form, errors, set };

  return (
    <div className="flex flex-col gap-6 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Inscribir alumno"
        subtitle="Lo que cargás se guarda solo como borrador en este equipo hasta que registres la inscripción."
        actions={
          <Button asChild variant="ghost" className="rounded-xl text-gray-300">
            <Link to={basePath}>
              <i className="ti ti-arrow-left text-base" aria-hidden="true" />
              Volver a alumnos
            </Link>
          </Button>
        }
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        {draft.restored && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-warning/25 bg-warning/5 px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-gray-200">
              <i
                className="ti ti-history text-base text-warning"
                aria-hidden="true"
              />
              Recuperamos una inscripción que quedó sin terminar.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                draft.clear();
                setErrors({});
              }}
              className="rounded-lg text-warning hover:text-warning"
            >
              Empezar de cero
            </Button>
          </div>
        )}

        <StepIndicator current={form.step} onGoTo={(step) => goTo(step)} />

        <div
          ref={contentRef}
          className="flex flex-col gap-5 rounded-2xl bg-neutral-900 p-6 shadow-card glass-border max-sm:p-4"
        >
          <div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-lg font-extrabold text-white outline-none"
            >
              {form.step}. {stepInfo.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {STEP_DESCRIPTIONS[form.step]}
            </p>
          </div>

          {form.step === 1 && (
            <PersonalStep
              {...stepProps}
              clients={state.clients}
              profilePath={(id) => `${basePath}/${id}`}
            />
          )}
          {form.step === 2 && (
            <ContactStep {...stepProps} clients={state.clients} />
          )}
          {form.step === 3 && <HealthStep {...stepProps} />}
          {form.step === 4 && (
            <PlanStep {...stepProps} plans={plans} branches={branches} />
          )}
          {form.step === 5 && (
            <SummaryStep
              draft={form}
              plans={plans}
              branches={branches}
              onEditStep={(step) => goTo(step)}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={form.step === 1 ? leave : () => goTo(form.step - 1)}
              className="rounded-xl"
            >
              {form.step === 1 ? "Cancelar" : "Anterior"}
            </Button>

            {form.step < ENROLLMENT_STEPS.length ? (
              <Button
                type="button"
                onClick={next}
                className="rounded-xl font-bold"
              >
                Siguiente
                <i className="ti ti-arrow-right text-base" aria-hidden="true" />
              </Button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={offerCollect ? "outline" : "default"}
                  onClick={() => register(false)}
                  className="rounded-xl font-bold"
                >
                  <i className="ti ti-user-plus text-base" aria-hidden="true" />
                  Registrar inscripción
                </Button>
                {offerCollect && (
                  <Button
                    type="button"
                    onClick={() => register(true)}
                    className="rounded-xl font-bold"
                  >
                    <i className="ti ti-cash text-base" aria-hidden="true" />
                    Registrar e ir a cobrar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="¿Salir de la inscripción?"
        description="Lo que cargaste queda guardado como borrador en este equipo. Cuando vuelvas a «Inscribir alumno», vas a poder seguir donde quedaste."
        confirmLabel="Salir y guardar borrador"
        cancelLabel="Seguir completando"
        onConfirm={() => navigate(basePath)}
        iconClassName="ti ti-device-floppy"
      />
    </div>
  );
}
