# Promociones y descuentos

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Alumnos | CU 9 | Secretaria, Administrador | E7, E16 | ✅ Verificado (02/10/2026) |

## Qué hace

Al cobrar se puede aplicar **una** promoción:
- **promos vigentes:** pago en efectivo, alumno con más de un año, cuota semestral, promo de temporada, etc.;
- **plan familiar:** si otro integrante de la familia está activo;
- **cupones con código:** por ejemplo `TRAEUNAMIGO`. Un cupón vencido (`INVIERNO`) se rechaza y se dice por qué.

Cada promo que no aplica aparece deshabilitada **con el motivo**, por ejemplo "Solo pagando en efectivo.", "Pide 12 meses de antigüedad (tiene 3)." o "Venció el …".

## Reglas

- **Una por cobro, no se acumulan** (confirmado por el grupo el 02/10/2026).
- Cada promo tiene vigencia y condiciones: medio de pago, antigüedad mínima, cantidad de cuotas, familiar o solo para la cuota de alta.
- Si cambian las condiciones (por ejemplo, de efectivo a QR), el descuento se quita solo.
- La **configuración** de promociones es del módulo de Finanzas (otro grupo). `client/data/promotions.ts` usa los mismos ids (dc1…dc5) que su lista. El panel del admin todavía usa su propia lista, y se deja así por decisión del grupo.

## Dónde está

| Parte | Ubicación |
|---|---|
| Dónde se usa | Diálogo de cobro (Cobros, ficha, Control de acceso) |
| Componente | `client/components/alumnos/payments/PromotionPicker.tsx`, `CheckoutPanel.tsx` |
| Reglas | `client/domain/promotions.ts` (`checkPromotion`, `promotionDiscount`, `findCoupon`, `listedPromotions`, `isPromotionCurrent`) |
| Datos | `client/data/promotions.ts` |

## Cómo se verificó

- **Tests:** `client/domain/promotions.spec.ts` ("condiciones de las promociones", "cupones y lista").
- **Navegador:** cobro con "Pago en efectivo" (10 %); al pasar a QR la promo se deshabilita con su motivo; cupón válido e inválido.
- **Para probarlo a mano:** cobrá a cualquier deudor y escribí el cupón `TRAEUNAMIGO`, y después `INVIERNO`.
