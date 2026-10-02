# Diseño, accesibilidad y celular

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Transversal | Todos | Todos los roles | E1, E5, E14 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Tema oscuro con tokens:** un solo verde de marca y colores semánticos (éxito, aviso, peligro, info) con contraste AA. Sin colores sueltos ni `style={{}}` en nuestros módulos.
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
| Componentes compartidos | `client/components/common/` (`PageHeader.tsx`, `StatCard.tsx`, `StatusBadge.tsx`, `AccountStatusBadge.tsx`, `SearchInput.tsx`, `FilterSelect.tsx`, `SegmentedTabs.tsx`, `EmptyState.tsx`, `FormField.tsx`, `DataTable.tsx`, `ConfirmDialog.tsx`, `SectionCard.tsx`, `DetailList.tsx`, `FileUpload.tsx`, `WeekNavigator.tsx`) |
| Primitivos | `client/components/ui/` (Radix/shadcn, adaptados al tema oscuro) |
| Formatos | `client/lib/format.ts` (`matchesPersonSearch`, `formatARS`, `formatDni`, `capitalizeFirst`) |

## Cómo se verificó

- **Tests:** `client/lib/format.spec.ts`, `client/lib/dates.spec.ts`.
- **Navegador:** cada pantalla se revisó en PC (1366 px) y celular (390 px); recorrido con teclado de formularios y tablas; capturas sin desbordes.
