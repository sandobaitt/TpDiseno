# Centro de avisos (campana) para todos los roles

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Transversal | Alumnos CU 10 y CU 14; Personal CU 7 | Sistema → todos los roles | E9, E12 | ✅ Verificado (02/10/2026) |

## Qué hace

Una campana con contador discreto y lista de avisos, sin ventanas que corten el trabajo. Los avisos se **calculan** con los datos; solo se guarda qué leyó cada usuario.

| Rol | Qué le avisa |
|---|---|
| Alumno | Cuota por vencer, cuota vencida, acceso suspendido, restricción, DDJJ faltante, documento en revisión, pago registrado y mensajes de secretaría |
| Secretaría | Alumnos con la cuota vencida y bloqueados de su sede, documentos para revisar y novedades en curso |
| Profesor | Reemplazos pedidos y novedades que lo involucran |
| Encargado | Novedades, reemplazos rechazados (clase sin cubrir), observaciones nuevas y turnos de profesores para confirmar |
| Admin | Novedades en curso |

## Dónde está

| Parte | Ubicación |
|---|---|
| Campana | `client/components/common/NotificationBell.tsx` (en `HeaderNav`) |
| Hook | `client/hooks/use-notifications.ts` |
| Reglas | `client/domain/notifications.ts` (`studentNotifications`, `secretaryNotifications`, `teacherNotifications`, `managerNotifications`, `novedadNotifications`) |
| Store | `markNotificationsRead` |

## Cómo se verificó

- **Tests:** `client/domain/notifications.spec.ts` (los 4 grupos de avisos).
- **Navegador:** cada flujo entre roles terminó con el aviso en la campana del otro rol; "marcar como leído" baja el contador.
