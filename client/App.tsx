import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/alumno" element={<AlumnoPanel />} />
          <Route path="/profesor" element={<ProfesorPanel />} />
          <Route path="/secretaria" element={<Secretaria />} />
          <Route path="/secretaria/asistencia" element={<AttendancePage />} />
          <Route path="/secretaria/cobros" element={<PaymentsPage />} />
          <Route
            path="/secretaria/cobros/cobrar"
            element={<PaymentCheckoutPage />}
          />
          <Route path="/secretaria/novedades" element={<NovedadesPage />} />
          <Route path="/alumno/cronograma" element={<AlumnoCronogramaPage />} />
          <Route path="/alumno/ajustes" element={<AlumnoAjustesPage />} />
          <Route path="/alumno/pagos" element={<AlumnoPagosPage />} />
          <Route
            path="/profesor/asistencia"
            element={<ProfesorAsistenciaPage />}
          />
          <Route
            path="/profesor/reemplazos"
            element={<ProfesorReemplazosPage />}
          />
          <Route path="/miembros/:id" element={<MemberDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
