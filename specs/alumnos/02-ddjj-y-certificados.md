# Declaración jurada de salud y certificados

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 2 | Alumno (y secretaría, que revisa) | E6, E9, E13 | ✅ Verificado (02/10/2026) |

## Qué hace

- El alumno completa o actualiza su **DDJJ de salud** desde la app, con el **mismo formulario** que la inscripción.
- Puede **adjuntar certificados** (apto médico u otros). Quedan "Pendiente de revisión".
- Secretaría recibe un aviso en la campana, abre la ficha y lo marca como **revisado**.
- El legajo del alumno muestra qué le falta (DDJJ, certificado, autorización si es menor).

## Reglas

- Formatos PDF, JPG o PNG de hasta 5 MB; si no cumple, se explica por qué.
- El alumno no puede marcar como revisado su propio documento.
- La DDJJ tiene borrador, también en el diálogo de edición.
- Archivos simulados: se guarda nombre, tamaño, quién lo subió y quién lo revisó (no el archivo real).

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | Alumno: `/alumno` (Mi perfil y asistencia). Secretaría: ficha `/secretaria/alumnos/:clientId`, pestaña "Salud y documentos" |
| Pantalla del alumno | `client/pages/AlumnoPanel.tsx` → `client/components/alumnos/student/MyHealth.tsx` |
| Formulario | `client/components/alumnos/health/HealthDeclarationFields.tsx`, `client/components/alumnos/health/HealthEditDialog.tsx` |
| Ficha (secretaría) | `client/components/alumnos/profile/HealthSection.tsx`, `client/components/alumnos/profile/AttachmentDialog.tsx`, `client/components/alumnos/profile/RecordChecklistCard.tsx` |
| Reglas | `client/domain/enrollment.ts` (`validateHealth`, `getRecordChecklist`), `client/lib/files.ts` |
| Datos | `client/data/clients.ts` (`Attachment`, `ATTACHMENT_KIND_LABELS`, `ATTACHMENT_STATUS_LABELS`), `client/data/health.ts` |
| Store | `saveHealth`, `addAttachment`, `reviewAttachment` |
| Avisos | `client/domain/notifications.ts` (`studentNotifications`: "Completá tu declaración jurada de salud", "Tu documento está en revisión"; `secretaryNotifications`: "Documento para revisar") |

## Cómo se verificó

- **Tests:** `client/domain/enrollment.spec.ts` ("estado del legajo"), `client/domain/notifications.spec.ts` ("avisos del alumno (CU 10)", "avisos de secretaría y profesor"), `client/lib/files.spec.ts`.
- **Navegador:** el alumno sube un certificado → cierra sesión → secretaría ve el aviso, abre la ficha y lo marca revisado. También se probó un archivo de 6 MB (rechazado) y uno `.docx` (rechazado).
- **Para probarlo a mano:** `alumno1@email.com` → "Mi perfil y asistencia" → subí un PDF. Cerrá sesión (sin recargar) y entrá como `secre1@squatgym.com`: la campana muestra "Documento para revisar".
