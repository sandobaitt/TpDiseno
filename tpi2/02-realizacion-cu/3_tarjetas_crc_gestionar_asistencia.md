# Tarjetas CRC: Realización de CU-A06 Gestionar Asistencia Diaria por Clase y Sede

> **Pautas de cátedra (DSI 2026):** una tarjeta por cada clase del diagrama de clases, incluidas la UI, los controladores y el Sistema. Anverso con clase y propósito; reverso con responsabilidades (hacer y saber) y colaboradores. Solo se listan las responsabilidades que la clase cumple en este caso de uso, incluido CU-A13.

---

### Tarjeta 1: `PantallaGestionarAsistencia`

#### Anverso (Frente)
* **Clase:** `PantallaGestionarAsistencia`
* **Propósito:** Interactuar con la secretaria durante la carga de la asistencia: recibir sus selecciones y mostrarle sedes, clases, alumnos, el resumen y el resultado. No contiene reglas de negocio.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Recibir la opción de gestionar la asistencia (`seleccionarOpcionGestionarAsistencia()`).<br>- Mostrar las sedes activas con la sede y la fecha propuestas (`mostrarSedes(sedes, sedePropuesta, fechaPropuesta)`).<br>- Recibir la sede y la fecha (`seleccionarSedeYFecha(idSede, fecha)`).<br>- Mostrar las clases del día (`mostrarClases(clases)`).<br>- Recibir la clase elegida (`seleccionarClase(idClase)`).<br>- Mostrar los alumnos con su habilitación (`mostrarAlumnos(alumnos)`).<br>- Recibir el estado de cada alumno (`indicarAsistencia(idAlumno, estado)`) y el fin de la carga (`terminarCarga()`).<br>- Mostrar el resumen y pedir confirmación (`solicitarConfirmacion(asistencias)`).<br>- Recibir la confirmación (`confirmarRegistro()`).<br>- Informar la asistencia registrada (`mostrarAsistenciaRegistrada(registro)`).<br><br>**Saber:**<br>- No tiene atributos. | - **CTRLGestionarAsistencia:** a quien le reenvía cada acción de la secretaria y de quien recibe lo que tiene que mostrar. |

---

### Tarjeta 2: `CTRLGestionarAsistencia`

#### Anverso (Frente)
* **Clase:** `CTRLGestionarAsistencia`
* **Propósito:** Coordinar el flujo del caso de uso: recibe las acciones de la pantalla, obtiene el usuario de la sesión, le pide al Sistema las operaciones de negocio y le indica a la pantalla qué mostrar.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Iniciar la gestión de asistencia, obtener la secretaria logueada y las sedes activas (`iniciarGestionAsistencia()`).<br>- Tomar la sede y la fecha y pedir las clases del día (`tomarSedeYFecha(idSede, fecha)`).<br>- Tomar la clase y pedir sus alumnos con la habilitación (`tomarClase(idClase)`).<br>- Tomar la asistencia indicada y pedir confirmación (`tomarAsistencias(asistencias)`).<br>- Tomar la confirmación y pedir el registro (`tomarConfirmacion()`).<br>- Destruir la pantalla al terminar el caso de uso.<br><br>**Saber:**<br>- No tiene atributos. | - **PantallaGestionarAsistencia:** recibe sus eventos y le indica qué mostrar.<br>- **CTRLSesion:** le pide el usuario logueado.<br>- **Sistema:** le delega las búsquedas y el registro. |

---

### Tarjeta 3: `CTRLSesion`

#### Anverso (Frente)
* **Clase:** `CTRLSesion`
* **Propósito:** Proveer el contexto de la sesión activa. Es preexistente: el caso de uso no la crea.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Devolver el usuario que inició sesión (`obtenerUsuarioLogueado()`).<br><br>**Saber:**<br>- No tiene atributos. | - **CTRLGestionarAsistencia:** quien le pide el usuario.<br>- **Usuario:** el objeto que devuelve (en este caso, la `Secretaria`). |

---

### Tarjeta 4: `Sistema`

#### Anverso (Frente)
* **Clase:** `Sistema`
* **Propósito:** Conocer las colecciones globales (sedes, cronograma de clases, alumnos y registros de asistencia), recorrerlas, armar las listas temporales y dar de alta los registros de asistencia.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Obtener las sedes activas (`obtenerSedesActivas()`).<br>- Obtener las clases programadas de una sede para el día de la fecha (`obtenerClasesDelDia(idSede, fecha)`), calculando el día de la semana (`calcularDiaSemana(fecha)`).<br>- Obtener los alumnos activos que cursan la actividad de la clase, con su habilitación (`obtenerAlumnosDeClase(idClase, fecha)`).<br>- Registrar la asistencia de la clase: crear el registro y pedirle que agregue un detalle por alumno (`registrarAsistencia(idClase, fecha, asistencias, usuario)`).<br>- Crear, llenar y destruir las listas temporales.<br><br>**Saber:**<br>- Las colecciones de `Sede`, `Clase`, `Alumno` y `RegistroAsistencia`.<br>- `diasBloqueoDeuda`: umbral configurable de bloqueo por deuda (15 días de atraso). | - **CTRLGestionarAsistencia:** quien le pide las operaciones.<br>- **Sede:** recorre las sedes para filtrar las activas.<br>- **Clase:** recorre el cronograma y busca la clase elegida.<br>- **Alumno:** recorre los alumnos, les pregunta si cursan la actividad y si están habilitados.<br>- **RegistroAsistencia:** lo crea y le pide que agregue los detalles. |

---

### Tarjeta 5: `Usuario`

#### Anverso (Frente)
* **Clase:** `Usuario` (abstracta)
* **Propósito:** Representar a una persona que ingresa al sistema con un rol. Reúne los datos comunes de la Secretaria y el Profesor.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Informar su nombre completo para mostrar quién registró la asistencia (`getNombreCompleto()`).<br><br>**Saber:**<br>- `idUsuario`, `nombre`, `apellido`, `email`. | - **CTRLSesion:** la devuelve como usuario logueado.<br>- **RegistroAsistencia:** la referencia como quien registró la asistencia. |

---

### Tarjeta 6: `Secretaria`

#### Anverso (Frente)
* **Clase:** `Secretaria`
* **Propósito:** Representar al usuario de recepción que gestiona la asistencia diaria de su sede. Hereda de `Usuario`.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Aportar la sede en la que trabaja, que se propone al iniciar la carga.<br><br>**Saber:**<br>- `legajo`.<br>- La `Sede` en la que trabaja. | - **Sede:** sede en la que trabaja.<br>- **CTRLGestionarAsistencia:** la recibe de la sesión y la envía como responsable del registro. |

---

### Tarjeta 7: `Profesor`

#### Anverso (Frente)
* **Clase:** `Profesor`
* **Propósito:** Representar al docente que dicta las clases del cronograma. Hereda de `Usuario`. En el camino alternativo 2.a es el actor del caso de uso.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Identificar al docente de cada clase que se muestra en la lista.<br><br>**Saber:**<br>- `tipoContrato` (empleado o contratado). | - **Clase:** las clases que dicta. |

---

### Tarjeta 8: `Sede`

#### Anverso (Frente)
* **Clase:** `Sede`
* **Propósito:** Representar cada gimnasio de la cadena. Es un dato, para poder sumar sedes sin rediseñar el sistema.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Indicar si está activa, para filtrarla al iniciar la carga.<br><br>**Saber:**<br>- `idSede`, `nombre`, `direccion`, `estado` (activa o inactiva). | - **Sistema:** quien la recorre.<br>- **Clase:** las clases que se dictan en ella.<br>- **Secretaria:** quien trabaja en ella. |

---

### Tarjeta 9: `Actividad`

#### Anverso (Frente)
* **Clase:** `Actividad`
* **Propósito:** Representar cada disciplina que ofrece el gimnasio (funcional, yoga, spinning, etc.).

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Identificar la disciplina de una clase y las que habilita un plan.<br><br>**Saber:**<br>- `idActividad`, `nombre`. | - **Clase:** la clase es de una actividad.<br>- **Plan:** el plan habilita actividades. |

---

### Tarjeta 10: `Clase`

#### Anverso (Frente)
* **Clase:** `Clase`
* **Propósito:** Representar un horario semanal del cronograma: una actividad, en una sede, con un profesor, un día y un horario.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Aportar su sede y su día de la semana para el filtro de clases del día.<br>- Aportar su actividad para buscar a los alumnos que la cursan.<br><br>**Saber:**<br>- `idClase`, `diaSemana`, `horaInicio`, `horaFin`, `cupo`.<br>- Su `Sede`, su `Actividad` y su `Profesor`. | - **Sistema:** quien la recorre y la busca por id.<br>- **Sede**, **Actividad** y **Profesor:** sus datos asociados.<br>- **RegistroAsistencia:** registra la asistencia de la clase. |

---

### Tarjeta 11: `Plan`

#### Anverso (Frente)
* **Clase:** `Plan`
* **Propósito:** Representar el plan contratado por el alumno y las actividades que habilita.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Responder si habilita una actividad (`incluyeActividad(actividad)`).<br><br>**Saber:**<br>- `idPlan`, `nombre`, `precioMensual`.<br>- Las `Actividad` que habilita. | - **Alumno:** le pregunta si la actividad de la clase está incluida.<br>- **Actividad:** las actividades que habilita. |

---

### Tarjeta 12: `Alumno`

#### Anverso (Frente)
* **Clase:** `Alumno`
* **Propósito:** Representar a la persona inscripta en el gimnasio. Es experta en su propia situación: sabe si cursa una actividad y si está habilitada para ingresar.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Responder si cursa la actividad, delegando en su plan (`cursaActividad(actividad)`).<br>- Verificar su habilitación para ingresar: restricción manual y días de atraso contra el umbral (`verificarHabilitacion(fecha, diasBloqueo)`). Es la verificación del CU-A13 incluido.<br>- Calcular los días de atraso de su cuota impaga más vieja (`calcularDiasAtraso(fecha)`).<br><br>**Saber:**<br>- `idAlumno`, `dni`, `nombre`, `apellido`, `estado` (activo o inactivo), `fechaInscripcion`, `restriccionManual`, `motivoRestriccion`.<br>- Su `Plan` y sus `Cuota`. | - **Sistema:** quien lo recorre, lo busca por id y le pide las verificaciones.<br>- **Plan:** le pregunta si incluye la actividad.<br>- **Cuota:** sus cuotas, para calcular el atraso.<br>- **DetalleAsistencia:** registra su asistencia. |

---

### Tarjeta 13: `Cuota`

#### Anverso (Frente)
* **Clase:** `Cuota`
* **Propósito:** Representar la cuota mensual de un alumno, con su vencimiento (el día 5) y su pago. Sin intereses ni recargos por mora.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Indicar si está paga (`estaPaga()`).<br>- Calcular sus días de atraso a una fecha (`calcularDiasAtraso(fecha)`).<br><br>**Saber:**<br>- `periodo`, `importe`, `fechaVencimiento`, `fechaPago`. | - **Alumno:** el todo al que pertenece y que le pide el atraso. |

---

### Tarjeta 14: `RegistroAsistencia`

#### Anverso (Frente)
* **Clase:** `RegistroAsistencia`
* **Propósito:** Registrar la asistencia de una clase en una fecha, con quién la cargó y cuándo. Es el todo de sus detalles: crea uno por alumno.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Registrar sus datos al ser creado (`create(clase, fecha, usuario, fechaHoraRegistro)`).<br>- Agregar el detalle de un alumno, creando el `DetalleAsistencia` (`agregarDetalle(alumno, estado)`).<br><br>**Saber:**<br>- `idRegistro`, `fecha`, `fechaHoraRegistro`.<br>- La `Clase`, el `Usuario` que lo registró y sus `DetalleAsistencia`. | - **Sistema:** quien lo crea y le pide agregar detalles.<br>- **DetalleAsistencia:** sus partes, que crea.<br>- **Clase:** la clase registrada.<br>- **Usuario:** quien registró. |

---

### Tarjeta 15: `DetalleAsistencia`

#### Anverso (Frente)
* **Clase:** `DetalleAsistencia`
* **Propósito:** Registrar la asistencia de un alumno dentro de un registro de clase. Su ciclo de vida depende del `RegistroAsistencia`.

#### Reverso (Dorso)

| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- Registrar el estado del alumno al ser creado (`create(alumno, estado)`).<br><br>**Saber:**<br>- `estado`: presente, ausente o ausente con justificación.<br>- El `Alumno` al que corresponde. | - **RegistroAsistencia:** el todo que lo crea.<br>- **Alumno:** el alumno registrado. |
