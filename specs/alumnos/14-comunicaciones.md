# Comunicaciones a alumnos

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 14 | Secretaria | E9, E13 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Plantillas:** vencimiento de cuota, cambio de clase, promoción y mensaje libre.
- **Destinatarios:** todos, una sede, un plan, los que están por vencer, los deudores o un alumno puntual. Muestra la cantidad y una vista previa antes de enviar.
- `{nombre}` se reemplaza por el nombre de cada alumno (mensaje personalizado).
- Opción de enviar también por email (simulado).
- Pide confirmación antes de enviar. El mensaje llega a la **campana** de cada alumno.
- **Historial** de lo enviado, con los destinatarios.
- Tiene **borrador**.

## Dónde está

| Parte | Ubicación |
|---|---|
| Ruta | `/secretaria/comunicaciones` |
| Página | `client/pages/SecretariaComunicacionesPage.tsx` |
| Componentes | `client/components/alumnos/communications/CommunicationsCenter.tsx`, `ComposeMessage.tsx`, `MessageHistory.tsx` |
| Reglas | `client/domain/communications.ts` (`resolveAudience`, `personalize`, `firstName`) |
| Datos | `client/data/communications.ts` (plantillas y mensajes de ejemplo) |
| Store | `sendCommunication` |
| Llega al alumno | `client/domain/notifications.ts` (`studentNotifications`) |

## Cómo se verificó

- **Tests:** `client/domain/notifications.spec.ts` ("comunicaciones (CU 14)").
- **Navegador:** secretaría envía un mensaje a un alumno → cierra sesión → el alumno lo recibe en la campana con su nombre.
- **Para probarlo a mano:** `secre1@squatgym.com` → "Comunicaciones" → destinatarios "Un alumno en particular" → Martín Rodríguez. Después entrá como `alumno1@email.com`.
