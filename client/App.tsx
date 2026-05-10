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
          <Route path="/miembros/:id" element={<MemberDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
