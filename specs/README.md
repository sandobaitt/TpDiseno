# Specs: funcionalidades del sistema

Cada archivo describe **una funcionalidad** que se construyó y verificó durante la Fase 3:
- **qué hace**, para quién y con qué reglas;
- **dónde está**: ruta, página, componentes, reglas de negocio, datos y acciones del store;
- **cómo se verificó**: tests automáticos, pruebas en el navegador y cómo probarla a mano.

Estado al **02/10/2026**: todas verificadas. Las rutas y los archivos citados se controlaron contra el código (ver "Cómo se mantiene", al final).

Los usuarios de prueba están en el [README](../README.md). La matriz por caso de uso está en [`docs/COBERTURA_CU.md`](../docs/COBERTURA_CU.md).

## Gestión de Alumnos

| Spec | CU | Dónde se ve | Estado |
|---|---|---|---|
| [Inscripción](alumnos/01-inscripcion.md) | 1 (y alta del 11) | `/secretaria/alumnos/nuevo`, `/admin/alumnos/nuevo` | ✅ |
| [DDJJ de salud y certificados](alumnos/02-ddjj-y-certificados.md) | 2 | `/alumno`; ficha del alumno | ✅ |
| [Estado de cuenta](alumnos/03-estado-de-cuenta.md) | 3 | `/alumno/pagos`; ficha; `/secretaria/cobros` | ✅ |
| [Cobro y recibo digital](alumnos/04-cobro-y-recibo.md) | 4 | `/secretaria/cobros`; ficha; `/secretaria/acceso`; `/alumno/pagos` | ✅ |
| [Restricción y habilitación](alumnos/05-restriccion-y-habilitacion.md) | 5 y 13 | `/secretaria/acceso`; ficha | ✅ |
| [Asistencia por clase y sede](alumnos/06-asistencia-por-clase.md) | 6 | `/secretaria/asistencia`, `/profesor/asistencia` | ✅ |
| [Historial de asistencia](alumnos/07-historial-de-asistencia.md) | 7 | `/alumno` | ✅ |
| [Plan y cronograma](alumnos/08-plan-y-cronograma.md) | 8 | `/alumno/cronograma` | ✅ |
| [Promociones](alumnos/09-promociones.md) | 9 | Diálogo de cobro | ✅ |
| [Alertas de vencimiento](alumnos/10-alertas-de-vencimiento.md) | 10 | Campana del alumno, `/alumno/ajustes` | ✅ |
| [Alta, baja y modificación](alumnos/11-abm-de-alumnos.md) | 11 | `/admin/alumnos` | ✅ |
| [Inscripciones por sede](alumnos/12-inscripciones-por-sede.md) | 12 | `/encargado/inscripciones` | ✅ |
| [Comunicaciones](alumnos/14-comunicaciones.md) | 14 | `/secretaria/comunicaciones` | ✅ |

## Gestión de Personal

| Spec | CU | Dónde se ve | Estado |
|---|---|---|---|
| [Asistencia de profesores](personal/01-asistencia-de-profesores.md) | 1, 2 y 3 | `/secretaria/asistencia`, `/encargado/asistencia`, `/admin/asistencia` | ✅ |
| [Novedades internas](personal/04-novedades.md) | 4 y 5 | `/encargado/novedades`, `/secretaria/novedades`, `/admin/novedades` | ✅ |
| [Horas y diferencias](personal/06-horas-y-diferencias.md) | 6 y 10 | `/profesor/horas`; asistencia docente | ✅ |
| [Reemplazos y avisos](personal/07-reemplazos.md) | 7 y 8 | `/profesor/reemplazos`, `/profesor/cronograma` | ✅ |
| [Observaciones de jornada](personal/09-observaciones.md) | 9 | `/profesor/asistencia`; `/encargado/observaciones`, `/admin/observaciones` | ✅ |
| [Directorio de personal](personal/directorio-de-personal.md) | — (pantalla heredada) | `/admin/personal` | ⚪ Sin cambios |

## Transversales

| Spec | Para qué | Estado |
|---|---|---|
| [Roles, sesión y permisos](transversal/roles-y-permisos.md) | Cada rol ve solo lo suyo | ✅ |
| [Store y registro de actividad](transversal/store-y-registro-de-actividad.md) | Flujos conectados; quién, qué y cuándo | ✅ |
| [Datos de demo y reglas](transversal/datos-de-demo-y-reglas.md) | Datos coherentes y constantes configurables | ✅ |
| [Centro de avisos](transversal/centro-de-avisos.md) | Campana para todos los roles | ✅ |
| [Conexión y borradores](transversal/conexion-y-borradores.md) | Wi-Fi inestable | ✅ |
| [Diseño y accesibilidad](transversal/diseno-y-accesibilidad.md) | Tema, componentes compartidos, celular y accesibilidad | ✅ |
| [Rendimiento y calidad](transversal/rendimiento-y-calidad.md) | Carga por pantalla, ESLint y tests | ✅ |

## Cómo se mantiene

- Si se agrega o cambia una funcionalidad, se actualiza su spec en el mismo commit.
- `npm run specs` (o `node specs/check.mjs`) controla que todos los archivos, carpetas, funciones y nombres de tests citados en las specs existan en el código. Si algo se movió o se renombró, lo avisa.
