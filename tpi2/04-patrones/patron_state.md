# Patrón de diseño aplicado a Registrar Pagos: State

**Patrón elegido:** State (de comportamiento).
**Contexto:** `Cuota`. **Estados:** pendiente y pagada.

## 1. Qué problema resuelve

En Registrar Pagos la cuota cambia de situación: arranca **pendiente** y, cuando se cobra, pasa a **pagada**. Hoy esa situación es un valor enumerado (`EstadoCuota`: `PENDIENTE` o `PAGADA`) y las decisiones dependen de él:

- El `Sistema` pregunta `c.estado = PENDIENTE` para armar la lista de cuotas pendientes (paso 4). Tiene que mirar dentro de la cuota.
- `marcarPagada()` decidiría con un `if` según el valor. Qué pasa si la cuota ya estaba pagada no queda definido.
- Si aparece un estado nuevo (por ejemplo, una cuota **anulada** o **vencida**), hay que revisar el `if` de `marcarPagada()` y todos los lugares que consultan el estado.

**Qué dice el patrón:** el objeto cambia su comportamiento cuando cambia su estado, y cada estado es una clase. La cuota no decide con `if`: le pregunta a su estado.

## 2. Cómo se aplica (roles del patrón → clases del sistema)

| Rol del patrón | Clase en SquatGym |
|---|---|
| Contexto | `Cuota` |
| Estado | `EstadoCuota` (clase abstracta; reemplaza al tipo enumerado del mismo nombre) |
| EstadoConcreto | `EstadoCuotaPendiente` y `EstadoCuotaPagada` |

Cómo se comporta cada estado:

| Operación | `EstadoCuotaPendiente` | `EstadoCuotaPagada` |
|---|---|---|
| `marcarPagada(cuota)` | Le pide a la cuota que cambie su estado a un `EstadoCuotaPagada` nuevo. | No hace nada: la cuota ya estaba pagada. |
| `estaPendiente()` | Verdadero. | Falso. |

## 3. Cambios propuestos

Se parte de la máquina de estados de la cuota, como indica el apunte: cada estado del diagrama pasa a ser una clase.

| Diagrama | Archivo |
|---|---|
| Máquina de estados de la cuota | [`1_maquina_estados_cuota.puml`](1_maquina_estados_cuota.puml) (+ `.svg`) |
| Diagrama de clases **antes** | [`2_clases_antes.puml`](2_clases_antes.puml) (+ `.svg`) |
| Diagrama de clases **después** | [`3_clases_despues.puml`](3_clases_despues.puml) (+ `.svg`) |
| Secuencia de las partes que cambian | [`4_secuencia_state_marcar_pagada.puml`](4_secuencia_state_marcar_pagada.puml) (+ `.svg`) |

### Diagrama de clases

- `Cuota` ya no guarda un valor: guarda un objeto `estado` del tipo `EstadoCuota`.
- Se agregan a `Cuota` dos métodos: `estaPendiente()` y `cambiarEstado(estado)`. `marcarPagada()` se mantiene, pero ahora le delega el trabajo al estado.
- `EstadoCuota` es abstracta, con `marcarPagada(cuota)` y `estaPendiente()`. La heredan `EstadoCuotaPendiente` y `EstadoCuotaPagada`.
- El tipo enumerado `EstadoCuota` desaparece (ahora es una clase). `EstadoAlumno`, `EstadoCuenta` y `MedioPago` siguen igual.

### Diagrama de secuencia

La secuencia de Registrar Pagos **casi no cambia**. Los cambios son dos:

1. **Paso 4.** La condición `opt c.estado = PENDIENTE` pasa a preguntarle a la cuota: `estaPendiente()`. La cuota se lo pregunta a su estado.
2. **Paso 12.** El mensaje `marcarPagada()` es el mismo, pero por dentro la cuota se lo delega a `EstadoCuotaPendiente`, que crea un `EstadoCuotaPagada` y se lo asigna a la cuota con `cambiarEstado(n)`.

El resto de la secuencia (pantalla, controlador, banco, pago, recibo) no se toca.

### Tarjetas CRC

Cambia la de `Cuota` y se agregan tres.

**`Cuota` (actualizada)**

| Responsabilidades | Colaboración |
|---|---|
| **Hacer:**<br>- Pasar a pagada cuando se la cobra (`marcarPagada()`), delegándole al estado.<br>- Informar si está pendiente (`estaPendiente()`), preguntándole al estado.<br>- Cambiar su estado (`cambiarEstado(estado)`).<br><br>**Saber:**<br>- `idCuota`, `periodo`, `importe`, `fechaVencimiento`.<br>- `estado`: su `EstadoCuota` actual. | - **EstadoCuota:** el estado en que está; le delega el comportamiento.<br>- **Alumno:** el todo al que pertenece.<br>- **Pago:** el pago que la cubre.<br>- **Sistema:** quien la elige y le pide que se marque como paga. |

**`EstadoCuota` (nueva)**
* **Propósito:** Definir qué puede hacer una cuota según su estado. Es abstracta.

| Responsabilidades | Colaboración |
|---|---|
| **Hacer:**<br>- Declarar `marcarPagada(cuota)` y `estaPendiente()`, que cada estado concreto implementa.<br><br>**Saber:**<br>- No tiene atributos. | - **Cuota:** quien le delega.<br>- **EstadoCuotaPendiente** y **EstadoCuotaPagada:** sus estados concretos. |

**`EstadoCuotaPendiente` (nueva)**
* **Propósito:** Representar la cuota que todavía no se cobró (por vencer o vencida).

| Responsabilidades | Colaboración |
|---|---|
| **Hacer:**<br>- Pasar la cuota a pagada: crea un `EstadoCuotaPagada` y se lo asigna (`marcarPagada(cuota)`).<br>- Informar que está pendiente (`estaPendiente()`).<br><br>**Saber:**<br>- No tiene atributos. | - **Cuota:** quien le delega y a la que le cambia el estado.<br>- **EstadoCuotaPagada:** el estado que crea. |

**`EstadoCuotaPagada` (nueva)**
* **Propósito:** Representar la cuota ya cobrada. Evita que se cobre dos veces.

| Responsabilidades | Colaboración |
|---|---|
| **Hacer:**<br>- No cambiar nada si se pide pagarla otra vez (`marcarPagada(cuota)`).<br>- Informar que no está pendiente (`estaPendiente()`).<br><br>**Saber:**<br>- No tiene atributos. | - **Cuota:** quien le delega. |

## 4. Por qué se eligió este patrón

- **Se ve en el caso de uso.** Registrar Pagos es el que hace pasar a la cuota de pendiente a pagada. Es un ciclo de vida claro, y la máquina de estados sale directo de la descripción.
- **Saca los `if` sobre el estado.** Cada estado sabe qué hacer. El `Sistema` deja de mirar el valor interno de la cuota y pregunta `estaPendiente()`.
- **Evita cobrar dos veces la misma cuota.** Es un riesgo real con dos secretarias, una por sede: si una cuota ya está pagada, pedir `marcarPagada()` otra vez no la modifica.
- **Es fácil de ampliar.** Si el negocio necesita estados nuevos (por ejemplo, cuota vencida o anulada), se agrega una clase y no se toca el resto. Es una de las reglas del escenario: poder crecer sin rediseñar.
- **Mantiene el diseño.** No cambia las capas ni el flujo del caso de uso: solo cambia lo que hay dentro de `Cuota`.

## 5. Otras opciones que se analizaron

| Patrón | Para qué serviría | Por qué no |
|---|---|---|
| **Strategy** (medios de pago y promociones) | Una clase por medio de pago o por promoción, con su regla propia. | Hoy el efectivo y la tarjeta solo difieren en pasar o no por el banco, y las promociones difieren en datos (porcentaje, vigencia), no en cómo se calculan. Se vuelve útil si aparecen reglas muy distintas. |
| **Observer** (avisos al registrar el pago) | Que el alumno y las alertas se enteren del pago sin que el `Sistema` los llame uno por uno. | Emitir el recibo es obligatorio y ocurre dentro del caso de uso (include): no es un observador opcional. |
| **Singleton** (`Sistema`, `CTRLSesion`) | Una única instancia. | Es una decisión de creación, no cambia la solución del caso de uso. |

## 6. Límites

- Con dos estados, el beneficio es moderado. Se justifica porque la cuota es el objeto que más cambia de situación en el negocio y porque hay que evitar el doble cobro.
- `EstadoAlumno` y `EstadoCuenta` (al día, por vencer, deudor, bloqueado) podrían tratarse igual. No se aplicó porque el estado de cuenta se **calcula** desde las cuotas (`actualizarEstadoCuenta()`), no se asigna con eventos.
- El diagrama de clases, las tarjetas y la secuencia de [`02-realizacion-cu/`](../02-realizacion-cu/) quedan como están: son la versión base del caso de uso. Los cambios del patrón se muestran en esta carpeta, como pide la consigna ("mostrar los cambios propuestos").
