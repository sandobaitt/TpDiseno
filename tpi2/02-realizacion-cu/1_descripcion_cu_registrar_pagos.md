# Descripción de Caso de Uso: Registrar Pagos

* **Actores:** Secretaria.
* **Actor externo:** La Entidad Bancaria participa como actor externo cuando el medio de pago es digital (camino alternativo 10.a).
* **CU incluido:** Emitir Recibos (se describe más abajo).
* **CU que lo extiende:** Aplicar Promociones (se describe más abajo).
* **Precondiciones:** La secretaria se encuentra autenticada en el sistema y el alumno se encuentra inscripto en el sistema.
* **Postcondiciones:** El pago quedó registrado, se emite comprobante y el estado de cuenta del alumno se actualizó.

---

### Camino Estándar

El camino estándar se describe con pago con tarjeta de débito y con una promoción aplicada al total.

| Paso | Acción / Proceso |
| :---: | :--- |
| **1** | La secretaria selecciona la opción para registrar el pago de cuotas. |
| **2** | El sistema solicita el DNI o el nombre del alumno. |
| **3** | La secretaria ingresa el DNI o nombre del alumno. |
| **4** | El sistema busca al alumno y muestra su estado de cuenta: las cuotas adeudadas y las próximas a vencer, con su importe y su vencimiento. Solicita las cuotas a pagar. |
| **5** | La secretaria selecciona las cuotas a pagar. |
| **6** | El sistema calcula el monto total de las cuotas seleccionadas y solicita el medio de pago (efectivo, tarjeta de débito, transferencia o QR). |
| **7** | La secretaria selecciona tarjeta de débito como medio de pago y solicita aplicar una promoción. |
| **8** | El sistema ejecuta el caso de uso *Aplicar Promociones* (extend), recalcula el monto total con el descuento y muestra el resumen del cobro (alumno, cuotas, monto total y medio de pago). |
| **9** | La secretaria confirma la operación. |
| **10** | El sistema solicita validación del pago a la Entidad Bancaria. |
| **11** | La Entidad Bancaria valida el pago. |
| **12** | El sistema registra el pago de las cuotas seleccionadas (con la fecha, el monto y el medio de pago, junto con la secretaria que cobra), actualiza el estado de cuenta del alumno, emite el recibo digital (*incluye Emitir Recibos*) e informa que el pago quedó registrado. |

---

### Caminos Alternativos

#### 7.a La secretaria no solicita aplicar ninguna promoción
1. El sistema muestra el resumen del cobro (alumno, cuotas, monto total sin descuento y medio de pago).
2. Retoma en el paso 9.

#### 11.b La Entidad Bancaria rechaza el pago
1. El sistema informa que el pago fue rechazado y el motivo informado por la entidad. No registra el pago.
2. Retoma en el paso 6.

---
---

# Descripción de Caso de Uso incluido: Emitir Recibos

* **Actor:** Secretaria
* **Precondiciones:** La secretaria se encuentra autenticada en el sistema y el pago se encuentra registrado en el sistema.
* **Postcondición:** Queda emitido el recibo digital del pago, con la fecha, el monto y el medio de pago.
* **Cuando lo incluye Registrar Pagos** (paso 12), no hay intervención del actor: el sistema recibe el pago ya registrado y realiza la emisión del paso 2. El recibo se muestra a la secretaria al informar que el pago quedó registrado.

---

### Camino Estándar

| Paso | Acción / Proceso |
| :---: | :--- |
| **1** | La secretaria solicita el recibo de un pago registrado. |
| **2** | El sistema genera el recibo digital con su número, la fecha, el alumno, las cuotas pagadas, el monto total, la promoción, el medio de pago y la secretaria que cobró, y lo muestra. |

---

### Caminos Alternativos

#### 2.a El actor solicita imprimir el recibo
1. El sistema entrega el recibo para su impresión.
2. Fin del caso de uso.

---
---

# Descripción de Caso de Uso que extiende: Aplicar Promociones

* **Actor:** Secretaria
* **Extiende a:** Registrar Pagos, en el paso 7 (cuando la secretaria solicita aplicar una promoción o un cupón).
* **Precondiciones:**
  * La secretaria se encuentra autenticada en el sistema.
  * Hay un pago en curso, con las cuotas y el medio de pago seleccionados.
* **Postcondición:** El pago en curso queda con la promoción aplicada y el monto total recalculado con el descuento.

---

### Camino Estándar

| Paso | Acción / Proceso |
| :---: | :--- |
| **1** | El sistema muestra las promociones vigentes, indicando para cada una si corresponde al pago en curso y, si no corresponde, el motivo. Solicita la promoción a aplicar. |
| **2** | La secretaria selecciona una promoción. |
| **3** | El sistema calcula el descuento, recalcula el monto total e informa el nuevo monto. |

---

### Caminos Alternativos

#### 1.a No hay promociones vigentes
1. El sistema informa que no hay promociones vigentes.
2. Retoma en el paso 3.

> **Regla del negocio:** se aplica una sola promoción por cobro. Cada promoción tiene su vigencia y sus condiciones, que configura el administrador.
