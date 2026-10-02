# Restricción por deuda y verificación de habilitación

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 5 y CU 13 | Sistema, Secretaria | E3, E7, E8 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Bloqueo automático (CU 5):** con 15 días de atraso desde el vencimiento, el alumno queda "Bloqueado" y no puede ingresar.
- **Restricción manual (CU 5):** desde la ficha, secretaría puede restringir el acceso con un **motivo obligatorio**, y levantarla después. En la lista se ve como "Restringido".
- **Control de acceso (CU 13):** secretaría busca por **DNI** (el resultado sale solo al completar el número) o por nombre, y puede elegir una clase de hoy. El resultado se ve en grande, con texto e ícono:
  - Habilitado;
  - Bloqueado por deuda (con monto y botón **Cobrar**);
  - Acceso restringido (con el motivo);
  - Clase no incluida en su plan;
  - Alumno dado de baja o sin plan.
- Muestra los **últimos controles** hechos.
- La **misma verificación** se aplica al tomar asistencia: un alumno bloqueado no se puede marcar presente.

## Reglas

- `DEBT_BLOCK_DAYS` (15) está en un solo lugar (`client/data/rules.ts`).
- Se puede entrar si la cuota no está bloqueada, no hay restricción manual y, si se eligió una clase, está incluida en el plan.
- Los alumnos pueden ir a **cualquier sede**.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/secretaria/acceso`; ficha `/secretaria/alumnos/:clientId` (tarjeta "Habilitación") |
| Página | `client/pages/SecretariaAccesoPage.tsx` |
| Control de acceso | `client/components/alumnos/access/AccessControl.tsx`, `AccessResult.tsx` |
| Ficha | `client/components/alumnos/profile/AccessCard.tsx`, `RestrictDialog.tsx` |
| Reglas | `client/domain/access.ts` (`checkAccess`) |
| Store | `restrictClient`, `unrestrictClient`; selectores `selectAccess`, `selectLastAccess` |

## Cómo se verificó

- **Tests:** `client/domain/access.spec.ts` ("habilitación para ingresar"), `client/store/reducer.spec.ts` ("flujo conectado: pago → estado de cuenta → habilitación").
- **Navegador:** DNI `38123456` → "Bloqueado por deuda" → Cobrar → "Habilitado"; restricción manual con motivo visible en la lista; probado también en celular.
- **Para probarlo a mano:** `secre1@squatgym.com` → "Control de acceso" → escribí `38123456`.
