# MEMORY.md — estado del proyecto

Última actualización: **02/10/2026**, al terminar la etapa E5. Las etapas están en [`docs/PLAN.md`](docs/PLAN.md).

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
| PDF del escenario | Queda sin versionar (`docs/Escenario completo SQUATGYM.pdf`), salvo que el grupo decida subirlo. | — |

## Estado actual

- Las Fases 1 (diagnóstico) y 2 (plan) se aprobaron el 01/10/2026.
- Fase 3: **E0 a E5 terminadas**. Sigue **E6**: gestión de alumnos de secretaría (ficha unificada e inscripción completa).
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
- `components/alumnos/` y `components/personal/` todavía **no existen**. Las carpetas viejas siguen en uso: `secretaria/`, `member-detail/`, `cobros/`, `cronograma/`, `novedades/` y `globales/`.
- **Helpers disponibles:**
  - `lib/dates.ts`: `parseISODate`, `addDays`, `diffDays`, meses "AAAA-MM", formatos y `todayISO`, que respeta `DEMO_TODAY`.
  - `lib/format.ts`, `hooks/use-draft.ts`, `common/ConfirmDialog.tsx` y `common/AccountStatusBadge.tsx`.
- **Quedan con mocks viejos hasta su etapa:**
  - `data/classStudents.ts` (asistencia del profesor, E8).
  - `data/adminAttendance.ts` (asistencia del admin/encargado, E11).
  - `horasMock` dentro de `ProfesorHorasPage` (E12).

## Pendientes

- Etapas E1 a E15 de `docs/PLAN.md`.
- Consultar antes de agregar ESLint, porque suma dependencias de desarrollo.
- Coordinar con el grupo de "configuración de promociones": hoy el cobro y Admin → Finanzas usan listas distintas.

## Problemas conocidos (los más graves)

Cada uno está detallado en `docs/DIAGNOSTICO.md`, con su ID entre paréntesis.

- Radix avisa que varios diálogos no tienen título accesible. Se corrige al rehacer cada pantalla.

## Lo que no hay que romper

- El login y el acceso rápido: triple clic en "Ingresar".
- Las rutas actuales de cada rol y sus menús (`data/navigation.ts`).
- El deploy en Vercel.
- Las pantallas de otros grupos: `pages/Index.tsx` y las pestañas Información, Finanzas y Kiosco de `pages/AdminPanel.tsx`.
- `npm run typecheck`, `npm test` y `npm run build` tienen que pasar en cada commit.
