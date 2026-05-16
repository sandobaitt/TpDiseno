import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/components/common/RequireAuth";
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPanel />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/personal"
            element={
              <RequireAuth>
                <AdminPersonalPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/asistencia"
            element={
              <RequireAuth>
                <AdminAsistenciaPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/novedades"
            element={
              <RequireAuth>
                <NovedadesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/alumno"
            element={
              <RequireAuth>
                <AlumnoPanel />
              </RequireAuth>
            }
          />
          <Route
            path="/profesor"
            element={
              <RequireAuth>
                <ProfesorAsistenciaPage />
              </RequireAuth>
            }
          />
          <Route
            path="/secretaria"
            element={
              <RequireAuth>
                <Secretaria />
              </RequireAuth>
            }
          />
          <Route
            path="/secretaria/asistencia"
            element={
              <RequireAuth>
                <AttendancePage />
              </RequireAuth>
            }
          />
          <Route
            path="/secretaria/cobros"
            element={
              <RequireAuth>
                <PaymentsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/secretaria/cobros/cobrar"
            element={
              <RequireAuth>
                <PaymentCheckoutPage />
              </RequireAuth>
            }
          />
          <Route
            path="/secretaria/novedades"
            element={
              <RequireAuth>
                <NovedadesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/alumno/cronograma"
            element={
              <RequireAuth>
                <AlumnoCronogramaPage />
              </RequireAuth>
            }
          />
          <Route
            path="/alumno/ajustes"
            element={
              <RequireAuth>
                <AlumnoAjustesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/alumno/pagos"
            element={
              <RequireAuth>
                <AlumnoPagosPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profesor/asistencia"
            element={
              <RequireAuth>
                <ProfesorAsistenciaPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profesor/reemplazos"
            element={
              <RequireAuth>
                <ProfesorReemplazosPage />
              </RequireAuth>
            }
          />
          <Route
            path="/miembros/:id"
            element={
              <RequireAuth>
                <MemberDetailPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
