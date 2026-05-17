"use client";
import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNav, type SidebarNavItem } from "./SidebarNav";
import { Header as HeaderNav } from "./HeaderNav";
import { getMockSession, clearMockSession } from "@/data/users";
import { getNavigationByRole } from "@/data/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  headerNav?: string;
  headerTitle?: string;
}

export function DashboardLayout({
  children,
  headerNav = "Dashboard",
  headerTitle = "SQUATGYM",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
  });
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem("sidebar-collapsed", String(next)); } catch {}
      return next;
    });
  };
  const session = getMockSession();
  const nav = getNavigationByRole(session?.role);

  const footerItems: SidebarNavItem[] = React.useMemo(
    () => [
      {
        id: "logout",
        label: "Cerrar sesión",
        iconClassName: "ti ti-logout",
        onClick: () => {
          clearMockSession();
          navigate("/", { replace: true });
        },
      },
    ],
    [navigate],
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
            title={headerTitle}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="pt-6 flex flex-col flex-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
