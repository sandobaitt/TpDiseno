# CLAUDE.md — tpi2/ (segunda entrega de DSI)

Estas reglas valen solo para esta carpeta. Las reglas del front-end del `CLAUDE.md` raíz (Tailwind, componentes, store, etc.) **no aplican acá**. Sí aplican los casos de uso, los roles y las reglas de negocio del `CLAUDE.md` raíz.

## Fuente de verdad (en este orden)

1. La consigna: `consigna/TPI 2 - Consigna-2026.pdf`.
2. El apunte de cátedra: `apunte.md`. Si algo lo contradice, gana el apunte.
3. Las skills de la cátedra en `.claude/skills/`:
   - `dsi-casos-de-uso`
   - `dsi-descripcion-cu`
   - `dsi-clases`
   - `dsi-tarjetas-crc`
   - `dsi-secuencia`

   **Cargá la skill del artefacto antes de crearlo o modificarlo.**
4. El escenario (`docs/Escenario completo SQUATGYM.pdf`) y la tabla de CU del `CLAUDE.md` raíz.

## Qué se entrega

- **Actores asignados:** Secretaria y Profesor.
- **Alcance del diagrama de CU:** los CU de Gestión de Alumnos y Gestión de Personal.
- **CU realizado:** CU-A06 Gestionar Asistencia Diaria por Clase y Sede (incluye CU-A13).
- **Orden del PDF:**
  1. descripción (estándar, alternativos y CU incluidos o extendidos);
  2. diagrama de clases;
  3. tarjetas CRC;
  4. diagrama de secuencia.
- **Caminos alternativos:** van **todos** los casos posibles en la descripción. Hay que marcar los 2 más significativos.
- **Diagrama de secuencia:** cubre **solo el camino estándar**.
- **Arquitectura y patrones:** quedan para después.

## Reglas de trabajo

- El diseño tiene que ser coherente con el sistema ya analizado y con el prototipo:
  - vencimiento el día 5 y bloqueo con 15 días de atraso (umbral configurable);
  - sin recargos por mora;
  - bajas lógicas;
  - una promoción por cobro;
  - corrección de asistencia hasta 30 días atrás.
  
  Las `specs/` describen lo que ya hace el prototipo.
- Los nombres de los diagramas van en español (clases, métodos, atributos). El código del prototipo está en inglés, pero eso no pasa al diseño.
- Cada cambio en secuencia, clases o CRC se cierra así:
  1. `tpi2/verificar.py tpi2/02-realizacion-cu` sin observaciones;
  2. `tpi2/render.sh tpi2/` sin errores.
- El `@startuml` de cada diagrama lleva el mismo nombre que su archivo.
- No se hacen commits: los hace el usuario.
