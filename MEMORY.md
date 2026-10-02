# MEMORY.md — estado del proyecto

Última actualización: **02/10/2026**, al terminar la etapa E11. Las etapas están en [`docs/PLAN.md`](docs/PLAN.md).

## Decisiones tomadas (y por qué)

| Tema | Decisión | Por qué |
|---|---|---|
| Datos compartidos | **Store central en memoria**: Context + `useReducer`, sin dependencias. No se guarda nada entre recargas. | El foco es la navegación, pero los flujos tienen que verse conectados en la demo. Recargar vuelve al estado inicial. |
| Borradores | Solo los formularios largos guardan borrador en el navegador. | Regla de Wi-Fi inestable: no perder lo cargado. |
| Mora | Vence el día 5 y bloquea con 15 días de atraso, o sea el día 20. Las constantes van en `client/data/rules.ts`, que se crea en E3. | El escenario dice "15 a 20 días": se tomó 15 y queda configurable. |
| Estados de cuenta | Al día / Por vencer (días 1–5) / Deudor (días 6–19) / Bloqueado (desde el día 20) / Inactivo. Se **calculan**, no se guardan. | Que el estado nunca quede desactualizado respecto de los pagos. |
| Cobro | Sin recargos ni intereses. Medios: efectivo, débito, transferencia y QR. El pago online del alumno no ofrece efectivo. | Así lo dice la regla; el código anterior la contradecía. |
| Bajas | Baja lógica, solo del Admin, con confirmación. Se quita "Eliminar cuenta" del alumno. | CU 11. |
| Funciones fuera de los CU | Se quitan "Reservar clase", "Visibilidad del perfil" y "Modo silencio". | No figuran en ningún caso de uso. |
| Encargado | Se crea con los nombres de la entrevista: Adrián López (Centro) y Susana García (Norte). Ve solo su sede. | No existía. |
| Términos | En la interfaz se dice "alumno", con voseo. Los identificadores del código siguen en inglés. | Coherencia con los CU y con el código existente. |
| Gestor de paquetes | npm. | Es el del lockfile y los scripts; pnpm no está instalado. |
| Lo que no se toca | Deploy (`server/`, `api/`, `netlify/`, `vercel.json`) y módulos de otros grupos. | Riesgo de romper el deploy, y alcance del grupo. |
| Documentación | Se borraron AGENTS.md, ARQUITECTURA_FRONTEND.md y `.builder/`. Se conserva `.agents/rules/frontend.md`, que es para otras herramientas. | Para tener una sola fuente de verdad. |
| Promociones | Una sola por cobro (no se acumulan). Están en `data/promotions.ts`, con los mismos ids que Admin → Finanzas (dc1…dc5), más plan familiar, una promo de temporada y cupones. | El escenario no dice si se acumulan: se eligió lo más simple de explicar. **Confirmar con el grupo.** |
| Reactivación | Al reactivar, los meses de baja no se cobran y el mes de regreso es proporcional (como un alta). | El escenario no lo dice. Sin esta regla, un alumno reactivado quedaba con deuda por los meses en que no vino. **Confirmar con el grupo.** |
| Restricción manual | La aplica o la quita solo secretaría, con motivo obligatorio. | CU 5 (actor: Sistema / Secretaria). |
| PDF del escenario | Queda sin versionar (`docs/Escenario completo SQUATGYM.pdf`), salvo que el grupo decida subirlo. | — |

## Estado actual

- Las Fases 1 (diagnóstico) y 2 (plan) se aprobaron el 01/10/2026.
- Fase 3: **E0 a E11 terminadas**. Sigue **E12**: novedades con tipo "Ausencia" y "anular", horas desde el dominio (reemplaza `horasMock`) con diferencias, observaciones visibles para el encargado y avisos al profesor (CU 4 a 10 de Personal).
- En E11 se resolvió lo siguiente:
  - **Asistencia de profesores real** (antes era inventada, con fecha de 2023 y KPIs fijos).
  - **Registrar turnos (CU 1):** secretaría (pestaña "Profesores" de Asistencia) y encargado.
    - Según el cronograma del día, con los reemplazos.
    - Presente o ausente, con motivo.
    - Lo ya confirmado no se toca desde ahí.
  - **Semana de la sede (CU 2):** programado contra registrado, con KPIs (dictadas, ausencias, sin registrar, para confirmar).
    - Filtros por profesor y por empleado o contratado.
    - Las semanas anteriores funcionan como historial.
  - **Confirmar o corregir (CU 3), solo el encargado:**
    - confirmar uno por uno o "Confirmar lo registrado";
    - corregir con motivo obligatorio, conservando el valor anterior;
    - registrar un turno faltante (queda confirmado).
  - **Admin:** consulta todas las sedes, sin acciones.
  - **Semilla:** los turnos de anoche desde las 18 quedan "sin registrar", para la demo.
  - **Borrados:** `data/adminAttendance.ts`, `AdminShiftCard` y la pestaña vieja de presentismo del personal.
- En E10 se resolvió lo siguiente:
  - **Admin, "Alumnos" (CU 11)** en `/admin/alumnos`:
    - lista con filtros; alta con el mismo formulario de inscripción; ficha única con edición validada;
    - **baja con motivo** (lista de motivos y detalle) y confirmación;
    - **reactivación** que no cobra los meses de baja.
  - **Gestión de personal** quedó solo para el personal (`components/personal/StaffDirectory.tsx`); los alumnos se sacaron de ahí.
  - **Encargado, "Inscripciones de mi sede" (CU 12)** en `/encargado/inscripciones`:
    - altas y bajas por mes, gráfico de los últimos 6 meses (con tabla accesible);
    - por plan, y el detalle con quién inscribió a cada alumno;
    - solo consulta.
  - **Menú del admin:** "Dashboard" pasó a llamarse "Inicio".
- En E9 se resolvió lo siguiente:
  - **Centro de avisos para todos los roles** (`NotificationBell`):
    - contador discreto y lista, sin modales;
    - "marcar como leído": lo leído se guarda en el store, por usuario;
    - avisos calculados en `domain/notifications.ts`, con tests.
  - **Qué avisa a cada rol:**
    - **alumno:** cuota por vencer, vencida y acceso suspendido (CU 10); restricción, DDJJ faltante, documento en revisión, pago registrado y mensajes de secretaría;
    - **secretaría:** deudores y bloqueados de su sede, documentos para revisar y novedades;
    - **profesor:** reemplazos pendientes (CU 7 de Personal);
    - **encargado y admin:** novedades en curso.
  - **Alumno:**
    - "Alertas y preferencias" con datos reales; las preferencias se guardan en el navegador;
    - DDJJ real: es el mismo formulario que el de la inscripción;
    - certificado subido desde la app: queda "Pendiente de revisión" y secretaría recibe el aviso;
    - "Mi cuenta" usa el cobro y el recibo compartidos.
  - **Comunicaciones (CU 14)** en `/secretaria/comunicaciones`:
    - plantillas;
    - destinatarios (todos, sede, plan, por vencer, deudores o un alumno) con vista previa y cantidad;
    - `{nombre}` personalizado, email opcional (simulado) y borrador;
    - confirmación antes de enviar, e historial con destinatarios.
- En E8 se resolvió lo siguiente:
  - **Asistencia por clase y sede (CU 6):**
    - secretaría elige día, sede y clase; el profesor ve solo sus clases, incluidos los reemplazos;
    - `ClassRoster`: presente, ausente o justificada, y "marcar presentes a los habilitados";
    - los bloqueados no se pueden marcar presentes (misma verificación que el CU 13);
    - se guarda en el store con "Último registro: quién y cuándo";
    - se corrige hasta 30 días atrás, y el registro dice "Corrigió".
  - **Mi asistencia (CU 7):** historial con ausencias justificadas y sin justificar, resumen por mes, exportar a CSV e imprimir.
  - **Mi plan y cronograma (CU 8):** tarjeta del plan, clases incluidas resaltadas y las demás como "No incluida", filtro por sede y "Ver solo las clases de mi plan".
  - **Limpieza:** se borró `data/classStudents.ts`. Las observaciones del profesor pasaron a `components/personal/ObservationsPanel.tsx` (se completan en E12).
  - La pestaña "Personal" de Asistencia (`components/personal/StaffAttendanceToday.tsx`) es la pantalla vieja y se reemplaza en E11.
- En E7 se resolvió lo siguiente:
  - **Cobro nuevo** (`components/alumnos/payments/`), un solo componente para secretaría y para el pago online del alumno:
    - se elige cuántas cuotas, de la más vieja a la más nueva, con hasta 6 por adelantado;
    - medio de pago y promoción o cupón, con el motivo cuando no aplica;
    - recibo para ver o imprimir.
  - **Cobros:** lista ordenada por urgencia, KPIs (adeudado y cobrado hoy) y pestaña "Pagos de hoy" con recibos.
  - **Promociones (CU 9):** `data/promotions.ts` y `domain/promotions.ts` con tests.
  - **Restricción manual (CU 5):** desde la ficha, con motivo y registro de quién la aplicó. Se ve como "Restringido" en la lista.
  - **Control de acceso (CU 13)** en `/secretaria/acceso`:
    - busca por DNI completo (el resultado sale solo) o por nombre;
    - permite elegir una clase de hoy para controlar el plan;
    - el resultado se muestra en grande, con botones para cobrar, registrar asistencia y ver la ficha;
    - muestra los últimos controles.
- En E6 se resolvió lo siguiente:
  - **Carpeta `components/alumnos/`:** lista (`StudentsDashboard`, `StudentsTable`, `StudentStats`), inscripción (`enrollment/`), ficha (`profile/`) y DDJJ compartida (`health/`).
  - **Rutas de secretaría:** `/secretaria` redirige a `/secretaria/alumnos`; la inscripción es `/secretaria/alumnos/nuevo` y la ficha `/secretaria/alumnos/:id`.
  - **Inscripción en 5 pasos (CU 1):**
    - DNI y email sin duplicados (avisa apenas se escriben);
    - menor con adulto responsable y autorización adjunta;
    - peso, estatura, condiciones y antecedentes;
    - certificado opcional;
    - plan, sede y fecha de inicio con la cuota proporcional;
    - "Registrar e ir a cobrar" abre la ficha con el cobro listo;
    - borrador guardado.
  - **Ficha única:** reemplaza a `MemberDetailModal` y `member-detail/`. Tiene estas pestañas:
    - Resumen: cuenta, habilitación, legajo y contacto;
    - Datos (edición validada);
    - Salud y documentos: DDJJ, adjuntar y "Marcar como revisado";
    - Pagos, con recibo;
    - Historial: asistencia y registro de actividad.
  - **Permisos dentro de la ficha:** `studentCapabilities(rol)`. Secretaría edita y cobra, solo el admin da de baja y el encargado solo consulta.
  - **Inicio de secretaría:** accesos rápidos (Tomar asistencia, Cobrar cuota, Inscribir alumno) y KPIs que filtran la lista.
  - **Registro de actividad desde la semilla:** cada ficha muestra quién la inscribió, cobró o adjuntó documentos.
- En E5 se resolvió lo siguiente:
  - **Tokens de tema oscuro** (los primitivos de `ui/` ya salen oscuros), estados semánticos e Inter por defecto.
  - **Accesibilidad global:** foco visible y respeto de "reducir movimiento".
  - **Contraste AA:** los grises pasan a `gray-400` en nuestros módulos.
  - **Textos legibles:** 11 px como mínimo.
  - **Componentes compartidos:** `PageHeader`, `StatCard`, `StatusBadge`, `SearchInput`, `SegmentedTabs`, `EmptyState`, `FormField` y `WeekNavigator`.
  - **Filtros:** `FilterSelect` pasa a ser accesible (Radix).
  - **Tablas:** `DataTable` se ve como tarjetas por debajo de 1024 px y tiene filas operables con teclado.
  - **Avisos** en tema oscuro.
  - **Novedades:** botón visible "Marcar resuelta" (antes solo aparecía con el mouse).
  - **Reemplazos:** tiene un historial real.
- En E4 se resolvió lo siguiente:
  - **Store central en memoria** (`StoreProvider` + `useAppState` + `useStoreActions`), con registro de actividad.
  - **Flujos conectados**, probados en el navegador:
    - inscribir → cobrar (recibo con fecha, monto, medio y quién cobró) → el alumno pasa a "Al día";
    - cobrar desbloquea;
    - una baja del admin se ve en secretaría;
    - aceptar un reemplazo cambia el cronograma;
    - una novedad nueva aparece en la campana.
  - **Ficha del alumno:** "Guardar cambios" guarda y valida.
- En E3 se resolvió lo siguiente:
  - **Mocks coherentes:** 18 alumnos, 7 profesores (empleados y contratados) y 22 clases semanales con sede y profesor reales. Pagos, asistencias y reemplazos se generan relativos a hoy.
  - **Reglas en `domain/`, con tests:** `billing`, `access`, `schedule` y `hours`.
  - **Estados calculados:** las pantallas muestran el estado de cuenta calculado, con `AccountStatusBadge`.
  - **Mi cuenta del alumno real:** sin pagos inventados, con monto adeudado, fecha límite y recibos.
  - **Cobro:** junta todas las cuotas adeudadas.
  - **Cronogramas:** semana real; el profesor ve solo sus clases.
  - **Fechas:** se corrigieron las corridas un día.
  - **KPIs de secretaría:** se calculan desde los datos.
  - **Novedades:** guardan sede y autor.
- En E2 se resolvió lo siguiente:
  - Rol `encargado`: Adrián López en Centro y Susana García en Norte. Por ahora usa la asistencia del admin y Novedades; el filtro por sede llega en E11.
  - Sede (`branchId`) en los usuarios de secretaría y encargado.
  - Vínculo alumno/profesor por id.
  - Las rutas se controlan por rol (`domain/permissions.ts`), con tests.
  - Página "No tenés permiso".
  - La sesión guarda solo el id.
- En E1 se corrigió lo siguiente:
  - Cobro sin recargo, con 4 medios y sin efectivo online.
  - Datos fijos en lugar de aleatorios.
  - Se borraron las rutas huérfanas.
  - Desaparece "Deudor $0".
  - Las bajas son lógicas y piden confirmación.
  - La inscripción guarda borrador y confirma antes de cerrar.
  - Las tablas no se cortan en el celular.
  - Los íconos se cargan una sola vez.
  - Búsqueda por nombre o DNI.
  - Un solo cierre de sesión, con confirmación.
  - Se quitaron "Reservar", "Eliminar cuenta", "Visibilidad del perfil" y "Modo silencio".
  - El login usa una imagen local.
- **Ya existen** `domain/` y `store/` (`state.ts`, `actions.ts`, `reducer.ts`, `selectors.ts` y `StoreProvider.tsx`). Todas las pantallas de nuestros módulos leen del store.
- `components/alumnos/` ya existe. `components/personal/` todavía **no existe**. Las carpetas viejas que siguen en uso son `cronograma/`, `novedades/` y `globales/`. `secretaria/`, `member-detail/` y `cobros/` ya no existen.
- El diálogo de alumno de `AdminPersonalPage` sigue siendo el viejo. Se reemplaza por la ficha única en E10, con ruta `/admin/alumnos/:id` y `studentCapabilities("admin")`.
- **Helpers disponibles:**
  - `lib/dates.ts`: `parseISODate`, `addDays`, `diffDays`, meses "AAAA-MM", formatos y `todayISO`, que respeta `DEMO_TODAY`.
  - `lib/format.ts`, `hooks/use-draft.ts`, `common/ConfirmDialog.tsx` y `common/AccountStatusBadge.tsx`.
- **Quedan con mocks viejos hasta su etapa:**
  - `horasMock` dentro de `ProfesorHorasPage` (E12).

## Pendientes

- Etapas E1 a E15 de `docs/PLAN.md`.
- Consultar antes de agregar ESLint, porque suma dependencias de desarrollo.
- Coordinar con el grupo de Finanzas: el cobro ya lee `data/promotions.ts` (con los ids dc1…dc5 de su lista), pero `AdminPanel` todavía usa su propia lista interna. No se tocó porque es de ese grupo.
- Confirmar con el grupo si las promociones se acumulan (hoy se aplica una por cobro).

## Problemas conocidos (los más graves)

Cada uno está detallado en `docs/DIAGNOSTICO.md`, con su ID entre paréntesis.

- Los diálogos sin título accesible quedaron resueltos en E11: no queda ninguno sin título.
- **Íconos y fuentes por internet:** se cargan desde CDN (jsdelivr y Google Fonts).
  - Con la red lenta, la página tarda en cargar y los íconos pueden no aparecer. Pasó el 02/10/2026: el CDN tardaba más de 10 s.
  - Propuesta: servirlos desde el repo (E13, Wi-Fi). Está pendiente de que el grupo decida.
  - Las pruebas de navegador del scratchpad ya usan una copia local.

## Lo que no hay que romper

- El login y el acceso rápido: triple clic en "Ingresar".
- Las rutas actuales de cada rol y sus menús (`data/navigation.ts`).
- El deploy en Vercel.
- Las pantallas de otros grupos: `pages/Index.tsx` y las pestañas Información, Finanzas y Kiosco de `pages/AdminPanel.tsx`.
- `npm run typecheck`, `npm test` y `npm run build` tienen que pasar en cada commit.
