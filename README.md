# SquatGym: prototipo front-end

Este es el TP Integrador de **Análisis de Sistemas de Información** (UTN FRRe, K2.4).

Es un prototipo navegable de los módulos **Gestión de Alumnos** (14 casos de uso) y **Gestión de Personal** (10 casos de uso) para SquatGym, una cadena de gimnasios con 2 sedes. Se puede usar en PC, notebook y celular.

Funciona solo en el navegador: no tiene backend y todos los datos son simulados. Mientras se usa, los datos quedan en memoria; **al recargar la página, la demo vuelve a empezar**. Lo que se escribe en los formularios largos sí se guarda como borrador.

## Cómo correrlo

Necesitás Node 20.19 o más nuevo (lo pide Vite).

```bash
npm install
npm run dev
```

Después abrí http://localhost:3000.

| Comando | Para qué |
|---|---|
| `npm run build` | Arma la versión de producción. |
| `npm test` | Corre los tests de las reglas de negocio (Vitest). |
| `npm run typecheck` | Revisa los tipos. |
| `npm run lint` | Busca errores comunes en el código (ESLint). |
| `npm run specs` | Controla que las specs de `specs/` coincidan con el código. |
| `npm run format.fix` | Da formato al código (Prettier). |

## Usuarios de prueba

| Rol | Usuario | Contraseña | Qué mirar |
|---|---|---|---|
| Administrador | admin1@squatgym.com | admin123 | Alumnos (alta, baja con motivo, reactivación), asistencia de todas las sedes y observaciones. |
| Encargado, sede Centro | encargado1@squatgym.com | encargado123 | Asistencia docente (confirmar o corregir), novedades, observaciones e inscripciones de la sede. |
| Encargado, sede Norte | encargado2@squatgym.com | encargado123 | Lo mismo para Norte. Ahí llegan los reemplazos rechazados de la demo. |
| Secretaría, sede Centro | secre1@squatgym.com | secre123 | Inscripción, ficha, cobros, control de acceso, asistencia y comunicaciones. |
| Secretaría, sede Norte | secre2@squatgym.com | secre123 | Lo mismo para Norte. |
| Profesor | profe1@squatgym.com | profe123 | Asistencia de sus clases, reemplazos pendientes, cronograma y horas. |
| Profesora | profe2@squatgym.com | profe123 | Otra agenda; recibe avisos de novedades. |
| Alumno al día | alumno1@email.com | alumno123 | Mi cuenta, asistencia, plan y cronograma, DDJJ y certificado. |
| Alumna bloqueada | alumno2@email.com | alumno123 | Avisos de deuda y pago online. |

Si hacés triple clic en el botón **Ingresar**, aparece un acceso rápido por rol.

Para cambiar de rol sin perder lo que hiciste, cerrá sesión desde el menú (no recargues la página).

## Documentación

| Archivo | Qué tiene |
|---|---|
| [`docs/COBERTURA_CU.md`](docs/COBERTURA_CU.md) | Cómo se cumple cada caso de uso y en qué pantalla. |
| [`docs/GUION_DEFENSA.md`](docs/GUION_DEFENSA.md) | Recorrido sugerido para la presentación. |
| [`specs/`](specs/README.md) | Una spec por funcionalidad: qué hace, dónde está en el código y cómo se verificó. |
| [`docs/DIAGNOSTICO.md`](docs/DIAGNOSTICO.md) | Diagnóstico inicial del proyecto. |
| [`docs/PLAN.md`](docs/PLAN.md) | Plan de trabajo por etapas. |
| [`CLAUDE.md`](CLAUDE.md) | Convenciones, roles, casos de uso y reglas de trabajo. |
| [`MEMORY.md`](MEMORY.md) | Decisiones tomadas, estado y pendientes. |
