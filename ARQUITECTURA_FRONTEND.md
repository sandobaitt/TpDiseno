# 🏛️ Arquitectura del Proyecto SQUATGYM

Este documento detalla la estructura actual de la aplicación, mapeando todas las páginas, rutas, componentes y módulos de datos.

## 📁 Visión General
El proyecto sigue una arquitectura Full-Stack utilizando Vite, React (SPA), Express y TailwindCSS. 
*   **`/client`**: Frontend en React.
*   **`/server`**: Backend con Express.
*   **`/shared`**: Tipos compartidos entre frontend y backend.

---

## 🗺️ Enrutamiento y Páginas (`client/pages/`)

El enrutamiento está centralizado en `client/App.tsx` utilizando `react-router-dom`. Las rutas están protegidas mediante el componente `RequireAuth` y comparten un `DashboardLayout`.

### 🌍 Rutas Públicas
*   **`/`** ➔ `Index.tsx`: Landing page o vista inicial.
*   **`/login`** ➔ `Login.tsx`: Página de autenticación.
*   **`/unauthorized`** ➔ `UnauthorizedAccess.tsx`: Página de acceso denegado.
*   **`*`** ➔ `NotFound.tsx`: Página 404.

### 🛡️ Rutas Protegidas por Rol

#### 👨‍💻 Administrador
*   **`/admin`** ➔ `AdminPanel.tsx`: Panel principal de administración.
*   **`/admin/personal`** ➔ `AdminPersonalPage.tsx`: Gestión de personal y staff.
*   **`/admin/asistencia`** ➔ `AdminAsistenciaPage.tsx`: Control global de asistencias.
*   **`/admin/novedades`** ➔ `NovedadesPage.tsx`: Tablón o historial de novedades.

#### 👩‍💼 Secretaría
*   **`/secretaria`** ➔ `Secretaria.tsx`: Panel principal de secretaría (Gestión de socios).
*   **`/secretaria/asistencia`** ➔ `AttendancePage.tsx`: Registro y visualización de asistencias.
*   **`/secretaria/cobros`** ➔ `PaymentsPage.tsx`: Gestión de pagos y facturación.
*   **`/secretaria/cobros/cobrar`** ➔ `PaymentCheckoutPage.tsx`: Flujo de checkout para un cobro.
*   **`/secretaria/novedades`** ➔ `NovedadesPage.tsx`: Visualización de novedades.

#### 🏋️‍♂️ Profesor
*   **`/profesor`** / **`/profesor/asistencia`** ➔ `ProfesorAsistenciaPage.tsx`: Panel principal y toma de asistencia en clases.
*   **`/profesor/reemplazos`** ➔ `ProfesorReemplazosPage.tsx`: Gestión de reemplazos.
*   **`/profesor/cronograma`** ➔ `ProfesorCronogramaPage.tsx`: Visualización de clases asignadas.
*   **`/profesor/horas`** ➔ `ProfesorHorasPage.tsx`: Reporte de horas trabajadas.

#### 🏃‍♂️ Alumno
*   **`/alumno`** ➔ `AlumnoPanel.tsx`: Panel principal del alumno.
*   **`/alumno/cronograma`** ➔ `AlumnoCronogramaPage.tsx`: Cronograma de clases disponibles o inscriptas.
*   **`/alumno/ajustes`** ➔ `AlumnoAjustesPage.tsx`: Configuración del perfil.
*   **`/alumno/pagos`** ➔ `AlumnoPagosPage.tsx`: Historial y estado de pagos.

#### 🔗 Rutas Compartidas
*   **`/miembros/:id`** ➔ `MemberDetailPage.tsx`: Vista detallada de un miembro (Socio/Staff).

---

## 🧩 Componentes (`client/components/`)

Los componentes están categorizados por dominio o funcionalidad para mantener el orden.

### 🎨 UI Primitivos (`/ui/`)
Contiene todos los componentes base construidos sobre Radix UI y TailwindCSS (basados en shadcn/ui):
`button.tsx`, `input.tsx`, `dialog.tsx`, `table.tsx`, `dropdown-menu.tsx`, `form.tsx`, `sidebar.tsx`, etc.
*No deben contener lógica de negocio.*

### 🔄 Componentes Comunes (`/common/`)
*   `DashboardLayout.tsx`: Layout envolvente para las rutas protegidas.
*   `RequireAuth.tsx`: Wrapper para proteger rutas según autenticación/rol.
*   `SidebarNav.tsx` / `HeaderNav.tsx`: Navegación lateral y superior.
*   `DataTable.tsx`: Componente de tabla dinámico basado en CSS Grid.
*   `Pagination.tsx`, `FilterSelect.tsx`: Elementos de UI compuestos.

### 💰 Cobros (`/cobros/`)
*   `PaymentCheckoutContent.tsx`: Lógica y UI para el flujo de cobros.

### 📅 Cronograma (`/cronograma/`)
*   `DayColumn.tsx`: Columna para un día en la vista de calendario/cronograma.
*   `ClassCard.tsx`: Tarjeta representativa de una clase.

### 🌍 Globales (`/globales/`)
Componentes transversales para manejo de estados o UI genérica:
*   `ActionButton.tsx`, `ErrorBadge.tsx`, `ErrorContent.tsx`, `FileUpload.tsx`, `NotFoundPage.tsx`, `SystemFooter.tsx`.

### 👤 Detalle de Miembro (`/member-detail/`)
Componentes que arman la vista de perfil de un usuario:
*   `MemberHeader.tsx`: Encabezado con datos principales.
*   `AccessControlCard.tsx`, `FinancialStatusCard.tsx`: Tarjetas de estado.
*   `PaymentHistory.tsx`: Historial de pagos del miembro.
*   `MemberDetail.tsx`: Contenedor principal.

### 📰 Novedades (`/novedades/`)
*   `NovedadesSidebar.tsx`: Menú lateral para filtrado o secciones de novedades.
*   `NovedadesHistory.tsx`: Listado histórico.

### 🏢 Secretaría (`/secretaria/`)
*   `GymDashboard.tsx`: Vista resumen del estado del gimnasio.
*   `MembersTable.tsx`: Tabla principal de socios.
*   `NuevoSocioModal.tsx`, `MemberDetailModal.tsx`: Modales de gestión.
*   `StatsCard.tsx`: Tarjetas de estadísticas.

### ⚠️ Original (`/original/`)
*Parece contener respaldos o iteraciones antiguas de componentes (ej: `HeadeR.tsx`, `GymDashBoard.tsx`, `MermerProfile.tsx`). Se recomienda revisar y limpiar para evitar confusión.*

---

## 🎣 Hooks y Librerías

*   **`/hooks/`**: `use-mobile.tsx` (Detección de dispositivo), `use-toast.ts` (Notificaciones).
*   **`/lib/`**: `utils.ts` (Funciones utilitarias como `cn` para Tailwind).

---

## 🗄️ Modelos de Datos (Mocks) (`client/data/`)
Al no contar con una base de datos 100% acoplada o para facilitar el prototipado, el proyecto maneja extensos mocks de datos:
*   `users.ts`, `clients.ts`, `employees.ts`, `teachers.ts`: Entidades de personas.
*   `branches.ts`: Sucursales del gimnasio.
*   `plans.ts`: Tipos de membresías.
*   `payments.ts`, `checkins.ts`, `attendance.ts`, `replacements.ts`: Transaccionales.
*   `schedule.ts`, `classStudents.ts`: Planificación.
*   `navigation.ts`, `dashboard.ts`, `bitacoras.ts`, `novedades.ts`: UI y sistema.

---

## ⚙️ Backend (`server/`)
El servidor es una aplicación Express ligera, configurada en `index.ts`.
Actualmente cuenta con una carpeta `/routes/` donde encontramos un `demo.ts` como ejemplo de endpoint. 
Tipos e interfaces compartidas residen en la carpeta raíz `shared/api.ts`.
