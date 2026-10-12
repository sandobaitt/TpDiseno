---
name: dsi-tarjetas-crc
description: >-
  Guía y pautas obligatorias de cátedra para la elaboración de Tarjetas CRC (Clase - Responsabilidad - Colaboración)
  en Diseño de Sistemas (DSI 2026). Aplica el formato exacto de Anverso (Clase, Propósito) y Reverso
  (Responsabilidades: Hacer/Saber, Colaboración), coherencia obligatoria 1 a 1 con el Diagrama de Clases
  y foco exclusivo en el caso de uso analizado.
---

# Skill: Tarjetas CRC - Pautas de Cátedra (DSI 2026)

Esta skill establece las reglas y formato oficial de la cátedra de **Diseño de Sistemas (DSI 2026)** para confeccionar **Tarjetas CRC (Clase - Responsabilidad - Colaboración)**.

---

## 📌 Reglas de Oro de la Cátedra (Checklist de Parcial)

### 1. Coherencia Absoluta con el Diagrama de Clases
- **Correspondencia 1 a 1:** Cada clase que aparezca en el Diagrama de Clases de la Realización debe tener obligatoriamente su tarjeta CRC (incluyendo `UI`, `CTRL`, `CTRLSesion`, `Sistema` y cada entidad de dominio).

### 2. Foco Estricto en el Caso de Uso
- No listar responsabilidades globales o hipotéticas del sistema. Listar **únicamente** lo que la clase realiza y conoce para dar cumplimiento al caso de uso analizado.

### 3. Formato Oficial Anverso / Reverso

#### 📇 Anverso (Frente)
Contiene la identificación y misión de la clase:
* **Clase:** Nombre único idéntico al del diagrama.
* **Propósito:** Descripción breve y clara del rol que cumple dentro del dominio del problema.

```text
+-----------------------------------------------------------+
| Clase: [Nombre de la Clase]                               |
| Propósito: [Breve descripción de su rol en el sistema]    |
+-----------------------------------------------------------+
```

#### 🔄 Reverso (Dorso)
Contiene el comportamiento interno y sus dependencias externas:
* **Responsabilidades:**
  - **Hacer:** Tareas y operaciones que ejecuta en el flujo del CU.
  - **Saber:** Información que conoce (atributos/colecciones). *Recordar que UI y CTRL no llevan atributos*.
* **Colaboración:** Clases con las que interactúa para cumplir sus responsabilidades (quién le pide servicios o a quién ella debe pedirle servicios).

```text
+-----------------------------+-----------------------------+
| Responsabilidades:          | Colaboración:               |
+-----------------------------+-----------------------------+
| - [Tarea que realiza]       | - [Clase colaboradora]      |
| - [Información que conoce]  |                             |
+-----------------------------+-----------------------------+
```

---

## 📝 Plantilla Markdown Reutilizable

```markdown
### Tarjeta: `[NombreClase]`

#### 📇 Anverso (Frente)
* **Clase:** `[NombreClase]`
* **Propósito:** [Descripción concisa del rol en el sistema.]

#### 🔄 Reverso (Dorso)
| Responsabilidades | Colaboración |
| :--- | :--- |
| **Hacer:**<br>- [Método o tarea 1]<br>- [Método o tarea 2]<br><br>**Saber:**<br>- [Dato o colección que administra] | - **[Clase Colaboradora 1]:** [Rol de la interacción]<br>- **[Clase Colaboradora 2]:** [Rol de la interacción] |
```
