# CLAUDE.md — SquatGym

Este archivo es la fuente de verdad sobre cómo se trabaja en este repo. El estado del proyecto, las decisiones tomadas y lo que está pendiente están en MEMORY.md:

@MEMORY.md

## Proyecto

Es el TP Integrador de **Análisis de Sistemas de Información** (UTN FRRe, K2.4, prof. Gaona).

**SquatGym** es una cadena de gimnasios con 2 sedes y unos 800 alumnos. El repo es un prototipo **solo front-end**:
- No hay backend real; todo funciona con datos simulados (mock).
- Tiene que funcionar bien en PC, notebook y celular.

**Alcance del grupo:** **Gestión de Alumnos** y **Gestión de Personal**.
- Los demás módulos son de otros grupos: kiosco y stock, reportes, auditoría, configuración de promociones y la landing.
- No los construimos ni los ampliamos. Si hay que tocarlos, se consulta antes.
- La fuente de verdad son los casos de uso de abajo y `docs/Escenario completo SQUATGYM.pdf`.

**Documentación de trabajo:**
- [`docs/DIAGNOSTICO.md`](docs/DIAGNOSTICO.md): estado y problemas detectados.
- [`docs/COBERTURA_CU.md`](docs/COBERTURA_CU.md): cobertura de cada CU.
- [`docs/PLAN.md`](docs/PLAN.md): etapas y decisiones.

## Comandos (npm)

```bash
npm install
npm run dev         # http://localhost:3000 (Vite + Express de la plantilla, con recarga en caliente)
npm run build       # build de producción (cliente + servidor)
npm test            # Vitest
npm run typecheck   # TypeScript
npm run format.fix  # Prettier
```

El gestor es **npm**: hay `package-lock.json` y los scripts usan `npm run`. No se usa pnpm.

## Stack

| Parte | Qué se usa |
|---|---|
| Base | React 18 + React Router 6 (SPA), TypeScript, Vite y TailwindCSS 3 |
| Componentes | Radix/shadcn (`components/ui`), framer-motion y sonner para los avisos (toasts) |
| Íconos | Tabler Icons, como webfont: `className="ti ti-<nombre>"`. Se cargan una sola vez, con versión fija, en `index.html`. |
| Servidor | Express 5 que viene con la plantilla. No se usa: no agregar endpoints ni backend sin consultar. |
| Deploy | Vercel (`vercel.json`, `api/`). No tocar. |

Alias de imports: `@/*` → `client/` y `@shared/*` → `shared/`.

## Estructura

```
client/
├── App.tsx            Rutas. Las privadas van dentro de <RequireAuth><DashboardLayout/></RequireAuth>
├── pages/             Una página por ruta: envoltorio fino, en PascalCase
├── components/
│   ├── ui/            Primitivos "tontos" (shadcn/Radix). Solo reciben props, sin lógica de negocio.
│   ├── common/        Layout y piezas compartidas (DashboardLayout, SidebarNav, HeaderNav, DataTable…)
│   ├── alumnos/       Gestión de Alumnos (lista, inscripción, ficha, legajo de salud)
│   └── personal/      Gestión de Personal  ← destino de las pantallas de ese módulo
├── data/              Mocks (datos semilla) y reglas configurables
├── domain/            Reglas de negocio como funciones puras, con tests
├── store/             Store central en memoria + registro de actividad
├── lib/, hooks/       Utilidades (cn, fechas, formatos) y hooks
docs/                  Diagnóstico, cobertura de CU, plan y escenario
```

La estructura está en migración. Qué carpetas existen y cuáles todavía son viejas figura en MEMORY.md.

## Convenciones de código

**Reglas de oro para componentes:**
1. `components/ui/` tiene **solo primitivos "tontos"** (Button, Input, Dialog…). No conocen el negocio.
2. `components/<módulo>/` tiene los componentes con lógica de negocio.
3. **Nunca** se crea un botón, input, toggle o checkbox nuevo dentro de una feature: se importa de `@/components/ui/`.

**Cómo agregar una pantalla:**
1. El componente principal va en `client/components/<módulo>/`.
2. La página `client/pages/MiPantalla.tsx` solo importa y renderiza ese componente.
3. Se registra la ruta en `client/App.tsx`, dentro del grupo protegido y **bajo el prefijo del rol**: `/admin`, `/encargado`, `/secretaria`, `/profesor` o `/alumno`.
   - Los permisos de cada prefijo están en `client/domain/permissions.ts` y los aplica `RequireAuth`.
   - Si dos roles usan la misma pantalla, se registra una ruta en cada prefijo.
4. Si va en el menú, se agrega el ítem en `client/data/navigation.ts`. Un test controla que cada ítem del menú sea accesible para su rol.
   - Si la sección tiene subpantallas (por ejemplo, la ficha `/secretaria/alumnos/:id`), el ítem lleva `end: false` para que siga marcado.
5. Lo que puede hacer cada rol **dentro** de una pantalla también sale de `domain/permissions.ts` (por ejemplo, `studentCapabilities(rol)` en la ficha del alumno).

**DashboardLayout** (`components/common/DashboardLayout.tsx`):
- Es un **layout de ruta**: no recibe props.
- Lee el rol de la sesión, arma el menú con `data/navigation.ts` y muestra sidebar + header + `<Outlet/>`.
- Las páginas solo renderizan su contenido; el título del header sale del ítem de menú activo.

**DataTable** (`components/common/DataTable.tsx`):
- Es una tabla genérica hecha con CSS Grid.
- Recibe `columns` (`key`, `header` y `render` opcional), `data`, `gridTemplateClass` y `getRowKey`.
- Para celdas largas: `min-w-0` en el contenedor y `truncate` en el texto.

**SidebarNav:** se arma solo con props. Cada ítem tiene una de estas acciones:
- `to`: link interno; marca el activo solo.
- `href`: link externo.
- `onClick`: una acción.
- `disabled`: se muestra deshabilitado.

**Código en general:**
- TypeScript con componentes funcionales y hooks. Evitar `any`.
- Archivos `.tsx` en PascalCase.
- Identificadores en **inglés**, como el código existente. Textos de la interfaz en **español**.
- Comentarios solo donde aporten, y en español.
- Sin `console.log` sueltos.
- Fechas: `new Date("AAAA-MM-DD")` se interpreta en UTC y en Argentina muestra el día anterior. Hay que usar los helpers de fechas (ver MEMORY.md).
- Los datos de negocio (alumnos, clases, pagos) salen de `client/data/` o del store. **Nunca** se escriben a mano en el JSX.

**Componentes compartidos** (`components/common/`), que se usan en vez de armar cada pieza a mano:

| Componente | Para qué |
|---|---|
| `PageHeader` | Título, subtítulo y acciones de cada pantalla. |
| `StatCard` | Indicadores. Con `onClick` + `pressed` funciona como filtro rápido. |
| `StatusBadge` y `AccountStatusBadge` | Estados con ícono y texto. |
| `SearchInput` | Buscador. |
| `FilterSelect` | Filtro accesible, basado en el Select de Radix. |
| `SegmentedTabs` | Pestañas. |
| `EmptyState` | Mensaje de lista vacía. |
| `FormField` + `inputClasses` | Campo con label asociado y error en línea. |
| `WeekNavigator` | Navegador de semana. |
| `ConfirmDialog` | Confirmaciones. |
| `SectionCard` | Tarjeta con título y acciones para agrupar una sección. |
| `DetailList` | Lista de datos "Rótulo: valor" (fichas, recibos, resúmenes). |
| `FileUpload` | Adjuntar PDF, JPG o PNG (con botón o arrastrando). Controla formato y tamaño. |
| `DataTable` | Tabla en escritorio y tarjetas por debajo de 1024 px. Para filas clickeables: `onRowClick` + `rowActionLabel`. |

**Piezas que ya existen y hay que reusar:**

| Pieza | Para qué |
|---|---|
| `components/common/ConfirmDialog.tsx` | Confirmar acciones importantes o destructivas. |
| `lib/format.ts` | `matchesPersonSearch` (busca por nombre sin tildes o por DNI con o sin puntos), `formatARS` (moneda), `formatDni`, `getInitials` y `cleanText`. |
| `lib/files.ts` | `FileMeta`, `checkDocumentFile` y `formatFileSize`. |
| `components/alumnos/payments/CheckoutDialog` | Cobrar cuotas desde cualquier pantalla: cuotas, medio, promoción y recibo. |
| `components/alumnos/payments/ReceiptDialog` | Ver o imprimir un recibo (solo sale el recibo, gracias a la clase `print-area`). |
| `data/promotions.ts` + `domain/promotions.ts` | Única fuente de promociones y sus condiciones (vigencia, cupón, efectivo, antigüedad, semestral, familiar). |
| `domain/enrollment.ts` | Validaciones de alumno (DNI, email, celular, fecha de nacimiento, DDJJ), duplicados, menores, cuota de alta y estado del legajo. Se usan en la inscripción y al editar. |
| `lib/dates.ts` | `toLocalISODate`, `todayISO` y `nowISO`. No usar `toISOString()` para fechas sin hora. |
| `hooks/use-draft.ts` | Borradores de formularios guardados en el navegador. |
| `data/payments.ts` | `PAYMENT_METHOD_LABELS`, las etiquetas de los 4 medios de pago aceptados. |

## Diseño

- **Estilos:** solo clases de Tailwind. **Está prohibido `style={{ }}`.**
- **Colores:** siempre desde tokens. Nada de hex sueltos.
  - Los tokens viven en `client/global.css` y `tailwind.config.ts`.
  - Clases semánticas: `bg-background`, `bg-card`, `text-muted-foreground`, `text-primary` (verde de la app), `text-success`, `text-warning`, `text-danger`, `text-info`.
  - La landing usa sus propios colores `squat-*`.
- **Clases condicionales:** con `cn()` de `@/lib/utils`.
- **Tema oscuro:** bordes redondeados `rounded-xl`/`rounded-2xl` y sombras suaves. Un solo verde de marca.
- **Accesibilidad:**
  - Cada label va asociado a su campo.
  - Los botones de solo ícono llevan `aria-label`.
  - El foco tiene que verse: ya hay un estilo global `:focus-visible`, así que no hay que sacarlo con `outline-none` sin dar otro indicador.
  - Contraste de 4,5:1 o más (AA).
  - Texto de 12 px o más; 11 px solo para rótulos en mayúsculas.
  - Botones de 40 px o más en el celular.
  - **Un estado nunca se comunica solo con color**: siempre va con texto o ícono, por ejemplo "Deudor".
- **Responsive:** primero el celular, sobre todo para alumno y profesor. En pantallas chicas, las tablas pasan a tarjetas.
- **Feedback:**
  - Cada acción muestra un aviso (sonner).
  - Las acciones destructivas piden confirmación (una baja, por ejemplo).
  - Las listas tienen estados vacíos claros.
- **Alertas:** resumidas y **no intrusivas**. Se usan badges, el centro de notificaciones o avisos discretos. No se usan modales que bloqueen el trabajo.

## Textos de la interfaz

- Español rioplatense neutro, **con voseo**: "Ingresá", "Guardá", "Elegí".
- Se dice **"alumno"**, no socio, cliente ni miembro.
- Lenguaje simple, sin jerga de marketing ni palabras en inglés ("Inicio", no "Dashboard").
- Pensar en usuarios con poca práctica digital, como secretarias y profesores.

## Roles

| Rol | Qué ve |
|---|---|
| `admin` | Todo, con filtro por sede. |
| `encargado` | Solo **su** sede. |
| `secretario` | Gestión diaria de alumnos y asistencia. |
| `profesor` | Sus clases, sus horas y sus reemplazos. |
| `alumno` | Solo **sus** datos. |

**Sesión mock:**
- En `localStorage` se guarda **solo el id** del usuario.
- El rol, la sede (`branchId`) y los vínculos con su alumno (`clientId`) o profesor (`teacherId`) se toman siempre de `client/data/users.ts`. Así no se pueden cambiar editando el navegador.
- Los helpers están en `client/data/users.ts`: `getMockSession()`, `saveMockSession()`, `clearMockSession()`, `getPostLoginPath(role)` y `ROLE_LABELS`.
- Haciendo triple clic en "Ingresar" aparece el acceso rápido por rol.

## Casos de uso

**Gestión de Alumnos**

| # | Caso de uso | Actor |
|---|---|---|
| 1 | Registrar inscripción: datos personales, contacto y DDJJ de salud | Secretaria |
| 2 | Completar la declaración jurada de salud (puede adjuntar certificados) | Alumno |
| 3 | Consultar estado de cuenta: pagos, monto adeudado y fecha límite | Alumno / Secretaria |
| 4 | Registrar pago de cuota con recibo digital | Secretaria |
| 5 | Aplicar restricción de acceso por deuda | Sistema / Secretaria |
| 6 | Gestionar asistencia diaria por clase y sede | Secretaria / Profesor |
| 7 | Consultar historial de asistencia, incluidas las ausencias sin justificar | Alumno |
| 8 | Consultar cronograma y plan contratado | Alumno |
| 9 | Aplicar promoción o descuento: cupones, planes familiares, promos vigentes | Secretaria / Administrador |
| 10 | Enviar alerta de vencimiento de cuota | Sistema |
| 11 | Gestionar alta, baja y modificación de alumno | Administrador |
| 12 | Consultar inscripciones por sede | Encargado |
| 13 | Verificar habilitación para ingresar a clase: cuota al día y plan | Sistema / Secretaria |
| 14 | Enviar notificación a alumnos, masiva o personalizada | Secretaria |

**Gestión de Personal**

| # | Caso de uso | Actor |
|---|---|---|
| 1 | Registrar asistencia de profesor en su turno | Secretaria / Encargado |
| 2 | Consultar asistencia de profesores: cronograma e historial de la sede | Encargado |
| 3 | Confirmar o modificar asistencia de profesor | Encargado |
| 4 | Registrar novedad interna: ausencia, incidente o cambio de turno | Encargado / Secretaria |
| 5 | Consultar historial de novedades de la sede | Encargado / Administrador |
| 6 | Consultar horas trabajadas: clases, duración y totales | Profesor |
| 7 | Notificar cambio de horario o reemplazo | Sistema |
| 8 | Confirmar o rechazar reemplazo | Profesor |
| 9 | Registrar observaciones de jornada, visibles para el encargado | Profesor |
| 10 | Detectar diferencias entre horas registradas y cronograma | Sistema |

## Reglas de negocio clave

- **Sedes:** son un **dato** y nunca se escriben a mano, para poder sumar sedes sin rediseñar. Los alumnos pueden ir a cualquier sede.
- **Planes:** cada plan habilita ciertas actividades. Por eso la asistencia se toma **por clase**.
- **Cobro:**
  - Si el alumno se inscribe a mitad de mes, se le cobra la parte proporcional.
  - La cuota **vence el día 5**.
  - **No hay intereses ni recargos por mora.**
  - Con **15 días de atraso desde el vencimiento** el alumno queda bloqueado y no puede ingresar.
  - Ese umbral es una constante configurable y no se repite en el código.
- **Medios de pago:** efectivo, tarjeta de débito, transferencia y QR. El recibo digital muestra fecha, monto y método.
- **Promociones:** se aplica **una por cobro** (no se acumulan). Cada una tiene vigencia y condiciones, y la configuración es del módulo de Finanzas (otro grupo).
- **Acceso:** se puede entrar si la cuota no está bloqueada, no hay restricción manual y, si es una clase, está incluida en el plan (`domain/access.ts`).
- **Inscripción:**
  - Datos de contacto, peso, estatura, antecedentes de salud y DDJJ.
  - Se pueden adjuntar certificados.
  - Un menor necesita la autorización firmada de un adulto responsable.
  - Se valida que el alumno no esté duplicado.
- **Personal:**
  - Todos son profesores, empleados o contratados. Hay un profesor por turno y sede que controla a los contratados.
  - Se manejan reemplazos y se comparan las horas registradas con el cronograma.
- **Bajas:** son **lógicas**. El alumno queda inactivo y conserva su historial. Las hace solo el Administrador, con confirmación.
- **Registro de actividad:** las operaciones importantes (pagos, asistencias, modificaciones) registran quién, qué y cuándo, aunque sea en un log mock.
- **Wi-Fi inestable:** se muestra el estado de conexión y nunca se pierde lo que el usuario ya cargó en un formulario.

## Datos, reglas y estado

- **Mocks:** todo vive en `client/data/`, con las entidades relacionadas por `id`.
  - Catálogos fijos: sedes, actividades, planes (con las actividades que habilitan), profesores y cronograma semanal.
  - Datos que cambian: alumnos, pagos, asistencias de alumnos y profesores, reemplazos, novedades y observaciones.
- **Fechas relativas a "hoy":** los mocks usan `data/seed.ts`, así la demo siempre muestra alumnos al día, por vencer, deudores y bloqueados. Para fijar el día de la presentación, se completa `DEMO_TODAY` en `data/rules.ts`.
- **Reglas configurables** en `data/rules.ts`: vencimiento el día 5, 5 días para pagar el alta y bloqueo a los 15 días de atraso. No se repiten esos números en el código.
- **Reglas de negocio** en `client/domain/`, como funciones puras con tests:
  - `billing.ts`: estado de cuenta, prorrateo y vencimientos.
  - `access.ts`: habilitación.
  - `schedule.ts`: semana con reemplazos.
  - `hours.ts`: horas contra cronograma.
  - `permissions.ts`: rol → ruta.
- **El estado de cuenta nunca se guarda:** se calcula desde los pagos (`selectAccount`).
- **Store central en memoria** (`client/store/`):
  - Las pantallas leen con `useAppState()` y modifican con `useStoreActions()`: `registerPayment`, `registerClient`, `deactivateClient`, `respondReplacement`, `addNovedad`, etc.
  - Los cálculos se hacen con los selectores de `selectors.ts`.
  - **Nunca** se copian los mocks a un `useState` local: así los flujos quedan conectados.
  - No se guarda nada entre recargas: recargar reinicia la demo.
- **Registro de actividad:** cada acción del store agrega a `state.activity` quién, qué y cuándo. Para mostrar quién registró algo se usa `getUserName(userId)`.
  - Los textos están en `store/activityText.ts`. La semilla arma la historia inicial con esos mismos textos (inscripciones, documentos, pagos), así cada ficha tiene su historial.

## Reglas de trabajo

1. Se trabaja **por etapas chicas**, con **un commit por etapa** y mensajes claros en español.
2. Después de cada etapa se corren `npm run typecheck`, `npm test` y `npm run build`, y se verifica que nada se rompió.
3. No se agrega backend ni dependencias pesadas sin consultar. Tampoco se borran archivos sin avisar.
4. No se cambia lo que ya cumple un caso de uso. Si algo es ambiguo, se pregunta.
5. Si el código contradice un CU o una regla de negocio, **se marca** y no se decide por cuenta propia.
6. No se tocan los módulos de otros grupos: la landing (`pages/Index.tsx`), el dashboard, finanzas y kiosco de `pages/AdminPanel.tsx`, y el servidor y deploy de la plantilla.
7. La prioridad es que todo funcione y se vea prolijo para la presentación.
8. Los cambios se explican en español simple y breve, como para defenderlos oralmente ante el profesor.
9. Al final de cada sesión de trabajo se actualiza MEMORY.md.

`.agents/rules/frontend.md` replica las reglas de frontend para otras herramientas. Si hay diferencias, manda este archivo.
