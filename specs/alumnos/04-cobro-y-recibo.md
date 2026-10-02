# Cobro de cuotas y recibo digital

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 4 | Secretaria (y el alumno, con pago online) | E1, E4, E7, E9 | ✅ Verificado (02/10/2026) |

## Qué hace

- Secretaría cobra desde **Cobros**, desde la **ficha** o desde **Control de acceso**, siempre con el mismo diálogo.
- Elige **cuántas cuotas** (de la más vieja a la más nueva, con hasta 6 por adelantado), el **medio de pago** y, si corresponde, una **promoción o cupón**.
- Pide confirmación y emite un **recibo digital** (número, fecha, alumno, cuotas, monto, medio y quién cobró) que se puede ver o imprimir.
- El estado del alumno cambia en el momento en todas las pantallas; si estaba bloqueado, queda habilitado.
- **Cobros** muestra la lista ordenada por urgencia, el total adeudado, lo cobrado hoy y la pestaña "Pagos de hoy".
- El alumno puede pagar online desde "Pagos" (sin efectivo).

## Reglas

- **Sin recargos ni intereses** por mora.
- Medios aceptados: efectivo, tarjeta de débito, transferencia y QR (`PAYMENT_METHOD_LABELS`). El pago online no ofrece efectivo.
- Pide confirmación antes de registrar el pago y después muestra el recibo en lugar del formulario, así no se cobra dos veces por error.
- Queda registrado quién cobró, qué y cuándo.

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/secretaria/cobros`, ficha `/secretaria/alumnos/:clientId`, `/secretaria/acceso`, `/alumno/pagos` |
| Páginas | `client/pages/PaymentsPage.tsx`, `client/pages/AlumnoPagosPage.tsx` |
| Cobro | `client/components/alumnos/payments/CheckoutDialog.tsx`, `CheckoutPanel.tsx` (`MAX_ADVANCE` = 6), `ChargesPicker.tsx`, `PaymentMethodPicker.tsx`, `PromotionPicker.tsx` |
| Recibo | `client/components/alumnos/payments/ReceiptDetails.tsx`, `ReceiptDialog.tsx` (clase `print-area` para imprimir solo el recibo) |
| Lista de cobros | `client/components/alumnos/payments/CollectionsBoard.tsx` |
| Reglas | `client/domain/billing.ts` (`upcomingCharges`, `getAccountSummary`) |
| Datos | `client/data/payments.ts` (`PAYMENT_METHOD_LABELS`) |
| Store | `registerPayment` |

## Cómo se verificó

- **Tests:** `client/store/reducer.spec.ts` ("flujo conectado: pago → estado de cuenta → habilitación"), `client/domain/billing.spec.ts` ("cuotas por adelantado").
- **Navegador:** cobro desde Cobros, desde la ficha y desde Control de acceso; el recibo muestra fecha, monto, medio y quién cobró; el alumno bloqueado pasa a "Habilitado".
- **Para probarlo a mano:** `secre1@squatgym.com` → "Cobros y facturación" → cobrá a Laura Gómez con efectivo → mirá el recibo.
