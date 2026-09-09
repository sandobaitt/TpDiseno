---
description: React, Vite, and Tailwind best practices for SQUATGYM (UTN Frontend Focus)
---
# Frontend Guidelines (React 18 + SPA + Tailwind)

## 1. Arquitectura y Componentes
- **Framework:** Usa React 18 con Functional Components y Hooks. NUNCA uses clases.
- **Tipado:** Usa TypeScript estricto. Evita el uso de `any`. Define interfaces claras para props y datos simulados.
- **Separación de Responsabilidades:** 
  - La carpeta `client/components/ui` es estrictamente "tonta" (solo recibe props, no tiene lógica de negocio ni llamadas a Mocks).
  - Los componentes de dominio (`client/components/[feature]`) consumen la lógica de estado o los mocks.

## 2. Estilizado (Tailwind CSS)
- Usa SIEMPRE utilidades de Tailwind CSS.
- **PROHIBIDO** usar estilos en línea (ej. `style={{ color: 'red' }}`).
- Usa la utilidad `cn()` (clsx + tailwind-merge) para combinar clases dinámicas.
- Mantén consistencia visual: bordes redondeados (`rounded-xl`, `rounded-2xl`), sombras suaves (`shadow-sm`), y el esquema de colores corporativo definido en `global.css`.

## 3. Simulación y Mocks (Diseño de Sistemas UTN)
- Dado que el backend no es la prioridad, **toda funcionalidad debe ser simulada convincentemente** en el Frontend.
- Los datos deben provenir de `client/data/*.ts`. NO "hardcodees" datos directamente en el JSX si representan entidades del negocio (ej. usuarios, clases, pagos).
- **Interacciones Vivas:** Usa `toast` de Sonner para simular éxitos y errores (ej. "Pago registrado con éxito", "Asistencia marcada").
- Muestra estados de carga (`isLoading`) usando Skeletons o Spinners cuando simules operaciones asíncronas con `setTimeout`.

## 4. Accesibilidad y UX
- Usa elementos HTML semánticos (`<button>`, `<nav>`, `<main>`).
- Asegúrate de que las tablas (`DataTable`) truncan texto largo correctamente y tienen scroll horizontal en pantallas pequeñas (`min-w-0`).
- Todas las interacciones deben tener feedback visual (ej. `hover:bg-accent`, `active:scale-95`).
