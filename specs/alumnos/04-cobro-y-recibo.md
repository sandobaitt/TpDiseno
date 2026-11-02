# Cobro de cuotas y recibo digital

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 4 (Registrar Pagos del TPI 2) | Secretaria (y el alumno, con pago online); Entidad Bancaria como actor externo | E1, E4, E7, E9, E24 | ✅ Verificado (02/11/2026) |

## Qué hace

- Secretaría cobra desde **Cobros**, desde la **ficha** o desde **Control de acceso**, siempre con el mismo diálogo.
- Elige las **cuotas una por una** con una casilla cada una (las impagas aparecen primero y marcadas; se pueden adelantar hasta 6 meses con "Ver más meses para adelantar"), el **medio de pago** y, si corresponde, una **promoción o cupón**.
- Muestra el resumen y pide confirmación.
- **Entidad Bancaria:** con débito, transferencia o QR, al confirmar aparece "Validando el pago con la entidad bancaria…" y la entidad aprueba o rechaza. Con efectivo no pasa por el banco.
  - **Aprobado:** se registra el pago y se emite el **recibo digital** (número, fecha, alumno, cuotas, descuento con el nombre de la promoción, monto, medio y quién cobró), que se puede ver o imprimir.
  - **Rechazado** (camino 11.b): se informa el motivo, el pago **no** se registra, la deuda sigue igual y se vuelve a elegir el medio. Queda en el historial de la ficha. Para la demo, la casilla "Simular que la entidad rechaza el pago (DEMO)" fuerza el rechazo.
- El estado del alumno cambia en el momento en todas las pantallas; si estaba bloqueado, queda habilitado.
- **Cobros** muestra la lista ordenada por urgencia, el total adeudado, lo cobrado hoy y la pestaña "Pagos de hoy".
- El alumno puede pagar online desde "Pagos" (sin efectivo), con las mismas promociones y la misma validación bancaria.

## Reglas

- **Sin recargos ni intereses** por mora.
- Medios aceptados: efectivo, tarjeta de débito, transferencia y QR (`PAYMENT_METHOD_LABELS`). El pago online no ofrece efectivo.
- Pide confirmación antes de registrar el pago y después muestra el recibo en lugar del formulario, así no se cobra dos veces por error.
- Queda registrado quién cobró, qué y cuándo; también los pagos que rechazó la entidad.
- Coincide con la realización de Registrar Pagos del TPI 2 (`tpi2/02-realizacion-cu/`): selección de cuotas de a una, medio de pago, Aplicar Promociones (extend), resumen, confirmación, validación de la Entidad Bancaria y Emitir Recibos (include).

## Dónde está

| Parte | Ubicación |
|---|---|
| Rutas | `/secretaria/cobros`, ficha `/secretaria/alumnos/:clientId`, `/secretaria/acceso`, `/alumno/pagos` |
| Páginas | `client/pages/PaymentsPage.tsx`, `client/pages/AlumnoPagosPage.tsx` |
| Cobro | `client/components/alumnos/payments/CheckoutDialog.tsx`, `CheckoutPanel.tsx` (`MAX_ADVANCE` = 6), `ChargesPicker.tsx`, `PaymentMethodPicker.tsx`, `PromotionPicker.tsx` |
| Recibo | `client/components/alumnos/payments/ReceiptDetails.tsx`, `ReceiptDialog.tsx` (clase `print-area` para imprimir solo el recibo) |
| Lista de cobros | `client/components/alumnos/payments/CollectionsBoard.tsx` |
| Reglas | `client/domain/billing.ts` (`upcomingCharges`, `getAccountSummary`), `client/domain/bank.ts` (`needsBankValidation`, `validateWithBank`), `client/data/rules.ts` (`BANK_VALIDATION_MS`) |
| Datos | `client/data/payments.ts` (`PAYMENT_METHOD_LABELS`) |
| Store | `registerPayment`, `rejectPayment` |

## Cómo se verificó

- **Tests:** `client/store/reducer.spec.ts` ("flujo conectado: pago → estado de cuenta → habilitación"), `client/domain/billing.spec.ts` ("cuotas por adelantado"), `client/domain/bank.spec.ts` ("validación con la entidad bancaria").
- **Navegador:** cobro desde Cobros, desde la ficha y desde Control de acceso; el recibo muestra fecha, monto, medio y quién cobró; el alumno bloqueado pasa a "Habilitado".
- **Navegador (02/11/2026):** a Malena Acosta se le desmarcó una cuota (queda "1 cuota elegida"), se cobró con Débito simulando el rechazo (no se registró y volvió al cobro) y después se aprobó (recibo con "La entidad bancaria aprobó el pago").
- **Para probarlo a mano:** `secre1@squatgym.com` → "Cobros y facturación" → cobrá a Laura Gómez con efectivo → mirá el recibo.
