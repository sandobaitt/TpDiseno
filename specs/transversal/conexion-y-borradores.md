# Wi-Fi inestable: aviso de conexión y borradores

| Módulo | CU | Actores | Etapas | Estado |
|---|---|---|---|---|
| Transversal | Regla de negocio "Wi-Fi inestable" | Todos los roles | E1, E13, E16 | ✅ Verificado (02/10/2026) |

## Qué hace

- **Aviso discreto** cuando se corta la conexión: "Sin conexión. Podés seguir: lo que cargues queda guardado en este equipo". Cuando vuelve: "Volvió la conexión".
- **Borradores** en todos los formularios largos: inscripción, DDJJ (también en el diálogo), novedad, observación y comunicación. Al volver avisa "Recuperamos…" y sobrevive a una recarga.
- La inscripción pide confirmación antes de cerrar si hay datos cargados.
- **Íconos y fuentes en el repo:** la app se ve completa aunque no haya internet.

## Dónde está

| Parte | Ubicación |
|---|---|
| Estado de conexión | `client/hooks/use-online-status.ts`, `client/components/common/ConnectionStatus.tsx` (montado en `DashboardLayout`) |
| Borradores | `client/hooks/use-draft.ts` (`useDraft` para pantallas, `dialogDraft` para diálogos) |
| Íconos y fuentes | `public/vendor/tabler-icons/`, `public/fonts/`, `index.html` |

## Cómo se verificó

- **Navegador:** se cortó la red con la app abierta (aviso y vuelta); borradores recuperados después de recargar en inscripción, DDJJ, novedad, observación y comunicación; con internet bloqueado, todas nuestras pantallas muestran íconos y fuentes.
