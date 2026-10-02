# Datos de demo y reglas configurables

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Transversal | Todos | — | E1, E3 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Datos coherentes** relacionados por id: 2 sedes activas (y una inactiva, que no aparece en los filtros), actividades, planes (con las actividades que habilitan), 7 profesores (empleados y contratados), 22 clases semanales con sede y profesor, 18 alumnos, pagos, asistencias, reemplazos, novedades y observaciones.
- **Fechas relativas a hoy:** cualquier día que se abra la demo hay alumnos al día, por vencer, deudores y bloqueados.
- **Reglas configurables** en un solo archivo, sin números repetidos en el código.
- Se pueden sumar sedes sin rediseñar: las sedes son un dato.

## Reglas configurables (`client/data/rules.ts`)

| Constante | Valor | Para qué |
|---|---|---|
| `PAYMENT_DUE_DAY` | 5 | Día de vencimiento de la cuota |
| `ENROLLMENT_GRACE_DAYS` | 5 | Días para pagar la cuota de alta |
| `DEBT_BLOCK_DAYS` | 15 | Días de atraso desde el vencimiento para bloquear |
| `ADULT_AGE` | 18 | Desde qué edad no pide adulto responsable |
| `MAX_ATTACHMENT_MB` | 5 | Tamaño máximo de un adjunto |
| `DEMO_TODAY` | `null` | Fija el "hoy" de la demo (por ejemplo, `"2026-10-15"` para la presentación) |

## Dónde está

| Parte | Ubicación |
|---|---|
| Generador de fechas | `client/data/seed.ts` |
| Datos | `client/data/` (`branches.ts`, `activities.ts`, `plans.ts`, `teachers.ts`, `schedule.ts`, `clients.ts`, `payments.ts`, `attendance.ts`, `teacherAttendance.ts`, `replacements.ts`, `novedades.ts`, `bitacoras.ts`, `communications.ts`, `promotions.ts`, `users.ts`) |
| Fechas en hora local | `client/lib/dates.ts` (`todayISO` respeta `DEMO_TODAY`; nunca `toISOString()` para fechas sin hora) |

## Cómo se verificó

- **Tests:** `client/data/data.spec.ts` ("los datos de demo son coherentes entre sí", "la demo siempre muestra cada situación de cuenta (cualquier día)", "compatibilidad con el panel del admin (otro grupo)"), `client/lib/dates.spec.ts` ("fechas en hora local").
