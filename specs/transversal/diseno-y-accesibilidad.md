# Diseño, accesibilidad y celular

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Transversal | Todos | Todos los roles | E1, E5, E14, E23 | ✅ Verificado (02/11/2026) |

## Qué hace

- **Tema claro y oscuro con tokens:** se cambia desde el menú del perfil ("Tema: Claro" / "Tema: Oscuro") y queda guardado en el navegador. Un solo verde de marca y colores semánticos (éxito, aviso, peligro, info) con contraste AA en los dos temas: en claro, el verde y los colores de estado son más oscuros para leerse sobre blanco. Los componentes usan solo tokens (`text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, etc.), sin colores fijos del tema oscuro ni `style={{}}`. El login queda siempre oscuro (usa los colores de la marca, `squat-*`). Los avisos (sonner) siguen el tema elegido.
- **Componentes compartidos** en lugar de piezas armadas a mano: encabezados, indicadores, estados, buscador, filtros, pestañas, listas vacías, campos de formulario, tablas y confirmaciones.
- **Celular primero:** las tablas pasan a tarjetas por debajo de 1024 px; botones de 40 px o más; grillas que no se desbordan.
- **Accesibilidad:**
  - cada campo tiene su label asociado y el error al lado;
  - los botones de solo ícono tienen nombre (`aria-label`);
  - el foco se ve siempre;
  - todo se puede usar con teclado (filas de tabla incluidas);
  - un estado nunca se comunica solo con color: siempre va con texto o ícono ("Deudor", "Bloqueado");
  - textos de 12 px o más (11 px solo en rótulos en mayúsculas);
  - se respeta "reducir movimiento".
- **Textos:** español con voseo, "alumno" (no socio ni cliente) y sin palabras en inglés ("Inicio", no "Dashboard").
- **Feedback:** cada acción muestra un aviso (sonner), las acciones destructivas piden confirmación y las listas vacías lo dicen claramente.

## Dónde está

| Parte | Ubicación |
|---|---|
| Tokens | `client/global.css`, `tailwind.config.ts` |
| Cambio de tema | `client/lib/theme.ts`, `client/hooks/use-theme.ts` (`useTheme`, `useAppliedTheme`), `client/components/common/HeaderNav.tsx`, `client/components/ui/sonner.tsx` |
| Componentes compartidos | `client/components/common/` (`PageHeader.tsx`, `StatCard.tsx`, `StatusBadge.tsx`, `AccountStatusBadge.tsx`, `SearchInput.tsx`, `FilterSelect.tsx`, `SegmentedTabs.tsx`, `EmptyState.tsx`, `FormField.tsx`, `DataTable.tsx`, `ConfirmDialog.tsx`, `SectionCard.tsx`, `DetailList.tsx`, `FileUpload.tsx`, `WeekNavigator.tsx`) |
| Primitivos | `client/components/ui/` (Radix/shadcn, con tokens: sirven para los dos temas) |
| Formatos | `client/lib/format.ts` (`matchesPersonSearch`, `formatARS`, `formatDni`, `capitalizeFirst`) |

## Cómo se verificó

- **Tests:** `client/lib/format.spec.ts`, `client/lib/dates.spec.ts`.
- **Navegador:** cada pantalla se revisó en PC (1366 px) y celular (390 px); recorrido con teclado de formularios y tablas; capturas sin desbordes.
- **Tema claro (02/11/2026):** capturas en claro de secretaría (alumnos, ficha, cobros, acceso), alumno (pagos, perfil y asistencia), profesor (cronograma, reemplazos), encargado (asistencia docente) y la 404; y en oscuro de la lista de alumnos para confirmar que no cambió. Contraste calculado de los tokens claros sobre blanco: verde 5,6:1, éxito 5,6:1, aviso 5,8:1, peligro 5,8:1, info 5,8:1 y texto secundario 6,0:1.
