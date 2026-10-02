# Observaciones de jornada

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Personal | CU 9 | Profesor (las leen el encargado y el admin) | E8, E12, E13 | ✅ Verificado (02/10/2026) |

## Qué hace

- El profesor anota una observación con **título**, **clase** (y su fecha), **alumno** opcional y el **texto**.
- Tiene **borrador**.
- El **encargado** de esa sede la ve en "Observaciones" y le llega un aviso a la campana. El **admin** ve las de todas las sedes.
- Filtros por sede (admin), profesor y fechas. Es solo consulta.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | Profesor: `/profesor/asistencia` (panel Observaciones). Lectura: `/encargado/observaciones`, `/admin/observaciones` |
| Páginas | `client/pages/ProfesorAsistenciaPage.tsx`, `client/pages/ObservacionesPage.tsx` |
| Componentes | `client/components/personal/observations/ObservationsPanel.tsx`, `ObservationsBoard.tsx`, `classLabel.ts` |
| Datos | `client/data/bitacoras.ts` |
| Store | `addBitacora` |
| Aviso | `client/domain/notifications.ts` (`managerNotifications`: "Observación de …") |

## Cómo se verificó

- **Tests:** `client/domain/notifications.spec.ts` ("avisos de novedades y del encargado (CU 7 de Personal)").
- **Navegador:** el profesor carga una observación → el encargado de esa sede la ve y recibe el aviso; borrador recuperado tras recargar.
- **Para probarlo a mano:** `profe1@squatgym.com` → "Asistencia y alumnos" → Observaciones.
