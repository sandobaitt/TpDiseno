# Alertas de vencimiento y centro de avisos del alumno

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 10 | Sistema | E9 | ✅ Verificado (02/10/2026) |

## Qué hace

- El sistema calcula los avisos del alumno a partir de su estado de cuenta:
  - "Tu cuota vence pronto" (días 1 a 5);
  - "Tenés una cuota vencida";
  - "Acceso suspendido por deuda".
- También avisa: restricción manual, DDJJ faltante, documento en revisión, pago registrado y mensajes de secretaría.
- Aparecen en la **campana** (contador discreto, sin ventanas que corten el trabajo) y en "Ajustes y alertas".
- Se pueden marcar como leídos.
- **Preferencias** (guardadas en el navegador): recibir por email, recordatorio de vencimiento y promociones.

## Reglas

- Los avisos no se guardan: se calculan, igual que el estado de cuenta. Lo único que se guarda es qué leyó cada usuario.
- Alertas no intrusivas: badge y lista, nunca un modal bloqueante.
- El email es simulado.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | Campana en todas las pantallas del alumno; `/alumno/ajustes` |
| Página | `client/pages/AlumnoAjustesPage.tsx` → `client/components/alumnos/student/MyAlerts.tsx` |
| Campana | `client/components/common/NotificationBell.tsx`, `client/hooks/use-notifications.ts` |
| Reglas | `client/domain/notifications.ts` (`studentNotifications`) |
| Preferencias | `client/hooks/use-stored-state.ts` |
| Store | `markNotificationsRead` |

## Cómo se verificó

- **Tests:** `client/domain/notifications.spec.ts` ("avisos del alumno (CU 10)").
- **Navegador:** `alumno2` (bloqueada) ve "Acceso suspendido por deuda"; al marcar como leído baja el contador; las preferencias se mantienen al volver a entrar.
- **Para probarlo a mano:** `alumno2@email.com` → campana.
