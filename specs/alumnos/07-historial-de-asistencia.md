# Historial de asistencia del alumno

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 7 | Alumno | E8 | ✅ Verificado (02/10/2026) |

## Qué hace

- El alumno ve **solo su** historial, mes por mes: fecha, clase, sede y estado.
- Los estados son **Asistió**, **Ausencia justificada** y **Ausencia sin justificar**, siempre con texto e ícono.
- Resumen del mes: asistencias, ausencias justificadas, ausencias sin justificar y porcentaje.
- Se puede **exportar a CSV** (abre bien en Excel, con tildes) o **imprimir**.
- En el celular, la tabla pasa a tarjetas.

## Dónde está

| Parte | Ubicación |
|---|---|
| Ruta | `/alumno` (Mi perfil y asistencia) |
| Página | `client/pages/AlumnoPanel.tsx` |
| Componente | `client/components/alumnos/student/MyAttendance.tsx` |
| Reglas | `client/domain/attendance.ts` (`summarizeAttendance`, `toCsv`, `ATTENDANCE_MARK_LABELS`) |
| Descarga | `client/lib/download.ts` |
| Store | selector `selectClientAttendance` |

## Cómo se verificó

- **Tests:** `client/domain/attendance.spec.ts` ("historial del alumno", "exportar a CSV").
- **Navegador:** el alumno ve su historial en PC y celular, cambia de mes y descarga el CSV. Lo que marca el profesor aparece en el historial del alumno.
- **Para probarlo a mano:** `alumno1@email.com` → "Mi perfil y asistencia".
