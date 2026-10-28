import * as React from "react";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "./NotificationBell";
import {
  getMockSession,
  clearMockSession,
  ROLE_LABELS,
  type AppUserRole,
} from "@/data/users";
import { useTheme } from "@/hooks/use-theme";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

const ROLE_STYLE: Record<AppUserRole, { bg: string; text: string }> = {
  admin: { bg: "bg-lime-400/10", text: "text-lime-400" },
  encargado: { bg: "bg-amber-400/10", text: "text-amber-400" },
  secretario: { bg: "bg-violet-400/10", text: "text-violet-400" },
  profesor: { bg: "bg-blue-400/10", text: "text-blue-400" },
  alumno: { bg: "bg-gray-400/10", text: "text-gray-500 dark:text-gray-300" },
};

interface HeaderProps {
  nav: string;
  title: string;
  className?: string;
  onMenuClick?: () => void;
  /** Abre la confirmación de cierre de sesión (la maneja DashboardLayout). */
  onLogoutClick?: () => void;
}

export function Header({
  nav,
  title,
  className = "",
  onMenuClick,
  onLogoutClick,
}: HeaderProps) {
  const navigate = useNavigate();
  const session = getMockSession();
  const role: AppUserRole = session?.role ?? "alumno";
  const roleStyle = ROLE_STYLE[role];
  const initials = session ? getInitials(session.fullName) : "?";
  const [userOpen, setUserOpen] = React.useState(false);
  const userRef = React.useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    if (!userOpen) return;
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userOpen]);

  function handleLogout() {
    setUserOpen(false);
    if (onLogoutClick) {
      onLogoutClick();
      return;
    }
    clearMockSession();
    navigate("/", { replace: true });
  }

  return (
    <header
      className={`flex sticky top-0 z-10 justify-between items-center px-7 max-sm:px-4 py-3.5 border-b bg-background border-border ${className}`}
    >
      <nav className="flex gap-2 items-center max-md:hidden">
        <span className="text-sm text-muted-foreground">{nav}</span>
      </nav>

      <div className="hidden gap-2 items-center max-md:flex">
        <h1 className="text-lg font-extrabold tracking-tight text-primary">
          {title}
        </h1>
      </div>

      <div className="flex gap-1 items-center">
        <NotificationBell />

        {/* User */}
        <div ref={userRef} className="relative ml-1">
          <button
            onClick={() => {
              setUserOpen((o) => !o);
            }}
            aria-label="Menú de usuario"
            aria-expanded={userOpen}
            className="flex justify-center items-center w-9 h-9 rounded-xl cursor-pointer bg-secondary hover:bg-accent transition-all duration-150 border border-border"
          >
            <span className="text-foreground text-[11px] font-extrabold">
              {initials}
            </span>
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-popover border border-border shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                  <span className="text-foreground text-sm font-extrabold">
                    {initials}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-bold truncate">
                    {session?.fullName ?? "Usuario"}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${roleStyle.bg} ${roleStyle.text}`}
                  >
                    {ROLE_LABELS[role]}
                  </span>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    toggleTheme();
                    setUserOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent text-xs font-bold transition-colors cursor-pointer"
                >
                  <i className={`ti ${theme === "dark" ? "ti-sun" : "ti-moon"} text-sm`} />
                  {theme === "dark" ? "Tema: Claro" : "Tema: Oscuro"}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 hover:bg-red-500/[0.07] text-xs font-bold transition-colors cursor-pointer"
                >
                  <i className="ti ti-logout text-sm" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="hidden max-md:flex ml-1">
          <button
            onClick={onMenuClick}
            aria-label="Abrir menú"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer"
          >
            <i className="ti ti-menu-2 text-xl" />
          </button>
        </div>
      </div>
    </header>
  );
}
