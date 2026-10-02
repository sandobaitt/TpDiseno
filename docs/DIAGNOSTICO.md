# Diagnóstico del front-end de SquatGym

- **Fecha:** 01/10/2026.
- **Rama:** `fixes-features-lucas`, en el commit `5e41cc7`.
- **Alcance:** módulos **Gestión de Alumnos** (14 CU) y **Gestión de Personal** (10 CU).
- **Cómo se hizo:**
  - Lectura completa del código propio: unas 11.400 líneas, sin contar los primitivos de `components/ui/`.
  - Revisión de los 17 archivos de mocks, las 22 rutas y la configuración.
  - Comparación con los casos de uso, las reglas de negocio y el escenario (`docs/Escenario completo SQUATGYM.pdf`).
  - Se corrieron typecheck, tests y build.

> **Documentos relacionados:**
> - Cobertura de cada CU: [`COBERTURA_CU.md`](COBERTURA_CU.md).
> - Plan de trabajo: [`PLAN.md`](PLAN.md).

---

## 1. Resumen

- **Casos de uso:** de los 24, **ninguno está completo**. Hay 17 parciales y 7 que faltan del todo.
- **Permisos:** cualquier usuario logueado entra a cualquier pantalla escribiendo la URL. No existe el rol **Encargado** y los usuarios no tienen sede.
- **Flujos cortados:** cada pantalla copia los mocks a su propio estado, y por eso nada se conecta:
  - cobrar no cambia el estado del alumno;
  - inscribir no lo hace aparecer en Cobros;
  - aceptar un reemplazo no suma horas.
- **Reglas de negocio incumplidas:**
  - recargo por mora con interés;
  - meses pagados inventados;
  - sin lógica de bloqueo por deuda;
  - sin prorrateo;
  - sin registro de quién hizo cada operación.
- **Bugs visibles en una demo:**
  - fechas corridas un día por la zona horaria;
  - datos aleatorios en la asistencia de profesores;
  - tablas cortadas en el celular;
  - rutas huérfanas.
- **Calidad:**
  - mucho código duplicado: 9 versiones de `getInitials` y 6 paletas de "estado del alumno";
  - los primitivos de `ui/` casi no se usan;
  - problemas de contraste y accesibilidad;
  - textos que mezclan tuteo, voseo e inglés.
- **Lo técnico funciona:** typecheck, tests y build pasan. Pero el chequeo de tipos no es estricto y hay un solo test, de una función de estilos.

---

## 2. Proyecto

### 2.1 Stack y estado técnico

| Tema | Detalle |
|---|---|
| Stack | React 18, React Router 6 (SPA), TypeScript, Vite 8, TailwindCSS 3, Radix/shadcn (`components/ui`), framer-motion y sonner. Íconos Tabler por CDN. |
| Servidor | Express 5 de la plantilla "Fusion Starter", con `/api/ping` y `/api/demo`. No lo usa ninguna pantalla. |
| Deploy | Vercel (`vercel.json`, `api/`). Quedan restos de Netlify (`netlify/`, `netlify.toml`). `api/server.js` es un archivo generado que está commiteado. |
| `npm run typecheck` | ✅ Sin errores, pero con `strict: false` y `strictNullChecks: false`, así que detecta poco. |
| `npm test` | ✅ 5 tests, todos de `cn()`. No hay ningún test de lógica de negocio. |
| `npm run build` | ✅ Con 2 avisos:<br>• clase ambigua `duration-[280ms]` en `DashboardLayout`;<br>• un solo bundle de **736 KB** (208 KB gzip), más una imagen `foto-admin.jpeg` de 712 KB. |
| Gestor de paquetes | La documentación dice pnpm, pero hay `package-lock.json`, los scripts usan `npm run` y pnpm no está instalado. **En la práctica es npm.** |
| Lint | No hay ESLint ni script `lint`. Hay un comentario `eslint-disable` que hoy no tiene efecto. |
| Otros | No hay README.<br>`index.html` tiene `lang="en"`.<br>El dev server corre en el puerto **3000** (la doc decía 8080).<br>`components.json` apunta a `client/index.css`, que no existe. |
| Documentación | `CLAUDE.md` describía `DashboardLayout` con props, pero el real es un layout de ruta con `<Outlet/>`.<br>`AGENTS.md` era la plantilla en inglés.<br>`ARQUITECTURA_FRONTEND.md` mencionaba la carpeta `/original`, ya borrada. |

### 2.2 Rutas y pantallas

| Ruta | Página | Aparece en el menú de |
|---|---|---|
| `/` | `pages/Index.tsx`, landing pública (otro módulo) | — |
| `/login` | `pages/Login.tsx` | — |
| `/unauthorized` | `pages/UnauthorizedAccess.tsx` | — |
| `/admin` | `pages/AdminPanel.tsx`: dashboard, finanzas y placeholders | admin |
| `/admin/personal` | `pages/AdminPersonalPage.tsx`: personal **y alumnos** | admin |
| `/admin/asistencia` | `pages/AdminAsistenciaPage.tsx` | admin |
| `/admin/novedades` | `pages/NovedadesPage.tsx` | admin |
| `/alumno` | `pages/AlumnoPanel.tsx`: perfil, asistencia y DDJJ | alumno |
| `/alumno/cronograma` | `pages/AlumnoCronogramaPage.tsx` | alumno |
| `/alumno/pagos` | `pages/AlumnoPagosPage.tsx` | alumno |
| `/alumno/ajustes` | `pages/AlumnoAjustesPage.tsx` | alumno |
| `/profesor` y `/profesor/asistencia` | `pages/ProfesorAsistenciaPage.tsx` | profesor |
| `/profesor/cronograma` | `pages/ProfesorCronogramaPage.tsx` | profesor |
| `/profesor/reemplazos` | `pages/ProfesorReemplazosPage.tsx` | profesor |
| `/profesor/horas` | `pages/ProfesorHorasPage.tsx` | profesor |
| `/secretaria` | `pages/Secretaria.tsx` → `components/secretaria/GymDashboard.tsx` | secretario |
| `/secretaria/asistencia` | `pages/AttendancePage.tsx` | secretario |
| `/secretaria/cobros` | `pages/PaymentsPage.tsx` | secretario |
| `/secretaria/cobros/cobrar` | `pages/PaymentCheckoutPage.tsx` | **ninguno: huérfana y rota** |
| `/secretaria/novedades` | `pages/NovedadesPage.tsx` | secretario |
| `/miembros/:id` | `pages/MemberDetailPage.tsx` | **ninguno: huérfana y abierta a cualquier rol** |
| `*` | `pages/NotFound.tsx` | — |

`pages/ProfesorPanel.tsx` se importa en `App.tsx`, pero ninguna ruta lo usa.

### 2.3 Datos mock (`client/data/`)

| Archivo | Contenido | Lo usa | Problemas |
|---|---|---|---|
| `branches.ts` | 3 sedes: Centro, Zona Norte y Zona Sur (inactiva) | Landing, ficha, asistencia, admin | Hay un alumno y dos profesores asignados a la sede inactiva. |
| `plans.ts` | 4 planes con `graceDays` | Varios | No dice qué actividades incluye cada plan. Los `graceDays` (3 y 5) contradicen la regla de mora de 15–20 días. |
| `clients.ts` | 4 alumnos | Varios | El estado es fijo y no se calcula desde los pagos. Faltan nacimiento, peso, estatura, salud, certificados y tutor. Las fechas de membresía están desactualizadas. |
| `payments.ts` | 5 pagos | Cobros, ficha, alumno | Incluye medios `credit` y `mp`, que no están en la lista aceptada. Usa fechas de solo día. |
| `checkins.ts` | 3 ingresos | **Nadie** | Código muerto. |
| `employees.ts` | Gerente, 2 recepcionistas y un entrenador inactivo | Asistencia, admin | Roles que no están en el escenario. Duplica a Tomás Ibáñez, que figura activo en `teachers.ts`. |
| `teachers.ts` | 5 profesores | Solo el formulario de novedades | No lo usan la asistencia, las horas ni el cronograma. No distingue empleado de contratado. |
| `users.ts` | 8 usuarios (2 por rol) y helpers de sesión | Login, auth, layout | No hay encargado. Los usuarios no tienen sede ni vínculo con su alumno o profesor. |
| `schedule.ts` | `weekMock`: clases de una semana | Cronograma de alumno y profesor, novedades | Los coaches no existen ("Coach Marcos", "Coach Elena"). Las clases no tienen sede ni actividad, ni relación con un plan. |
| `classStudents.ts` | 22 "alumnos de clase" | Asistencia del profesor | No existen en `clients.ts` e incluyen a "Nicolás Ferreyra", que es secretario. |
| `attendance.ts` | 8 asistencias | Perfil del alumno | No tienen `clientId`, así que todos los alumnos ven lo mismo. |
| `adminAttendance.ts` | Bloques de turnos, días y horarios | Asistencia del admin | Los entrenadores no existen. `daysMock` no se usa. |
| `replacements.ts` | 2 solicitudes de reemplazo | Reemplazos del profesor | Los profesores no existen. Dice "15 Oct" con fecha 2026-05-15. El campo `title` guarda la sede ("Sede Central", que tampoco existe). |
| `novedades.ts` | 6 novedades | Novedades, campana, admin | No tienen sede ni autor. El texto menciona sedes inexistentes (Belgrano, Palermo, Caballito). |
| `bitacoras.ts` | 3 observaciones | Asistencia del profesor | No tienen profesor ni clase. |
| `dashboard.ts` | Métricas y noticias fijas | Dashboard del admin (otro módulo) | Números incoherentes: "Asistencia hoy 1.245" con unos 800 alumnos. |
| `navigation.ts` | Menú por rol | `DashboardLayout` | No tiene encargado. Ante un rol desconocido muestra el menú de secretaria. |

**Datos de negocio escritos dentro de componentes:**
- `horasMock` en `ProfesorHorasPage.tsx`.
- `PROMOS` en `PaymentCheckoutContent.tsx`.
- `DESCUENTOS_INICIALES` en `AdminPanel.tsx` (otro módulo).
- Tres listas distintas de condiciones de salud: `NuevoSocioModal.tsx`, `AlumnoPanel.tsx` y `PaymentHistory.tsx`.
- Los KPIs de `StatsCard.tsx` (1.248 socios, 982, 156, 110) y de `AdminAsistenciaPage.tsx` (342 h, 15 miembros, 2 conflictos).

---

## 3. Permisos por rol

| Gravedad | Hallazgo |
|---|---|
| 🔴 | **`RequireAuth` solo verifica que haya sesión.** Cualquier rol entra a cualquier ruta escribiendo la URL. Por ejemplo, un alumno puede abrir `/admin/personal` y editar o borrar personal y alumnos, o abrir `/secretaria/cobros`. Es justo el problema que contó el cliente: "todos tienen acceso total". |
| 🔴 | **No existe el rol Encargado** en `AppUserRole`, ni en los usuarios, ni en el menú. Todos sus CU quedan sin actor. |
| 🔴 | **Los usuarios no tienen sede.** No hay forma de limitar al Encargado a su sucursal ni de saber en qué sede trabaja una secretaria. |
| 🔴 | **Privacidad del alumno:**<br>• `/miembros/:id` deja a cualquier rol ver la ficha y los pagos de cualquier alumno.<br>• El historial de asistencia es el mismo para todos.<br>• El estado de cuenta se busca **por coincidencia de nombre completo**, no por id. |
| 🟠 | **El profesor ve de más:** todas las clases del gimnasio (no solo las suyas), y las mismas solicitudes de reemplazo y horas que cualquier otro profesor. |
| 🟠 | **Rol desconocido:** `getNavigationByRole` cae en el menú de secretaria. |
| ℹ️ | La sesión mock vive en `localStorage` y se puede editar a mano. Sin backend es aceptable, pero hay que decirlo si lo preguntan. |

---

## 4. Reglas de negocio

| Regla | Estado | Detalle |
|---|---|---|
| Cada rol ve solo lo suyo | ❌ | Ver §3. |
| La sede es un dato y no está escrita a mano | ⚠️ | `branches.ts` existe, pero hay sedes escritas a mano:<br>• "CABA Centro" en `ProfesorAsistenciaPage`;<br>• "SEDE CENTRAL · Av. Principal 1234" en `AdminPanel`;<br>• "Sede Central" en reemplazos;<br>• Belgrano, Palermo y Caballito en novedades;<br>• `br_001` fijo al inscribir.<br>Además, clases, turnos, novedades y asistencias no tienen sede. |
| Acceso cruzado entre sedes | ❌ | No está modelado. |
| Las clases dependen del plan | ❌ | Los planes no dicen qué actividades incluyen y las listas no son por clase. |
| Cobro proporcional al inscribirse a mitad de mes | ❌ | No existe. |
| Pago en los primeros 5 días | ❌ | No hay fecha límite. |
| Sin intereses por mora | ❌ | El cobro suma "Recargo por mora +$5.000 · interés compuesto 1,5%", **activado por defecto**. |
| Bloqueo con 15–20 días de atraso, como constante configurable | ❌ | No hay lógica. Los planes tienen `graceDays` de 3 y 5 días. |
| Medios de pago: efectivo, débito, transferencia y QR | ⚠️ | El cobro dice "Tarjeta". El modelo de pagos tiene crédito y MercadoPago. En el pago online, el alumno puede elegir "Efectivo" y recibe 10% automático. |
| Recibo con fecha, monto y método | ⚠️ | El comprobante del alumno (`ReceiptPopup`) existe, pero al cobrar desde secretaria no se emite ningún recibo. |
| Inscripción completa | ⚠️ | Solo tiene DDJJ con casillas. Faltan peso, estatura, antecedentes, certificados y autorización de un adulto para menores, y no se controlan duplicados. |
| Personal = profesores empleados o contratados, por turno y sede | ❌ | `employees.ts` tiene recepción, gerente y contabilidad, y los profesores están en otra entidad. No hay turnos, ni tipo de contratación, ni comparación de horas contra el cronograma. |
| Alertas resumidas y no intrusivas | ⚠️ | No hay modales bloqueantes, y eso está bien. Pero solo admin y secretaria tienen campana, y su punto rojo late sin parar (`animate-pulse`). |
| Interfaz clara para distintos niveles de alfabetización digital | ⚠️ | 187 textos de 8 a 10 px, grises de bajo contraste y jerga ("laboratorio cinético", "en cancha", "Action Req"). |
| Las operaciones importantes dejan registro de quién, qué y cuándo | ❌ | No existe ningún registro. |
| Wi-Fi inestable: estado de conexión y no perder lo cargado | ❌ | No hay indicador de conexión. Cerrar el modal de inscripción borra todo, y nada sobrevive a una navegación. |

---

## 5. Flujos de punta a punta

La causa raíz es siempre la misma: cada pantalla copia los mocks a su propio `useState`, así que ningún cambio llega a las demás pantallas.

| Flujo esperado | Qué pasa hoy |
|---|---|
| Registrar pago → cambia el estado de cuenta → cambia la habilitación | El pago no se registra. El alumno sigue "Deudor" y nada cambia. |
| Inscripción → el alumno aparece en Cobros y en Asistencia | El alumno nuevo solo vive en la pantalla de socios y se pierde al navegar. |
| Confirmar reemplazo → cambia el cronograma y las horas | Solo desaparece la tarjeta. |
| DDJJ del alumno → legajo médico que ve la secretaria | El legajo siempre dice "Sin declarar". |
| Observación del profesor → la ve el encargado | Nadie más la ve. |
| Registrar novedad → avisa en la campana | La campana lee el mock fijo. |
| Editar o dar de baja un alumno (admin) → se refleja en secretaria | Son estados separados. |
| Tomar asistencia → historial del alumno y horas del profesor | No se guarda en ningún lado. |
| Deuda → restricción → no se puede marcar presente | No hay restricción, y se puede marcar presente a un deudor. |

---

## 6. Contradicciones entre el código y los CU o reglas

| # | Contradicción | Decisión (01/10/2026) |
|---|---|---|
| 1 | Recargo por mora con interés (`PaymentCheckoutContent.tsx`) contra "no hay intereses por mora". | Se corrige: se quita el recargo. |
| 2 | Medios de pago: crédito, MercadoPago, "Tarjeta" genérica y "Efectivo" en el pago online. | Se corrige: solo efectivo, débito, transferencia y QR. El pago online no ofrece efectivo. |
| 3 | `graceDays` por plan (3 y 5 días) contra un umbral global de 15–20 días. | Se corrige: umbral único de **15 días desde el vencimiento (día 5)**, en una constante configurable. |
| 4 | El admin borra alumnos definitivamente y sin confirmar, y el alumno puede "Eliminar cuenta". El CU 11 asigna la baja al Administrador. | Se corrige: baja lógica, solo del admin, con confirmación. Se quita "Eliminar cuenta". |
| 5 | Personal con roles recepcionista, gerente y contabilidad, contra "todos son profesores, empleados o contratados". | Se corrige en el modelo de datos. |
| 6 | Funciones que no están en ningún CU: "Reservar clase" (aparece hasta en el cronograma del profesor), "Visibilidad del perfil" y "Modo silencio". | Se corrige: se quitan. |
| 7 | La lista de promociones del cobro está fija en el componente y es distinta a la de Admin → Finanzas (otro grupo). | Se crea una fuente de datos propia para el cobro. No se toca el módulo de promociones; queda anotado para coordinar con ese grupo. |

---

## 7. Hallazgos ordenados por gravedad

### 7.1 🔴 Críticos: rompen un CU o una regla

| ID | Hallazgo | Dónde |
|---|---|---|
| C1 | No se controla el rol en las rutas. | `App.tsx`, `components/common/RequireAuth.tsx` |
| C2 | No existe el rol Encargado y los usuarios no tienen sede. | `data/users.ts`, `data/navigation.ts` |
| C3 | El cobro no registra el pago ni emite recibo, y suma un recargo con interés. | `components/cobros/PaymentCheckoutContent.tsx` |
| C4 | El estado de cuenta es falso: `buildMonthHistory` inventa pagos (`synth_`) para todos los meses pasados, así que un deudor figura al día. | `pages/AlumnoPagosPage.tsx` |
| C5 | No hay lógica de mora ni de bloqueo, y se puede marcar presente a un deudor. | `pages/AttendancePage.tsx`, `member-detail/AccessControlCard.tsx` |
| C6 | No hay datos compartidos entre pantallas: todos los flujos del §5 están cortados. | Todas |
| C7 | Datos aleatorios que cambian en cada visita (`Math.random`). | `pages/AttendancePage.tsx:159`, `pages/AdminAsistenciaPage.tsx:55` |
| C8 | Privacidad: `/miembros/:id` queda abierta a cualquier rol y los datos del alumno no se filtran por usuario. | `App.tsx`, `pages/MemberDetailPage.tsx`, `pages/AlumnoPanel.tsx`, `pages/AlumnoPagosPage.tsx` |

### 7.2 🟠 Altos: bugs

| ID | Hallazgo | Dónde |
|---|---|---|
| A1 | **Fechas corridas un día.** `new Date("2026-04-01")` se interpreta como UTC, así que en Argentina (UTC-3) se muestra el día anterior y el pago de mayo se cuenta como de abril. Además, el "hoy" calculado con `toISOString()` da el día siguiente después de las 21 h. | `MemberDetailModal`, `PaymentCheckoutContent`, `AlumnoPagosPage`, `NuevoSocioModal` |
| A2 | **Cinco "hoy" distintos:** la fecha real (oct-2026), los mocks (may-2026), la base del cronograma (may-2025), la base de la asistencia del admin (nov-2023) y las alertas del alumno (oct-2023). | Cronogramas, `AdminAsistenciaPage`, `AlumnoAjustesPage` |
| A3 | `/secretaria/cobros/cobrar` usa `useParams().id`, pero la ruta no tiene `:id`. Siempre cobra a `cl_002`. | `pages/PaymentCheckoutPage.tsx` |
| A4 | La alumna inactiva y sin plan aparece en Cobros como "Deudor $0". | `pages/PaymentsPage.tsx` |
| A5 | "Eliminar alumno" y "Eliminar personal" borran sin pedir confirmación. | `pages/AdminPersonalPage.tsx` |
| A6 | "Guardar cambios" en la ficha de la secretaria solo muestra un aviso. En `MemberDetailPage`, "Editar perfil" y "Cobrar saldo" no hacen nada. | `secretaria/MemberDetailModal.tsx`, `pages/MemberDetailPage.tsx` |
| A7 | Cerrar el modal de inscripción (clic afuera o Esc) borra todo lo cargado. | `secretaria/NuevoSocioModal.tsx` |
| A8 | "Confirmar" y "Rechazar" reemplazo hacen lo mismo, y las fechas no coinciden. | `pages/ProfesorReemplazosPage.tsx`, `data/replacements.ts` |
| A9 | **Tablas cortadas en el celular.** Las columnas fijas no entran, y como el contenedor tiene `overflow-hidden`, se pierden los botones:<br>• Asistencia: 312 px en 280 px útiles.<br>• Mis horas: 320 px. | `pages/AttendancePage.tsx`, `pages/ProfesorHorasPage.tsx` |
| A10 | **Íconos Tabler** cargados desde un CDN `@latest` dentro de 3 componentes:<br>• no se ven en `/login` ni en `/unauthorized`;<br>• si se cae la red, desaparecen, y muchos botones son solo un ícono. | `DashboardLayout`, `Index`, `NotFoundPage` |
| A11 | **Búsquedas:**<br>• por DNI hay que escribir los puntos: "34567890" no encuentra "34.567.890";<br>• en Cobros y en Asistencia solo se busca por nombre. | `MembersTable`, `PaymentsPage`, `AttendancePage` |
| A12 | **Dos formas de cerrar sesión:**<br>• la del menú de usuario no pide confirmación;<br>• la del sidebar es un modal propio que no atrapa el foco ni se cierra con Esc. | `common/HeaderNav.tsx`, `common/DashboardLayout.tsx` |
| A13 | **La campana lee mocks fijos:**<br>• las novedades nuevas no aparecen;<br>• al alumno y al profesor les dice "Sin notificaciones", aunque Ajustes muestra 4 alertas. | `common/HeaderNav.tsx` |
| A14 | Imágenes externas temporales (api.builder.io "TEMP" y placehold.co) que pueden dejar de existir el día de la presentación. | `Login.tsx`, `Index.tsx`, `NotFoundPage.tsx` |

### 7.3 🟡 Código: duplicado, muerto, nombres y tamaño

**Código duplicado:**

| Qué se repite | Veces |
|---|---|
| `getInitials` | 9, más uno escrito inline |
| Formateadores de fecha (`formatDate`, `formatTimestamp`, `formatLastAccess`) | 7 |
| `timeAgo` | 2 |
| Mapeo de pago a movimiento | 2 |
| Etiquetas de medios de pago | 3, más un enum distinto en el cobro |
| Estilos del estado del alumno | 6 paletas distintas |
| Botones de pestaña / buscadores / campos `Field` | 6 / 6 / 4 |
| Toggles / tarjetas de KPI | 5 / 6 |
| Navegador de semana, cada uno con su fecha base | 3 |
| Listas de condiciones de salud | 3 |
| Dropdowns caseros (existiendo Radix Select) | 4 |
| Ficha y edición de alumno (`MemberDetailModal`, `MemberDetailPage`, diálogo de `AdminPersonalPage`) | 3 |

**Código muerto:**
- Páginas y componentes sin uso:
  - `ProfesorPanel.tsx`;
  - `SystemFooter.tsx`;
  - `FileUpload.tsx` (sirve para los certificados);
  - `PaymentCheckoutPage` y `MemberDetailPage`, con sus rutas.
- Mocks sin uso: `checkinsMock` y `daysMock`.
- Providers montados sin uso: el Toaster de Radix (se usa sonner) y `QueryClientProvider`.
- Dependencias sin uso: `three`, `@react-three/fiber`, `@react-three/drei` y `@types/three`.
- Primitivos de `ui/`: unos 40 sin usar. Fuera de `ui/` solo se usan dialog, alert-dialog, sonner y tooltip.
- Restos menores:
  - 13 directivas `"use client"`, que son de Next.js;
  - un `console.error` en `NotFound.tsx`;
  - variables `branch` sin usar en `AdminPersonalPage`;
  - íconos definidos y nunca dibujados en la landing.

**Incumplimientos de las reglas de CLAUDE.md:**
- Las páginas tienen toda la lógica en lugar de ser envoltorios finos.
- Las features construyen botones, inputs, toggles y checkboxes a mano en vez de usar `ui/`.
- Hay 6 `style={{}}` y 18 colores hex sueltos (`#111111`, `#151515`, `#171717`…).

**Componentes demasiado grandes:**

| Componente | Líneas |
|---|---|
| `AdminPersonalPage` | 701 |
| `AttendancePage` | 574 |
| `NovedadesSidebar` (trae su propio DatePicker y TimePicker) | 560 |
| `AdminPanel` | 539 |
| `PaymentCheckoutContent` | 457 |
| `NuevoSocioModal` | 401 |

**Nombres confusos:**
- Se mezclan "socio", "alumno", "miembro" y "cliente".
- "Bitácora" contra "observación".
- `Secretaria.tsx` y `GymDashboard` son en realidad la gestión de alumnos.
- En reemplazos, el campo `title` guarda la sede.

**Mocks inconsistentes:** ver el §2.3.

**Archivos sueltos:**
- `.dockerignore` está copiado de otro proyecto.
- `api/server.js` es un archivo generado y está commiteado.
- `package.json` se sigue llamando "fusion-starter".

### 7.4 🔵 Usabilidad

**Falta de feedback:**
- Confirmar un reemplazo, marcar asistencia o guardar no muestran ningún aviso.
- Los botones que dicen "notificar" no notifican.

**Validaciones:**
- Email y DNI solo se controlan como "no vacío".
- No se detectan duplicados.
- Los botones quedan deshabilitados sin explicar qué falta.

**Faltan confirmaciones:**
- En las bajas del admin.
- "Resolver novedad" solo aparece con el mouse encima. En el celular no hay hover: se toca "En proceso" y la novedad se resuelve sin aviso.

**Faltan estados de pantalla:**
- No hay mensaje para cuando no hay datos en:
  - el historial de novedades;
  - los pagos del alumno, si no se lo encuentra;
  - el historial de asistencia.
- No hay estados de carga ni de error.

**Flujos lentos para la secretaria, que atiende con gente esperando:**
- Para saber si alguien puede pasar tiene que buscarlo en socios y abrir la ficha.
- La asistencia es una lista plana de todos los alumnos; con 800 sería inviable.
- Registrar una novedad pide fecha y hora con selectores propios, sin "ahora" por defecto.

**Textos:**
- Mezclan tuteo con voseo:
  - tuteo: "Ingresa tus credenciales", "Debes iniciar sesión", "Gestiona", "Consulta";
  - voseo: "Completá", "Pagá".
- Hay inglés suelto: "Dashboard", "Action Req", "Close", "Check-in", "Push Mobile".
- Hay jerga de marketing en pantallas de trabajo: "laboratorio cinético", "en cancha", "centro de transacciones".

**Botones que no hacen nada:**
- PDF y CSV, "Ver todo", "Marcar todo como leído" y "¿Olvidaste tu contraseña?".
- La flecha "volver" de Mi perfil es decorativa.
- Hay íconos de check decorativos en los títulos.

### 7.5 🟣 Diseño y accesibilidad

**Colores:**
- Hay dos verdes de marca: `lime-400` (#a3e635, 355 usos) y `squat-green` (#95FD00, 29 usos).
- Hay unos 10 negros distintos.
- El color del estado cambia según la pantalla:
  - "habilitado": green-500, green-400 o lime-400;
  - "deudor": red-500, red-400 u orange-400.

**Tema:**
- Los tokens de shadcn (`global.css`) están en paleta **clara**, pero la app es oscura. Por eso cada Dialog se corrige a mano con clases.
- Sonner sigue el tema del sistema, así que puede mostrar avisos blancos sobre la app negra.

**Tipografía:**
- Inter y Plus Jakarta Sans solo se aplican en la landing y el login; el panel usa la fuente del sistema.
- Hay 6 estilos distintos de título de página.

**Contraste:**
- `text-gray-600` sobre #171717 da ≈ 2,4:1 y `text-gray-500` ≈ 3,7:1. Ninguno llega al **4,5:1** que pide WCAG AA para texto normal.
- Esas dos clases se usan 292 veces.

**Teclado y lectores de pantalla:**
- Hay 0 `htmlFor` (los labels no están asociados a sus campos), 0 `focus-visible` y solo 4 `aria-label`.
- Los checkboxes, toggles y dropdowns caseros no tienen rol ARIA ni se pueden usar con el teclado.
- Hay filas y columnas clickeables hechas con `div`.
- Hay botones que son solo un ícono y no tienen nombre: campana, menú, papelera y flechas de semana.

**Estado comunicado solo con color:**
- El punto de activo o inactivo del personal.
- El punto del tipo de novedad en la campana.

**Responsive:**
- Las tablas tienen anchos mínimos de 900, 700 y 600 px, así que en el celular hay que deslizar de costado.
- Las grillas de 3 KPIs quedan apretadas en 360 px.
- Hay botones de 28 px; para gente con poca práctica digital conviene que midan 40 px o más.

---

## 8. Recorrido por rol

**Secretaria** (PC, con gente esperando):
1. **Inicio:** los KPIs fijos (1.248 socios) no coinciden con la lista (4 alumnos).
2. **Inscripción:** si toca afuera del modal pierde todo. No puede adjuntar el certificado, nadie le avisa si el DNI ya existe y el alumno desaparece al cambiar de pantalla.
3. **Cobro:** el recargo de $5.000 viene activado aunque el alumno esté al día. Después de confirmar, el alumno sigue "Deudor" y no hay recibo para entregar.
4. **Control en la puerta:** no hay una forma rápida de saber si alguien puede pasar (CU 13).
5. **Asistencia:** es una lista plana, sin clase ni sede. Puede marcar presente a un deudor, y al salir de la pantalla se pierde lo marcado.
6. **Comunicaciones:** el ítem está deshabilitado.

**Profesor** (celular):
1. Entra a una clase fija ("CrossFit WOD 18:00, CABA Centro") que no es necesariamente suya.
2. Marca Sí/No a 22 alumnos inventados, y no hay botón Guardar.
3. En el cronograma ve todas las clases del gimnasio, con un botón "RESERVAR".
4. En reemplazos, Confirmar y Rechazar hacen lo mismo y no muestran ningún aviso.
5. En "Mis horas" la tabla se corta y no ve diferencias con su cronograma.
6. La campana está siempre vacía.

**Encargado:** no existe, así que no se puede loguear y ninguno de sus CU se puede recorrer.

**Administrador:**
1. El dashboard muestra "SEDE CENTRAL · Av. Principal 1234", que no existe, con métricas fijas y pestañas "en desarrollo".
2. En "Gestión de personal" puede editar (el cambio vale solo en esa pantalla) y borrar alumnos y personal sin confirmación. No puede dar de alta.
3. En Asistencia los estados son aleatorios y solo se pueden mirar.

**Alumno** (celular):
1. "Mi perfil" no muestra sus datos, su plan ni su estado.
2. Su historial de asistencia es igual al de todos y obliga a deslizar de costado.
3. El certificado queda "Confirmado" sin haber elegido ningún archivo.
4. Los meses pasados figuran pagados aunque deba.
5. Puede pagar "en efectivo" online, y al pagar no cambia nada.
6. No ve qué clases le corresponden según su plan.
7. Las alertas son de 2023 y tiene un botón "Eliminar cuenta".

---

## 9. Código de otros módulos

Estas partes del repo no son de nuestro grupo. Se listan acá y no se tocan.

| Módulo | Dónde |
|---|---|
| Landing pública | `pages/Index.tsx` |
| Dashboard y estadísticas del admin (Reportes) | `pages/AdminPanel.tsx`, pestaña Información, y `data/dashboard.ts` |
| Configuración de promociones y descuentos | `pages/AdminPanel.tsx` → `TabFinanzas`. Hay que coordinar: nuestro cobro debería leer de la misma fuente. |
| Kiosco | Ítem deshabilitado en el menú de secretaria y pestaña "Kiosco" de `AdminPanel` |
| Pestaña "Staff" de AdminPanel | Placeholder que duplica `/admin/personal` |
| Cronogramas de secretaria (requisito 3.1.17, fuera de nuestros CU) | Ítem deshabilitado en el menú |
| Servidor y deploy de la plantilla | `server/`, `api/`, `netlify/`, `vercel.json`. No se tocan, para no romper el deploy. |
