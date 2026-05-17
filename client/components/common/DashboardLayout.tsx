"use client";
import * as React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { Header as HeaderNav } from "./HeaderNav";
import { getMockSession, clearMockSession } from "@/data/users";
import { getNavigationByRole } from "@/data/navigation";

function LogoutDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            className="relative z-10 w-full max-w-sm bg-neutral-900 rounded-2xl border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <div className="p-8 flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <i className="ti ti-logout text-2xl text-red-400" />
              </div>
              <div className="text-center flex flex-col gap-2">
                <h2 className="text-white text-lg font-extrabold tracking-tight">
                  ¿Cerrar sesión?
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tu sesión se cerrará y tendrás que volver a ingresar tus credenciales.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={onConfirm}
                  className="w-full py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-bold hover:bg-red-500/25 hover:border-red-500/40 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  Sí, cerrar sesión
                </button>
                <button
                  onClick={onCancel}
                  className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-300 text-sm font-bold hover:bg-white/[0.08] hover:border-white/[0.10] active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  Seguir aquí
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem("sidebar-collapsed", String(next)); } catch {}
      return next;
    });
  };

  const handleLogout = () => {
    clearMockSession();
    navigate("/", { replace: true });
  };

  const session = getMockSession();
  const nav = getNavigationByRole(session?.role);

  const headerNav = React.useMemo(() => {
    const all = nav.items;
    const exact = all.find((item) => item.to === location.pathname);
    if (exact) return exact.label;
    const partial = all
      .filter((item) => item.to && location.pathname.startsWith(item.to + "/"))
      .sort((a, b) => (b.to?.length ?? 0) - (a.to?.length ?? 0))[0];
    return partial?.label ?? "Dashboard";
  }, [nav.items, location.pathname]);

  const footerItems: SidebarNavItem[] = React.useMemo(
    () => [
      {
        id: "logout",
        label: "Cerrar sesión",
        iconClassName: "ti ti-logout",
        onClick: () => setShowLogoutDialog(true),
      },
    ],
    [],
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      <div className="flex bg-neutral-900 min-h-screen relative overflow-hidden">
        <SidebarNav
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          brandTitle="SQUATGYM"
          items={nav.items}
          footerItems={footerItems}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className={`flex flex-col flex-1 w-full min-w-0 transition-[margin-left] duration-[280ms] ease-in-out ${sidebarCollapsed ? "md:ml-[68px]" : "md:ml-[248px]"}`}>
          <HeaderNav
            nav={headerNav}
            title="SQUATGYM"
            onMenuClick={() => setSidebarOpen(true)}
          />
          <AnimatePresence mode="popLayout">
            <motion.div
              key={location.pathname}
              className="pt-6 flex flex-col flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <LogoutDialog
        open={showLogoutDialog}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </>
  );
}
