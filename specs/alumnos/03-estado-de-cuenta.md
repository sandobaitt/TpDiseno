# Estado de cuenta

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 3 | Alumno, Secretaria | E3, E7, E9, E10 | ✅ Verificado (02/10/2026) |

## Qué hace

Muestra, para cada alumno:
- **estado:** Al día, Por vencer, Deudor, Bloqueado o Inactivo, siempre con texto e ícono;
- **monto adeudado** y **fecha límite**;
- cuotas mes por mes (la de alta, proporcional) y **recibos** de los pagos hechos.

## Reglas

- **Nunca se guarda:** se calcula desde los pagos cada vez, así no queda desactualizado.
- La cuota vence el día `PAYMENT_DUE_DAY` (5). **Sin intereses ni recargos.**
- Por vencer: días 1 a 5 sin pagar. Deudor: con atraso. Bloqueado: con `DEBT_BLOCK_DAYS` (15) días de atraso desde el vencimiento.
- Los meses en que el alumno estuvo de baja no se cobran (`inactivePeriods`); el mes de regreso es proporcional.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | Alumno: `/alumno/pagos`. Secretaría: ficha `/secretaria/alumnos/:clientId` (Resumen y Pagos) y `/secretaria/cobros` |
| Pantallas | `client/components/alumnos/student/MyAccount.tsx`, `client/components/alumnos/profile/AccountCard.tsx`, `client/components/alumnos/profile/PaymentsSection.tsx`, `client/components/alumnos/payments/CollectionsBoard.tsx` |
| Estado visual | `client/components/common/AccountStatusBadge.tsx` |
| Reglas | `client/domain/billing.ts` (`getAccountSummary`, `dueDateFor`, `proratedAmount`, `describeAccount`, `ACCOUNT_STATUS_LABELS`) |
| Constantes | `client/data/rules.ts` (`PAYMENT_DUE_DAY`, `DEBT_BLOCK_DAYS`) |
| Store | selector `selectAccount` en `client/store/selectors.ts` |

## Cómo se verificó

- **Tests:** `client/domain/billing.spec.ts` ("vencimientos", "estado de cuenta", "baja y reactivación"), `client/data/data.spec.ts` ("la demo siempre muestra cada situación de cuenta (cualquier día)").
- **Navegador:** el alumno ve su deuda y fecha límite; al cobrarle, pasa a "Al día" en todas las pantallas.
- **Para probarlo a mano:** `alumno2@email.com` (Laura, bloqueada) → "Pagos": monto adeudado y fecha límite.
