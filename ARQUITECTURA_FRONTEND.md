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
