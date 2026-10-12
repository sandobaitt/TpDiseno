# Descripción de Caso de Uso: CU-A06 Gestionar Asistencia Diaria por Clase y Sede

* **Actores:** Secretaria, Profesor. El camino estándar se describe para la Secretaria; lo que cambia para el Profesor está en el camino alternativo 2.a.
* **CU incluido:** CU-A13 Verificar Habilitación para Ingresar a Clase (se describe más abajo).
* **Precondiciones:**
  * El actor se encuentra autenticado en el sistema.
  * El cronograma tiene clases programadas.
* **Postcondiciones:**
  * Queda registrada la asistencia de cada alumno de la clase en la fecha indicada: presente, ausente o ausente con justificación.
  * Queda registrado quién cargó la asistencia, y la fecha y hora del registro.
  * Ningún alumno no habilitado queda registrado como presente.

---

### Camino Estándar

| Paso | Responsable | Acción / Proceso |
| :---: | :---: | :--- |
| **1** | **Actor** | La secretaria selecciona la opción para gestionar la asistencia diaria. |
| **2** | **Sistema** | Muestra las sedes activas y solicita la sede y la fecha, proponiendo la sede de la secretaria y la fecha actual. |
| **3** | **Actor** | Selecciona la sede y la fecha. |
| **4** | **Sistema** | Busca las clases programadas en la sede para el día de la semana de la fecha indicada y las muestra con su actividad, horario y profesor. |
| **5** | **Actor** | Selecciona una clase. |
| **6** | **Sistema** | Busca los alumnos activos cuyo plan incluye la actividad de la clase, verifica la habilitación de cada uno para ingresar (*incluye CU-A13 Verificar Habilitación para Ingresar a Clase*) y muestra la lista de alumnos con su habilitación. |
| **7** | **Actor** | Indica, para cada alumno, si estuvo presente, ausente o ausente con justificación. |
| **8** | **Sistema** | Muestra el resumen de la asistencia (cantidad de presentes, ausentes y ausentes con justificación) y solicita confirmación. |
| **9** | **Actor** | Confirma el registro. |
| **10** | **Sistema** | Registra la asistencia de cada alumno de la clase en la fecha indicada, junto con la secretaria que la registra y la fecha y hora, e informa que la asistencia quedó registrada. |

---

### Caminos Alternativos

#### 2.a El actor es un Profesor
1. El sistema solicita solo la fecha, proponiendo la fecha actual.
2. El profesor selecciona la fecha.
3. El sistema busca y muestra solo las clases que el profesor dicta en esa fecha, en cualquier sede, incluidas las que cubre por un reemplazo aceptado.
4. Retoma en el paso 5.

#### 3.a La fecha seleccionada es posterior a la fecha actual
1. El sistema informa que no se puede registrar la asistencia de una fecha futura.
2. Retoma en el paso 3.

#### 3.b La fecha seleccionada tiene más de 30 días de antigüedad
1. El sistema informa que la asistencia solo se puede registrar o corregir hasta 30 días atrás.
2. Retoma en el paso 3.

#### 4.a No hay clases programadas en la sede para la fecha seleccionada
1. El sistema informa que no hay clases programadas para esa sede y esa fecha.
2. Retoma en el paso 3.

#### 6.a La asistencia de la clase en esa fecha ya fue registrada
1. El sistema muestra la asistencia registrada, indicando quién la registró y cuándo.
2. El actor modifica el estado de los alumnos que corresponda.
3. Retoma en el paso 8. En el paso 10, el sistema registra la corrección indicando quién la hizo y cuándo, y conserva el registro anterior.

#### 6.b Ningún alumno activo tiene un plan que incluya la actividad de la clase
1. El sistema informa que la clase no tiene alumnos para registrar.
2. Retoma en el paso 5.

#### 7.a El actor indica como presente a un alumno no habilitado
1. El sistema informa que el alumno no está habilitado para ingresar y el motivo: bloqueado por deuda (con los días de atraso y el monto adeudado) o acceso restringido (con el motivo de la restricción).
2. El sistema no permite registrarlo como presente.
3. Retoma en el paso 7.

#### 9.a El actor no confirma el registro
1. El sistema conserva lo indicado hasta el momento.
2. Retoma en el paso 7.

#### 10.a No hay conexión al momento de registrar
1. El sistema informa que no hay conexión y conserva en el equipo la asistencia cargada.
2. Cuando se restablece la conexión, retoma en el paso 9.

> **Caminos alternativos más significativos** (punto 2.b de la consigna): **7.a**, porque es donde actúa la regla de habilitación del CU incluido, y **6.a**, porque cubre la modificación de una asistencia ya registrada (requisito 3.1.12b del escenario). Los demás completan todos los casos posibles.

---
---

# Descripción de Caso de Uso incluido: CU-A13 Verificar Habilitación para Ingresar a Clase

* **Actor:** Secretaria
* **Precondición:** La secretaria se encuentra autenticada en el sistema.
* **Postcondición:** Queda determinado si el alumno está habilitado para ingresar y, si no lo está, el motivo.

> **Cuando lo incluye CU-A06** (paso 6), no hay intervención del actor: el sistema recibe el alumno, la clase y la fecha, y realiza la verificación del paso 4. Si el alumno no está habilitado, el resultado se muestra en la lista de la clase en lugar de terminar el caso de uso.

---

### Camino Estándar

| Paso | Responsable | Acción / Proceso |
| :---: | :---: | :--- |
| **1** | **Actor** | La secretaria selecciona la opción para verificar la habilitación de un alumno. |
| **2** | **Sistema** | Solicita el DNI o el nombre del alumno y una clase del día. |
| **3** | **Actor** | Ingresa el DNI del alumno y selecciona la clase. |
| **4** | **Sistema** | Busca al alumno y verifica que esté activo, que no tenga una restricción de acceso manual, que no tenga una cuota con 15 o más días de atraso desde su vencimiento (el día 5 de cada mes) y que su plan incluya la actividad de la clase. Informa que el alumno está habilitado para ingresar. |

---

### Caminos Alternativos

#### 3.a El actor ingresa el nombre del alumno
1. El sistema muestra los alumnos cuyo nombre coincide.
2. La secretaria selecciona al alumno.
3. Retoma en el paso 4.

#### 3.b El actor no selecciona una clase
1. El sistema verifica solo el estado del alumno, la restricción manual y la deuda, sin controlar el plan.
2. Retoma en el paso 4.

#### 4.a No existe un alumno con el DNI ingresado
1. El sistema informa que no encontró al alumno.
2. Retoma en el paso 3.

#### 4.b El alumno está dado de baja
1. El sistema informa que el alumno no está habilitado porque está dado de baja.
2. Fin del caso de uso.

#### 4.c El alumno tiene una restricción de acceso manual
1. El sistema informa que el alumno no está habilitado y el motivo de la restricción.
2. Fin del caso de uso.

#### 4.d El alumno tiene una cuota con 15 o más días de atraso
1. El sistema informa que el alumno está bloqueado por deuda, con los días de atraso y el monto adeudado.
2. Fin del caso de uso. La secretaria puede registrar el pago con CU-A04 Registrar Pago de Cuota; al quedar al día, el alumno queda habilitado.

#### 4.e La actividad de la clase no está incluida en el plan del alumno
1. El sistema informa que la clase no está incluida en el plan contratado.
2. Fin del caso de uso.

> **Regla configurable:** el umbral de 15 días de atraso desde el vencimiento es un parámetro del sistema, no un valor fijo del caso de uso.
