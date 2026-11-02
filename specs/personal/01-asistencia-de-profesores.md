# Asistencia de profesores por turno

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Personal | CU 1, CU 2 y CU 3 (requisito 3.1.7) | Secretaria, Encargado (consulta: Administrador) | E1, E11, E24 | ✅ Verificado (02/11/2026) |

## Qué hace

- **Registrar turnos (CU 1):** secretaría (pestaña "Profesores" de Asistencia) y el encargado ("Registrar turnos") ven los turnos del día según el **cronograma**, ya con los reemplazos aceptados. Cada turno se marca **Presente** o **Ausente** con motivo (enfermedad, trámite personal, problema de transporte u otro). Lo que ya confirmó el encargado no se puede tocar desde ahí.
- **Semana de la sede (CU 2):** el encargado ve lo **programado contra lo registrado**, con indicadores (dictadas, ausencias, sin registrar, para confirmar), filtros por profesor y por empleado o contratado, y **"Horas por profesor"**. Las semanas anteriores funcionan como **historial**.
- **Confirmar o corregir (CU 3):** solo el encargado. Confirma de a uno o todo junto ("Confirmar lo registrado"). La corrección pide **motivo obligatorio** y conserva el valor anterior. También puede cargar un turno que nadie registró (queda confirmado).
- **Ausencia sin justificar (3.1.7c):** al marcar "Ausente", el motivo arranca en "Sin justificar"; si hay motivo, se elige. Las ausencias sin justificar de la última semana le llegan al encargado de la sede como aviso.
- **Admin:** consulta todas las sedes, sin acciones.

## Reglas

- Hay un profesor por turno y sede; todos son profesores, empleados o contratados.
- Cada registro, confirmación y corrección guarda quién y cuándo.
- El encargado ve solo **su** sede.
- Para la demo, los turnos de anoche desde las 18 quedan "Sin registrar".

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/secretaria/asistencia` (pestaña Profesores), `/encargado/asistencia`, `/admin/asistencia` |
| Páginas | `client/pages/AttendancePage.tsx`, `client/pages/EncargadoAsistenciaPage.tsx`, `client/pages/AdminAsistenciaPage.tsx` |
| Componentes | `client/components/personal/attendance/ShiftRegister.tsx`, `ManagerAttendance.tsx`, `TeacherAttendanceBoard.tsx`, `CorrectShiftDialog.tsx` |
| Reglas | `client/domain/teacherAttendance.ts` (`shiftRows`, `shiftStats`, `SHIFT_STATE_LABELS`, `ABSENCE_REASONS`, `NO_REASON`, `unjustifiedTeacherAbsences`), `client/domain/schedule.ts` |
| Datos | `client/data/teacherAttendance.ts`, `client/data/teachers.ts`, `client/data/schedule.ts` |
| Store | `saveTeacherAttendance`, `confirmTeacherAttendance`, `confirmTeacherAttendanceMany`, `correctTeacherAttendance` |
| Aviso al encargado | `client/domain/notifications.ts` (`managerNotifications`: "turnos de profesores para confirmar"; `teacherAbsenceNotifications`: "Ausencia de un profesor sin justificar") |

## Cómo se verificó

- **Tests:** `client/domain/teacherAttendance.spec.ts` ("turnos de profesores", "ausencias de profesores sin justificar (3.1.7c)"), `client/domain/hours.spec.ts`.
- **Navegador (02/11/2026):** secretaría marcó a Tomás Ibáñez "Ausente" sin justificar → al encargado de Centro le llegó "Ausencia de un profesor sin justificar".
- **Navegador:** secretaría registra turnos → cierra sesión → el encargado los ve "para confirmar", confirma todo y corrige uno con motivo; el admin ve las dos sedes sin botones.
- **Para probarlo a mano:** `encargado2@squatgym.com` → "Asistencia docente" → "Semana de la sede".
