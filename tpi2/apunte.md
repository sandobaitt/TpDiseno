# Apunte Parcial Práctico 2026

A partir del 2026 solamente se rinde el parcial práctico del segundo cuatrimestre. A continuación se detallan los temas y su manera de encararlos a la hora de la resolución.

**Hecho por:**
* Mateo Lopez
* Agustin Carrasco
* Lautaro Sandoval

---

## Pasos para resolver

1. Primero se hace el [diagrama de casos de uso](#diagrama-de-casos-de-uso) de **todos** los casos de uso del escenario.
2. Se hace la [descripción de caso de uso](#descripción-de-caso-de-uso) indicado (ej: CU1).
3. Se hace la [realización del CU](#realización-del-caso-de-uso) con los siguientes elementos:
   1. [Diagrama de clases](#1---diagrama-de-clases) (de las clases involucradas en el caso de uso).
   2. [Tarjetas CRC](#2---tarjeta-crc) (de las clases utilizadas en el diagrama de clases de ese caso de uso CU1).
   3. [Diagrama de secuencia](#3---diagrama-de-secuencia) de ese caso de uso.
4. Máquina de estados.
5. Patrones de diseño.

---

## Diagrama de Casos de Uso

```text
                    Sistema
              +-----------------+
   Actor 1 ---|----( CU1 )      |
          \---|----( CU2 )------|------> (Entidad)
              |                 |
   Actor 2 ---|----( CU3 )------|------- Actor externo
          \---|----( CU4 )      |
              +-----------------+
```

Es un mapa visual que delimita los límites del sistema, quién interactúa con él (**Actores**) y qué funcionalidades de valor ofrece (**Casos de Uso**), sin entrar en el orden cronológico de las acciones.

### Elementos clave

* **Actores:**
  * Son los que inician el caso de uso (actores del lado izquierdo).
  * Representan un rol externo al sistema, jamás un nombre propio (ej: *Cajero*, *Cliente*, *Administrador*; no *Juan Pérez*).
  * Pueden ser sistemas externos que envían o reciben datos (ej: *AFIP*).
  * Los actores del lado derecho suelen ser externos al sistema y actúan como soporte o receptores de información sin iniciar el caso de uso.
* **Casos de Uso (Óvalos):**
  * Nombre: `[Verbo en infinitivo] + [Sustantivo]` (ej: *Registrar Pedido*).
* **Asociación (Línea sólida simple):**
  * Conecta al actor con el óvalo del caso de uso en el que participa.
  * **No lleva flechas.**
* **Límite del Sistema (System Boundary):**
  * Un rectángulo grande con el nombre del sistema arriba.
  * **Regla de oro:** Los casos de uso van adentro; los actores van siempre afuera.
  * La profe en clase por ahí lo saltea; hay que preguntar si lo usamos o no en el parcial. No creo que esté de más.

### Relaciones

| Relación | Cuándo se usa | Sentido de la flecha |
| :--- | :--- | :--- |
| `<<include>>` | Parte obligatoria o común que se extrae para reutilizar. Es por si el CU base **no puede completarse** sin este. | Línea punteada que apunta **hacia el caso de uso incluido** (`CU Base → CU Incluido`). |
| `<<extend>>` | Comportamiento opcional o condicional que ocurre bajo cierta regla/evento. | Línea punteada que apunta **hacia el caso de uso base** (`CU Extensión → CU Base`). |
| **Generalización (Herencia)** | Un actor o caso de uso hereda el comportamiento de otro más general (ej: *Usuario Registrado* hereda de *Usuario*). | Línea sólida con flecha triangular hueca hacia el padre (`——▷`). |

### Errores típicos

* **Casos de uso "huérfanos":** Dejar un óvalo sin conectar a ningún actor.
* **Conectar actores entre sí con líneas simples:** Entre actores **solo** puede haber relación de generalización/herencia (flecha con punta hueca).
* **Descomposición funcional:** Crear casos de uso para pasos individuales dentro de un proceso más grande (ej: crear *Validar Contraseña* o *Buscar Producto* como casos de uso aislados en lugar de integrarlos dentro del flujo de *Iniciar Sesión* o *Registrar Venta*).
* **Invertir las flechas de include y extend:** El base **necesita/incluye** al otro. La extensión **le agrega algo** a la base. Por lo tanto, la flecha apunta al que se agrega.

---

## Descripción de Caso de Uso

En la **descripción textual** (o plantilla de caso de uso) se explica paso a paso la interacción entre el **actor** y el **sistema**.

* **Actor:** El rol que inicia la acción (ej: *Cajero*).
* **Precondición:** Qué debe ser verdad en el sistema antes de empezar (ej: *El usuario debe estar autenticado en el sistema*).
  * Lo que se especifica en la precondición no se vuelve a indicar en el camino.
  * Ej: Precondición: *Alumno autenticado*. No pongas:
    1. Alumno ingresa usuario y contraseña.
    2. El sistema valida usuario y contraseña.
  * La autenticación ya ocurrió antes; por ende, el paso 1 también.
* **Postcondición:** Estado en el que queda el sistema tras completar el objetivo (ej: *La venta queda registrada y el stock actualizado*).
  * **OJO:** Precondición y Postcondición siempre se refieren al **sistema**, nunca a algo del usuario.
* **Camino Estándar:** Los pasos alternan entre **acción del actor** y **respuesta del sistema**.
  * La idea es que sea uno y uno: actor, sistema, actor, y así sucesivamente.
  * Usa lenguaje generalista: habla de *"ingresar datos"*, *"validar"*, *"solicitar confirmación"*.
  * **Nunca detalles técnicos ni de interfaz gráfica** (prohibido poner *"el usuario presiona el botón X"* o *"se ejecuta un INSERT en la tabla Y"*; se pone *"el actor confirma la operación"* o *"el sistema registra la venta"*).
* **Caminos Alternativos:** Los desvíos del camino feliz donde algo falla o se toma otra opción válida (ej: datos incorrectos, falta de stock, cancelación).
  * Todo camino alternativo debe indicar explícitamente:
    * Si **vuelve** al flujo estándar (ej: *Retoma en el paso 3*).
    * Si **termina** el caso de uso sin éxito (ej: *Fin del caso de uso*).
  * **Numeración de caminos alternativos:** Supongamos que el desvío pasa en el paso 4; la numeración según el apunte de la cátedra es así:

    ```text
    4.a No hay evaluaciones pendientes
        1. El sistema informa que no encuentra evaluaciones pendientes para el alumno.
        2. Finalizar caso de uso / ir a paso X.
    ```

### Include en el CU

*(Sección pendiente de completar en el apunte original.)*

### Errores comunes a evitar

* **Olvidar al Actor:** Todo caso de uso debe estar iniciado directa o indirectamente por un actor (humano, rol o sistema externo).
* **Mezclar diseño técnico con requerimientos:** Hablar de pantallas, botones, tecnologías o bases de datos en la descripción del caso de uso.

---

## Realización del Caso de Uso

Se trabaja siempre sobre el caso de uso que fue seleccionado para su análisis y resolución.

### 1 - Diagrama de clases

En el diagrama de clases para una realización de caso de uso, el objetivo es representar exclusivamente las clases necesarias para ejecutar ese flujo específico:

* **Clases involucradas:** Incluye sólo aquellas clases que colaboran para cumplir los pasos del Caso de Uso, incluyendo obligatoriamente la clase **Controlador** (orquestador del flujo) y la clase de **UI** (interfaz de usuario), junto con las clases de dominio necesarias (nombre, atributos necesarios, métodos).
* **Relaciones:** Define asociaciones, agregación/composición y herencia (generalización) entre las clases.

| Relación | Símbolo en el gráfico | Cuándo usarla |
| :--- | :---: | :--- |
| **Herencia (Generalización)** | `——▷` (línea sólida, triángulo hueco) | Relación *"es un"* (Docente es una Persona). Hereda atributos y métodos. |
| **Composición** | `——◆` (línea sólida, rombo relleno) | El ciclo de vida de las partes depende del todo. |
| **Agregación** | `——◇` (línea sólida, rombo hueco) | Contenedor global débil. |
| **Asociación simple** | `——` (línea sólida) | Relación estructural estándar entre dos entidades independientes. |
| **Dependencia** | `- - >` (línea punteada, flecha abierta) | Cuando un elemento depende de otro para su funcionamiento (ej: una clase usa a otra como parámetro). |
| **Realización** | `- - ▷` (línea punteada, triángulo hueco) | Cuando una clase implementa una interfaz. |

* **Multiplicidad:** Indica cuántos objetos participan en la relación (ej: `1`, `*`, `0..1`).
* **Visibilidad:** La visibilidad de una característica especifica si puede ser utilizada por otros clasificadores. En UML se pueden especificar cuatro niveles de visibilidad:

| Nivel | Símbolo | Definición |
| :--- | :---: | :--- |
| **public** | `+` | Cualquier clasificador externo con visibilidad hacia el clasificador dado puede utilizar la característica. |
| **protected** | `#` | Cualquier descendiente del clasificador puede utilizar la característica. |
| **private** | `-` | Sólo el propio clasificador puede utilizar la característica. |
| **package** | `~` | Sólo los clasificadores declarados en el mismo paquete pueden utilizar la característica. |

* **Alcance de instancia y estático** (no hace falta en práctica).
* **Clase DTO** (esto no se toma en práctica).
* **Cómo leer las relaciones:** *(sección pendiente de completar en el apunte original).*

#### Clases UI, Controlador y Sistema

> Las clases **UI** y **Controlador** **no llevan atributos**.

* **UI:** Componente responsable de la interacción con el usuario, sin involucrarse en las reglas del negocio. Lo que hace (**métodos**):
  * Recibir datos del actor.
  * Mostrar información.
    * Mostrar confirmaciones o errores.
  * Pedir datos o selecciones.

  Estas clases no tienen nada que ver con las reglas de negocio.
* **CTRL:** Coordina la ejecución de un CU. Conceptualmente esta clase organiza la UI, el Sistema y las **clases del dominio** que tienen los datos (o sea, las clases comunes que ya venimos viendo en los diagramas de clases). Lo que hace (**métodos**):
  * Iniciar una acción del CU.
  * Recibe acciones de la UI.
  * Coordinar el flujo de acciones para realizar el CU.
  * Enviar mensajes al Sistema.
  * Recibe resultados y continúa el flujo.
* **Sistema:** Representa la clase que tiene una visión general de la información manejada por la aplicación. Conoce los conjuntos de objetos principales y realiza operaciones que necesitan acceder o afectar a esa información global. Lo que hace (**métodos**):
  * Mantiene/conoce los objetos que administra el sistema.
  * Busca objetos dentro de esos conjuntos.
  * Devuelve listas de objetos cuando se necesitan.
  * Realiza las altas de nuevos objetos cuando corresponde.
  * Cálculos generales que involucran información del sistema.
* **Dominio:** Representan conceptos, entidades o cosas que existen en el negocio. Son sobre los cuales el sistema realiza las operaciones. Saben hacer cosas en base a su propia información (ej: *Cliente*, *Producto*, *Materia*). A diferencia de la UI y el Controlador, las clases del dominio tienen:
  * **Atributos:** Información que define al objeto.
  * **Métodos:** Acciones que puede hacer o conocer el objeto.

#### Preguntas para hacerte con cada acción del enunciado

1. ¿Es una interacción con el actor? → **UI**
2. ¿Es coordinación del flujo del CU? → **CTRL**
3. ¿Necesita acceder al conjunto general, buscar, dar de alta o calcular globalmente? → **SISTEMA**
4. ¿Es información o comportamiento propio de un objeto concreto? → **Clase de dominio**
5. ¿Ese mensaje aparece llegando a la clase en el diagrama de secuencia? → **Tiene que estar como método en esa clase.**

#### Consejos clave

* **Alcance:** No incluir clases del sistema que no intervienen en el flujo del CU.
* **Foco en el comportamiento:** Asegurar que los métodos invocados durante el flujo estén descriptos, ya que van a ser usados en el diagrama de secuencia.
* **Coherencia:** Si una clase aparece en el diagrama, debe tener su tarjeta CRC.

---

### 2 - Tarjeta CRC

Las tarjetas CRC (Clase-Responsabilidad-Colaboración) son esenciales para definir el comportamiento y las interacciones de cada clase en el sistema. Deben organizarse de la siguiente manera:

* **Anverso (Frente):**
  * **Nombre de la clase:** Identificador único de la clase.
  * **Propósito:** Descripción breve y clara del rol que cumple la clase dentro del dominio del problema.
* **Reverso (Dorso):**
  * **Responsabilidades:** Qué tareas sabe realizar y qué información conoce (métodos principales y datos clave).
  * **Colaboradores:** Otras clases con las que interactúa para cumplir sus tareas (quién le pide servicios o a quién ella debe pedirle servicios).

```text
CRC: Clase

+-----------------------------------------------+
|  Clase: Clase                                 |
|  Propósito: ----                              |
+-----------------------------------------------+

+-----------------------+-----------------------+
|  Responsabilidades:   |  Colaboración:        |
+-----------------------+-----------------------+
|                       |                       |
|                       |                       |
+-----------------------+-----------------------+
```

#### Consejos

* **Coherencia:** Cada clase del diagrama de clases del caso de uso debe tener su tarjeta CRC correspondiente.
* **Simplicidad:** Si el reverso de la tarjeta acumula demasiadas responsabilidades, evaluar si la clase está sobrecargada (posible violación del principio de responsabilidad única) y se debería dividir.
* **Foco en el CU:** Las responsabilidades listadas deben ser aquellas que la clase realmente ejecuta durante el flujo del caso de uso analizado.

---

### 3 - Diagrama de secuencia

> Referencia: *resolución modelo 2 - 2024 - Jero*.

Es un modelo dinámico que representa el intercambio de mensajes entre objetos ordenado estrictamente por secuencia temporal (eje vertical). Muestra el sistema en tiempo de ejecución, evidenciando cómo las instancias colaboran para concretar el flujo exacto del Caso de Uso.

#### Orden visual (de izquierda a derecha)

Para mantener un estándar al resolver el parcial, es bueno siempre poder ubicar los elementos en este orden:

1. **Actor:** Quien inicia el flujo.
2. **Pantalla (`<<Boundary>>` o UI):** Interfaz del actor. Recibe y muestra, sin lógica.
3. **Controlador de CU (`CTRLCU`):** El orquestador específico del caso de uso.
4. **Controlador de Sesión (`CTRLSesion`):** Objeto preexistente que maneja el contexto y seguridad.
5. **Sistema (`<<Sistema>>`):** Fachada centralizadora de colecciones globales y operaciones.
6. **Colecciones y Entidades (`<<Entity>>`):** Clases del dominio.
7. **Actor Externo:** Servicios de terceros (ej: pasarelas de pago). Siempre en el extremo derecho.

```text
  Actor     |-( CU UI )   ( CTRLCU )   ( CTRLSesion )   [ Sistema ]   [ Entidad ]   Actor Externo
   웃                                                                                    웃
```

#### Ciclo de vida y ejecución

1. **Línea de vida (Lifeline):** Línea vertical punteada descendente que indica la existencia del objeto.
2. **Foco de Control (Caja de Activación):** Rectángulo vertical sobre la línea de vida. Representa el lapso exacto donde el objeto tiene el control del procesamiento.
3. **Destrucción Explícita (`X` o `destroy`):** Marcador al final de la línea que indica eliminación definitiva. **Prohibido:** No usarlo para simular el "recolector de basura" de las listas temporales al finalizar el CU.

```text
   [ :Object ]
        :
       | |   <- (2) foco de control
        :    <- (1) línea de vida
       | |
       | |
        :<- - - destroy()   <- (3) destrucción explícita
```

#### Tips de resolución

##### Manejo de Sesión y Autenticación

* No solicitar al actor datos que el sistema ya conoce por su sesión, si es que en la precondición se marca que está logueado (`idUsuario`, `legajo`).
* El `CTRLCU` debe extraerlos consultando a `CTRLSesion` (ej: `obtenerUsuarioLogueado()`).
* A `CTRLSesion` no se le hace un mensaje `create`; ya es una instancia preexistente.

```plantuml
CTRLCU -> CTRLSesion: obtenerUsuario()
CTRLSesion --> CTRLCU: Usuario
```

##### Forma de mensajes

* **De CTRL a Sistema:** Usar verbos de negocio (ej: `obtenerEvento()`, `buscarDisponibles()`, `validarDisponibilidad()`). **Prohibido usar `get` a este nivel.**
* **De Sistema a Entidad:** Usar getters formales de POO para consultar estados internos (ej: `getNombre()`, `getCupo()`).

```plantuml
CTRLCU -> Sistema: obtenerEvento()
Sistema -> Eventos: getEvento()
Eventos --> Sistema: Evento
Sistema --> CTRLCU: Evento
```

##### Tipos de mensajes y sincronía

* **Mensajes Síncronos (punta rellena):** El emisor bloquea y espera respuesta. Es el estándar para llamadas internas del sistema.
* **Mensajes Asíncronos (punta abierta):** El emisor no espera respuesta inmediata. **Uso obligatorio para comunicación con Actores Externos** debido a latencias de red.

```plantuml
CTRLCU -> Sistema: ValidarPago()
Sistema ->> "Entidad Bancaria": getValidacion()
"Entidad Bancaria" --> Sistema: PagoValidado
Sistema --> CTRLCU: PagoValidado
```

##### Paso de parámetros y retornos

* **Ida:** Incluir explícitamente los parámetros necesarios en las firmas (ej: `procesarPago(idMedioPago, datosPago)`).
* **Vuelta:** Utilizar línea punteada (`-->`) indicando únicamente el nombre del dato retornado. **Prohibido incluir la palabra reservada `return:` o `retornar`.**

```plantuml
Sistema ->> "Entidad Bancaria": getValidacion(id_usuario, cuenta)
"Entidad Bancaria" --> Sistema: PagoValidado
```

##### Mensajes reflexivos (Self-Message)

* Graficar explícitamente cuando una instancia invoca un método de su propia clase para delegar cálculos internos (ej: una flecha que sale y entra de `Sistema -> Sistema: calcularTotal()`).

```plantuml
Ventas -> Ventas: calcularTotal()
```

##### Recorridos de clases entidades

* Para recorrer una clase, ya sea con un filtro o no, se la nombra con el formato **`LT` + una letra que indica a qué clase corresponde**. Por ejemplo, para la clase *Clientes* queda **`LTC: Clientes`**.
* Esto está diciendo que es una lista de clientes (`c`) sobre la clase `Clientes`.
* No se puede recorrer una clase `Clientes` sin esto que se explica.
* De no necesitar recorrer, ahí sí se pone solamente `Clientes`.

```plantuml
participant "Sistema" as Sistema
participant "LTC: Clientes" as LTC

loop for each c in LTC
    Sistema -> LTC: getCliente()
    LTC --> Sistema: c
end
```

##### Manejo de listas temporales

* La clase **Sistema es la única responsable** de instanciar (`create`) y agregar datos (`add()`) a listas temporales, generalmente dentro de un `loop`.
* **Regla visual:** No graficar una flecha de retorno desde la lista temporal hacia el Sistema tras agregar elementos. O sea, no poner un `return()` al Sistema, ya que una vez creada la misma, el sistema la conoce de por sí.
* Al final del uso de esa lista temporal se hace un `destroy()`, que es un mensaje que le envía el Sistema.
* **Nomenclatura:** a la notación de lista solo se le agrega una **T**. La lista temporal de *Clientes* queda **`LTTC: Clientes`** (y, en general, `LTT` + la letra de la clase).

```plantuml
participant "Sistema" as Sistema
participant "LTC: Clientes" as LTC

create "LTTC: Clientes" as LTTC
Sistema -> LTTC: create()

loop for each c in LTC
    Sistema -> LTC: getCliente()
    LTC --> Sistema: c
    opt c.atributo = condicion de filtrado
        Sistema -> LTTC: add(c)
    end
end
```

##### Creación de objetos de entidades de negocio

* **Entidades simples:** El Sistema instancia nuevas entidades al finalizar procesos exitosos. La flecha con el mensaje `create(...)` debe apuntar directamente a la cabecera (caja superior) de la nueva entidad.
* **Estructuras Todo-Parte (Composición):** El Sistema **NO** instancia los detalles directamente. Primero hace el `create` de la cabecera (ej: *Reserva*). Luego, dentro de un `loop`, la cabecera recibe el mensaje para agregar detalles y es **ELLA** quien ejecuta el `create` hacia sus objetos hijos (ej: *Entradas*).

```plantuml
create "r: Reserva" as r
Sistema -> r: create()
```

##### Fragmentos de interacción o control (marcos lógicos)

* **`alt` (Alternativa):** Modela flujos mutuamente excluyentes (if/else). Esencial para caminos alternativos.
* **`opt` (Opcional):** Modela comportamiento condicional simple (if).
* **`loop` (Bucle):** Iteración obligatoria al recorrer colecciones desde el Sistema.
* **`ref` (Referencia):** Actúa como un "include" visual. Encapsula y reutiliza flujos complejos ya documentados en otro diagrama (ej: `ref: Validar Pago Externo`), evitando saturar el diagrama principal.

##### Actores externos

* El envío de información a pasarelas de pago o servicios (ej: AFIP) lo ejecuta el **Sistema directamente hacia el Actor Externo**. No se modelan como clases del sistema.

```plantuml
actor "Entidad Bancaria" as Banco
Sistema ->> Banco: validarPago()
Banco --> Sistema: pagoValidado
```

##### Coherencia absoluta

* Todo mensaje enviado (el que recibe la punta de la flecha) debe existir obligatoriamente como un método en la tarjeta CRC y en el diagrama de clases de esa entidad receptora.

---

## Máquina de estados

*(Sección pendiente de completar en el apunte original.)*

---

## Patrones de diseño

*(Sección pendiente de completar en el apunte original.)*
