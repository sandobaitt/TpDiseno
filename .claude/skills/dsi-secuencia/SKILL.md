---
name: dsi-secuencia
description: >-
  Guía y pautas obligatorias de la cátedra para la resolución y diagramado de Diagramas de Secuencia
  y su coherencia con Diagramas de Clases y Tarjetas CRC en Diseño de Sistemas (DSI). Aplica reglas
  estrictas de CTRLSesion preexistente, notación LTx/LTTx (ej: LTC/LTTC) para recorridos y listas temporales,
  loops hechos por Sistema, búsqueda indexada vs recorrido, creación de entidades/composiciones,
  actores externos invocados por Sistema, destroy de listas temporales y de la UI, solo camino estándar,
  y verificación automática de coherencia con verificar.py.
---

# Skill: Diagramas de Secuencia - Pautas de Cátedra (DSI)

Esta skill define las reglas obligatorias, criterios de corrección y convenciones de la cátedra de **Diseño de Sistemas (DSI)** para modelar **Diagramas de Secuencia** en PlantUML y asegurar su consistencia con el Diagrama de Clases y las Tarjetas CRC.

- **Fuente de verdad:** [apunte.md](../../../tpi2/apunte.md) → sección *3 - Diagrama de secuencia*, más las aclaraciones dadas en clase que se registran acá. Si algo contradice al apunte, **gana el apunte**.
- **Justificaciones y dudas abiertas:** [references/pautas_catedra.md](references/pautas_catedra.md).
- **Ejemplo de referencia:** [examples/ejemplo_secuencia_catedra.puml](examples/ejemplo_secuencia_catedra.puml). No está validado por la cátedra; refleja la interpretación actual de las reglas.
- **Verificación:** `tpi2/verificar.py <carpeta-del-modelo>` (ver §13).

---

## 🔄 Actualización del apunte (28/10/2026)

El apunte nuevo (`tpi2/apunte.md`) gana sobre lo que dice esta skill más abajo. Cambios que afectan al diagrama:

- **Notación de listas:** recorrido `LL[c]: Clientes` (lista de `c` sobre `Clientes`) y lista temporal `LT` + letra que indique de qué es + `[objeto]`: `LTP[c]: Cuotas` = pendientes, `LTS[c]: Cuotas` = seleccionadas, `LTV[pr]: Promociones` = vigentes. En los ejemplos de abajo, `LTC` se lee `LL[c]` y `LTTC` se lee `LT` + letra. `verificar.py` acepta todas las notaciones.
- **Loop:** `for each c in Clientes`.
- **Altas:** `create()` seguido de los sets (`setDatos(datos)`, `setAlumno(a)`…), **siempre desde el Sistema**. Con muchos datos: `setDatos(datosX)` y una nota que diga qué contiene. La composición no cambia: la cabecera crea sus partes.
- **Ingreso múltiple:** el actor nunca envía listas; manda un elemento por vuelta dentro de un `loop`. En cada vuelta el CTRL le dice a la UI que pregunte si sigue ingresando, la UI se lo pregunta al actor y su respuesta decide si el loop continúa (no hace falta un mensaje de "terminar" aparte; tampoco mostrar el elemento elegido).
- **Comparar en el loop:** al recorrer una colección, la guarda compara el atributo que corresponde (por ejemplo `c.alumno.dni = dni`), no se arma la lista desde otro objeto.
- **`Externo`:** va a la izquierda del actor principal (es un extra). Como el CTRL no tiene atributos, el Sistema acumula lo elegido en una lista temporal.
- **Nombres:** `UI<Nombre del CU>` y `CTRL<Nombre del CU>` (ej: `UIRealizarReserva`, `CTRLRealizarReserva`).
- **Entidad a colección:** un objeto puede pedir colecciones a otro con getters (`a.getCuotas()`).
- **Listas temporales:** sin retorno tras `create`/`add`, pero **leer** un elemento (`getX()`) sí devuelve el objeto. El `destroy` es lo correcto aunque la profesora dijo que no hace falta en el parcial.
- **`create()` y `destroy()` van con línea punteada** (`-->`), no con la flecha continua. `verificar.py` lo acepta y los sigue controlando.
- **Inicio y fin (como lo pide la profe):** un participante `Externo` (algo ajeno al CU) le manda `create()` al CTRL; el CTRL le manda `create()` a la UI y después `mostrarOpciones()`; recién ahí la secretaria elige la opción del CU. Al final, el CTRL manda `destroy()` a la UI y **después** el `Externo` manda `destroy()` al CTRL (ese es el último mensaje). Vale para cada CU que tenga su propio CTRL, incluidos el include y el extend.
- **Include y extend:** en el diagrama del CU base se muestran con un `ref over ...` (el extend dentro de un `opt` con la condición de la descripción) y cada uno tiene su propio diagrama de secuencia, con su `UI<CU>` y su `CTRL<CU>`. Los datos del CU base (alumno, monto, etc.) llegan como parámetros.
- **Orden de trabajo:** primero el diagrama de clases sin métodos ni atributos, después la secuencia, después se completan las clases y al final las tarjetas CRC.

---

## 📌 Reglas de Oro de la Cátedra (Checklist de Examen)

### 1. Alcance: solo el camino estándar
- Se diagrama **únicamente el camino estándar** de la descripción del caso de uso. Los caminos alternativos **no** se diagraman.
- Cada paso de la descripción tiene que poder rastrearse en el diagrama. Separar los bloques con `== Paso N: ... ==`.

### 2. Orden de participantes (izquierda → derecha)
`Actor → Pantalla (UI) → CTRLCU → CTRLSesion → Sistema → Colecciones/Entidades → Actor Externo`

- El **Actor Externo** (banco, AFIP, Trello, pasarela) va **siempre en el extremo derecho**.
- Las listas temporales y las entidades nuevas van a la derecha de las colecciones (y a la izquierda del actor externo). En PlantUML, **declararlas arriba** con `participant` y usar `create <alias>` en el momento en que nacen; si no se declaran, PlantUML las agrega al final y quedan a la derecha del actor externo.

### 3. Manejo de Sesión (`CTRLSesion`)
- **Prohibido pedirle al actor datos que el sistema ya conoce** si la precondición dice que está logueado (`legajo`, `idUsuario`, `rol`).
- `CTRLSesion` es una **instancia preexistente**: NUNCA lleva `create`.
- El `CTRLCU` la consulta **solo si el CU necesita el usuario** (para registrarlo, filtrar por él, etc.): `CTRLCU -> CTRLSesion: obtenerUsuarioLogueado()` / `CTRLSesion --> CTRLCU: usuario`.

### 4. Nomenclatura de mensajes por capa
| De → A | Forma | Ejemplos |
| :--- | :--- | :--- |
| `Actor → UI` | Acción de negocio del actor, sin detalles de interfaz (nada de "click", "botón") | `seleccionarOpcionReservar()`, `ingresarCantidad(cant)`, `confirmar()` |
| `UI → CTRLCU` | Iniciar / reenviar la acción del actor | `iniciarReserva()`, `tomarSeleccion(idEvento)` |
| `CTRLCU → UI` | **Mensaje síncrono** (`->`) a un método de la UI | `mostrarEventos(LTTE)`, `solicitarConfirmacion()` |
| `UI → Actor` | **Retorno punteado** con lo que se le muestra al actor. Va siempre que se le muestra algo | `UI --> Actor: eventos disponibles` |
| `CTRLCU → Sistema` | **Verbo de negocio. Prohibido `get`** | `obtenerEventos()`, `buscarDisponibles(fecha)`, `registrarReserva(...)` |
| `Sistema → Entidad` | **Getters formales POO** que devuelven **el objeto** | `getCliente()`, `getEvento(idEvento)`, `getEquipo()` |
| `Sistema → Entidad` (lógica) | Mensaje de negocio a la entidad experta | `calcularImporte(cant)`, `tieneDisponibilidad(cant)`, `decrementarCupo(cant)` |

- **Se devuelve el objeto, no sus atributos:** el getter retorna `c` y a partir de ahí sus atributos se consideran conocidos. Una comparación por atributo va directo en la guarda (`opt c.estado = activo`), **sin** un `getEstado()` previo. No encadenar `getNombre()`, `getFecha()`, etc., para armar listas.
- **Patrón Experto:** los cálculos que dependen de los datos de una entidad se delegan a ella (`e.calcularImporte(cant)`), no se hacen en `Sistema`/`CTRL` con getters.
- **Mensajes reflexivos:** graficar explícitamente `Sistema -> Sistema: calcularTotal(...)` cuando una instancia usa un método propio.

### 5. Parámetros y retornos
- **Ida:** toda invocación que necesita datos lleva los parámetros en la firma con nombres representativos.
  - ✔️ `add(c)`, `procesarPago(idMedioPago, datosPago)`, `decrementarCupo(cantidad)`
  - ❌ `add()`, `procesarPago()`, `decrementarCupo()`
- **Vuelta:** línea punteada (`-->`) con **únicamente el nombre del dato retornado**.
  - ❌ `return: lista`, `retornar(lista)`, `CTRLCU --> UI: mostrarLista(lista)` (un método no va en una flecha de retorno).
  - ✔️ `Sistema --> CTRLCU: LTTE`, `LTC --> Sistema: c`.
- Coherencia con clases: cada parámetro graficado figura con tipo en la firma del método (`+ tieneDisponibilidad(cant: int): boolean`).

### 6. Acceso a objetos: búsqueda indexada vs recorrido
Las dos formas son válidas; se elige según lo que pide el paso:

| Necesidad | Forma | Participante |
| :--- | :--- | :--- |
| **Un objeto puntual** conocido por su id (el actor lo seleccionó) | Búsqueda indexada, **sin loop**: `Sistema -> Clientes: getCliente(idCliente)` → `c` | Solo el nombre de la clase: `Clientes` |
| **Conocer varios objetos** (listar, filtrar, acumular) | Recorrido con `loop` | `LT` + inicial: `LTC: Clientes` |

- Si la colección ya aparece en el diagrama como `LTx` (porque se recorrió en otro paso), la búsqueda indexada se le envía a ese mismo participante (`Sistema -> LTC: getCliente(idCliente)`) en vez de duplicar la columna.

### 7. Recorrido de colecciones: `LT` + inicial de la clase
- El participante que se recorre se nombra **`LT` + una letra de la clase**: `LTC: Clientes`, `LTE: Eventos`. **No se puede recorrer una clase sin esta notación.**
- **No complicarse:** si dos clases comparten inicial, o si la clase empieza con **T** (se confundiría con el prefijo de lista temporal), usar una abreviatura corta: `Camiones` → `LTCAM`, `Tickets` → `LTTIC`, `Tareas` → `LTTAR`.
- **El loop lo hace siempre el `Sistema`** (es quien tiene el método para hacerlo), aunque la colección pertenezca a otro objeto: primero obtiene la lista del dueño (`Sistema -> eq: getDesarrolladores()` → `LTD`) y después la recorre él.
- Dentro del `loop`, el primer mensaje obtiene el elemento y el retorno es la variable de iteración:
  ```plantuml
  participant "LTC: Clientes" as LTC <<Entity>>
  loop for each c in LTC
      Sistema -> LTC: getCliente()
      activate LTC
      LTC --> Sistema: c
      deactivate LTC
  end
  ```
- Etiqueta del loop: `for each <var> in <LTx>`. Etiqueta del opt de filtro: `<var>.<atributo> = <valor>`.
- Los mensajes de negocio a cada elemento se envían al mismo participante `LTx` (`Sistema -> LTD: calcularCargaSprint()`).

### 8. Listas temporales: `LTT` + inicial de la clase
- Se agrega una **T** más a la notación de lista: `LTTC: Clientes`, `LTTE: Eventos`, `LTTTIC: Tickets`.
- **`Sistema` es el único responsable** de hacer el `create()` y los `add(x)` (normalmente dentro de un `loop`/`opt`).
- **Sin flecha de retorno** desde la lista hacia `Sistema` (ya la conoce).
- `Sistema` devuelve la lista al `CTRLCU`: `Sistema --> CTRLCU: LTTC`.
- **`destroy()`:** una vez usada, el `Sistema` le envía `destroy()` (flecha + `X`), inmediatamente después de devolverla. No se deja como "recolector de basura" al final del CU.
  ```plantuml
  participant "LTTC: Clientes" as LTTC
  ...
  create LTTC
  Sistema -> LTTC: create()
  loop for each c in LTC
      Sistema -> LTC: getCliente()
      LTC --> Sistema: c
      opt c.activo = true
          Sistema -> LTTC: add(c)
      end
  end
  Sistema --> CTRLCU: LTTC
  Sistema -> LTTC: destroy()
  destroy LTTC
  ```

### 9. Ciclo de vida: `create()` y `destroy`
- `create(...)` siempre que una instancia **nace durante el flujo** (entidad nueva, cabecera, detalle, lista temporal). La flecha apunta a la **cabecera (caja superior)** del nuevo objeto → en PlantUML, `create <alias>` antes del mensaje.
- Si el objeto necesita datos iniciales, van como parámetros: `create(cliente, evento, cantidad)`.
- Nombre de la instancia nueva: **`r: Reserva`** (variable : Clase).
- **Nunca llevan `create`:** `UI`, `CTRLCU`, `CTRLSesion`, `Sistema`, colecciones existentes.
- **`destroy` va en dos lugares:**
  1. Listas temporales ya usadas → las destruye el `Sistema` (§8).
  2. **Fin del CU** → el `CTRLCU` destruye la UI: `CTRLCU -> UI: destroy()` + `destroy UI`, después de la última vez que la UI le muestra algo al actor.

### 10. Creación de entidades y composición (Todo-Parte)
- **Entidad simple:** tras el proceso exitoso, `Sistema` ejecuta el `create(...)` de la entidad.
- **Composición** (ej: `Reserva` ◆— `Entrada`, `Venta` ◆— `LineaVenta`):
  1. `Sistema -> r: create(...)` de la **cabecera**.
  2. Dentro de un `loop`, `Sistema -> r: agregarEntrada(...)`.
  3. **La cabecera** hace `create(...)` de cada hijo. El `Sistema` **NO** instancia los detalles.

### 11. Cambios de estado
- Un cambio de estado de una entidad se pide con un **mensaje de negocio con el nombre de la acción**, y la entidad actualiza su propio estado (Experto): `r.confirmar()`, `t.reasignar(nuevoDev)`, `p.marcarEntregado()`.
- **No** usar setters de estado desde el `Sistema` (`setEstado("Confirmada")`): eso saca la regla de negocio de la entidad. Un `setX` solo es aceptable para asignar un dato simple que no es un estado.
- Si el ejercicio pide **patrón State** / máquina de estados, la entidad delega en su estado actual y ese estado crea el siguiente:
  ```plantuml
  Sistema -> r: confirmar()
  r -> estadoActual: confirmar(r)
  create confirmada
  estadoActual -> confirmada: create()
  estadoActual -> r: setEstado(confirmada)
  ```

### 12. Fragmentos de interacción
- **`loop`:** **obligatorio** al recorrer colecciones desde `Sistema` (siempre sobre un participante `LTx`). También para repeticiones que el camino estándar indica ("repite los pasos 7 a 11").
- **`opt`:** condición simple (filtro dentro de un recorrido).
- **`alt`:** solo si el **camino estándar** tiene dos ramas excluyentes. Los caminos alternativos de la descripción no se diagraman (§1).
- **`ref`:** "include visual" para flujos ya documentados en otro diagrama: `ref over Sistema, Banco : Validar Pago Externo`.

### 13. Actores Externos
- Los invoca **el `Sistema` directamente** (no el `CTRLCU`, no una clase interna).
- Mensaje **asíncrono** obligatorio (`->>`, punta abierta); la respuesta vuelve con `-->`.
- Se modelan como `actor` en el extremo derecho, **nunca** como clase del sistema (no aparecen en el diagrama de clases).
  ```plantuml
  Sistema ->> Banco: validarPago(idUsuario, cuenta)
  Banco --> Sistema: pagoValidado
  ```

### 14. Coherencia absoluta con Clases y CRC
- Todo mensaje que **recibe** un objeto (punta de la flecha) debe existir con la **misma firma** como método en su clase del diagrama de clases y como responsabilidad en su Tarjeta CRC (si la consigna pide CRC de esa clase). Incluye los métodos de la **UI** (lo que el actor le envía y `mostrarX`) y del **CTRLCU** (`tomarX`, `iniciarX`).
- Excepciones: mensajes al **Actor humano** y al **Actor Externo** (no son clases), `create()` / `destroy()` / `add()` sobre listas temporales, y el getter de acceso a la colección (`getCliente()` / `getCliente(id)` sobre `LTC` o `Clientes`).
- **Verificar siempre** antes de entregar:
  ```bash
  tpi2/verificar.py tpi2/02-realizacion-cu   # carpeta con secuencia + clases (+ CRC si existen)
  tpi2/verificar.py secuencia.puml clases.puml [crc.md]
  ```
  Reporta métodos faltantes en clases/CRC, cantidad de parámetros distinta, retornos con métodos, `get` de CTRL a Sistema, actores externos no invocados por Sistema, numeración manual, listas temporales sin `destroy` y UI sin `destroy` al final.

---

## 🏗️ Plantilla de participantes (PlantUML)

```plantuml
@startuml secuencia_<nombre_cu>
!pragma layout smetana
autonumber
skinparam shadowing false
skinparam roundcorner 8
skinparam sequenceArrowThickness 1.5
skinparam sequenceMessageAlign center
skinparam responseMessageBelowArrow true

actor "<Rol>" as Actor
boundary "Pantalla<CU>" as UI <<Boundary>>
control "CTRL<CU>" as CTRLCU <<Control>>
control "CTRLSesion" as CTRLSesion <<Control>>
participant "Sistema" as Sistema <<Sistema>>
participant "Clientes" as Clientes <<Entity>>              ' búsqueda indexada (sin loop)
participant "LTE: Eventos" as LTE <<Entity>>               ' colección que se recorre (LT + inicial)
participant "e: Evento" as Evento <<Entity>>               ' instancia puntual ya conocida
participant "LTTE: Eventos" as LTTE                        ' lista temporal: "create LTTE" donde nace
participant "r: Reserva" as Reserva <<Entity>>             ' entidad nueva: "create Reserva" donde nace
actor "<ServicioExterno>" as Externo                       ' siempre a la derecha
@enduml
```

**Numeración:** usar solo `autonumber`. **No** escribir números a mano en las etiquetas (`1. iniciar()`), porque se duplican con la numeración automática.

**Activaciones:** usar `activate`/`deactivate` para mostrar el foco de control de cada objeto mientras procesa.

---

## 🔄 Flujo de trabajo para resolver un diagrama

1. **Leer el camino estándar** de la descripción del CU. Cada paso del actor es `Actor -> UI -> CTRLCU`; cada paso del sistema termina en `CTRLCU -> UI: mostrarX(...)` + `UI --> Actor`.
2. **Sesión:** si el CU necesita al usuario logueado, `CTRLCU -> CTRLSesion: obtenerUsuarioLogueado()`.
3. **Consultas al Sistema:** `CTRLCU -> Sistema: obtenerX(params)` (verbo de negocio).
4. **Acceso a objetos:** búsqueda indexada (`getX(id)`) si es uno puntual; `loop` sobre `LTx` si hay que conocer varios.
5. **Filtrado/armado de listas:** `create` de `LTTx`, `opt` con la condición sobre atributos del objeto, `add(x)`; retorno de la `LTTx` al CTRL y `destroy()`.
6. **Reglas de negocio y cambios de estado:** delegar a la entidad experta (`tieneDisponibilidad(cant)`, `confirmar()`).
7. **Actores externos:** `Sistema ->> Externo` y respuesta `-->`.
8. **Alta de entidades:** `Sistema` hace `create(...)` de la entidad/cabecera; la cabecera crea sus detalles.
9. **Cierre:** `Sistema --> CTRLCU: resultado`, `CTRLCU -> UI: mostrarX(...)`, `UI --> Actor: ...`, `CTRLCU -> UI: destroy()`.
10. **Actualizar clases y CRC** con cada método recibido y **correr `tpi2/verificar.py`**. Renderizar con `tpi2/render.sh <archivo.puml>`.

---

## ✅ Checklist rápido de corrección

- [ ] Solo el camino estándar; cada paso de la descripción aparece en el diagrama.
- [ ] Orden de participantes correcto y actor externo a la derecha.
- [ ] No se le piden al actor datos de sesión; `CTRLSesion` sin `create`.
- [ ] Ningún `get` de `CTRLCU` a `Sistema`; getters de `Sistema` a entidades devuelven el objeto.
- [ ] Comparaciones por atributo en la guarda (`c.estado = activo`), sin getters extra.
- [ ] Búsqueda indexada para un objeto puntual; `LTx` + `loop` (hecho por `Sistema`) para varios.
- [ ] Listas temporales `LTTx` creadas y llenadas solo por `Sistema`, sin retorno desde la lista, con `destroy()` después de usarse.
- [ ] Entidades nuevas como `var: Clase`, creadas por `Sistema`; detalles creados por la cabecera.
- [ ] Cambios de estado con mensajes de negocio, no con `setEstado`.
- [ ] Retornos punteados solo con el nombre del dato; métodos de UI como mensajes síncronos; `UI --> Actor` cuando se le muestra algo.
- [ ] Actores externos invocados por `Sistema` con `->>`.
- [ ] El `CTRLCU` destruye la UI al final.
- [ ] `tpi2/verificar.py` sin errores.
