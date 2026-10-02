import type { EnrollmentDraft, FieldErrors } from "@/domain/enrollment";

/** Lo que recibe cada paso del formulario de inscripción. */
export interface StepProps {
  draft: EnrollmentDraft;
  errors: FieldErrors<EnrollmentDraft>;
  set: <K extends keyof EnrollmentDraft>(
    key: K,
    value: EnrollmentDraft[K],
  ) => void;
}
