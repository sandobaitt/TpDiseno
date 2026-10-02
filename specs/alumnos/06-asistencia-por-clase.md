# Asistencia de alumnos por clase y sede

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 6 | Secretaria, Profesor | E1, E8 | ✅ Verificado (02/10/2026) |

## Qué hace

- Secretaría elige **día, sede y clase** del cronograma. El profesor ve **solo sus clases** (incluidos los reemplazos que aceptó).
- La lista trae a los alumnos activos cuyo plan incluye esa actividad (primero los de esa sede), con buscador.
- Cada alumno se marca **Presente**, **Ausente** o **Justificada**. También está "Marcar presentes a los habilitados".
- Los **bloqueados** aparecen marcados y no se pueden poner presentes.
- Al guardar queda "Último registro: quién y cuándo". Avisa si hay cambios sin guardar.
- Se puede **corregir hasta 30 días atrás**; el registro dice "Corrigió".

## Reglas

- La asistencia se toma por clase porque cada plan habilita ciertas actividades.
- Verificación de acceso compartida con el CU 13 (`checkAccess`).
- `ATTENDANCE_CORRECTION_DAYS` = 30.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/secretaria/asistencia` (pestaña "Alumnos por clase"), `/profesor/asistencia` |
| Páginas | `client/pages/AttendancePage.tsx`, `client/pages/ProfesorAsistenciaPage.tsx` |
| Componentes | `client/components/alumnos/attendance/SecretaryAttendance.tsx`, `TeacherClassAttendance.tsx`, `ClassRoster.tsx`, `SessionSummary.tsx` |
| Reglas | `client/domain/attendance.ts` (`classRoster`, `markOf`, `ATTENDANCE_CORRECTION_DAYS`), `client/domain/schedule.ts` (`sessionsBetween`), `client/domain/access.ts` |
| Datos | `client/data/schedule.ts`, `client/data/attendance.ts` |
| Store | `saveAttendance` |

## Cómo se verificó

- **Tests:** `client/domain/attendance.spec.ts` ("lista de una clase"), `client/domain/schedule.spec.ts` ("cronograma semanal").
- **Navegador:** secretaría marca y guarda una clase; corrige un día anterior; el profesor toma asistencia desde el celular; un bloqueado no se puede marcar presente.
- **Nota:** la pantalla elige sola la próxima clase del día. Si en esa lista no hay ningún bloqueado, elegí otra clase u otro día para ver el aviso "no se puede marcar presente".
- **Para probarlo a mano:** `profe1@squatgym.com` → "Asistencia y alumnos".
