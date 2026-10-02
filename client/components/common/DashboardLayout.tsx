import * as React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "./ConfirmDialog";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { Header as HeaderNav } from "./HeaderNav";
import { getMockSession, clearMockSession } from "@/data/users";
import { getNavigationByRole } from "@/data/navigation";

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

        <main className={`flex flex-col flex-1 w-full min-w-0 transition-[margin-left] [transition-duration:280ms] ease-in-out ${sidebarCollapsed ? "md:ml-[68px]" : "md:ml-[248px]"}`}>
          <HeaderNav
            nav={headerNav}
            title="SQUATGYM"
            onMenuClick={() => setSidebarOpen(true)}
            onLogoutClick={() => setShowLogoutDialog(true)}
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

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="¿Cerrar sesión?"
        description="Vas a salir del sistema y tendrás que volver a ingresar con tu usuario."
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Seguir acá"
        onConfirm={handleLogout}
        tone="danger"
        iconClassName="ti ti-logout"
      />
    </>
  );
}
