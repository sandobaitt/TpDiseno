# Datos compartidos (store) y registro de actividad

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Transversal | Todos | Todos los roles | E4 (y cada etapa siguiente) | ✅ Verificado (02/10/2026) |

## Qué hace

- **Un solo store en memoria** (React Context + `useReducer`, sin librerías). Todas las pantallas leen y escriben los mismos datos, por eso los flujos quedan conectados:
  - inscribir → cobrar → el alumno pasa a "Al día" y queda habilitado;
  - una baja del admin se ve en secretaría;
  - aceptar un reemplazo cambia el cronograma y las horas;
  - lo que sube el alumno le llega a secretaría.
- **Registro de actividad:** cada acción guarda **quién, qué y cuándo** (pagos, asistencias, modificaciones, bajas, restricciones, documentos, novedades). Se ve en el historial de cada ficha ("Cobrado por…", "Modificado por…").
- La semilla arma una historia inicial con los mismos textos, así cada ficha ya tiene historial.

## Reglas

- **No se guarda nada entre recargas:** recargar la página reinicia la demo. Para cambiar de rol sin perder lo hecho, se cierra sesión desde el menú.
- Las pantallas **nunca** copian los datos a un estado local: leen con `useAppState()` y modifican con `useStoreActions()`.
- Los cálculos (estado de cuenta, habilitación) se hacen con selectores, no se guardan.

## Dónde está

| Parte | Ubicación |
|---|---|
| Estado inicial | `client/store/state.ts` |
| Acciones | `client/store/actions.ts`, `client/store/reducer.ts` |
| Hooks | `client/store/StoreProvider.tsx` (`useAppState`, `useStoreActions`) |
| Selectores | `client/store/selectors.ts` (`selectAccount`, `selectAccess`, `selectClientPayments`, `selectLastAccess`, `selectClientAttendance`) |
| Textos del registro | `client/store/activityText.ts` |
| Historial en la ficha | `client/components/alumnos/profile/HistorySection.tsx` |

## Cómo se verificó

- **Tests:** `client/store/reducer.spec.ts` ("flujo conectado: pago → estado de cuenta → habilitación", "otras acciones del store").
- **Navegador:** los flujos entre roles se probaron cerrando sesión sin recargar (alumno → secretaría, secretaría → alumno, secretaría → encargado, encargado → profesor, profesor → encargado).
