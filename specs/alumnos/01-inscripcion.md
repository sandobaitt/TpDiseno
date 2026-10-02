# Inscripción de alumnos

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 1 (y alta del CU 11) | Secretaria, Administrador | E1, E6, E13 | ✅ Verificado (02/10/2026) |

## Qué hace

Registra a un alumno nuevo en **5 pasos**:
1. **Datos personales:** nombre, DNI y fecha de nacimiento. Si es **menor de 18**, pide un adulto responsable (nombre, DNI, vínculo, teléfono) y la autorización firmada adjunta.
2. **Contacto:** email, celular y contacto de emergencia.
3. **Salud (DDJJ):** peso, estatura, condiciones, antecedentes, aceptación de la declaración y certificado opcional.
4. **Plan y sede:** plan, sede (por defecto, la de la secretaria) y fecha de inicio.
5. **Confirmar:** resumen y **cuota de alta proporcional**. Ofrece "Registrar" o "Registrar e ir a cobrar".

## Reglas

- **Sin duplicados:** avisa apenas se escribe un DNI o un email que ya existe. Si es el DNI, ofrece un link a la ficha de ese alumno.
- **Validación por paso:** no deja avanzar con errores, y cada error se muestra junto a su campo.
- **Prorrateo:** el mes de alta se cobra proporcional a los días que quedan; hay `ENROLLMENT_GRACE_DAYS` (5) para pagarlo.
- **Inicio:** la fecha de inicio puede ser hasta 60 días adelante (`MAX_START_DAYS_AHEAD`).
- **Adjuntos:** PDF, JPG o PNG de hasta `MAX_ATTACHMENT_MB` (5 MB).
- **Borrador:** lo cargado se guarda en el navegador y sobrevive a una recarga o a un corte de Wi-Fi.
- **Registro de actividad:** queda quién inscribió y cuándo (`createdBy`).

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/secretaria/alumnos/nuevo`, `/admin/alumnos/nuevo` |
| Páginas | `client/pages/SecretariaInscripcionPage.tsx`, `client/pages/AdminInscripcionPage.tsx` |
| Formulario | `client/components/alumnos/enrollment/EnrollmentForm.tsx` (pasos: `PersonalStep`, `ContactStep`, `HealthStep`, `PlanStep`, `SummaryStep`; `StepIndicator`, `EnrollmentChargeBox`) |
| DDJJ compartida | `client/components/alumnos/health/HealthDeclarationFields.tsx` |
| Reglas | `client/domain/enrollment.ts` (`findClientByDni`, `findClientByEmail`, `isMinor`, `validateEnrollmentStep`, `enrollmentCharge`, `buildClientFromDraft`), `client/domain/billing.ts` (`proratedAmount`) |
| Constantes | `client/data/rules.ts` (`ADULT_AGE`, `ENROLLMENT_GRACE_DAYS`, `MAX_ATTACHMENT_MB`) |
| Archivos | `client/lib/files.ts` (`checkDocumentFile`), `client/components/common/FileUpload.tsx` |
| Store | `registerClient` en `client/store/StoreProvider.tsx` |
| Borrador | `client/hooks/use-draft.ts` (`useDraft`) |

## Cómo se verificó

- **Tests:** `client/domain/enrollment.spec.ts` ("duplicados (CU 1)", "validación por pasos", "cuota de alta proporcional", "armado del alumno"), `client/domain/billing.spec.ts` ("prorrateo del mes de alta"), `client/lib/files.spec.ts`.
- **Navegador (PC y celular):** inscripción completa de un adulto y de un menor; aviso de DNI repetido; borrador recuperado después de recargar; "Registrar e ir a cobrar" abre la ficha con el cobro listo.
- **Para probarlo a mano:** entrá como `secre1@squatgym.com`, "Inscribir alumno", escribí el DNI `38123456` (ya existe) y mirá el aviso. Poné una fecha de nacimiento de menor y aparece el adulto responsable.
