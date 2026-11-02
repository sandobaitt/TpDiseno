# Observaciones de jornada y de turno

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Personal | CU 9 y requisito 3.1.16 | Profesor y Secretaria (las leen el encargado y el admin) | E8, E12, E13, E24 | ✅ Verificado (02/11/2026) |

## Qué hace

- El profesor anota una observación con **título**, **clase** (y su fecha), **alumno** opcional y el **texto**.
- Tiene **borrador**.
- El **encargado** de esa sede la ve en "Observaciones" y le llega un aviso a la campana. El **admin** ve las de todas las sedes.
- **Secretaría (3.1.16)** carga observaciones de **turno** desde su menú "Observaciones" → "Nueva observación": turno (mañana, tarde o noche), **área** (recepción, sala, vestuarios…), **persona** opcional (un profesor o un alumno), título y texto, con borrador. Le llega al encargado de la sede y, si se marca "Avisarle también al administrador", también al admin.
- Es la misma pantalla para todos: secretaría y el encargado ven las de su sede (de profesores y de secretaría); el admin, todas.
- Filtros por sede (admin), origen (profesores o secretaría), profesor y fechas.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | Profesor: `/profesor/asistencia` (panel Observaciones). Secretaría: `/secretaria/observaciones`. Lectura: `/encargado/observaciones`, `/admin/observaciones` |
| Páginas | `client/pages/ProfesorAsistenciaPage.tsx`, `client/pages/ObservacionesPage.tsx` |
| Componentes | `client/components/personal/observations/ObservationsPanel.tsx`, `ObservationsBoard.tsx`, `ShiftObservationForm.tsx`, `classLabel.ts` |
| Datos | `client/data/bitacoras.ts` (`SHIFT_LABELS`, `OBSERVATION_AREAS`) |
| Store | `addBitacora` |
| Aviso | `client/domain/notifications.ts` (`observationNotifications`: "Observación de …", para el encargado y, las que lo piden, para el admin) |

## Cómo se verificó

- **Tests:** `client/domain/notifications.spec.ts` ("avisos de novedades y del encargado (CU 7 de Personal)").
- **Navegador:** el profesor carga una observación → el encargado de esa sede la ve y recibe el aviso; borrador recuperado tras recargar.
- **Navegador (02/11/2026):** secretaría cargó "Falta papel en el baño de mujeres" avisando al admin → le llegó al encargado de Centro y al admin.
- **Para probarlo a mano:** `profe1@squatgym.com` → "Asistencia y alumnos" → Observaciones; `secre1@squatgym.com` → "Observaciones" → "Nueva observación".
