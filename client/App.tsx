import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/components/common/RequireAuth";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UnauthorizedAccess from "./pages/UnauthorizedAccess";
import NotFound from "./pages/NotFound";
import Secretaria from "./pages/Secretaria";
import AdminPanel from "./pages/AdminPanel";
import AlumnoPanel from "./pages/AlumnoPanel";
import ProfesorPanel from "./pages/ProfesorPanel";
import MemberDetailPage from "./pages/MemberDetailPage";
import AttendancePage from "./pages/AttendancePage";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentCheckoutPage from "./pages/PaymentCheckoutPage";
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<UnauthorizedAccess />} />
          {/* Protected routes share a single DashboardLayout instance */}
          <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/personal" element={<AdminPersonalPage />} />
            <Route path="/admin/asistencia" element={<AdminAsistenciaPage />} />
            <Route path="/admin/novedades" element={<NovedadesPage />} />
            <Route path="/alumno" element={<AlumnoPanel />} />
            <Route path="/alumno/cronograma" element={<AlumnoCronogramaPage />} />
            <Route path="/alumno/ajustes" element={<AlumnoAjustesPage />} />
            <Route path="/alumno/pagos" element={<AlumnoPagosPage />} />
            <Route path="/profesor" element={<ProfesorAsistenciaPage />} />
            <Route path="/profesor/asistencia" element={<ProfesorAsistenciaPage />} />
            <Route path="/profesor/reemplazos" element={<ProfesorReemplazosPage />} />
            <Route path="/profesor/cronograma" element={<ProfesorCronogramaPage />} />
            <Route path="/profesor/horas" element={<ProfesorHorasPage />} />
            <Route path="/secretaria" element={<Secretaria />} />
            <Route path="/secretaria/asistencia" element={<AttendancePage />} />
            <Route path="/secretaria/cobros" element={<PaymentsPage />} />
            <Route path="/secretaria/cobros/cobrar" element={<PaymentCheckoutPage />} />
            <Route path="/secretaria/novedades" element={<NovedadesPage />} />
            <Route path="/miembros/:id" element={<MemberDetailPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
