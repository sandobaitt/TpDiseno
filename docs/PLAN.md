# Plan de trabajo (Fase 2)

Aprobado el 01/10/2026. Parte del diagnóstico ([`DIAGNOSTICO.md`](DIAGNOSTICO.md)) y la matriz de casos de uso ([`COBERTURA_CU.md`](COBERTURA_CU.md)).

- **Cómo se ejecuta:**
  - Cada etapa lleva un commit en español.
  - Antes de cerrar cada etapa se corren `npm run typecheck`, `npm test` y `npm run build`, y se hace una prueba manual.
- **Prioridades:**
  - **P0:** imprescindible para la presentación.
  - **P1:** casos de uso faltantes.
  - **P2:** pulido.

## Decisiones tomadas

| Tema | Decisión | Por qué |
|---|---|---|
| Datos compartidos | **Store central en memoria**: Context + `useReducer`, sin dependencias nuevas. No se guarda nada entre recargas; recargar vuelve la demo al estado inicial. | El foco es la navegación, pero los CU tienen que verse conectados. Por ejemplo, cobrar cambia la cuenta y el acceso, y aceptar un reemplazo suma horas. |
| Borradores | Solo los formularios largos (inscripción, DDJJ, novedad, comunicación) se guardan en el navegador. | Regla de Wi-Fi inestable: no perder lo que ya se cargó. |
| Mora | La cuota vence el **día 5**. Con **15 días de atraso desde el vencimiento** el alumno queda bloqueado, es decir, desde el día 20. Las constantes van en `client/data/rules.ts`. | Regla del escenario, que habla de 15 a 20 días; se toma el mínimo y se deja configurable. |
| Estados de cuenta | **Al día**; **por vencer** (días 1 a 5 sin pagar); **deudor** (días 6 a 19, puede ingresar); **bloqueado** (desde el día 20); **inactivo** (baja). | Se calculan con funciones puras y probadas, no se guardan a mano. |
| Cobro | Sin recargos ni intereses. Medios: efectivo, débito, transferencia y QR. El pago online del alumno no ofrece efectivo. | El código contradecía la regla de "sin intereses" y la lista de medios aceptados. |
| Bajas | Baja lógica: el alumno queda inactivo y conserva su historial. La hace solo el Admin y pide confirmación. Se quita "Eliminar cuenta" del alumno. | CU 11. |
| Funciones fuera de CU | Se quitan "Reservar clase", "Visibilidad del perfil" y "Modo silencio". | No están en ningún caso de uso. |
| Roles | Se agrega `encargado` con los nombres de la entrevista: Adrián López (Centro) y Susana García (Norte). Los usuarios tienen sede y se vinculan por id con su alumno o profesor. Las rutas se protegen por rol. | Hoy cualquier rol entra a cualquier ruta, y el Encargado no existe. |
| Estructura | `components/alumnos/`, `components/personal/`, `components/common/`, `client/domain/` (reglas) y `client/store/`. Las páginas son envoltorios finos. Las pantallas se migran cuando se las toca. | Orden por módulo, sin hacer un commit gigante de movimientos. |
| Diseño | Tokens oscuros en `global.css`: un solo verde, estados semánticos con contraste AA e Inter por defecto. Los primitivos de `ui/` se usan en lugar de controles caseros. | Consistencia y accesibilidad. |
| Dependencias | No se agrega ninguna. ESLint es opcional y se consulta antes de sumarlo. Los íconos se cargan una sola vez, con versión fija. | Pedido explícito. |
| Gestor de paquetes | npm. | Es el que tiene lockfile y el que usan los scripts. |
| Textos | Español rioplatense neutro con voseo. Se dice "alumno", no socio, cliente ni miembro. | Claridad y coherencia con los CU. |
| Módulos ajenos | No se tocan: landing, dashboard, finanzas y kiosco del admin, y el servidor y deploy de la plantilla. | Alcance del grupo. |

## (a) Correcciones

| # | Qué | Archivos | Riesgo |
|---|---|---|---|
| a1 | Control de rol en las rutas y página "No tenés permiso" | `App.tsx`, `common/RequireAuth.tsx`, `pages/UnauthorizedAccess.tsx` | Bajo |
| a2 | Rol Encargado, sede en los usuarios y vínculo usuario ↔ alumno/profesor | `data/users.ts`, `data/navigation.ts`, `pages/Login.tsx`, `common/SidebarNav.tsx`, `common/HeaderNav.tsx` | Bajo |
| a3 | Cobro según las reglas: sin recargo, con los 4 medios y sin efectivo en el pago online | `cobros/PaymentCheckoutContent.tsx`, `data/payments.ts` | Bajo |
| a4 | Registrar el pago de verdad y emitir el recibo: fecha, monto, método, número y quién cobró | Cobros, store | Medio |
| a5 | Estado de cuenta real: sin pagos inventados, con monto adeudado y fecha límite | `AlumnoPagosPage`, ficha, `domain/billing.ts` | Medio |
| a6 | Fechas "AAAA-MM-DD" leídas como fecha local y un único "hoy" | `lib/dates.ts` y todos los formateadores | Medio |
| a7 | Datos deterministas, sin `Math.random` | `AttendancePage`, `AdminAsistenciaPage` | Bajo |
| a8 | Borrar las rutas huérfanas `/secretaria/cobros/cobrar` y `/miembros/:id` | `App.tsx` y sus páginas | Bajo |
| a9 | Que no aparezca "Deudor $0" en Cobros | `PaymentsPage` | Bajo |
| a10 | Baja lógica con confirmación y sin "Eliminar cuenta" | `AdminPersonalPage`, `AlumnoAjustesPage` | Bajo |
| a11 | "Guardar cambios" de la ficha que guarde de verdad y valide | Ficha del alumno | Medio |
| a12 | Que la inscripción no pierda datos: borrador y confirmación al cerrar | `NuevoSocioModal` | Bajo |
| a13 | Reemplazos: confirmar y rechazar distintos, con aviso y fechas coherentes | `ProfesorReemplazosPage`, `data/replacements.ts` | Bajo |
| a14 | Tablas que no se corten en el celular | `AttendancePage`, `ProfesorHorasPage` | Bajo |
| a15 | Íconos cargados una sola vez, con versión fija, en `index.html` | `index.html`, `DashboardLayout`, `NotFoundPage`, `Index.tsx` (solo se quita el `<link>`) | Bajo |
| a16 | Búsqueda por nombre o DNI, con o sin puntos | `common/SearchInput`, `lib/format.ts` | Bajo |
| a17 | Una sola forma de cerrar sesión, con confirmación accesible | `DashboardLayout`, `HeaderNav` | Bajo |
| a18 | Campana conectada al store y disponible para todos los roles | `HeaderNav` | Medio |
| a19 | Arreglos chicos:<br>• `lang="es-AR"`;<br>• "Cerrar" en los diálogos;<br>• avisos en tema oscuro;<br>• el aviso `duration-[280ms]`;<br>• la clase "undefined" de `HeaderPage`;<br>• el `console.error` de `NotFound`. | Varios | Bajo |
| a20 | Imágenes externas temporales pasadas a assets locales (en Login y 404) | `Login.tsx`, `NotFoundPage.tsx` | Bajo |
| a21 | Quitar "Reservar clase", "Visibilidad del perfil" y "Modo silencio", y reemplazar los `graceDays` por plan por el umbral único | `cronograma/ClassCard.tsx`, `AlumnoAjustesPage`, `data/plans.ts` | Bajo |

## (b) Mejoras de UX/UI

| # | Qué | Riesgo |
|---|---|---|
| b1 | Tokens oscuros, un solo verde, estados semánticos con contraste AA e Inter por defecto | Medio: cambia el aspecto de toda la app; hay que revisar que las pantallas de otros grupos no cambien |
| b2 | Usar los primitivos de `ui/` (Button, Input, Label, Select, Switch, Checkbox, Tabs, Badge, Dialog) en lugar de controles caseros | Medio |
| b3 | Componentes compartidos:<br>• PageHeader;<br>• StatCard;<br>• StatusBadge (con ícono y texto, nunca solo color);<br>• SearchInput;<br>• EmptyState;<br>• ConfirmDialog;<br>• FormField (label asociado y error en línea);<br>• WeekNavigator. | Bajo |
| b4 | DataTable que se vea como tarjetas en el celular y sea accesible | Medio |
| b5 | Accesibilidad:<br>• labels asociados;<br>• `aria-label` en los botones de ícono;<br>• foco visible;<br>• texto de 12 px o más;<br>• contraste de 4,5:1 o más;<br>• botones de 40 px o más en el celular;<br>• respeto de "reducir movimiento". | Bajo a medio |
| b6 | Textos: voseo, "Inicio", "Asistencia" y "Alumnos", sin jerga | Bajo |
| b7 | Feedback:<br>• un aviso en cada acción;<br>• errores claros;<br>• "Procesando…" para no cobrar dos veces;<br>• confirmación en las acciones destructivas. | Bajo |
| b8 | Alertas no intrusivas: centro de notificaciones con contador y resúmenes, sin modales | Medio |
| b9 | Wi-Fi inestable: indicador de conexión, borradores guardados solos y aviso de "borrador recuperado" | Bajo |
| b10 | Inicio de la secretaria con accesos rápidos: Control de acceso, Cobrar, Inscribir y Asistencia de hoy | Bajo |

## (c) Refactor y limpieza

| # | Qué | Riesgo |
|---|---|---|
| c1 | Estructura por módulo y páginas finas | Medio: hay que corregir los imports, y el typecheck los detecta |
| c2 | Utilidades únicas en `lib/format.ts` y `lib/dates.ts` | Bajo |
| c3 | Unificar lo duplicado:<br>• una sola ficha del alumno;<br>• una sola lista de condiciones de salud;<br>• un solo WeekNavigator;<br>• los toggles, fields y stat cards. | Medio |
| c4 | Mocks coherentes y relacionados por id. Los KPIs de nuestras pantallas se calculan desde los datos. | Medio |
| c5 | Borrar código muerto:<br>• `ProfesorPanel`;<br>• `SystemFooter`;<br>• `PaymentCheckoutPage`;<br>• `MemberDetailPage`;<br>• el Toaster de Radix;<br>• `QueryClientProvider`;<br>• los `"use client"`. | Bajo |
| c6 | Quitar las dependencias sin uso: `three`, `@react-three/*`, `@types/three` y `@tanstack/react-query` | Bajo |
| c7 | Cargar cada rol por separado con `React.lazy`, para achicar el bundle inicial | Bajo |
| c8 | Sacar los `style={{}}` y los colores hex sueltos de nuestros módulos | Bajo |
| c9 | ESLint mínimo con script `lint`. **Es opcional y se consulta antes**, porque agrega dependencias de desarrollo. | Bajo |

## (d) Casos de uso faltantes o incompletos

### Gestión de Alumnos

| CU | Solución |
|---|---|
| 1 | **Inscripción en 5 pasos:**<br>1. Datos personales: DNI con formato y control de duplicados. Si es menor de edad, se piden los datos del adulto responsable y su autorización firmada.<br>2. Contacto, incluido un contacto de emergencia.<br>3. Salud: peso, estatura, condiciones, antecedentes y certificado.<br>4. Plan y sede.<br>5. Resumen con la cuota proporcional y botón "Registrar e ir a cobrar".<br>El formulario se guarda como borrador y queda registrado quién hizo la inscripción. |
| 2 | **DDJJ:**<br>• Usa el mismo formulario que la inscripción.<br>• El certificado se carga de verdad: se valida el tipo y el tamaño y queda "Pendiente de revisión".<br>• La secretaria la ve en el legajo. |
| 3 | **Estado de cuenta:**<br>• "Mi cuenta" para el alumno y una sección en la ficha para la secretaria.<br>• Muestra cuotas por mes, monto adeudado, fecha límite, días de atraso e historial con recibos. |
| 4 | **Cobro:**<br>• Se eligen las cuotas adeudadas, el medio de pago y una promo o cupón.<br>• El total no lleva recargo.<br>• Al confirmar se emite el recibo, el estado se actualiza en todas las pantallas y queda registrado. |
| 5 | **Restricción por deuda:**<br>• Bloqueo automático al pasar el umbral.<br>• La secretaria puede aplicar una restricción manual, con motivo. |
| 6 | **Asistencia por clase y sede:**<br>• Se elige sede, fecha y clase.<br>• Aparecen los alumnos habilitados, con buscador. Los bloqueados no se pueden marcar presentes.<br>• Se puede guardar y corregir días anteriores, y queda registrado.<br>• El profesor ve solo sus clases. |
| 7 | **"Mi asistencia":**<br>• Fecha, clase, sede y estado: Asistió, Ausente sin justificar o Justificada.<br>• Resumen del mes.<br>• Exportar a CSV o imprimir. |
| 8 | **"Mi plan y cronograma":**<br>• Tarjeta del plan.<br>• Semana real, con las clases del plan resaltadas y las demás bloqueadas con un aviso.<br>• Filtro por sede. |
| 9 | **Promociones vigentes** desde `data/promotions.ts`:<br>• Vigencia, porcentaje o monto, cupón y plan familiar.<br>• Validaciones: por ejemplo, el descuento por efectivo solo vale pagando en efectivo. |
| 10 | **Alertas automáticas** que salen del estado de cuenta: por vencer, vencida y acceso suspendido. Aparecen en la campana y en "Alertas", y se pueden marcar como leídas. |
| 11 | **"Alumnos" en el menú del admin:**<br>• Lista con filtros.<br>• Alta, reusando el formulario de inscripción.<br>• Modificación con validación.<br>• Baja lógica con motivo y confirmación.<br>• Reactivar. |
| 12 | **Encargado → "Inscripciones de mi sede"**: solo lectura, con filtros. |
| 13 | **"Control de acceso" de la secretaria:**<br>• Se busca por DNI o nombre.<br>• El resultado se muestra grande, con texto e ícono: Habilitado, Bloqueado por deuda o Clase no incluida en su plan. |
| 14 | **"Comunicaciones" de la secretaria:**<br>• Plantillas.<br>• Destinatarios: todos, por sede, por plan, deudores o un alumno.<br>• Al enviar llega a la campana del alumno.<br>• Historial con los destinatarios. |

### Gestión de Personal

| CU | Solución |
|---|---|
| 1 | **Asistencia de profesores del día**, por sede y según el cronograma: presente o ausente, con motivo. Una ausencia sugiere cargar la novedad correspondiente. |
| 2 | **Vista del Encargado:** semana e historial de su sede, con lo programado frente a lo registrado y filtros por profesor y por empleado o contratado. |
| 3 | **Confirmar o corregir cada registro.** Para corregir hay que poner un motivo, y queda quién lo hizo y cuándo. |
| 4 | **Novedades:**<br>• Tipos: Ausencia, Incidente, Cambio de turno y General.<br>• La sede y el autor se completan solos, y la fecha arranca en "ahora".<br>• Se avisa al profesor involucrado. |
| 5 | **Historial de novedades** con filtros por sede, fecha, tipo y estado. Las novedades se anulan en lugar de borrarse. |
| 6 | **"Mis horas"** calculadas desde las asistencias confirmadas y los reemplazos aceptados, con filtros. |
| 7 | **Aviso al profesor** cuando le asignan o cancelan un reemplazo, o cuando cambia su agenda. |
| 8 | **Reemplazos:**<br>• Aceptar o rechazar, con confirmación.<br>• Al aceptar, cambian el cronograma y las horas.<br>• Al rechazar, el turno vuelve a "sin cubrir" y se avisa al encargado. |
| 9 | **Observaciones** vinculadas a la clase, la fecha y el profesor. Las ven el encargado y el admin. |
| 10 | **Diferencias con el cronograma:** las horas registradas frente a las programadas, con un aviso discreto. |

## Etapas

| Etapa | Contenido | Prioridad | Riesgo |
|---|---|---|---|
| E0 | Documentación:<br>• `DIAGNOSTICO.md`, `COBERTURA_CU.md` y `PLAN.md`;<br>• CLAUDE.md unificado;<br>• MEMORY.md y README.<br>Se borran `AGENTS.md`, `ARQUITECTURA_FRONTEND.md` y `.builder/`. | P0 | Nulo |
| E1 | Correcciones rápidas: a3, a7, a8, a9, a10, a12, a14, a15, a16, a17, a19, a20 y a21 | P0 | Bajo |
| E2 | Roles y permisos (a1 y a2), con tests de rol → ruta | P0 | Bajo |
| E3 | Datos coherentes, reglas y dominio con tests (a6, c2 y c4) | P0 | Medio |
| E4 | Store central en memoria y registro de actividad | P0 | Medio a bajo |
| E5 | Base visual: tokens, primitivos, componentes compartidos y DataTable responsive (b1 a b5) | P1 | Medio |
| E6 | Alumnos de la secretaria: lista, ficha unificada e inscripción (CU 1 y 2; a11 y b10) | P1 | Medio |
| E7 | Cobros, estado de cuenta, promociones, restricción y control de acceso (CU 3, 4, 5, 9 y 13) | P0 | Medio |
| E8 | Asistencia por clase y sede, historial, plan y cronograma (CU 6, 7 y 8) | P1 | Medio |
| E9 | Pantallas del alumno: cuenta y pago, DDJJ, alertas, notificaciones y Comunicaciones (CU 2, 3, 10 y 14) | P1 | Medio |
| E10 | Admin y Encargado: alta, baja y modificación de alumnos, e inscripciones por sede (CU 11 y 12) | P1 | Bajo |
| E11 | Personal: asistencia de profesores, confirmación e historial (CU 1 a 3) | P1 | Medio |
| E12 | Personal: novedades, reemplazos, horas, diferencias, observaciones y avisos (CU 4 a 10) | P1 | Medio |
| E13 | Wi-Fi: indicador de conexión y borradores | P2 | Bajo |
| E14 | Limpieza final: código muerto, dependencias, carga diferida, textos, accesibilidad y responsive | P2 | Bajo |
| E15 | Cierre: actualizar la matriz de CU, MEMORY.md y CLAUDE.md, y armar un guion para la defensa | P0 | Nulo |

## Verificación

**En cada etapa:** se corren `npm run typecheck`, `npm test` y `npm run build`.

**Tests nuevos (Vitest):**

| Qué se prueba | Casos |
|---|---|
| Estado de cuenta | • Al día, por vencer, deudor y bloqueado justo en el umbral.<br>• Monto adeudado.<br>• Prorrateo. |
| Habilitación | Deuda y plan. |
| Cronograma | La semana y el reemplazo aceptado. |
| Horas | Diferencias con el cronograma. |
| Permisos | Matriz rol → ruta. |

**Prueba manual por rol**, en PC y en una pantalla de 360 px:

| Rol | Recorrido |
|---|---|
| Secretaria | Inscribir → cobrar → recibo → control de acceso → asistencia → comunicación. |
| Alumno | Cuenta, alertas, plan y DDJJ. |
| Profesor | Asistencia, observación, reemplazo y horas. |
| Encargado | Asistencia de profesores, confirmación, novedades e inscripciones. |
| Admin | Alta, baja y modificación de alumnos, novedades y diferencias de horas. |
