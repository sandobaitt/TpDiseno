# Pautas de Cátedra y Puntos de Consulta Docente (DSI)

Este documento profundiza en las justificaciones de cada pauta indicada por la cátedra y detalla las inconsistencias y consultas recomendadas para realizar al docente o ayudante de trabajos prácticos.

---

## 🔍 Desglose Técnico de las Pautas de la Cátedra

### 1. Control de Sesión (`CTRLSesion`)
- **Propósito:** Separación de responsabilidades. La autenticación es un aspecto transversal. Una vez que el usuario ingresó al sistema, la sesión activa almacena su contexto (`legajo`, `idUsuario`, `rol`, etc.).
- **Regla:** En los diagramas de secuencia de casos de uso operativos (ej: *Registrar Venta*, *Inscribir a Examen*), el actor humano nunca debe ingresar su propio legajo o datos que el sistema ya conoce. El `CTRLCU` debe delegar esa consulta al `CTRLSesion`.
- **Notación:** Se representa como una línea de vida preexistente (sin mensaje `new` / `create`).

### 2. Nomenclatura `obtener...()` vs `get...()`
- **Capa Control / Negocio (`CTRL` $\rightarrow$ `Sistema`):**
  - Los mensajes entre controladores y la fachada del sistema representan operaciones de alto nivel del caso de uso. Deben expresar intención de negocio: `obtenerAlumnosInscriptos()`, `buscarTurnosDisponibles()`, `calcularMontoTotal()`.
- **Capa de Dominio / Entidades (`Sistema` $\rightarrow$ `Entidad`):**
  - Los mensajes entre el sistema y las instancias de entidad representan consultas directas de atributos de estado (propiedades encapsuladas). Por estándar de Programación Orientada a Objetos, se utiliza `getNombre()`, `getLegajo()`, `getPrecio()`.

### 3. Creación y Ciclo de Vida de Listas Temporales
- **Creador (Patrón GRASP Creator):** El objeto `Sistema` contiene o coordina la búsqueda, por lo tanto es quien crea la lista temporal (ej: `create` sobre `listaDTO` o `listaTemp`).
- **Retorno implícito de referencia:** Al hacer `Sistema -> listaTemp: add(item)`, `Sistema` ya tiene el puntero a la colección en su memoria local. Modelar una flecha `listaTemp --> Sistema` es redundante e incorrecto bajo la semántica UML.
- **`destroy` de la lista temporal:** Según el apunte 2026, al terminar de usar la lista el `Sistema` le envía un mensaje `destroy()`. No debe usarse como "recolector de basura" al final del CU (ver Consulta 4).
- **Nomenclatura:** colección recorrida `LT` + inicial de la clase (`LTC: Clientes`); lista temporal `LTT` + inicial (`LTTC: Clientes`).

### 4. Retornos sin palabra clave `return`
- En PlantUML y UML estándar, la flecha discontinua (`-->`) define intrínsecamente un mensaje de respuesta (`reply message`).
- Escribir `return: x` o `retornar(x)` genera ruido visual. Basta con rotular la flecha con el nombre del dato o variable devuelta (`--> CTRLCU: listaFiltrada`).

---

## ❓ Puntos de Consulta / Inconsistencias a Confirmar con el Docente

A continuación se listan las consultas puntuales para trasladar a la profesora o ayudantes para asegurar máxima compatibilidad con su criterio de corrección:

### Consulta 1: "Una clase que relacione las 3 clases del sistema"
- **Contexto:** En el tip se indicó: *"El diagrama de clases habría que tener una clase que relacione las 3 clases del sistema"*.
- **Pregunta concreta para el docente:**
  > *"Profe, cuando en el enunciado tenemos tres clases principales del sistema (ej: Cliente, Producto, Vendedor), ¿la clase que las relaciona se refiere a una **clase asociativa / transacción** del modelo de dominio (como `Pedido`, `Factura` o `Reserva`), o se refiere a la clase **`Sistema`** actuando como Fachada/Controlador de negocio que conoce las colecciones de las tres entidades?"*
- **Impacto en el parcial:** Si se refiere al dominio, no debe faltar la entidad transaccional intermedia que resuelve las relaciones N a N. Si se refiere a la arquitectura, la clase `Sistema` debe tener los enlaces (`1 -> *`) hacia los repositorios/colecciones.

### Consulta 2: Destinatario directo del retorno de la lista temporal
- **Contexto:** El tip menciona: *"El retorno de la lista completa debe graficarse desde el Sistema hacia el Controlador o la UI"*.
- **Pregunta concreta para el docente:**
  > *"¿En la cátedra se permite que el mensaje de retorno de la lista vaya directamente desde `Sistema` a la `Pantalla/UI`, o el retorno debe viajar obligatoriamente `Sistema --> CTRLCU` y luego el `CTRLCU` envía los datos a la `Pantalla/UI` para respetar el patrón Controlador?"*
- **Recomendación por defecto:** Mantener el desacoplamiento estricto (`Sistema --> CTRLCU --> Pantalla`). Es la opción universalmente más segura en cualquier corrección académica. El apunte 2026 solo muestra retornos `Sistema --> CTRLCU`, lo que es consistente con esto.

### Consulta 3: Creación de nuevas entidades de negocio — ✅ RESUELTA por el apunte 2026
- **Resolución:** El `Sistema` instancia las entidades simples y las cabeceras; en una composición, **la cabecera** crea sus detalles (ver *Creación de objetos de entidades de negocio* en `apunte.md`).

### Consulta 4: ¿Cuándo va el `destroy()`? — ✅ RESUELTA en clase
- **Resolución:** El `destroy` va principalmente a las **listas temporales ya usadas**, enviado por el `Sistema`. Además, **al terminar el CU el controlador destruye la UI** (`CTRLCU -> UI: destroy()`).

### Consulta 5: Nombres de listas con clases de igual inicial — ✅ RESUELTA en clase
- **Resolución:** No complicarse. `Clientes` → `LTC`, y si aparece `Camiones` → `LTCAM`. En la skill también se abrevia con 3 letras cuando la clase empieza con **T** (`LTTIC: Tickets`, `LTTAR: Tareas`), para que no se confunda con el prefijo `LTT` de las listas temporales.

### Consulta 6: ¿Quién hace el loop? — ✅ RESUELTA en clase
- **Resolución:** El loop lo hace **siempre el `Sistema`**, porque es quien tiene el método para hacerlo. Si la colección pertenece a otro objeto (`Equipo` → `Desarrolladores`), el `Sistema` primero le pide la lista y después la recorre él.

### Consulta 7: Retornos, alcance del diagrama y flecha UI → Actor — ✅ RESUELTA en clase
- **Resolución:**
  - Los getters devuelven **el objeto**. Una comparación por atributo se considera resuelta en la guarda (`c.estado = true`), sin getters adicionales.
  - Se diagrama **solo el camino estándar** de la descripción del caso de uso.
  - La flecha `UI --> Actor` normalmente va, para mostrarle algo al actor.

### Consulta 8: Búsqueda indexada vs recorrido — ✅ RESUELTA en clase
- **Resolución:** Las dos formas son válidas. Búsqueda indexada (`getCliente(idCliente)`, sin loop) cuando se necesita **un** objeto puntual; `loop` sobre `LTx` cuando hay que **conocer varios**.

---

## 🧪 Pendiente de validar con la cátedra

Los modelos `01`, `02` y `03` y el ejemplo de esta skill reflejan la interpretación actual de las reglas, **no** una resolución corregida por la cátedra. A medida que se validen, registrar acá qué se confirmó y qué se corrigió.

- **Cambios de estado (criterio propio):** se modelan con un mensaje de negocio a la entidad (`r.confirmar()`, `t.reasignar(nuevoDev)`) en lugar de `setEstado(...)` desde el Sistema. Confirmar si la cátedra acepta setters o prefiere este estilo, y cómo espera ver el patrón State cuando se pide.
- **Retorno de dos valores:** `Sistema --> CTRL: LTTAR, tiempoTotal` (modelo 03). Confirmar si se acepta así.
