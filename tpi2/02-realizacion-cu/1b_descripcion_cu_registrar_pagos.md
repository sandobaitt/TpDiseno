# Descripción de Caso de Uso: Registrar Pagos

* **Actores:** Secretaria. La Entidad Bancaria participa como actor externo cuando el medio de pago es digital (camino alternativo 10.a).
* **CU incluido:** Emitir Recibos (se describe más abajo).
* **CU que lo extiende:** Aplicar Promociones (se describe más abajo).
* **Precondiciones:**
  * La secretaria se encuentra autenticada en el sistema.
  * El alumno se encuentra inscripto en el sistema.
* **Postcondiciones:**
  * Las cuotas cobradas quedan registradas como pagas, con la fecha, el monto y el medio de pago.
  * Queda registrado quién cobró y cuándo.
  * Queda emitido el recibo digital del pago.
  * El estado de cuenta del alumno queda actualizado y, si estaba bloqueado por deuda y queda al día, el alumno queda habilitado para ingresar.

---

### Camino Estándar

El camino estándar se describe con pago en efectivo y sin promoción.

| Paso | Responsable | Acción / Proceso |
| :---: | :---: | :--- |
| **1** | **Actor** | La secretaria selecciona la opción para registrar el pago de cuotas. |
| **2** | **Sistema** | Solicita el DNI o el nombre del alumno. |
| **3** | **Actor** | Ingresa el DNI del alumno. |
| **4** | **Sistema** | Busca al alumno y muestra su estado de cuenta: las cuotas adeudadas y las próximas a vencer, con su importe y su vencimiento. Solicita las cuotas a pagar. |
| **5** | **Actor** | Selecciona las cuotas a pagar. |
| **6** | **Sistema** | Calcula el monto total de las cuotas seleccionadas y solicita el medio de pago (efectivo, tarjeta de débito, transferencia o QR). |
| **7** | **Actor** | Selecciona el medio de pago. |
| **8** | **Sistema** | Muestra el resumen del cobro (alumno, cuotas, monto total y medio de pago) y solicita confirmación. |
| **9** | **Actor** | Confirma el pago. |
| **10** | **Sistema** | Registra el pago de las cuotas seleccionadas con la fecha, el monto y el medio de pago, junto con la secretaria que cobra, actualiza el estado de cuenta del alumno, emite el recibo digital (*incluye Emitir Recibos*) e informa que el pago quedó registrado. |

---

### Caminos Alternativos

#### 3.a El actor ingresa el nombre del alumno
1. El sistema muestra los alumnos cuyo nombre coincide.
2. La secretaria selecciona al alumno.
3. Retoma en el paso 4.

#### 4.a No existe un alumno con el DNI ingresado
1. El sistema informa que no encontró al alumno.
2. Retoma en el paso 3.

#### 4.b El alumno está dado de baja
1. El sistema informa que no se pueden registrar pagos de un alumno dado de baja.
2. Fin del caso de uso.

#### 5.a El actor selecciona más de 6 cuotas por adelantado
1. El sistema informa que solo se pueden pagar hasta 6 cuotas por adelantado.
2. Retoma en el paso 5.

#### 5.b El actor selecciona una cuota sin seleccionar las anteriores que están impagas
1. El sistema informa que las cuotas se cobran en orden, desde la más antigua.
2. Retoma en el paso 5.

#### 9.a El actor solicita aplicar una promoción o un cupón
1. El sistema ejecuta el caso de uso *Aplicar Promociones* (extend).
2. Retoma en el paso 8, con el monto total recalculado.

#### 9.b El actor no confirma el pago
1. El sistema conserva lo indicado hasta el momento.
2. Retoma en el paso 5.

#### 10.a El medio de pago es tarjeta de débito, transferencia o QR
1. El sistema solicita a la Entidad Bancaria la confirmación del pago por el monto total.
2. La Entidad Bancaria confirma el pago.
3. Retoma en el paso 10, a partir del registro del pago.

#### 10.b La Entidad Bancaria rechaza el pago
1. El sistema informa que el pago fue rechazado y el motivo informado por la entidad. No registra el pago.
2. Retoma en el paso 6.

#### 10.c La Entidad Bancaria no responde
1. El sistema informa que no pudo confirmar el pago con la entidad. No registra el pago.
2. Retoma en el paso 6.

#### 10.d No hay conexión al momento de registrar
1. El sistema informa que no hay conexión y conserva en el equipo el cobro cargado.
2. Cuando se restablece la conexión, retoma en el paso 9.

> **Caminos alternativos más significativos** (punto 2.b de la consigna): **9.a**, porque es donde se ejecuta el CU que extiende (Aplicar Promociones), y **10.a**, porque es donde participa la Entidad Bancaria, el actor externo. Los demás completan todos los casos posibles.
>
> **Reglas del negocio que aplican:** la cuota vence el día 5 de cada mes; no hay intereses ni recargos por mora; se cobra la parte proporcional del mes si el alumno se inscribió a mitad de mes; las cuotas se pagan de la más antigua a la más nueva y se admiten hasta 6 por adelantado.

---
---

# Descripción de Caso de Uso incluido: Emitir Recibos

* **Actor:** Secretaria
* **Precondiciones:**
  * La secretaria se encuentra autenticada en el sistema.
  * El pago se encuentra registrado en el sistema.
* **Postcondición:** Queda emitido el recibo digital del pago, con la fecha, el monto y el medio de pago.

> **Cuando lo incluye Registrar Pagos** (paso 10), no hay intervención del actor: el sistema recibe el pago ya registrado y realiza la emisión del paso 2. El recibo se muestra a la secretaria al informar que el pago quedó registrado.

---

### Camino Estándar

| Paso | Responsable | Acción / Proceso |
| :---: | :---: | :--- |
| **1** | **Actor** | La secretaria solicita el recibo de un pago registrado. |
| **2** | **Sistema** | Genera el recibo digital con su número, la fecha, el alumno, las cuotas pagadas, el monto total, el medio de pago y la secretaria que cobró, y lo muestra. |

---

### Caminos Alternativos

#### 2.a El pago tiene una promoción aplicada
1. El sistema agrega al recibo la promoción aplicada y el descuento.
2. Retoma en el paso 2, con el recibo completo.

#### 2.b El actor solicita imprimir el recibo
1. El sistema entrega el recibo para su impresión.
2. Fin del caso de uso.

---
---

# Descripción de Caso de Uso que extiende: Aplicar Promociones

* **Actor:** Secretaria
* **Extiende a:** Registrar Pagos, en el paso 9 (cuando la secretaria solicita aplicar una promoción o un cupón).
* **Precondiciones:**
  * La secretaria se encuentra autenticada en el sistema.
  * Hay un pago en curso, con las cuotas y el medio de pago seleccionados.
* **Postcondición:** El pago en curso queda con la promoción aplicada y el monto total recalculado con el descuento.

---

### Camino Estándar

| Paso | Responsable | Acción / Proceso |
| :---: | :---: | :--- |
| **1** | **Actor** | La secretaria indica que desea aplicar una promoción o un cupón al pago. |
| **2** | **Sistema** | Muestra las promociones vigentes, indicando para cada una si corresponde al pago en curso y, si no corresponde, el motivo. Solicita la promoción a aplicar. |
| **3** | **Actor** | Selecciona una promoción. |
| **4** | **Sistema** | Verifica que la promoción esté vigente y que se cumplan sus condiciones (medio de pago, antigüedad del alumno, cantidad de cuotas, plan familiar), calcula el descuento, recalcula el monto total e informa el nuevo monto. |

---

### Caminos Alternativos

#### 2.a No hay promociones vigentes
1. El sistema informa que no hay promociones vigentes y solicita el código de un cupón.
2. Retoma en el paso 3.

#### 3.a El actor ingresa el código de un cupón
1. El sistema busca el cupón.
2. Retoma en el paso 4, con las condiciones del cupón.

#### 3.b El actor no selecciona ninguna promoción
1. El sistema conserva el pago sin descuento.
2. Fin del caso de uso.

#### 4.a La promoción no corresponde al pago, o el cupón no existe o está vencido
1. El sistema informa el motivo: promoción vencida, condición que no se cumple, o cupón inexistente o vencido. No aplica el descuento.
2. Retoma en el paso 2.

#### 4.b El pago ya tiene una promoción aplicada
1. El sistema informa que las promociones no se acumulan y reemplaza la anterior por la seleccionada.
2. Retoma en el paso 4, con el descuento de la nueva promoción.

> **Regla del negocio:** se aplica una sola promoción por cobro. Cada promoción tiene su vigencia y sus condiciones, que configura el administrador.
