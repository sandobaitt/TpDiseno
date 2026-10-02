# Reemplazos y avisos al profesor

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Personal | CU 7 y CU 8 | Sistema, Profesor | E1, E4, E5, E9, E12 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Aviso (CU 7):** al profesor le llega a la campana "Te pidieron un reemplazo", y también las novedades que lo involucran.
- **Confirmar o rechazar (CU 8):** en "Reemplazos", pestaña "Pendientes", el profesor acepta o rechaza; **pide confirmación** antes.
  - Al **aceptar**, la clase aparece en su cronograma con él como reemplazante y suma a sus horas ("Reemplazo aceptado: ya figura en tu cronograma.").
  - Al **rechazar**, la clase queda sin cubrir y al encargado de esa sede le llega "Reemplazo rechazado: la clase quedó sin cubrir".
- Pestaña **"Historial"** con lo ya respondido.
- El profesor ve **solo** sus solicitudes.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/profesor/reemplazos`, `/profesor/cronograma`; campanas del profesor y del encargado |
| Páginas | `client/pages/ProfesorReemplazosPage.tsx`, `client/pages/ProfesorCronogramaPage.tsx` |
| Calendario | `client/components/cronograma/UnifiedCalendar.tsx`, `ClassCard.tsx`, `weekView.ts` |
| Reglas | `client/domain/schedule.ts` (semana con reemplazos), `client/domain/notifications.ts` (`teacherNotifications`, `managerNotifications`) |
| Datos | `client/data/replacements.ts` |
| Store | `respondReplacement` |

## Cómo se verificó

- **Tests:** `client/domain/schedule.spec.ts` (reemplazo aceptado en la semana), `client/domain/notifications.spec.ts`, `client/store/reducer.spec.ts` ("otras acciones del store").
- **Navegador:** `profe1` rechaza un reemplazo con confirmación → cierra sesión → `encargado2` recibe el aviso. Aceptar uno lo agrega al cronograma del profesor.
- **Para probarlo a mano:** `profe1@squatgym.com` → "Reemplazos" → "Rechazar". Después entrá como `encargado2@squatgym.com` y abrí la campana.
