# Tarjetas CRC: Realización de Registrar Pagos

> **Pautas de cátedra (apunte actualizado):** una tarjeta por cada clase del diagrama de clases (el de Registrar Pagos, con su include Emitir Recibos y su extend Aplicar Promociones), incluidas las UI, los controladores y el Sistema. Anverso con el nombre y el propósito de la clase. Reverso con las **responsabilidades** (sale de mirar los métodos de la clase: qué sabe hacer y qué información conoce) y la **colaboración** (sale de las asociaciones del diagrama de clases). La Entidad Bancaria es un actor externo: no es una clase y no tiene tarjeta.

---

### Tarjeta 1: `UIRegistrarPagos`

#### Anverso (Frente)
* **Clase:** `UIRegistrarPagos`
* **Propósito:** Interactuar con la secretaria durante el registro de un pago: recibir lo que indica y mostrarle el estado de cuenta, las cuotas elegidas, el resumen y el resultado. No tiene reglas de negocio.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Mostrar las opciones disponibles (`mostrarOpciones()`).<br>- Recibir la opción de registrar pagos (`seleccionarOpcionRegistrarPagos()`).<br>- Pedir el DNI o el nombre del alumno (`solicitarDniONombre()`).<br>- Recibir el DNI (`ingresarDni(dni)`).<br>- Mostrar el estado de cuenta con las cuotas pendientes (`mostrarEstadoDeCuenta(alumno, cuotasPendientes)`).<br>- Recibir cada cuota elegida (`seleccionarCuota(idCuota)`).<br>- Preguntar si sigue ingresando cuotas (`solicitarContinuarSeleccion()`) y recibir la respuesta (`indicarContinuar(continuar)`).<br>- Mostrar el monto total y los medios de pago, de los que la secretaria elige solo uno (`mostrarMontoYMediosDePago(montoTotal, mediosPago)`).<br>- Recibir el medio de pago (`seleccionarMedioPago(medioPago)`).<br>- Mostrar el resumen del cobro (`mostrarResumenCobro(alumno, cuotas, montoTotal, medioPago)`).<br>- Recibir la confirmación (`confirmarPago()`).<br>- Informar el pago registrado con su recibo (`mostrarPagoRegistrado(recibo)`).<br><br>**Saber:**<br>- No tiene atributos. | - **CTRLRegistrarPagos:** le reenvía cada acción de la secretaria y recibe de él lo que tiene que mostrar. |

---

### Tarjeta 2: `CTRLRegistrarPagos`

#### Anverso (Frente)
* **Clase:** `CTRLRegistrarPagos`
* **Propósito:** Coordinar el flujo del caso de uso: recibe las acciones de la pantalla, obtiene la secretaria de la sesión, le pide al Sistema las operaciones de negocio y le indica a la pantalla qué mostrar.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Crear la pantalla y pedirle que muestre las opciones.<br>- Iniciar el registro del pago y pedir el DNI (`iniciarRegistroPago()`).<br>- Tomar el DNI, pedir el alumno y sus cuotas pendientes (`tomarDni(dni)`).<br>- Tomar cada cuota elegida y pedirle al Sistema que la agregue (`tomarCuota(idCuota)`).<br>- Tomar la respuesta de si sigue ingresando cuotas: si dice que sí, repite la selección; si dice que no, pide el monto total y los medios de pago (`tomarContinuar(continuar)`).<br>- Tomar el medio de pago y pedir el resumen (`tomarMedioPago(medioPago)`).<br>- Tomar la confirmación, obtener la secretaria y pedir el registro del pago (`tomarConfirmacion()`).<br>- Destruir la pantalla al terminar el caso de uso.<br><br>**Saber:**<br>- No tiene atributos. | - **UIRegistrarPagos:** recibe sus eventos y le indica qué mostrar.<br>- **CTRLSesion:** le pide la secretaria logueada.<br>- **Sistema:** le delega las búsquedas, el cálculo y el registro. |

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
* **Propósito:** Conocer las colecciones globales (alumnos, pagos, recibos y promociones), buscar en ellas, calcular el monto del cobro, aplicar la promoción elegida, pedir la validación a la Entidad Bancaria y dar de alta el pago y el recibo.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Buscar un alumno por su DNI (`obtenerAlumno(dni)`).<br>- Obtener las cuotas pendientes del alumno: se las pide al alumno, recorre sus cuotas y deja las pendientes en una lista temporal (`obtenerCuotasPendientes(alumno)`).<br>- Crear la lista temporal de las cuotas del pago en curso (`iniciarSeleccionCuotas()`).<br>- Agregar a esa lista la cuota elegida (`agregarCuotaSeleccionada(idCuota)`).<br>- Informar el monto total de las cuotas elegidas (`obtenerMontoTotal()`) y calcularlo (`calcularTotal()`).<br>- Informar los medios de pago aceptados (`obtenerMediosPago()`).<br>- Informar las cuotas elegidas (`obtenerCuotasSeleccionadas()`).<br>- Confirmar el pago: pedir la validación a la Entidad Bancaria, crear el pago (con su promoción, si se aplicó una) y su recibo, marcar las cuotas como pagas y actualizar el estado de cuenta del alumno (`confirmarPago(alumno, montoTotal, medioPago, secretaria)`).<br>- Buscar un pago por su id (`obtenerPago(idPago)`).<br>- Emitir el recibo de un pago (`emitirRecibo(pago)`) y numerarlo (`generarNumeroRecibo()`).<br>- Obtener las promociones vigentes, con el resultado de sus condiciones (`obtenerPromocionesVigentes(alumno, montoTotal, medioPago)`).<br>- Aplicar la promoción elegida (`aplicarPromocion(idPromocion, montoTotal)`): calcular el descuento, recalcular el monto (`recalcularMontoTotal(montoTotal, descuento)`) y recordar la promoción (`registrarPromocionAplicada(promocion)`).<br>- Crear, llenar y destruir las listas temporales.<br><br>**Saber:**<br>- Las colecciones de `Alumno`, `Pago`, `Recibo` y `Promocion`.<br>- `promocionAplicada`: la promoción del pago en curso. | - **CTRLRegistrarPagos**, **CTRLAplicarPromociones** y **CTRLEmitirRecibos:** quienes le piden las operaciones.<br>- **Alumno:** lo busca, le pide sus cuotas y que actualice su estado de cuenta.<br>- **Cuota:** la recorre y la busca por id, la agrega a la lista y le pide que se marque como paga.<br>- **Pago:** lo crea, lo busca y le setea sus datos, sus cuotas y su promoción.<br>- **Recibo:** lo crea y le setea sus datos.<br>- **Promocion:** la recorre, le pide verificar condiciones y calcular el descuento.<br>- **Secretaria:** la recibe para registrar quién cobró.<br>- **Entidad Bancaria** (actor externo): le pide validar el pago. |

---

---

### Tarjeta 5: `Alumno`

#### Anverso (Frente)
* **Clase:** `Alumno`
* **Propósito:** Representar a la persona inscripta en el gimnasio que paga sus cuotas. Conoce sus cuotas y su estado de cuenta.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Entregar sus cuotas (`getCuota()`).<br>- Recalcular su estado de cuenta a partir de sus cuotas, después de un pago (`actualizarEstadoCuenta()`).<br><br>**Saber:**<br>- `idAlumno`, `dni`, `nombre`, `apellido`.<br>- `estado`, del tipo enumerado `EstadoAlumno` (activo o inactivo), y `estadoCuenta`, del tipo enumerado `EstadoCuenta` (al día, por vencer, deudor o bloqueado).<br>- Sus `Cuota`. | - **Cuota:** sus partes; de ellas calcula el estado de cuenta.<br>- **Sistema:** quien lo busca y le pide las cuotas y la actualización.<br>- **Pago:** los pagos se registran a su nombre.<br>- **Promocion:** evalúa sus condiciones (antigüedad, plan familiar) para saber si le corresponde. |

---

### Tarjeta 6: `Cuota`

#### Anverso (Frente)
* **Clase:** `Cuota`
* **Propósito:** Representar la cuota mensual de un alumno, con su importe y su vencimiento (el día 5). Sin intereses ni recargos por mora.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Pasar a estado pagada cuando se la cobra (`marcarPagada()`).<br><br>**Saber:**<br>- `idCuota`, `periodo`, `importe`, `fechaVencimiento`.<br>- `estado`, del tipo enumerado `EstadoCuota` (pendiente o pagada). | - **Alumno:** el todo al que pertenece.<br>- **Pago:** el pago que la cubre.<br>- **Sistema:** quien la elige y le pide que se marque como paga. |

---

### Tarjeta 7: `Pago`

#### Anverso (Frente)
* **Clase:** `Pago`
* **Propósito:** Registrar el cobro de una o más cuotas de un alumno, con su fecha, su monto, su medio de pago, quién lo cobró y la promoción aplicada, si la hubo.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Crear un pago (`create()`).<br>- Conocer sus datos: fecha y hora, monto total y medio de pago (`setDatos(datosPago)`).<br>- Conocer el alumno que paga (`setAlumno(alumno)`).<br>- Conocer la secretaria que cobra (`setSecretaria(secretaria)`).<br>- Conocer la promoción aplicada (`setPromocion(promocion)`).<br>- Conocer las cuotas que cubre (`agregarCuota(cuota)`).<br><br>**Saber:**<br>- `idPago`, `fechaHora`, `montoTotal`.<br>- `medioPago`, del tipo enumerado `MedioPago` (efectivo, tarjeta de débito, transferencia o QR). | - **Alumno:** quien realiza el pago.<br>- **Secretaria:** quien cobra.<br>- **Cuota:** las cuotas pagadas (1 o más).<br>- **Promocion:** la promoción aplicada (0 o 1).<br>- **Sistema:** quien lo crea, lo busca y le setea los datos.<br>- **Recibo:** el comprobante que se emite por él. |

---

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

---

### Tarjeta 10: `Promocion`

#### Anverso (Frente)
* **Clase:** `Promocion`
* **Propósito:** Representar un descuento vigente que se puede aplicar a un cobro. Sabe si se cumplen sus condiciones y cuánto descuenta.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Verificar si se cumplen sus condiciones para el cobro en curso (medio de pago, antigüedad del alumno, cantidad de cuotas, plan familiar) y devolver "aplica" o el motivo por el que no corresponde (`verificarCondiciones(alumno, montoTotal, medioPago)`).<br>- Calcular el descuento sobre un monto (`calcularDescuento(montoTotal)`).<br><br>**Saber:**<br>- `idPromocion`, `nombre`, `porcentajeDescuento`.<br>- `fechaDesde` y `fechaHasta` (su vigencia). | - **Sistema:** quien la recorre, la busca por id y le pide las verificaciones.<br>- **Alumno:** de quien evalúa las condiciones.<br>- **Pago:** el pago al que se aplica (0 o 1 promoción por pago). |

---

### Tarjeta 11: `UIAplicarPromociones`

#### Anverso (Frente)
* **Clase:** `UIAplicarPromociones`
* **Propósito:** Interactuar con la secretaria cuando quiere aplicar una promoción: mostrarle las promociones vigentes, recibir la elegida e informar el nuevo monto. No tiene reglas de negocio.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Mostrar las opciones disponibles (`mostrarOpciones()`).<br>- Recibir el pedido de aplicar una promoción (`solicitarPromocion()`).<br>- Mostrar las promociones vigentes y el motivo de las que no corresponden (`mostrarPromocionesVigentes(promociones)`).<br>- Recibir la promoción elegida (`seleccionarPromocion(idPromocion)`).<br>- Mostrar el nuevo monto total con el descuento (`mostrarNuevoMonto(montoTotal)`).<br><br>**Saber:**<br>- No tiene atributos. | - **CTRLAplicarPromociones:** le reenvía cada acción de la secretaria y recibe de él lo que tiene que mostrar. |

---

### Tarjeta 12: `CTRLAplicarPromociones`

#### Anverso (Frente)
* **Clase:** `CTRLAplicarPromociones`
* **Propósito:** Coordinar el flujo de Aplicar Promociones: recibe las acciones de la pantalla, le pide al Sistema las promociones vigentes y la aplicación de la elegida, y le indica a la pantalla qué mostrar.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Crear la pantalla y pedirle que muestre las opciones.<br>- Iniciar la aplicación de una promoción con los datos del cobro en curso y pedir las promociones vigentes (`iniciarAplicacionPromocion(alumno, montoTotal, medioPago)`).<br>- Tomar la promoción elegida y pedir su aplicación (`tomarPromocion(idPromocion)`).<br>- Destruir la pantalla al terminar.<br><br>**Saber:**<br>- No tiene atributos. | - **UIAplicarPromociones:** recibe sus eventos y le indica qué mostrar.<br>- **Sistema:** le delega la búsqueda de promociones y su aplicación. |

---

### Tarjeta 13: `UIEmitirRecibos`

#### Anverso (Frente)
* **Clase:** `UIEmitirRecibos`
* **Propósito:** Interactuar con la secretaria cuando solicita el recibo de un pago registrado: recibir el pedido y mostrarle el recibo digital. No tiene reglas de negocio.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Mostrar las opciones disponibles (`mostrarOpciones()`).<br>- Recibir el pedido del recibo de un pago (`solicitarRecibo(idPago)`).<br>- Mostrar el recibo digital (`mostrarRecibo(recibo)`).<br><br>**Saber:**<br>- No tiene atributos. | - **CTRLEmitirRecibos:** le reenvía el pedido y recibe de él el recibo a mostrar. |

---

### Tarjeta 14: `CTRLEmitirRecibos`

#### Anverso (Frente)
* **Clase:** `CTRLEmitirRecibos`
* **Propósito:** Coordinar el flujo de Emitir Recibos: recibe el pedido de la pantalla, le pide al Sistema el pago y la emisión del recibo, y le indica a la pantalla qué mostrar.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Crear la pantalla y pedirle que muestre las opciones.<br>- Iniciar la emisión del recibo de un pago: pedir el pago y pedir la emisión (`iniciarEmisionRecibo(idPago)`).<br>- Destruir la pantalla al terminar.<br><br>**Saber:**<br>- No tiene atributos. | - **UIEmitirRecibos:** recibe su evento y le indica qué mostrar.<br>- **Sistema:** le delega la búsqueda del pago y la emisión del recibo. |
