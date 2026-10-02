# Matriz de cobertura de casos de uso

Actualizada al **02/10/2026**, al terminar la Fase 3 (etapas E0 a E15).

**Estados:**
- ✅ **Completo:** cumple el CU de punta a punta, con el actor correcto, dentro de lo que permite un prototipo sin backend.
- 🟡 **Parcial:** existe una pantalla, pero le faltan partes del CU o el flujo está cortado.
- ❌ **Falta:** no hay pantalla o la que hay es decorativa.

**Acceso:** cada ruta se controla por rol (`domain/permissions.ts`, con tests). Lo que puede hacer cada rol dentro de la ficha del alumno sale de `studentCapabilities(rol)`.

## Resumen

| Módulo | Línea base (01/10) | Ahora |
|---|---|---|
| Gestión de Alumnos (14) | 0 ✅ · 10 🟡 · 4 ❌ | **14 ✅** |
| Gestión de Personal (10) | 0 ✅ · 7 🟡 · 3 ❌ | **10 ✅** |
| **Total (24)** | **0 ✅ · 17 🟡 · 7 ❌** | **24 ✅** |

Las limitaciones propias del prototipo (datos simulados, emails y archivos simulados) están al final.

El detalle de lo que faltaba en cada CU al empezar está en la versión de este archivo del commit de E0: `git show 9a3d900:docs/COBERTURA_CU.md`.

---

## Gestión de Alumnos

| # | Caso de uso | Actor | Estado | Dónde (ruta) | Cómo se cumple | Etapa |
|---|---|---|---|---|---|---|
| 1 | Registrar inscripción | Secretaria | ✅ | `/secretaria/alumnos/nuevo` (y `/admin/alumnos/nuevo`) | **Inscripción en 5 pasos:** datos personales, contacto, salud, plan y sede, y confirmación.<br>• DNI y email sin duplicados; avisa apenas se escriben.<br>• Si es menor, pide adulto responsable y autorización firmada.<br>• Peso, estatura, condiciones, antecedentes y DDJJ; certificado opcional.<br>• Muestra la cuota de alta proporcional.<br>• Guarda borrador y registra quién inscribió. | E6 |
| 2 | Completar DDJJ de salud | Alumno | ✅ | `/alumno` (Mi perfil) | Usa el mismo formulario de la inscripción. El certificado subido queda "Pendiente de revisión": secretaría recibe el aviso y lo marca como revisado en la ficha. | E6, E9 |
| 3 | Consultar estado de cuenta | Alumno / Secretaria | ✅ | `/alumno/pagos`; ficha del alumno; `/secretaria/cobros` | El estado se calcula desde los pagos y nunca se guarda (`domain/billing.ts`). Muestra:<br>• monto adeudado y fecha límite;<br>• cuotas del mes (proporcionales cuando corresponde);<br>• recibos. | E3, E7, E9 |
| 4 | Registrar pago de cuota | Secretaria | ✅ | Cobros, ficha y Control de acceso | Cobro sin recargo:<br>• cuotas de la más vieja a la más nueva, con adelanto de hasta 6;<br>• 4 medios de pago;<br>• recibo digital imprimible.<br>El estado cambia en todas las pantallas y queda quién cobró. | E4, E7 |
| 5 | Restricción de acceso por deuda | Sistema / Secretaria | ✅ | Ficha (Habilitación) y Control de acceso | **Automática:** bloqueo con 15 días de atraso (constante en `data/rules.ts`).<br>**Manual:** con motivo y registro de quién la aplicó; se ve como "Restringido" en la lista. | E3, E7 |
| 6 | Gestionar asistencia por clase y sede | Secretaria / Profesor | ✅ | `/secretaria/asistencia`, `/profesor/asistencia` | Lista por clase (día, sede y clase del cronograma):<br>• los bloqueados no se pueden marcar presentes;<br>• se guarda con "último registro";<br>• se corrige hasta 30 días atrás.<br>El profesor ve solo sus clases. | E8 |
| 7 | Consultar historial de asistencia | Alumno | ✅ | `/alumno` (Mi asistencia) | Muestra asistió, ausencia justificada y ausencia sin justificar, con resumen del mes. Se exporta a CSV o se imprime. | E8 |
| 8 | Consultar cronograma y plan | Alumno | ✅ | `/alumno/cronograma` | Plan con sus clases. Cronograma semanal con las clases incluidas resaltadas, filtro por sede y "solo mis clases". | E8 |
| 9 | Aplicar promoción o descuento | Secretaria / Administrador | ✅ | Diálogo de cobro | Promos vigentes, cupones con código y plan familiar, con sus condiciones (efectivo, antigüedad, semestral) y el motivo cuando no aplican. Se aplica una por cobro. La configuración de promos es del grupo de Finanzas (ver notas). | E7 |
| 10 | Enviar alerta de vencimiento | Sistema | ✅ | Campana del alumno y `/alumno/ajustes` | Avisos calculados con el estado de cuenta: por vencer, vencida y acceso suspendido. Se marcan como leídos y las preferencias se guardan. | E9 |
| 11 | Alta, baja y modificación de alumno | Administrador | ✅ | `/admin/alumnos` | Alta con el formulario de inscripción y modificación validada. Baja lógica con motivo y confirmación. Al reactivar no se cobran los meses de baja. | E10 |
| 12 | Consultar inscripciones por sede | Encargado | ✅ | `/encargado/inscripciones` | Altas y bajas por mes, gráfico de 6 meses (con tabla accesible), detalle por plan y quién inscribió. Solo consulta. | E10 |
| 13 | Verificar habilitación para clase | Sistema / Secretaria | ✅ | `/secretaria/acceso` y asistencia por clase | Se busca por DNI o nombre, con una clase de hoy opcional. El resultado se ve en grande, con texto e ícono: si puede entrar y por qué no (deuda, restricción, baja o clase fuera del plan). | E7, E8 |
| 14 | Enviar notificación a alumnos | Secretaria | ✅ | `/secretaria/comunicaciones` | Plantillas y destinatarios (todos, sede, plan, por vencer, deudores o un alumno), con vista previa y cantidad. El mensaje llega con el nombre de cada alumno; tiene historial con destinatarios y borrador. | E9 |

## Gestión de Personal

| # | Caso de uso | Actor | Estado | Dónde (ruta) | Cómo se cumple | Etapa |
|---|---|---|---|---|---|---|
| 1 | Registrar asistencia de profesor en su turno | Secretaria / Encargado | ✅ | `/secretaria/asistencia` (Profesores), `/encargado/asistencia` (Registrar turnos) | Según el cronograma del día, con los reemplazos: presente o ausente, con motivo. | E11 |
| 2 | Consultar asistencia de profesores | Encargado | ✅ | `/encargado/asistencia` (Semana de la sede) | Programado contra registrado, con KPIs y filtros (profesor, empleado o contratado). Las semanas anteriores son el historial. El admin consulta todas las sedes. | E11 |
| 3 | Confirmar o modificar asistencia | Encargado | ✅ | `/encargado/asistencia` | Se confirma de a uno o todo junto. La corrección pide motivo y conserva el valor anterior. También se pueden registrar turnos faltantes. | E11 |
| 4 | Registrar novedad interna | Encargado / Secretaria | ✅ | `/encargado/novedades`, `/secretaria/novedades` | Tipos Ausencia, Incidente, Cambio de turno y General, vinculados a un profesor o una clase. Lleva sede, autor y hora; tiene borrador y aviso al profesor. | E12 |
| 5 | Consultar historial de novedades | Encargado / Administrador | ✅ | `/encargado/novedades`, `/admin/novedades` | Filtros por tipo, estado, fechas y sede (admin). No se borran: se anulan con motivo. | E12 |
| 6 | Consultar horas trabajadas | Profesor | ✅ | `/profesor/horas` | Horas reales desde el cronograma y los registros, por período, sede y clase, con alumnos por clase. | E12 |
| 7 | Notificar cambio de horario o reemplazo | Sistema | ✅ | Campanas del profesor y del encargado | Al profesor le llegan los reemplazos pendientes y las novedades que lo involucran. Al encargado, los reemplazos rechazados (clase sin cubrir), las observaciones y los turnos para confirmar. | E9, E12 |
| 8 | Confirmar o rechazar reemplazo | Profesor | ✅ | `/profesor/reemplazos` | Pide confirmación. Al aceptar, cambian el cronograma y las horas; al rechazar, se avisa al encargado. | E4, E12 |
| 9 | Registrar observaciones de jornada | Profesor | ✅ | `/profesor/asistencia`; el encargado y el admin en `/…/observaciones` | Se vinculan a la clase y la fecha. Las ve el encargado de esa sede (y el admin). Tienen borrador. | E12, E13 |
| 10 | Detectar diferencias con el cronograma | Sistema | ✅ | `/profesor/horas` y asistencia docente | El profesor ve un aviso cuando le faltan horas. El encargado y el admin ven "Horas por profesor", con una insignia si hay diferencia. | E12 |

---

## Limitaciones del prototipo (se aclaran en la defensa)

- **Sin backend:** los datos son simulados y viven en memoria. **Recargar la página reinicia la demo**; los borradores de los formularios sí se conservan.
- **Archivos simulados:** certificados y autorizaciones guardan solo nombre y tamaño; se controla el formato y el tamaño máximo.
- **Emails simulados:** las comunicaciones llegan a la campana de la app; el email figura como opción, pero no se envía.
- **Promociones (CU 9):**
  - La configuración es del grupo de Finanzas: el cobro lee `data/promotions.ts`, con los mismos ids que su lista.
  - Hay que confirmar con el grupo si las promociones se acumulan.
- **Reactivación:** los meses de baja no se cobran. Es una decisión propia, porque el escenario no lo dice. Está para confirmar.
