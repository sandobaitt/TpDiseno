# Gestión de personal

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Personal | Requisito 3.1.1 (altas, bajas y modificaciones de usuarios) | Administrador | E10, E24 | ✅ Verificado (02/11/2026) |

## Qué es

- Lista del personal administrativo (secretaría y encargados) con buscador, filtro por cargo y ficha.
- **Alta** ("Dar de alta"), **modificación** (nombre, email, DNI, **cargo** y sede) y **baja lógica** con confirmación (se puede reactivar).
- Valida el formato del DNI y del email, y que no se repitan dentro del personal.
- Cada alta, cambio o baja queda en el **registro de actividad** y se ve en "Historial de cambios" de la ficha (3.1.1c).
- Los alumnos se administran desde su propio menú (CU 11).

## Dónde está

| Parte | Ubicación |
|---|---|
| Ruta | `/admin/personal` |
| Página | `client/pages/AdminPersonalPage.tsx` |
| Componente | `client/components/personal/StaffDirectory.tsx` |
| Reglas | `client/domain/staff.ts` (`validateEmployee`) |
| Datos | `client/data/employees.ts` (semilla del store) |
| Store | `registerEmployee`, `updateEmployee`, `setEmployeeStatus` |

## Cómo se verificó

- **Tests:** `client/domain/staff.spec.ts` ("validación del personal (3.1.1)").
- **Navegador (02/11/2026):** alta de "Lucía Benítez" con un email repetido (avisa "ya lo usa otra persona") y después con uno nuevo; su ficha muestra "Dio de alta a Lucía Benítez en el personal".
- **Para probarlo a mano:** `admin1@squatgym.com` → "Gestión de personal" → "Dar de alta".
