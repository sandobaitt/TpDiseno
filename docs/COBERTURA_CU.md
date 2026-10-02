# Matriz de cobertura de casos de uso

Está actualizada al **01/10/2026**, al terminar la Fase 1 y antes de cualquier cambio en el código.

**Estados:**
- ✅ **Completo:** cumple el CU de punta a punta, con el actor correcto.
- 🟡 **Parcial:** existe una pantalla, pero le faltan partes del CU o el flujo está cortado.
- ❌ **Falta:** no hay pantalla o la que hay es decorativa.

**Columna "Acceso hoy":** no existe control de rol, así que cualquier usuario logueado entra a cualquier ruta escribiendo la URL. La columna indica en qué menú aparece la pantalla.

**Columna "Etapa":** la etapa de [`PLAN.md`](PLAN.md) que va a cubrir lo que falta.

## Resumen

| Módulo | ✅ Completos | 🟡 Parciales | ❌ Faltan |
|---|---|---|---|
| Gestión de Alumnos (14) | 0 | 10 | 4 |
| Gestión de Personal (10) | 0 | 7 | 3 |
| **Total (24)** | **0** | **17** | **7** |

---

## Gestión de Alumnos

| # | Caso de uso | Actor | Estado | Pantalla y ruta | Archivo(s) | Acceso hoy | Qué falta | Etapa |
|---|---|---|---|---|---|---|---|---|
| 1 | Registrar inscripción de alumno | Secretaria | 🟡 | "Agregar socio" en Gestión de socios (`/secretaria`) | `components/secretaria/NuevoSocioModal.tsx` | Menú de secretaria | • Peso, estatura y antecedentes.<br>• Adjuntar certificado médico.<br>• Autorización de un adulto para menores.<br>• Validar duplicados (DNI y email) y formatos.<br>• La sede está fija en `br_001`.<br>• Cuota proporcional.<br>• El alumno queda "Habilitado" sin pagar.<br>• Los datos de salud no se guardan.<br>• El alumno nuevo se pierde al navegar.<br>• Cerrar el modal borra todo.<br>• No queda registro de quién lo hizo. | E6 |
| 2 | Completar declaración jurada de salud | Alumno | 🟡 | "Mi perfil y asistencia" (`/alumno`), tarjetas "Certificado médico" y "DDJJ de salud" | `pages/AlumnoPanel.tsx` | Menú de alumno | • El certificado no abre un selector de archivo: un clic y ya figura "Confirmado".<br>• La DDJJ no se guarda ni se vincula al alumno.<br>• La secretaria no la ve: el legajo dice siempre "Sin declarar".<br>• Hay 3 listas distintas de condiciones de salud. | E6, E9 |
| 3 | Consultar estado de cuenta | Alumno / Secretaria | 🟡 | "Pagos" del alumno (`/alumno/pagos`). Secretaria: ficha del alumno y "Cobros y facturación" (`/secretaria/cobros`) | `pages/AlumnoPagosPage.tsx`, `components/secretaria/MemberDetailModal.tsx`, `components/member-detail/*`, `pages/PaymentsPage.tsx` | Menú de alumno y de secretaria | • Los meses pasados figuran "Pagado" con pagos inventados.<br>• No hay monto adeudado total ni fecha límite (día 5).<br>• Muestra deuda y días de atraso fijos ($28.500 y "14 días").<br>• El estado no se calcula desde los pagos.<br>• Fechas corridas un día por la zona horaria.<br>• El alumno se busca por nombre. | E7, E9 |
| 4 | Registrar pago de cuota | Secretaria | 🟡 (flujo roto) | Diálogo de cobro en "Cobros y facturación" (`/secretaria/cobros`) | `components/cobros/PaymentCheckoutContent.tsx`, `pages/PaymentsPage.tsx` | Menú de secretaria | • Al confirmar no registra el pago y no cambia el estado.<br>• No emite recibo digital.<br>• Recargo por mora con interés activado por defecto (contradice la regla).<br>• Dice "Tarjeta" en vez de "Débito".<br>• Cobra un solo mes aunque se deban varios.<br>• No queda quién cobró. | E1, E7 |
| 5 | Aplicar restricción de acceso por deuda | Sistema / Secretaria | ❌ | Tarjeta "Control de acceso" en la ficha del alumno (toggle decorativo) | `components/member-detail/AccessControlCard.tsx` | Menú de secretaria | • Bloqueo automático al superar el umbral de mora (constante configurable).<br>• Efecto en la asistencia.<br>• Restricción manual con motivo y registro. | E7 |
| 6 | Gestionar asistencia de alumnos | Secretaria / Profesor | 🟡 | "Control de asistencia", pestaña Alumnos (`/secretaria/asistencia`). "Asistencia y alumnos" (`/profesor/asistencia`) | `pages/AttendancePage.tsx`, `pages/ProfesorAsistenciaPage.tsx`, `data/classStudents.ts` | Menú de secretaria y de profesor | • No es por clase ni por sede.<br>• Se puede marcar presente a un deudor.<br>• La clase del profesor es fija y sus alumnos no existen en el sistema.<br>• No se guarda.<br>• No se puede modificar un día anterior.<br>• No queda registro. | E8 |
| 7 | Consultar historial de asistencia | Alumno | 🟡 | "Mi perfil y asistencia" (`/alumno`), tabla "Historial de asistencias" | `pages/AlumnoPanel.tsx`, `data/attendance.ts` | Menú de alumno | • Todos los alumnos ven el mismo historial.<br>• No distingue ausencia justificada de sin justificar.<br>• Los botones PDF y CSV no hacen nada.<br>• Obliga a deslizar de costado en el celular. | E8 |
| 8 | Consultar cronograma y plan contratado | Alumno | 🟡 | "Cronograma de clases" (`/alumno/cronograma`) | `pages/AlumnoCronogramaPage.tsx`, `components/cronograma/*`, `data/schedule.ts` | Menú de alumno | • No muestra el plan contratado.<br>• No marca qué clases habilita el plan.<br>• Las clases no tienen sede.<br>• La semana base está fija en 2025 y repite las mismas clases.<br>• Tiene "Reservar", que no está en ningún CU. | E1, E8 |
| 9 | Aplicar promoción o descuento | Secretaria / Administrador | 🟡 | Selector "Aplicar promoción" del cobro | `components/cobros/PaymentCheckoutContent.tsx` | Menú de secretaria | • La lista está fija en el componente y es distinta a la de Admin → Finanzas (otro grupo).<br>• No hay cupones ni planes familiares.<br>• No controla la vigencia.<br>• El "10% efectivo" se aplica con cualquier medio. | E7 |
| 10 | Enviar alerta de vencimiento de cuota | Sistema | 🟡 (estático) | "Ajustes y alertas" (`/alumno/ajustes`) y campana | `pages/AlumnoAjustesPage.tsx`, `components/common/HeaderNav.tsx` | Menú de alumno | • Son 4 alertas fijas, con fechas de 2023.<br>• No se calculan desde el estado de cuenta.<br>• La campana del alumno está vacía.<br>• "Marcar todo como leído" no hace nada.<br>• Las preferencias no se guardan. | E9 |
| 11 | Gestionar alta, baja y modificación de alumno | Administrador | 🟡 | "Gestión de personal", pestaña Alumnos (`/admin/personal`) | `pages/AdminPersonalPage.tsx` | Menú de admin | • No hay alta.<br>• La baja borra sin confirmar y para siempre.<br>• Las ediciones quedan solo en esa pantalla.<br>• No hay validaciones.<br>• Está escondido bajo "Personal".<br>• La edición desde secretaria no guarda. | E1, E10 |
| 12 | Consultar inscripciones por sede | Encargado | ❌ | — | — | — | • No existe el rol Encargado ni la pantalla.<br>• Los usuarios no tienen sede. | E2, E10 |
| 13 | Verificar habilitación para ingresar a clase | Sistema / Secretaria | ❌ | Solo un badge de "estado financiero" fijo en asistencia | — | — | • Chequear cuota al día y clase incluida en el plan.<br>• Los datos no relacionan plan con actividad. | E7 |
| 14 | Enviar notificación a alumnos | Secretaria | ❌ | Ítem "Comunicaciones" deshabilitado | `data/navigation.ts` | — | • Envío masivo o personalizado.<br>• Plantillas.<br>• Registro de quién la recibió. | E9 |

## Gestión de Personal

| # | Caso de uso | Actor | Estado | Pantalla y ruta | Archivo(s) | Acceso hoy | Qué falta | Etapa |
|---|---|---|---|---|---|---|---|---|
| 1 | Registrar asistencia de profesor | Secretaria / Encargado | 🟡 | "Control de asistencia", pestaña Profesores/Staff (`/secretaria/asistencia`) | `pages/AttendancePage.tsx`, `data/employees.ts` | Menú de secretaria | • Lista empleados (secretarias, gerente) en lugar de profesores.<br>• No muestra el turno.<br>• El estado inicial es aleatorio.<br>• No se guarda.<br>• No existe el Encargado. | E11 |
| 2 | Consultar asistencia de profesores | Encargado | 🟡 (actor incorrecto) | "Asistencia" del admin (`/admin/asistencia`) | `pages/AdminAsistenciaPage.tsx`, `data/adminAttendance.ts` | Menú de admin | • No existe el Encargado y no hay filtro por sede.<br>• Los estados son aleatorios y los KPIs fijos.<br>• Todas las semanas muestran lo mismo, con fecha base 2023.<br>• Los profesores no existen en el sistema. | E11 |
| 3 | Confirmar o modificar asistencia de profesor | Encargado | ❌ | — (el detalle del turno es de solo lectura) | — | — | • Confirmar o corregir el registro, con motivo y registro de quién lo hizo. | E11 |
| 4 | Registrar novedad interna | Encargado / Secretaria | 🟡 (casi completo) | "Novedades" (`/secretaria/novedades`, `/admin/novedades`), formulario "Registrar novedad" | `components/novedades/NovedadesSidebar.tsx`, `pages/NovedadesPage.tsx` | Menú de secretaria y de admin | • Falta el tipo "Ausencia".<br>• No guarda sede ni autor.<br>• "Notificar" no notifica.<br>• Se pierde al navegar.<br>• Fecha y hora no arrancan en "ahora". | E12 |
| 5 | Consultar historial de novedades | Encargado / Administrador | 🟡 | "Historial de novedades" (`/admin/novedades`) | `components/novedades/NovedadesHistory.tsx` | Menú de admin y de secretaria | • Faltan filtros por sede, fecha, tipo y estado.<br>• No hay mensaje cuando la lista está vacía.<br>• Las novedades se borran en lugar de anularse.<br>• No existe el Encargado. | E12 |
| 6 | Consultar horas trabajadas | Profesor | 🟡 | "Mis horas" (`/profesor/horas`) | `pages/ProfesorHorasPage.tsx` | Menú de profesor | • Los datos están fijos dentro de la página y son iguales para todos los profesores.<br>• Faltan filtros por sede y tipo de clase.<br>• No se vincula con asistencias ni reemplazos.<br>• La tabla se corta en el celular. | E12 |
| 7 | Notificar cambio de horario o reemplazo | Sistema | ❌ | — (la campana del profesor siempre está vacía) | `components/common/HeaderNav.tsx` | — | • Aviso al profesor cuando cambia su agenda o se le asigna un reemplazo. | E12 |
| 8 | Confirmar o rechazar reemplazo | Profesor | 🟡 (flujo roto) | "Reemplazos y novedades" (`/profesor/reemplazos`) | `pages/ProfesorReemplazosPage.tsx`, `data/replacements.ts` | Menú de profesor | • Confirmar y rechazar hacen lo mismo.<br>• No hay aviso ni confirmación.<br>• No cambia el cronograma ni las horas.<br>• Las fechas no coinciden.<br>• No se filtra por profesor. | E1, E12 |
| 9 | Registrar observaciones de jornada | Profesor | 🟡 | Panel "Observaciones" en `/profesor/asistencia` | `pages/ProfesorAsistenciaPage.tsx`, `data/bitacoras.ts` | Menú de profesor | • El encargado no las ve.<br>• No se vinculan a clase, fecha ni profesor.<br>• No se guardan. | E12 |
| 10 | Detectar diferencias con el cronograma | Sistema | ❌ | — (tarjeta "Conflictos 2" decorativa en `/admin/asistencia`) | — | — | • Comparar horas registradas contra programadas, con un aviso discreto para encargado, admin y profesor. | E12 |
