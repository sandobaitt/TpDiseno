# Novedades internas

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Personal | CU 4 y CU 5 | Encargado, Secretaria (historial: Administrador) | E3, E5, E12, E13 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Registrar (CU 4):** tipos **Ausencia**, **Incidente**, **Cambio de turno** y **General**. Se vinculan a un **profesor o una clase** de la sede. Sede y autor se completan solos; fecha y hora arrancan en "ahora".
- "Avisarle al profesor": la novedad le aparece en su campana.
- **Historial (CU 5):** filtros por tipo, estado, fechas y, para el admin, sede. Mensaje claro si no hay resultados.
- "Marcar resuelta" (botón visible, también en el celular).
- **No se borran:** se **anulan con motivo** y quedan en el historial.
- El formulario tiene **borrador**.

## Reglas

- El encargado y la secretaría ven solo su sede; el admin ve todas.
- La semilla usa solo los tipos y estados que conoce el panel del admin (otro grupo); un test lo controla. Ese panel no muestra las ausencias, y se deja así por decisión del grupo.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/encargado/novedades`, `/secretaria/novedades`, `/admin/novedades` |
| Página | `client/pages/NovedadesPage.tsx` |
| Componentes | `client/components/personal/novedades/NovedadesBoard.tsx`, `NovedadForm.tsx`, `NovedadesHistory.tsx` |
| Datos | `client/data/novedades.ts` (`NOVEDAD_TYPE_LABELS`, `NOVEDAD_STATUS_LABELS`) |
| Store | `addNovedad`, `resolveNovedad`, `annulNovedad` |
| Avisos | `client/domain/notifications.ts` (`novedadNotifications`, `teacherNotifications`) |

## Cómo se verificó

- **Tests:** `client/domain/notifications.spec.ts` ("avisos de novedades y del encargado (CU 7 de Personal)"), `client/data/data.spec.ts` ("compatibilidad con el panel del admin (otro grupo)"), `client/store/reducer.spec.ts`.
- **Navegador:** el encargado registra una ausencia de `profe2` con aviso → `profe2` la ve en su campana; anulación con motivo; filtros; borrador recuperado.
- **Para probarlo a mano:** `encargado1@squatgym.com` → "Novedades" → registrá una novedad sobre Micaela Sosa con "Avisarle al profesor". Después entrá como `profe2@squatgym.com`.
