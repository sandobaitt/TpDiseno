# Inscripciones por sede

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 12 | Encargado | E2, E10 | ✅ Verificado (02/10/2026) |

## Qué hace

- El encargado ve **solo su sede**: altas y bajas del mes elegido, con indicadores.
- **Gráfico de los últimos 6 meses**, con una tabla equivalente para lectores de pantalla.
- Inscripciones **por plan** del mes.
- **Detalle** de los alumnos inscriptos ese mes, con quién los inscribió.
- Es **solo de consulta**.

## Dónde está

| Parte | Ubicación |
|---|---|
| Ruta | `/encargado/inscripciones` (Inscripciones de mi sede) |
| Página | `client/pages/EncargadoInscripcionesPage.tsx` |
| Componente | `client/components/alumnos/BranchEnrollments.tsx` |
| Reglas | `client/domain/enrollment.ts` (`branchEnrollmentHistory`) |
| Sede del usuario | `client/data/users.ts` (`branchId` del encargado) |

## Cómo se verificó

- **Tests:** `client/domain/enrollment.spec.ts` ("inscripciones por sede (CU 12)").
- **Navegador:** `encargado1` (Centro) y `encargado2` (Norte) ven datos distintos; un alumno recién inscripto suma en el mes actual.
- **Para probarlo a mano:** `encargado1@squatgym.com` → "Inscripciones de mi sede".
