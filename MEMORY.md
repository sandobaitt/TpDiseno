# MEMORY.md — estado del proyecto

Última actualización: **01/10/2026**, al terminar la etapa E0. Las etapas están en [`docs/PLAN.md`](docs/PLAN.md).

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
- Fase 3: **E0 terminada** (documentación). Sigue **E1**: correcciones rápidas.
- Los cambios en el código todavía no empezaron, así que todo lo de `docs/DIAGNOSTICO.md` sigue vigente.
- La estructura nueva (`components/alumnos/`, `components/personal/`, `domain/`, `store/`) todavía **no existe**. Las carpetas viejas siguen en uso: `secretaria/`, `member-detail/`, `cobros/`, `cronograma/`, `novedades/` y `globales/`.
- Los helpers de fechas (`lib/dates.ts`) también se crean en E3. Hasta entonces, cuidado con `new Date("AAAA-MM-DD")`.

## Pendientes

- Etapas E1 a E15 de `docs/PLAN.md`.
- Consultar antes de agregar ESLint, porque suma dependencias de desarrollo.
- Coordinar con el grupo de "configuración de promociones": hoy el cobro y Admin → Finanzas usan listas distintas.

## Problemas conocidos (los más graves)

Cada uno está detallado en `docs/DIAGNOSTICO.md`, con su ID entre paréntesis.

- No hay control de rol en las rutas y no existe el Encargado (C1, C2).
- El cobro no registra el pago y suma un recargo con interés (C3).
- El estado de cuenta del alumno muestra pagos inventados (C4).
- Hay datos aleatorios en la asistencia de profesores (C7).
- Las fechas de solo día se muestran corridas un día (A1).

## Lo que no hay que romper

- El login y el acceso rápido: triple clic en "Ingresar".
- Las rutas actuales de cada rol y sus menús (`data/navigation.ts`).
- El deploy en Vercel.
- Las pantallas de otros grupos: `pages/Index.tsx` y las pestañas Información, Finanzas y Kiosco de `pages/AdminPanel.tsx`.
- `npm run typecheck`, `npm test` y `npm run build` tienen que pasar en cada commit.
