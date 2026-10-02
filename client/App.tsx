import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/components/common/RequireAuth";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { StoreProvider } from "@/store/StoreProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UnauthorizedAccess from "./pages/UnauthorizedAccess";
import NotFound from "./pages/NotFound";
import SecretariaAlumnosPage from "./pages/SecretariaAlumnosPage";
import SecretariaAlumnoPage from "./pages/SecretariaAlumnoPage";
import SecretariaInscripcionPage from "./pages/SecretariaInscripcionPage";
import SecretariaAccesoPage from "./pages/SecretariaAccesoPage";
import SecretariaComunicacionesPage from "./pages/SecretariaComunicacionesPage";
import AdminPanel from "./pages/AdminPanel";
import AlumnoPanel from "./pages/AlumnoPanel";
import AttendancePage from "./pages/AttendancePage";
import PaymentsPage from "./pages/PaymentsPage";
import NovedadesPage from "./pages/NovedadesPage";
import AlumnoCronogramaPage from "./pages/AlumnoCronogramaPage";
import AlumnoAjustesPage from "./pages/AlumnoAjustesPage";
import AlumnoPagosPage from "./pages/AlumnoPagosPage";
import ProfesorAsistenciaPage from "./pages/ProfesorAsistenciaPage";
import ProfesorReemplazosPage from "./pages/ProfesorReemplazosPage";
import ProfesorCronogramaPage from "./pages/ProfesorCronogramaPage";
import ProfesorHorasPage from "./pages/ProfesorHorasPage";
import AdminAsistenciaPage from "./pages/AdminAsistenciaPage";
import AdminPersonalPage from "./pages/AdminPersonalPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<UnauthorizedAccess />} />
          {/* Rutas privadas: un solo DashboardLayout. RequireAuth controla sesión y rol (domain/permissions.ts). */}
          <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/personal" element={<AdminPersonalPage />} />
            <Route path="/admin/asistencia" element={<AdminAsistenciaPage />} />
            <Route path="/admin/novedades" element={<NovedadesPage />} />
            <Route path="/encargado" element={<Navigate to="/encargado/asistencia" replace />} />
            <Route path="/encargado/asistencia" element={<AdminAsistenciaPage />} />
            <Route path="/encargado/novedades" element={<NovedadesPage />} />
            <Route path="/alumno" element={<AlumnoPanel />} />
            <Route path="/alumno/cronograma" element={<AlumnoCronogramaPage />} />
            <Route path="/alumno/ajustes" element={<AlumnoAjustesPage />} />
            <Route path="/alumno/pagos" element={<AlumnoPagosPage />} />
            <Route path="/profesor" element={<ProfesorAsistenciaPage />} />
            <Route path="/profesor/asistencia" element={<ProfesorAsistenciaPage />} />
            <Route path="/profesor/reemplazos" element={<ProfesorReemplazosPage />} />
            <Route path="/profesor/cronograma" element={<ProfesorCronogramaPage />} />
            <Route path="/profesor/horas" element={<ProfesorHorasPage />} />
            <Route path="/secretaria" element={<Navigate to="/secretaria/alumnos" replace />} />
            <Route path="/secretaria/alumnos" element={<SecretariaAlumnosPage />} />
            <Route path="/secretaria/alumnos/nuevo" element={<SecretariaInscripcionPage />} />
            <Route path="/secretaria/alumnos/:clientId" element={<SecretariaAlumnoPage />} />
            <Route path="/secretaria/acceso" element={<SecretariaAccesoPage />} />
            <Route path="/secretaria/comunicaciones" element={<SecretariaComunicacionesPage />} />
            <Route path="/secretaria/asistencia" element={<AttendancePage />} />
            <Route path="/secretaria/cobros" element={<PaymentsPage />} />
            <Route path="/secretaria/novedades" element={<NovedadesPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
