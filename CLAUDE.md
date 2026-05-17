# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server on port 8080 (client + server, hot-reload)
pnpm build      # Production build (client + server)
pnpm typecheck  # TypeScript validation
pnpm test       # Run Vitest tests
pnpm format.fix # Auto-format with Prettier
```

## Stack

React 18 + React Router 6 SPA · TypeScript · Vite · TailwindCSS 3 · Radix UI · Express 5 (single port, integrated with Vite dev server).

Path aliases: `@/*` → `client/` · `@shared/*` → `shared/`

---

## Reglas de oro para componentes

1. `client/components/ui/` — **solo primitivos "tontos"** (Button, Input, Card…). No conocen el negocio, solo reciben props.
2. `client/components/<feature>/` — componentes con lógica de negocio. Cada módulo/sección tiene su propia carpeta (ej. `secretaria/`, `admin/`, `alumno/`).
3. Nunca crear un botón/input nuevo en una carpeta de feature: importar desde `@/components/ui/`.

---

## Cómo agregar una nueva pantalla

```
1. client/pages/MiPantalla.tsx          ← thin wrapper, solo importa el componente principal
2. client/components/<feature>/         ← carpeta con toda la lógica y sub-componentes
3. client/App.tsx                       ← registrar la ruta
```

**`client/pages/MiPantalla.tsx`** (siempre así de delgado):
```tsx
import MiDashboard from "@/components/<feature>/MiDashboard";
export default function MiPantalla() {
  return <MiDashboard />;
}
```

**`client/App.tsx`** — todas las rutas protegidas usan `RequireAuth`:
```tsx
import MiPantalla from "./pages/MiPantalla";
// ...
<Route path="/mi-ruta" element={<RequireAuth><MiPantalla /></RequireAuth>} />
```

Los archivos `.tsx` van en **PascalCase** siempre.

---

## Diseño (Premium)

- **Solo clases TailwindCSS** — prohibido `style={{ }}`.
- Colores nuevos: agregarlos en `tailwind.config.ts` o como variables CSS en `client/global.css`. No usar hex sueltos en el código.
- Clases condicionales: usar `cn()` de `@/lib/utils`.

```ts
import { cn } from "@/lib/utils";
className={cn("base", { "conditional": condition }, props.className)}
```

---

## DashboardLayout

Todas las pantallas autenticadas usan `DashboardLayout` (`client/components/common/DashboardLayout.tsx`). Lee el rol de la sesión, resuelve los nav items desde `client/data/navigation.ts` y renderiza sidebar + header automáticamente.

```tsx
import { DashboardLayout } from "@/components/common/DashboardLayout";

export default function MiDashboard() {
  return (
    <DashboardLayout headerNav="Mi Sección" headerTitle="SQUATGYM">
      {/* contenido */}
    </DashboardLayout>
  );
}
```

Icons: Tabler Icons webfont, cargado dentro de `DashboardLayout`. Usar `className="ti ti-<nombre>"`.

---

## DataTable

Componente genérico basado en CSS Grid para cualquier listado. Referencia: `client/components/secretaria/MembersTable.tsx`.

```tsx
import { DataTable } from "@/components/common/DataTable";

const columns = [
  { key: "name", header: "Nombre", render: (row) => <span>{row.name}</span> },
  { key: "status", header: "Estado" }, // sin render → usa row["status"] directamente
];

<DataTable
  columns={columns}
  data={data}
  gridTemplateClass="grid-cols-[minmax(160px,_1fr)_120px_60px]"
  getRowKey={(row) => row.id}
/>
```

- `gridTemplateClass` controla cantidad y ancho de columnas.
- Para celdas largas (nombre + email): `min-w-0` en el contenedor, `truncate` en los textos.

---

## SidebarNav

`client/components/common/SidebarNav.tsx` — driven entirely by props. Los items por rol están en `client/data/navigation.ts`.

```ts
// SidebarNavItem
{ id: "members", label: "Socios", iconClassName: "ti ti-users", to: "/secretaria" }
// to     → NavLink interno (marca activo automáticamente)
// href   → link externo
// onClick → acción custom (logout, modal…)
// disabled: true → mostrar deshabilitado
```

Para agregar un item a un rol: editar `client/data/navigation.ts`.

---

## Auth (mock)

- Sesión en `localStorage`. Helpers en `client/data/users.ts`: `getMockSession()`, `saveMockSession()`, `clearMockSession()`.
- Roles: `admin` · `alumno` · `profesor` · `secretario`.
- Redirección post-login: `getPostLoginPath(role)` en `client/data/users.ts`.

---

## Mock data

Todo en `client/data/`. Importar por archivo o desde el barrel:

```ts
import { clientsMock, plansMock, paymentsMock } from "@/data";
```

Entidades: `clients`, `plans`, `branches`, `employees`, `payments`, `checkins`, `teachers`, `schedule`, `novedades`, `replacements`.

Relaciones por `id` (ej. `client.membership.planId` → `plans.ts`).

---

## API Express

Crear endpoints **solo cuando la lógica debe vivir en el servidor** (claves privadas, operaciones de DB sensibles). En el resto de casos, usar los mocks del cliente directamente.

Estructura: handler en `server/routes/mi-ruta.ts` → registrar en `server/index.ts` con prefijo `/api/`.
