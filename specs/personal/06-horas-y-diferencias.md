# Horas trabajadas y diferencias con el cronograma

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Personal | CU 6 y CU 10 | Profesor; Sistema (encargado y admin ven las diferencias) | E3, E12 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Mis horas (CU 6):** el profesor ve sus clases dictadas, su duración y los totales: horas dictadas contra programadas.
  - Períodos: esta semana, este mes o el mes anterior.
  - Filtros por sede y por clase.
  - Cantidad de alumnos por clase.
  - En el celular, la tabla pasa a tarjetas.
- **Diferencias (CU 10):**
  - el profesor ve un **aviso** cuando le faltan horas respecto del cronograma;
  - el encargado y el admin ven **"Horas por profesor"** en la semana de la sede, con una insignia cuando hay diferencia.
- Los reemplazos aceptados suman horas al reemplazante.

## Reglas

- Las horas salen del cronograma y de los registros de asistencia docente; no se cargan a mano.
- Se reemplazó la tabla fija (`horasMock`) que era igual para todos los profesores.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/profesor/horas`; `/encargado/asistencia` y `/admin/asistencia` (Horas por profesor) |
| Página | `client/pages/ProfesorHorasPage.tsx` |
| Componentes | `client/components/personal/hours/MyHours.tsx`, `client/components/personal/attendance/TeacherAttendanceBoard.tsx` |
| Reglas | `client/domain/hours.ts` (`getTeacherHours`, `summarizeTeacherSessions`), `client/domain/schedule.ts` |

## Cómo se verificó

- **Tests:** `client/domain/hours.spec.ts` ("horas trabajadas contra cronograma"), `client/domain/schedule.spec.ts`.
- **Navegador:** el profesor ve sus horas por período; al aceptar un reemplazo, la clase suma a sus horas; el encargado ve la insignia de diferencia.
- **Para probarlo a mano:** `profe1@squatgym.com` → "Mis horas".
