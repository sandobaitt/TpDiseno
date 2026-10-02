# SquatGym: prototipo front-end

Este es el TP Integrador de **Análisis de Sistemas de Información** (UTN FRRe, K2.4).

Es un prototipo navegable de los módulos **Gestión de Alumnos** y **Gestión de Personal** para SquatGym, una cadena de gimnasios con 2 sedes. Funciona solo en el navegador: no tiene backend real y todos los datos son simulados.

## Cómo correrlo

Necesitás Node 20 o más nuevo.

```bash
npm install
npm run dev
```

Después abrí http://localhost:3000.

Otros comandos útiles:

| Comando | Para qué |
|---|---|
| `npm run build` | Arma la versión de producción. |
| `npm test` | Corre los tests. |
| `npm run typecheck` | Revisa los tipos. |

## Usuarios de prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | admin1@squatgym.com | admin123 |
| Secretaria | secre1@squatgym.com | secre123 |
| Profesor | profe1@squatgym.com | profe123 |
| Alumno | alumno1@email.com | alumno123 |

Si hacés triple clic en el botón **Ingresar**, aparece un acceso rápido por rol.

## Documentación

| Archivo | Qué tiene |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Convenciones, roles, casos de uso y reglas de trabajo. |
| [`MEMORY.md`](MEMORY.md) | Decisiones tomadas y estado actual. |
| [`docs/DIAGNOSTICO.md`](docs/DIAGNOSTICO.md) | Diagnóstico del proyecto. |
| [`docs/COBERTURA_CU.md`](docs/COBERTURA_CU.md) | Cobertura de cada caso de uso. |
| [`docs/PLAN.md`](docs/PLAN.md) | Plan de trabajo por etapas. |
