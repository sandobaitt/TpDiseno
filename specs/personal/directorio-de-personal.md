# Directorio de personal (pantalla heredada, fuera de los CU)

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Gestión de Personal | Ninguno (apoyo) | Administrador | E10 | ⚪ Se mantiene como estaba |

## Qué es

- Es la pantalla "Gestión de personal" del admin que ya existía: lista del personal administrativo con buscador, filtro por rol, ficha, edición y baja con confirmación.
- En E10 se le sacaron los alumnos (ahora tienen su propio menú, CU 11).
- **No corresponde a ningún CU**, por eso no se amplió. Los cambios quedan solo en esa pantalla (no usa el store central).

## Dónde está

| Parte | Ubicación |
|---|---|
| Ruta | `/admin/personal` |
| Página | `client/pages/AdminPersonalPage.tsx` |
| Componente | `client/components/personal/StaffDirectory.tsx` |
| Datos | `client/data/employees.ts` |

## Cómo se verificó

- **Navegador:** la pantalla abre y funciona sin errores (regresión del 02/10/2026).
