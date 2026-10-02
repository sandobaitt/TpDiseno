# Alta, baja y modificación de alumnos

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 11 | Administrador | E1, E4, E6, E10 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Lista de alumnos** con buscador (nombre, email o DNI, con o sin puntos) y filtros por estado, plan y sede.
- **Alta:** usa el mismo formulario de inscripción del CU 1.
- **Modificación:** "Editar datos" en la ficha, con las mismas validaciones (DNI y email sin duplicados, formatos).
- **Baja lógica:** pide motivo (se mudó, motivos económicos, de salud, se cambió de gimnasio u otro) y confirmación. El alumno queda **Inactivo** y conserva todo su historial.
- **Reactivación:** vuelve a activo.
- La ficha es **la misma** para secretaría y admin; lo que puede hacer cada rol sale de sus permisos.

## Reglas

- La baja la hace **solo el Administrador**, con confirmación. Nunca se borra un alumno.
- Al reactivar, **los meses de baja no se cobran** y el mes de regreso se cobra proporcional (confirmado por el grupo el 02/10/2026).
- Se quitó "Eliminar cuenta" del alumno.
- Toda modificación queda en el registro de actividad (quién, qué y cuándo).

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/admin/alumnos`, `/admin/alumnos/nuevo`, `/admin/alumnos/:clientId` |
| Páginas | `client/pages/AdminAlumnosPage.tsx`, `client/pages/AdminInscripcionPage.tsx`, `client/pages/AdminAlumnoPage.tsx` |
| Lista | `client/components/alumnos/StudentsDashboard.tsx` (`variant="admin"`), `StudentsTable.tsx`, `StudentStats.tsx` |
| Ficha | `client/components/alumnos/profile/StudentProfile.tsx`, `ProfileHeader.tsx`, `PersonalDataSection.tsx`, `StudentEditDialog.tsx`, `DeactivateDialog.tsx`, `HistorySection.tsx` |
| Permisos | `client/domain/permissions.ts` (`studentCapabilities`) |
| Reglas | `client/domain/enrollment.ts` (validaciones), `client/domain/billing.ts` (`inactivePeriods`) |
| Store | `updateClient`, `deactivateClient`, `reactivateClient` |

## Cómo se verificó

- **Tests:** `client/domain/billing.spec.ts` ("baja y reactivación"), `client/domain/permissions.spec.ts` ("permisos dentro de la ficha del alumno"), `client/store/reducer.spec.ts` ("otras acciones del store").
- **Navegador:** el admin da de baja con motivo → secretaría ve al alumno "Inactivo" → el admin lo reactiva y no le aparecen deudas por los meses de baja; alta desde el admin.
- **Para probarlo a mano:** `admin1@squatgym.com` → "Alumnos" → abrí una ficha → "Dar de baja".
