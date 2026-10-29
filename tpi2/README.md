# TPI 2: Diseño de Sistemas de Información

Segunda entrega del TPI de **Diseño de Sistemas de Información** (UTN FRRe, 2026), sobre el sistema SquatGym. La consigna está en [`consigna/`](consigna/).

| Dato | Valor |
|---|---|
| Actores asignados | **Secretaria y Profesor** |
| Grupo | *(completar con el nombre del grupo en la consigna)* |
| Alcance del diagrama de CU | Los CU de Secretaria y Profesor del diagrama del grupo (hecho en draw.io y pasado a PlantUML) |
| CU realizado | **Registrar Pagos** (incluye Emitir Recibos; lo extiende Aplicar Promociones). Descripción escrita por el grupo |
| Entrega | 04/11/2026, PDF en el Campus Virtual. Coloquios: 25/11 y 02/12 |

## Estado

| Punto de la consigna | Archivo | Estado |
|---|---|---|
| 1. Diagrama de CU | [`01-casos-de-uso/casos_de_uso_secretaria_profesor.puml`](01-casos-de-uso/casos_de_uso_secretaria_profesor.puml) (+ `.svg`) | ✅ Hecho |
| 2.i Descripción (estándar, alternativos, include y extend) | [`02-realizacion-cu/1_descripcion_cu_registrar_pagos.md`](02-realizacion-cu/1_descripcion_cu_registrar_pagos.md) | ✅ Hecho |
| 2.ii Diagrama de clases | [`02-realizacion-cu/2_clases_registrar_pagos.puml`](02-realizacion-cu/2_clases_registrar_pagos.puml) (+ `.svg`) | ✅ Hecho |
| 2.iii Tarjetas CRC (las 14 clases) | [`02-realizacion-cu/3_tarjetas_crc_registrar_pagos.md`](02-realizacion-cu/3_tarjetas_crc_registrar_pagos.md) y, para draw.io, [`3_tarjetas_crc_registrar_pagos.drawio`](02-realizacion-cu/3_tarjetas_crc_registrar_pagos.drawio) | ✅ Hecho |
| 2.iv Diagrama de secuencia (camino estándar) | [`02-realizacion-cu/4_secuencia_registrar_pagos.puml`](02-realizacion-cu/4_secuencia_registrar_pagos.puml) (+ `.svg`). Referencia con `ref` al include y al extend | ✅ Hecho |
| 2.iv Secuencia del CU incluido: Emitir Recibos | [`02-realizacion-cu/4b_secuencia_emitir_recibos.puml`](02-realizacion-cu/4b_secuencia_emitir_recibos.puml) (+ `.svg`) | ✅ Hecho |
| 2.iv Secuencia del CU que extiende: Aplicar Promociones | [`02-realizacion-cu/4c_secuencia_aplicar_promociones.puml`](02-realizacion-cu/4c_secuencia_aplicar_promociones.puml) (+ `.svg`) | ✅ Hecho |
| 3. Arquitectura (tipo y 2 vistas) | [`03-arquitectura/`](03-arquitectura/) | ⏳ Para después |
| 4. Patrón aplicado al CU | [`04-patrones/`](04-patrones/) | ⏳ Para después |
| PDF final | [`entrega/`](entrega/) | ⏳ Al terminar |

El PDF respeta el orden de la consigna: descripción, diagrama de clases, tarjetas CRC y diagrama de secuencia. Los archivos de `02-realizacion-cu/` están numerados en ese orden.

## Estado del CU

La realización de Registrar Pagos está completa, con su include (Emitir Recibos) y su extend (Aplicar Promociones): descripción de los tres, un diagrama de clases (14 clases), 14 tarjetas CRC y tres diagramas de secuencia. En la secuencia de Registrar Pagos, el include y el extend se muestran con un `ref` que apunta a su propio diagrama. `verificar.py` confirma que cada mensaje de la secuencia existe en el diagrama de clases y en su tarjeta.

## Cómo se trabaja

Los comandos se corren desde la raíz del repo:

```bash
tpi2/render.sh tpi2/                         # genera el .svg de todos los .puml (el .svg queda al lado)
tpi2/render.sh -w tpi2/                      # modo observador: regenera al guardar
tpi2/verificar.py tpi2/02-realizacion-cu     # coherencia secuencia ↔ clases ↔ CRC
tpi2/crc_a_drawio.py                         # pasa las tarjetas CRC del .md a un .drawio
```

- **Requisitos:** Java y `~/.local/share/plantuml/plantuml.jar` (lo usa `bin/plantuml`) para renderizar, y Python 3 para verificar.
- **Skills:** las pautas de la cátedra están en `.claude/skills/dsi-*`: casos de uso, descripción, clases, CRC y secuencia. Claude Code las usa al resolver cada artefacto.
- **Fuente de verdad:** [`apunte.md`](apunte.md), el apunte de cátedra actualizado (octubre 2026; el PDF con las imágenes es [`apunte.pdf`](apunte.pdf)). Si una skill lo contradice, gana el apunte.
- **Nombres de archivo:** `verificar.py` reconoce los archivos por su nombre (`secuencia`, `clases`, `crc`). El `@startuml` de cada diagrama lleva el mismo nombre que el archivo, para que el `.svg` quede con el mismo prefijo.

Las skills, `render.sh`, `verificar.py` y `bin/plantuml` se copiaron de `~/Documents/dsi-2026` el 02/10/2026. Si se mejoran allá, hay que volver a copiarlos acá. En las skills, las rutas se ajustaron a `tpi2/`. El 28/10/2026 se actualizaron con el apunte nuevo (notación `LL[c]`/`LLT[...]`) y `verificar.py` acepta la notación nueva y la anterior; esos cambios **no** están en `dsi-2026`.
