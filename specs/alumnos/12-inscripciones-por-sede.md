# Inscripciones y pagos por sede

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 12 y requisito 3.1.6 | Encargado | E2, E10, E24 | ✅ Verificado (02/11/2026) |

## Qué hace

- El encargado ve **solo su sede**: altas y bajas del mes elegido, con indicadores.
- **Gráfico de los últimos 6 meses**, con una tabla equivalente para lectores de pantalla.
- Inscripciones **por plan** del mes.
- **Detalle** de los alumnos inscriptos ese mes, con quién los inscribió.
- Pestaña **Pagos** (3.1.6a y b): los pagos registrados en la sede en el mes, con total cobrado, cantidad y cuántos tuvieron promoción; filtros por alumno, plan (tipo de actividad) y medio de pago; cada fila abre el recibo.
- Pestaña **Para revisar** (3.1.6c): inconsistencias o datos faltantes: DDJJ sin firmar, menor sin autorización, inscripción sin la cuota de alta pagada después del plazo, ficha sin celular, pago con descuento sin promoción o con un total que no cierra. Además le llega un aviso a la campana que abre esta pestaña.
- Es **solo de consulta**.

## Dónde está

| Parte | Ubicación |
|---|---|
| Ruta | `/encargado/inscripciones` (Inscripciones y pagos) |
| Página | `client/pages/EncargadoInscripcionesPage.tsx` |
| Componentes | `client/components/alumnos/BranchEnrollments.tsx`, `BranchPayments.tsx` |
| Reglas | `client/domain/enrollment.ts` (`branchEnrollmentHistory`, `branchInconsistencies`) |
| Sede del usuario | `client/data/users.ts` (`branchId` del encargado) |

## Cómo se verificó

- **Tests:** `client/domain/enrollment.spec.ts` ("inscripciones por sede (CU 12)", "inconsistencias de la sede (3.1.6c)").
- **Navegador (02/11/2026):** pestaña Pagos con el total del mes y quién registró cada pago; en Norte, "Para revisar" muestra la inscripción de Malena Acosta sin el alta pagada.
- **Navegador:** `encargado1` (Centro) y `encargado2` (Norte) ven datos distintos; un alumno recién inscripto suma en el mes actual.
- **Para probarlo a mano:** `encargado2@squatgym.com` → "Inscripciones y pagos" → pestañas Pagos y Para revisar.
