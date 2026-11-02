# Centro de avisos (campana) para todos los roles

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Transversal | Alumnos CU 10 y CU 14; Personal CU 7; requisitos 3.1.6c, 3.1.7c, 3.1.8, 3.1.16c, 3.1.17c y 3.1.20c | Sistema → todos los roles | E9, E12, E24 | ✅ Verificado (02/11/2026) |

## Qué hace

Una campana con contador discreto y lista de avisos, sin ventanas que corten el trabajo. Los avisos se **calculan** con los datos; solo se guarda qué leyó cada usuario.

| Rol | Qué le avisa |
|---|---|
| Alumno | Cuota por vencer, cuota vencida, acceso suspendido, restricción, DDJJ faltante, documento en revisión, pago registrado y mensajes de secretaría |
| Secretaría | Alumnos con la cuota vencida y bloqueados de su sede, documentos para revisar, novedades en curso, cambios en el cronograma (reemplazos confirmados y superposiciones) y alumnos con inasistencias frecuentes |
| Profesor | Reemplazos pedidos y novedades que lo involucran |
| Encargado | Novedades, reemplazos rechazados (clase sin cubrir) y confirmados, superposiciones, observaciones nuevas (de profesores y de secretaría), turnos para confirmar, ausencias de profesores sin justificar, alumnos con deuda, promociones vencidas o por vencer, alumnos con inasistencias frecuentes y datos para revisar en inscripciones y pagos |
| Admin | Novedades en curso y observaciones de secretaría que piden avisarle |

## Dónde está

| Parte | Ubicación |
|---|---|
| Campana | `client/components/common/NotificationBell.tsx` (en `HeaderNav`) |
| Hook | `client/hooks/use-notifications.ts` |
| Reglas | `client/domain/notifications.ts` (`studentNotifications`, `secretaryNotifications`, `teacherNotifications`, `managerNotifications`, `novedadNotifications`, `debtNotifications`, `scheduleNotifications`, `frequentAbsenceNotifications`, `promotionNotifications`, `teacherAbsenceNotifications`, `inconsistencyNotifications`, `observationNotifications`); umbrales en `client/data/rules.ts` (`FREQUENT_ABSENCES`, `FREQUENT_ABSENCES_WINDOW_DAYS`, `PROMO_EXPIRED_ALERT_DAYS`, `TEACHER_ABSENCE_ALERT_DAYS`) |
| Store | `markNotificationsRead` |

## Cómo se verificó

- **Tests:** `client/domain/notifications.spec.ts` (los grupos de avisos y "avisos nuevos para encargado y secretaría").
- La campana muestra hasta 15 avisos, primero los no leídos.
- **Navegador:** cada flujo entre roles terminó con el aviso en la campana del otro rol; "marcar como leído" baja el contador.
