# Guion breve para la defensa

Tiempo estimado: **10 a 12 minutos**, más preguntas. Antes de empezar: `npm run dev`, abrir http://localhost:3000 y tener a mano los usuarios del README. Si conviene fijar el día de la demo, se completa `DEMO_TODAY` en `client/data/rules.ts`.

## 1. Qué hicimos (1 minuto)

- Prototipo navegable de **Gestión de Alumnos** (14 CU) y **Gestión de Personal** (10 CU) de SquatGym.
- Funciona en PC y celular, con datos simulados y **sin backend**.
- **Partimos de un diagnóstico:** 0 de 24 CU completos, sin control de roles y con flujos cortados (cobrar no registraba nada).
- **Hoy:** los 24 CU funcionan de punta a punta y los flujos están conectados.

## 2. Cómo está armado (2 minutos)

- **Un solo "store" en memoria:** todas las pantallas leen y escriben los mismos datos. Por eso, si cobrás en una pantalla, el alumno aparece habilitado en todas. Recargar reinicia la demo.
- **Reglas de negocio en un solo lugar** (`client/domain/`), como funciones con tests:
  - estado de cuenta: vence el día 5, bloquea a los 15 días de atraso y no hay intereses;
  - prorrateo, habilitación, promociones, inscripción, asistencia, horas y permisos.
- **El estado de cuenta nunca se guarda:** se calcula desde los pagos, así nunca queda desactualizado.
- **Permisos por rol:** cada rol entra solo a sus pantallas. Dentro de la ficha, cada rol hace solo lo suyo (por ejemplo, dar de baja es solo del admin).
- **Registro de actividad:** cada operación guarda quién, qué y cuándo. Se ve en el historial de cada ficha.
- **Calidad:** 161 tests de las reglas de negocio (Vitest). Además, cada flujo se probó en el navegador, en PC y en celular.

## 3. Recorrido (6 minutos)

Un flujo por rol. Entre uno y otro se cierra la sesión **sin recargar**, así se ve que los datos quedan conectados.

1. **Secretaria** (`secre1`):
   - Inscribe a un alumno en 5 pasos. Mostrar que avisa si el DNI está repetido y que pide adulto responsable si es menor.
   - Con "Registrar e ir a cobrar" abre la ficha con el cobro listo. Elige efectivo, aplica "Pago en efectivo" (10 %), cobra y emite el recibo. Si cambia a QR, la promo explica por qué ya no aplica.
   - En "Control de acceso" escribe el DNI de Laura (38123456): sale "Bloqueado por deuda". La cobra y en el momento sale "Habilitado".
2. **Profesor** (`profe1`):
   - Toma asistencia de su clase. Mostrar que un bloqueado no se puede marcar presente.
   - Rechaza un reemplazo, con confirmación.
   - Revisa "Mis horas": diferencias con el cronograma.
3. **Encargado** (`encargado2`, sede Norte):
   - En la campana le llegó el reemplazo rechazado.
   - En Asistencia docente confirma los turnos registrados y corrige uno con motivo.
   - Abre "Inscripciones de mi sede".
4. **Alumno** (`alumno1`):
   - Ve su cuenta y su asistencia (exporta a CSV) y su plan con las clases que incluye.
   - Completa la declaración jurada y sube el certificado: secretaría recibe el aviso.
5. **Admin** (`admin1`): da de baja a un alumno con motivo y lo reactiva. Los meses de baja no se cobran.

## 4. Decisiones que conviene explicar (2 minutos)

- **Store en memoria y no una base de datos:** el foco del TP es la navegación y los CU. Sin backend, recargar vuelve a la demo inicial.
- **Mora:** se tomó 15 días desde el vencimiento (el escenario dice "15 a 20"). Es una constante configurable.
- **Bajas lógicas:** nunca se borra un alumno ni una novedad; se marcan con motivo y se conserva el historial.
- **Alertas no intrusivas:** campana con contador, sin ventanas que corten el trabajo.
- **Wi-Fi inestable:** aviso de conexión y borradores en todos los formularios largos.
- **Accesibilidad:**
  - contraste AA y foco visible;
  - estados con texto e ícono, no solo con color;
  - todo usable con teclado;
  - en el celular, las tablas pasan a tarjetas.

## 5. Límites y qué seguiría (1 minuto)

- Persistencia real (backend y base de datos), envío real de emails y subida real de archivos.
- Para coordinar con otros grupos:
  - que la configuración de promociones (Finanzas) use la misma lista que el cobro;
  - que el panel del admin muestre las ausencias.
- Para confirmar con el profesor o el grupo: si las promociones se acumulan y cómo cobrar una reactivación.
