# Plan contratado y cronograma

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 8 | Alumno | E1, E3, E8 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Tarjeta del plan:** nombre, precio y actividades que incluye.
- **Cronograma de la semana real**, con navegación entre semanas.
- Las clases incluidas en su plan aparecen **resaltadas**; las demás, marcadas "No incluida".
- Filtro por **sede** y la opción "Ver solo las clases de mi plan".
- Muestra los reemplazos: si otro profesor cubre la clase, figura el reemplazante.
- Se sacó "Reservar clase", que no estaba en ningún CU.

## Dónde está

| Parte | Ubicación |
|---|---|
| Ruta | `/alumno/cronograma` (Mi plan y cronograma) |
| Página | `client/pages/AlumnoCronogramaPage.tsx` |
| Componente | `client/components/alumnos/student/MyPlanSchedule.tsx` |
| Calendario compartido | `client/components/cronograma/UnifiedCalendar.tsx`, `DayColumn.tsx`, `ClassCard.tsx`, `weekView.ts`; `client/components/common/WeekNavigator.tsx` |
| Reglas | `client/domain/schedule.ts` (`weekDates`, `sessionsBetween`) |
| Datos | `client/data/plans.ts` (actividades de cada plan), `client/data/schedule.ts`, `client/data/activities.ts`, `client/data/branches.ts` |

## Cómo se verificó

- **Tests:** `client/domain/schedule.spec.ts` ("cronograma semanal", incluye el reemplazo aceptado).
- **Navegador:** el alumno ve su plan y las clases resaltadas, filtra por sede y cambia de semana, en PC y celular.
- **Para probarlo a mano:** `alumno1@email.com` → "Mi plan y cronograma".
