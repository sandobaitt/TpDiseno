# Arquitectura de SquatGym

## 1. Tipo de arquitectura elegido

**Arquitectura cliente-servidor en capas (3 niveles).**

- **Cliente:** el navegador del usuario (PC, notebook o celular). Solo muestra pantallas.
- **Servidor de aplicación:** controla el acceso, ejecuta las reglas del negocio y habla con los servicios de afuera.
- **Servidor de base de datos:** guarda los datos de todas las sedes en una única base.

Dentro del servidor, el sistema se divide en **capas**. Cada capa solo le habla a la que tiene debajo:

| Capa | Qué hace | Clases del diseño (Registrar Pagos) |
|---|---|---|
| **Presentación** | Muestra pantallas y recibe lo que carga el usuario. No conoce el negocio. | `UIRegistrarPagos`, `UIAplicarPromociones`, `UIEmitirRecibos` |
| **Control** | Recibe los pedidos de la pantalla, controla la sesión y el rol, y los pasa al negocio. | `CTRLRegistrarPagos`, `CTRLAplicarPromociones`, `CTRLEmitirRecibos`, `CTRLSesion` |
| **Negocio** | Tiene las reglas: cuotas, promociones, recibos, estados de cuenta. | `Sistema`, `Alumno`, `Cuota`, `Pago`, `Recibo`, `Promocion`, `Secretaria` |
| **Acceso a datos e integración** | Guarda y busca datos, registra la actividad y se comunica con servicios externos. | repositorios, registro de actividad, adaptadores (banco, mensajería, AFIP) |
| **Datos** | Guarda la información. | base de datos única |

Es la misma estructura que ya usan los diagramas de la entrega: pantalla (UI), controlador (CTRL), `Sistema` y entidades del dominio. Por eso la arquitectura y el diseño no se contradicen.

## 2. Por qué esta arquitectura

Lo que pide el escenario y cómo lo resuelve:

| Lo que dice el escenario | Cómo responde la arquitectura |
|---|---|
| Se usa desde PC, notebook o celular, sin instalar nada | El cliente es el navegador: una sola aplicación web que se adapta al tamaño de la pantalla. |
| Una sola base y datos sincronizados entre sedes; un alumno puede ir a cualquier sede | Una base de datos central. Las sedes comparten los mismos datos y no hay copias que se desfasen. |
| Roles distintos (admin, encargado, secretaria, profesor, alumno) y acceso restringido | El control de sesión y de permisos está en la capa de Control, del lado del servidor: no se puede saltear desde el navegador. |
| Todo lo importante queda registrado (pagos, asistencias, cambios) | Toda operación pasa por el `Sistema`, que usa el registro de actividad: no hay otro camino para modificar datos. |
| Sumar sedes sin rediseñar | La sede es un dato de la base, no parte de la estructura. |
| Integración con el banco, mensajería y AFIP | Los servicios de afuera se conectan por adaptadores: cambiar de banco o de proveedor de mensajes no toca el negocio. |
| Wi-Fi inestable en las sedes | El cliente guarda en el navegador lo que el usuario ya cargó, avisa que no hay conexión y se reconecta solo. |
| Respuesta fluida en horas pico | Los servidores se pueden reforzar sin tocar las pantallas. Con ~800 alumnos y 2 sedes no hace falta nada más complejo. |

### Alternativas que se descartaron

- **Orientada a servicios o microservicios** (un servicio por módulo). Sirve para sistemas enormes con equipos separados. Para 2 sedes y unos 800 alumnos suma complejidad (muchos servicios, comunicación entre ellos) sin una necesidad real.
- **Hexagonal** (puertos y adaptadores). Aísla muy bien los servicios externos, pero se aleja de la estructura UI → CTRL → Sistema → Dominio del resto de la entrega. De todos modos, **los adaptadores** de la capa de integración toman esa idea para el banco y la mensajería.
- **Aplicación de escritorio o sistema local por sede.** Contradice la restricción de usar solo el navegador y de tener la información sincronizada entre sedes.

## 3. Casos de uso prioritarios

La arquitectura se pensó para el sistema completo, mirando los casos de uso que más pesan en el funcionamiento diario:

| Caso de uso | Por qué es prioritario | Qué exige de la arquitectura |
|---|---|---|
| Registrar Pagos (con Emitir Recibos y Aplicar Promociones) | Es el ingreso de dinero y lo usan todo el día en cada sede. | Integración con el banco, consistencia de datos y registro de actividad. |
| Registrar inscripción | Es la puerta de entrada de cada alumno. | Datos centralizados (sin duplicar alumnos entre sedes) y carga de documentos. |
| Verificar habilitación y restricción de acceso por deuda | Se consulta en cada ingreso a una clase. | Respuesta rápida y una sola fuente de verdad sobre la cuota. |
| Registrar asistencia de alumnos y de profesores | Se carga en simultáneo en horas pico. | Tolerar cortes de conexión y mucha concurrencia. |
| Enviar alertas y notificaciones | Avisos de vencimiento y cambios de horario. | Integración con mensajería. |

## 4. Vistas

Se presentan dos vistas, las más pertinentes para este sistema:

1. **Vista lógica (capas):** cómo se organiza el sistema por dentro y qué clases del diseño van en cada capa.
   Archivo: [`1_vista_logica_capas.puml`](1_vista_logica_capas.puml) (+ `.svg`).
2. **Vista de despliegue (física):** dónde corre cada parte: dispositivo del usuario, servidor de aplicación, servidor de base de datos y servicios externos.
   Archivo: [`2_vista_despliegue.puml`](2_vista_despliegue.puml) (+ `.svg`).

La primera responde "cómo está armado"; la segunda, "dónde corre y con quién se comunica". Juntas muestran tanto la estructura como los requisitos de uso (web, sedes, internet, servicios de afuera).

## 5. Relación con el prototipo

El prototipo es solo la capa de presentación, con datos simulados:

- `client/pages` y `client/components` son la capa de Presentación.
- `client/domain` tiene las reglas del negocio como funciones puras y `client/store` hace de `Sistema` en memoria.
- `client/data` simula la base de datos y los servicios externos.

Cuando haya servidor, esas reglas pasan al servidor sin cambiar las pantallas. El deploy actual (Vercel) es solo del prototipo.
