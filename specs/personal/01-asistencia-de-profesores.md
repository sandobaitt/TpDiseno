# Asistencia de profesores por turno

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Personal | CU 1, CU 2 y CU 3 | Secretaria, Encargado (consulta: Administrador) | E1, E11 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Registrar turnos (CU 1):** secretaría (pestaña "Profesores" de Asistencia) y el encargado ("Registrar turnos") ven los turnos del día según el **cronograma**, ya con los reemplazos aceptados. Cada turno se marca **Presente** o **Ausente** con motivo (enfermedad, trámite personal, problema de transporte u otro). Lo que ya confirmó el encargado no se puede tocar desde ahí.
- **Semana de la sede (CU 2):** el encargado ve lo **programado contra lo registrado**, con indicadores (dictadas, ausencias, sin registrar, para confirmar), filtros por profesor y por empleado o contratado, y **"Horas por profesor"**. Las semanas anteriores funcionan como **historial**.
- **Confirmar o corregir (CU 3):** solo el encargado. Confirma de a uno o todo junto ("Confirmar lo registrado"). La corrección pide **motivo obligatorio** y conserva el valor anterior. También puede cargar un turno que nadie registró (queda confirmado).
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
| Reglas | `client/domain/teacherAttendance.ts` (`shiftRows`, `shiftStats`, `SHIFT_STATE_LABELS`, `ABSENCE_REASONS`), `client/domain/schedule.ts` |
| Datos | `client/data/teacherAttendance.ts`, `client/data/teachers.ts`, `client/data/schedule.ts` |
| Store | `saveTeacherAttendance`, `confirmTeacherAttendance`, `confirmTeacherAttendanceMany`, `correctTeacherAttendance` |
| Aviso al encargado | `client/domain/notifications.ts` (`managerNotifications`: "turnos de profesores para confirmar") |

## Cómo se verificó

- **Tests:** `client/domain/teacherAttendance.spec.ts` ("turnos de profesores"), `client/domain/hours.spec.ts`.
- **Navegador:** secretaría registra turnos → cierra sesión → el encargado los ve "para confirmar", confirma todo y corrige uno con motivo; el admin ve las dos sedes sin botones.
- **Para probarlo a mano:** `encargado2@squatgym.com` → "Asistencia docente" → "Semana de la sede".
