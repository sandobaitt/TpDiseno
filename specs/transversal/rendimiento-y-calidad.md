# Rendimiento y calidad del código

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Transversal | — | — | E14, E16, E17 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Carga por pantalla:** cada pantalla se descarga recién cuando se abre (`React.lazy`), con "Cargando…" mientras tanto. El archivo inicial bajó de 736 KB a 520 KB.
- **Sin dependencias de más:** se quitaron librerías que no se usaban (`three`, `@react-three/*`, `@tanstack/react-query`).
- **Sin CDN:** íconos y fuentes se sirven desde el repo.
- **ESLint** (`npm run lint`): revisa errores comunes (variables sin usar, hooks mal usados, `any`, `console.log`). Es solo para desarrollo, no entra en la app.
- **Tests de las reglas de negocio** con Vitest: 161 tests en 16 archivos.

## Dónde está

| Parte | Ubicación |
|---|---|
| Carga diferida | `client/App.tsx`, `client/components/common/PageLoading.tsx`, `client/components/common/DashboardLayout.tsx` |
| ESLint | `eslint.config.js` |
| Tests | `client/domain/*.spec.ts`, `client/store/reducer.spec.ts`, `client/data/data.spec.ts`, `client/lib/*.spec.ts` |
| Scripts | `package.json` (`typecheck`, `lint`, `test`, `build`) |

## Cómo se verificó

- `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` pasan en cada commit.
- Regresión completa en el navegador (94 pruebas en PC y celular) el 02/10/2026, después de la carga diferida.
