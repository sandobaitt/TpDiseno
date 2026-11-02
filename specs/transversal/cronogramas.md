# Cronogramas de la sede (secretaría)

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos y de Personal | Requisito 3.1.17 (CU del TPI 2: Consultar Cronograma, extendido por Consultar Detalle de Clase) | Secretaria | E24 | ✅ Verificado (02/11/2026) |

## Qué hace

- La semana de clases con **horario, profesor, sede y cupo** de cada una, ya con los reemplazos aplicados (3.1.17a).
- Filtros por **sede** (arranca en la de la secretaria; se puede mirar la otra, porque los alumnos van a cualquier sede), **profesor** y **actividad**, y navegación por semanas: es la **disponibilidad por día y sede** (3.1.17b).
- Indicadores: clases de la semana, horas, cambios y superposiciones.
- Panel **Cambios y superposiciones de la semana** (3.1.17c):
  - **superposición:** un profesor con dos clases que se pisan el mismo día (por ejemplo, si aceptó un reemplazo a la hora de una clase suya); la tarjeta de la clase también lo marca;
  - **reemplazo confirmado** o **pendiente** de respuesta;
  - **cambio de turno** cargado como novedad.
- Tocar una clase abre su **detalle** (Consultar Detalle de Clase): día, horario, duración, sede, profesor (y a quién reemplaza), cupo, cuántos alumnos la tienen en su plan, asistencia registrada y las novedades de ese día.
- Los cambios y las superposiciones también le llegan a secretaría y al encargado por la campana.
- Al profesor, antes de aceptar un reemplazo que se pisa con una clase suya, se le avisa en la confirmación.

## Dónde está

| Parte | Ubicación |
|---|---|
| Ruta | `/secretaria/cronograma` (menú "Cronogramas") |
| Página | `client/pages/SecretariaCronogramaPage.tsx` |
| Componentes | `client/components/cronograma/StaffSchedule.tsx`, `ClassCard.tsx`, `UnifiedCalendar.tsx`, `weekView.ts` |
| Reglas | `client/domain/schedule.ts` (`sessionsBetween`, `findOverlaps`) |
| Avisos | `client/domain/notifications.ts` (`scheduleNotifications`) |
| Aviso al profesor | `client/pages/ProfesorReemplazosPage.tsx` |

## Cómo se verificó

- **Tests:** `client/domain/schedule.spec.ts` ("superposiciones del cronograma").
- **Navegador (02/11/2026):** el profesor aceptó el reemplazo de HIIT del viernes en Norte (a esa hora tiene Musculación en Centro) y el diálogo le avisó la superposición. Después, en Cronogramas de secretaría aparecieron la superposición en el panel y en la tarjeta, y el aviso en la campana de secretaría y del encargado. El detalle de una clase mostró sede, duración, profesor, cupo, alumnos con la clase en su plan y asistencia.
- **Para probarlo a mano:** `profe1@squatgym.com` → "Reemplazos" → aceptá el HIIT del viernes → cerrá sesión → `secre1@squatgym.com` → "Cronogramas".
