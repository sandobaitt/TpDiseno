"use client";
import * as React from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex flex-col flex-1 md:ml-[248px] w-full min-w-0">
          <HeaderNav
            nav={headerNav}
            title={headerTitle}
            onMenuClick={() => setSidebarOpen(true)}
          />
          {children}
        </main>
      </div>
    </>
  );
}
