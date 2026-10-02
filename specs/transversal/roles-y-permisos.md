# Roles, sesión y permisos

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Transversal | Todos (cada CU tiene su actor) | Todos los roles | E1, E2, E6 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Login** con email o DNI y contraseña. Haciendo **triple clic en "Ingresar"** aparece el acceso rápido por rol (demo).
- Cada rol entra **solo a sus pantallas**: `/admin`, `/encargado`, `/secretaria`, `/profesor` y `/alumno`. Si alguien escribe una URL de otro rol, ve "No tenés permiso", con un botón a su inicio.
- El menú de cada rol sale de una sola lista, y un test controla que cada ítem sea accesible para ese rol.
- **Dentro de la ficha del alumno**, cada rol hace solo lo suyo: secretaría edita, cobra y restringe; solo el admin da de baja; el encargado solo consulta.
- El encargado y la secretaría trabajan con **su sede**; el admin ve todas, con filtro.
- **Cerrar sesión:** una sola forma, desde el menú de usuario, con confirmación.

## Reglas

- La sesión mock guarda en el navegador **solo el id** del usuario. El rol, la sede y el vínculo con su alumno o profesor se leen siempre de `client/data/users.ts`, así no se pueden cambiar editando el navegador.
- Roles: `admin`, `encargado` (Adrián López en Centro, Susana García en Norte), `secretario`, `profesor` y `alumno`.

## Dónde está

| Parte | Ubicación |
|---|---|
| Login | `client/pages/Login.tsx` |
| Usuarios y sesión | `client/data/users.ts` (`getMockSession`, `saveMockSession`, `clearMockSession`, `getPostLoginPath`, `ROLE_LABELS`) |
| Control de rutas | `client/components/common/RequireAuth.tsx`, `client/App.tsx` |
| Permisos | `client/domain/permissions.ts` (`ROUTE_ROLES`, `canAccess`, `studentCapabilities`) |
| Menú | `client/data/navigation.ts`, `client/components/common/SidebarNav.tsx`, `client/components/common/HeaderNav.tsx`, `client/components/common/DashboardLayout.tsx` |
| Sin permiso | `client/pages/UnauthorizedAccess.tsx` |

## Cómo se verificó

- **Tests:** `client/domain/permissions.spec.ts` ("canAccess: cada rol entra solo a su sección", "coherencia entre permisos, inicio y menú", "permisos dentro de la ficha del alumno").
- **Navegador:** un alumno que escribe `/admin/alumnos` ve "No tenés permiso"; login de los 5 roles; acceso rápido con triple clic; cierre de sesión con confirmación.
- **Para probarlo a mano:** entrá como `alumno1@email.com` y escribí `/secretaria/cobros` en la barra de direcciones.
