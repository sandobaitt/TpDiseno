# Tarjetas CRC: Realización de Registrar Pagos

> **Pautas de cátedra (apunte actualizado):** una tarjeta por cada clase del diagrama de clases, incluidas la UI, los controladores y el Sistema. Anverso con el nombre y el propósito de la clase. Reverso con las **responsabilidades** (sale de mirar los métodos de la clase: qué sabe hacer y qué información conoce) y la **colaboración** (sale de las asociaciones del diagrama de clases). La Entidad Bancaria es un actor externo: no es una clase y no tiene tarjeta.

---

### Tarjeta 1: `UIRegistrarPagos`

#### Anverso (Frente)
* **Clase:** `UIRegistrarPagos`
* **Propósito:** Interactuar con la secretaria durante el registro de un pago: recibir lo que indica y mostrarle el estado de cuenta, las cuotas elegidas, el resumen y el resultado. No tiene reglas de negocio.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Recibir la opción de registrar pagos (`seleccionarOpcionRegistrarPagos()`).<br>- Pedir el DNI o el nombre del alumno (`solicitarDniONombre()`).<br>- Recibir el DNI (`ingresarDni(dni)`).<br>- Mostrar el estado de cuenta con las cuotas pendientes (`mostrarEstadoDeCuenta(alumno, cuotasPendientes)`).<br>- Recibir cada cuota elegida (`seleccionarCuota(idCuota)`) y mostrarla como seleccionada (`mostrarCuotaSeleccionada(cuota)`).<br>- Recibir el fin de la selección (`terminarSeleccion()`).<br>- Mostrar el monto total y los medios de pago (`mostrarMontoYMediosDePago(montoTotal)`).<br>- Recibir el medio de pago (`seleccionarMedioPago(medioPago)`).<br>- Mostrar el resumen del cobro (`mostrarResumenCobro(alumno, cuotas, montoTotal, medioPago)`).<br>- Recibir la confirmación (`confirmarPago()`).<br>- Informar el pago registrado con su recibo (`mostrarPagoRegistrado(recibo)`).<br><br>**Saber:**<br>- No tiene atributos. | - **CTRLRegistrarPagos:** le reenvía cada acción de la secretaria y recibe de él lo que tiene que mostrar. |

---

### Tarjeta 2: `CTRLRegistrarPagos`

#### Anverso (Frente)
* **Clase:** `CTRLRegistrarPagos`
* **Propósito:** Coordinar el flujo del caso de uso: recibe las acciones de la pantalla, obtiene la secretaria de la sesión, le pide al Sistema las operaciones de negocio y le indica a la pantalla qué mostrar.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Iniciar el registro del pago y pedir el DNI (`iniciarRegistroPago()`).<br>- Tomar el DNI, pedir el alumno y sus cuotas pendientes (`tomarDni(dni)`).<br>- Tomar cada cuota elegida y pedirle al Sistema que la agregue (`tomarCuota(idCuota)`).<br>- Tomar el fin de la selección y pedir el monto total (`tomarFinSeleccion()`).<br>- Tomar el medio de pago y pedir el resumen (`tomarMedioPago(medioPago)`).<br>- Tomar la confirmación, obtener la secretaria y pedir el registro del pago (`tomarConfirmacion()`).<br>- Destruir la pantalla al terminar el caso de uso.<br><br>**Saber:**<br>- No tiene atributos. | - **UIRegistrarPagos:** recibe sus eventos y le indica qué mostrar.<br>- **CTRLSesion:** le pide la secretaria logueada.<br>- **Sistema:** le delega las búsquedas, el cálculo y el registro. |

---

### Tarjeta 3: `CTRLSesion`

#### Anverso (Frente)
* **Clase:** `CTRLSesion`
* **Propósito:** Proveer el contexto de la sesión activa. Es preexistente: el caso de uso no la crea.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Devolver la secretaria que inició sesión (`obtenerUsuarioLogueado()`).<br><br>**Saber:**<br>- No tiene atributos. | - **CTRLRegistrarPagos:** quien le pide la secretaria logueada.<br>- **Secretaria:** el objeto que devuelve. |

---

### Tarjeta 4: `Sistema`

#### Anverso (Frente)
* **Clase:** `Sistema`
* **Propósito:** Conocer las colecciones globales (alumnos, pagos y recibos), buscar en ellas, calcular el monto del cobro, pedir la validación a la Entidad Bancaria y dar de alta el pago y el recibo.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Buscar un alumno por su DNI (`obtenerAlumno(dni)`).<br>- Obtener las cuotas pendientes de un alumno, armando una lista temporal (`obtenerCuotasPendientes(alumno)`).<br>- Crear la lista temporal de las cuotas del pago en curso (`iniciarSeleccionCuotas()`).<br>- Agregar a esa lista la cuota elegida (`agregarCuotaSeleccionada(idCuota)`).<br>- Informar el monto total de las cuotas elegidas (`obtenerMontoTotal()`) y calcularlo (`calcularTotal()`).<br>- Informar las cuotas elegidas (`obtenerCuotasSeleccionadas()`).<br>- Confirmar el pago: pedir la validación a la Entidad Bancaria, crear el pago y su recibo, marcar las cuotas como pagas y actualizar el estado de cuenta del alumno (`confirmarPago(alumno, montoTotal, medioPago, secretaria)`).<br>- Numerar el recibo (`generarNumeroRecibo()`).<br>- Crear, llenar y destruir las listas temporales.<br><br>**Saber:**<br>- Las colecciones de `Alumno`, `Pago` y `Recibo`. | - **CTRLRegistrarPagos:** quien le pide las operaciones.<br>- **Alumno:** lo busca, le pide sus cuotas y que actualice su estado de cuenta.<br>- **Cuota:** la busca, la agrega a la lista y le pide que se marque como paga.<br>- **Pago:** lo crea y le setea sus datos y sus cuotas.<br>- **Recibo:** lo crea y le setea sus datos.<br>- **Secretaria:** la recibe para registrar quién cobró.<br>- **Entidad Bancaria** (actor externo): le pide validar el pago. |

---

### Tarjeta 5: `Alumno`

#### Anverso (Frente)
* **Clase:** `Alumno`
* **Propósito:** Representar a la persona inscripta en el gimnasio que paga sus cuotas. Conoce sus cuotas y su estado de cuenta.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Entregar sus cuotas (`getCuotas()`).<br>- Recalcular su estado de cuenta a partir de sus cuotas, después de un pago (`actualizarEstadoCuenta()`).<br><br>**Saber:**<br>- `idAlumno`, `dni`, `nombre`, `apellido`.<br>- `estado` (activo o inactivo) y `estadoCuenta` (al día, por vencer, deudor o bloqueado).<br>- Sus `Cuota`. | - **Cuota:** sus partes; de ellas calcula el estado de cuenta.<br>- **Sistema:** quien lo busca y le pide las cuotas y la actualización.<br>- **Pago:** los pagos se registran a su nombre. |

---

### Tarjeta 6: `Cuota`

#### Anverso (Frente)
* **Clase:** `Cuota`
* **Propósito:** Representar la cuota mensual de un alumno, con su importe y su vencimiento (el día 5). Sin intereses ni recargos por mora.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Pasar a estado pagada cuando se la cobra (`marcarPagada()`).<br><br>**Saber:**<br>- `idCuota`, `periodo`, `importe`, `fechaVencimiento`.<br>- `estado` (pendiente o pagada). | - **Alumno:** el todo al que pertenece.<br>- **Pago:** el pago que la cubre.<br>- **Sistema:** quien la elige y le pide que se marque como paga. |

---

### Tarjeta 7: `Pago`

#### Anverso (Frente)
* **Clase:** `Pago`
* **Propósito:** Registrar el cobro de una o más cuotas de un alumno, con su fecha, su monto, su medio de pago y quién lo cobró.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Crear un pago (`create()`).<br>- Conocer sus datos: fecha y hora, monto total y medio de pago (`setDatos(datosPago)`).<br>- Conocer el alumno que paga (`setAlumno(alumno)`).<br>- Conocer la secretaria que cobra (`setSecretaria(secretaria)`).<br>- Conocer las cuotas que cubre (`agregarCuota(cuota)`).<br><br>**Saber:**<br>- `idPago`, `fechaHora`, `montoTotal`, `medioPago`. | - **Alumno:** quien realiza el pago.<br>- **Secretaria:** quien cobra.<br>- **Cuota:** las cuotas pagadas (1 o más).<br>- **Sistema:** quien lo crea y le setea los datos.<br>- **Recibo:** el comprobante que se emite por él. |

---

### Tarjeta 8: `Recibo`

#### Anverso (Frente)
* **Clase:** `Recibo`
* **Propósito:** Ser el comprobante digital de un pago. Tiene su número y la fecha de emisión; el resto (alumno, cuotas, monto, medio de pago y secretaria) lo conoce a través del pago.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Crear un recibo (`create()`).<br>- Conocer su número y su fecha de emisión (`setDatos(datosRecibo)`).<br>- Conocer el pago al que corresponde (`setPago(pago)`).<br><br>**Saber:**<br>- `nroRecibo`, `fechaEmision`. | - **Pago:** el pago del que es comprobante.<br>- **Sistema:** quien lo crea y le setea los datos. |

---

### Tarjeta 9: `Secretaria`

#### Anverso (Frente)
* **Clase:** `Secretaria`
* **Propósito:** Representar a la usuaria de recepción que cobra las cuotas. Se registra en cada pago para saber quién cobró.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- No tiene métodos propios en este caso de uso: solo aporta sus datos.<br><br>**Saber:**<br>- `idUsuario`, `nombre`, `apellido`, `legajo`. | - **Pago:** los pagos que cobra.<br>- **CTRLSesion:** quien la devuelve como usuaria logueada. |
