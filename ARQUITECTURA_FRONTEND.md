# Guía de Arquitectura Frontend y Convenciones

Este documento establece las convenciones y la estructura de carpetas a seguir en el proyecto React para mantener el código limpio, escalable y fácil de mantener.

---

## 📂 Estructura de Carpetas

Todo el código del frontend vive dentro de la carpeta `client/`. Esta es la organización principal que debemos seguir:

```text
client/
├── App.tsx                 # Configuración principal, Providers y Enrutador (Router)
├── global.css              # Estilos globales y tokens de TailwindCSS
├── pages/                  # Vistas principales correspondientes a rutas
│   ├── Index.tsx           
│   ├── Login.tsx           
│   └── Secretaria.tsx      
├── components/             # Todos los componentes de React
│   ├── ui/                 # -> SÓLO componentes PRIMITIVOS y reutilizables (Botones, Inputs, etc.)
│   └── [nombre-feature]/   # -> Componentes ESPECÍFICOS de una sección o módulo
│       ├── GymDashboard.tsx
│       └── MembersTable.tsx
├── hooks/                  # Custom Hooks genéricos (ej. useAuth, useWindowSize)
└── lib/                    # Funciones utilitarias (ej. utils.ts, formateadores de fecha)
```

### Reglas de Oro para Componentes
1. **Nunca** pongas componentes con lógica de negocio (ej. `MembersTable.tsx` que carga datos de socios) dentro de `components/ui/`.
2. **La carpeta `ui/` es "tonta"**: Los componentes ahí adentro solo reciben `props` y emiten eventos, no saben de qué se trata la aplicación.
3. Si una pantalla necesita varios componentes, crea una carpeta para esa pantalla dentro de `components/` (ej. `components/admin/` o `components/secretaria/`).

---

## 📝 Convenciones de Nombres

Es crucial mantener la consistencia en el nombrado de archivos para que sea fácil navegar por el proyecto:

*   **Componentes de React (`.tsx`)**: Usa `PascalCase` (cada palabra empieza con mayúscula).
    *   ✅ CORRECTO: `MiComponente.tsx`, `LoginForm.tsx`, `Secretaria.tsx`
    *   ❌ INCORRECTO: `miComponente.tsx`, `login-form.tsx`, `secretaria.tsx`
*   **Funciones / Hooks / Utilidades (`.ts`)**: Usa `camelCase` o `kebab-case`.
    *   ✅ CORRECTO: `useAuth.ts`, `formatDate.ts`
*   **Archivos CSS**: Usa `kebab-case`.
    *   ✅ CORRECTO: `global.css`, `theme-styles.css`

---

## 🚀 Paso a Paso: Cómo Crear una Nueva Pantalla

Si te piden crear una nueva sección, por ejemplo, un **"Panel de Entrenadores"**, sigue estos pasos:

### 1. Crea la Página Principal (Ruta)
Crea el archivo que representará la URL en el navegador.
*   **Archivo**: `client/pages/Entrenadores.tsx`
*   **Contenido**: Debería ser un archivo "delgado", que solo importa el layout principal de la sección.
```tsx
import EntrenadorDashboard from "../components/entrenadores/EntrenadorDashboard";

export default function Entrenadores() {
  return <EntrenadorDashboard />;
}
```

### 2. Crea los Componentes de la Sección
Si el panel tiene muchas partes (gráficos, listas, un sidebar propio), agrúpalos en una carpeta nueva en `components/`.
*   **Directorio**: `client/components/entrenadores/`
*   **Archivos**: 
    *   `EntrenadorDashboard.tsx` (El contenedor general)
    *   `RutinasList.tsx`
    *   `AlumnosActivos.tsx`

*Nota: Si necesitas un botón, impórtalo desde `../ui/button.tsx`, no crees un botón nuevo en tu carpeta.*

### 3. Conecta la Ruta en `App.tsx`
Abre `client/App.tsx` y agrega tu nueva página al router.

```tsx
// 1. Importas la página (NO el dashboard, sino la página de "pages/")
import Entrenadores from "./pages/Entrenadores";

// ... dentro del componente App ...
<Routes>
  {/* Rutas existentes */}
  <Route path="/" element={<Index />} />
  <Route path="/secretaria" element={<Secretaria />} />
  
  {/* 2. Agregas la nueva ruta */}
  <Route path="/entrenadores" element={<Entrenadores />} />
  
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 🎨 Recomendaciones de Diseño
Como se especifica en las bases del proyecto, SQUATGYM requiere un diseño Premium:
*   Usa siempre clases de TailwindCSS.
*   No uses estilos en línea (`style={{ color: 'red' }}`).
*   Si necesitas nuevos colores corporativos, agrégalos a `tailwind.config.ts` o al archivo `global.css` como variables CSS, en lugar de usar colores hexadecimales sueltos por todo el código.

---

## 📊 Tabla Reutilizable (`DataTable`)

Para listados con **cantidad de columnas variable** (por módulo) usamos `DataTable`, un componente genérico basado en **CSS Grid**.

### ¿Dónde está?

- **Componente**: `client/components/common/DataTable.tsx`
- **Uso de referencia**: `client/components/secretaria/MembersTable.tsx`

### Concepto

`DataTable` renderiza:

- Un **header** con los títulos de columnas.
- Un listado de **filas**, donde cada fila se arma recorriendo el mismo array de columnas.

La cantidad/ancho de columnas se controla con una clase Tailwind en `gridTemplateClass`, por ejemplo:

- `grid-cols-[minmax(160px,_1fr)_90px_90px_120px_120px_60px]`

### API de columnas

Cada columna se define así:

```ts
interface DataTableColumn<T> {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => React.ReactNode;
}
```

- **`key`**: identificador de la columna. Si no se define `render`, se usa como acceso directo `(row as any)[key]`.
- **`header`**: texto del encabezado.
- **`render(row)`**: permite celdas complejas (chips de estado, avatar, acciones, etc.).

### Props principales

```ts
<DataTable<T>
  columns={columns}
  data={data}
  gridTemplateClass="..."
  getRowKey={(row) => row.id}
/>
```

- **`columns`**: definición de columnas (orden = orden visual).
- **`data`**: array de filas.
- **`gridTemplateClass`**: define el template de columnas (cantidad/ancho).
- **`getRowKey`**: clave única por fila (recomendado).
- **`minWidthClass` (opcional)**: ancho mínimo para habilitar scroll horizontal en pantallas chicas.

### Responsive: sin scroll en desktop, scroll en mobile (si hace falta)

Por defecto `DataTable` usa:

- `min-w-[770px] md:min-w-0`

Eso significa:

- **< md**: mantiene un ancho mínimo y permite **scroll horizontal** si no entra.
- **≥ md**: no fuerza `min-width`, entonces la tabla intenta **entrar en una sola pantalla**.

Si un módulo requiere otro comportamiento, pasá tu propio `minWidthClass`.

### Recomendación para la primera columna (Nombre)

Si una celda tiene contenido largo (nombre + email), agregá:

- `min-w-0` al contenedor
- `truncate` a los textos

Ejemplo típico en la columna `Nombre`:

```tsx
render: (row) => (
  <div className="flex items-center gap-2.5 min-w-0">
    <div className="w-9 h-9 rounded-full flex-shrink-0" />
    <div className="flex flex-col min-w-0">
      <h3 className="truncate">Nombre Apellido</h3>
      <p className="truncate">email@dominio.com</p>
    </div>
  </div>
)
```

