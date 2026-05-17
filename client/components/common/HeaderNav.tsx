"use client";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { novedadesMock, type Novedad } from "@/data/novedades";
import { getMockSession, clearMockSession } from "@/data/users";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

const TYPE_DOT: Record<Novedad["type"], string> = {
  incident: "bg-red-400",
  change:   "bg-amber-400",
  normal:   "bg-blue-400",
};

const STATUS_STYLE: Record<Novedad["status"], { label: string; color: string }> = {
  in_progress: { label: "En curso",  color: "text-amber-400" },
  resolved:    { label: "Resuelto",  color: "text-green-400" },
  closed:      { label: "Cerrado",   color: "text-gray-500"  },
};

const ROLE_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  admin:      { label: "Administrador", bg: "bg-lime-400/10",   text: "text-lime-400"   },
  secretario: { label: "Secretario",    bg: "bg-violet-400/10", text: "text-violet-400" },
  profesor:   { label: "Profesor",      bg: "bg-blue-400/10",   text: "text-blue-400"   },
  alumno:     { label: "Alumno",        bg: "bg-gray-400/10",   text: "text-gray-400"   },
};

const NOVEDADES_ROUTE: Record<string, string> = {
  admin:      "/admin/novedades",
  secretario: "/secretaria/novedades",
};

const recentNovedades = [...novedadesMock]
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, 4);

interface HeaderProps {
  nav: string;
  title: string;
  className?: string;
  onMenuClick?: () => void;
}

export function Header({ nav, title, className = "", onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const session = getMockSession();
  const role = session?.role ?? "alumno";
  const roleStyle = ROLE_STYLE[role] ?? ROLE_STYLE.alumno;
  const initials = session ? getInitials(session.fullName) : "?";
  const hasNovedades = role === "admin" || role === "secretario";
  const inProgressCount = hasNovedades
    ? novedadesMock.filter((n) => n.status === "in_progress").length
    : 0;

  const [bellOpen, setBellOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const bellRef = React.useRef<HTMLDivElement>(null);
  const userRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  React.useEffect(() => {
    if (!userOpen) return;
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userOpen]);

  function handleLogout() {
    clearMockSession();
    navigate("/");
  }

  return (
    <header className={`flex sticky top-0 z-10 justify-between items-center px-7 max-sm:px-4 py-3.5 border-b bg-neutral-900 border-white/[0.05] ${className}`}>
      <nav className="flex gap-2 items-center max-md:hidden">
        <span className="text-sm text-gray-500">{nav}</span>
      </nav>

      <div className="hidden gap-2 items-center max-md:flex">
        <h1 className="text-lg font-extrabold tracking-tight text-lime-400">{title}</h1>
      </div>

      <div className="flex gap-1 items-center">

        {/* Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => { setBellOpen((o) => !o); setUserOpen(false); }}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer"
          >
            <i className="ti ti-bell text-[18px]" />
            {inProgressCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-neutral-900 animate-pulse" />
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-neutral-900 border border-white/[0.07] shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                <span className="text-white text-xs font-extrabold tracking-wider">NOTIFICACIONES</span>
                {inProgressCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold">
                    {inProgressCount} en curso
                  </span>
                )}
              </div>

              {hasNovedades ? (
                <>
                  <div className="flex flex-col divide-y divide-white/[0.04]">
                    {recentNovedades.map((nov) => {
                      const s = STATUS_STYLE[nov.status];
                      return (
                        <div key={nov.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[nov.type]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{nov.entityName}</p>
                            <p className="text-gray-600 text-[10px]">{timeAgo(nov.timestamp)}</p>
                          </div>
                          <span className={`text-[10px] font-bold shrink-0 ${s.color}`}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-white/[0.05]">
                    <Link
                      to={NOVEDADES_ROUTE[role] ?? "/"}
                      onClick={() => setBellOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-gray-300 text-xs font-bold transition-colors"
                    >
                      <i className="ti ti-arrow-right text-xs" />
                      Ver todas las novedades
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 px-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                    <i className="ti ti-bell-off text-gray-600 text-lg" />
                  </div>
                  <p className="text-gray-600 text-xs text-center">Sin notificaciones por ahora</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div ref={userRef} className="relative ml-1">
          <button
            onClick={() => { setUserOpen((o) => !o); setBellOpen(false); }}
            className="flex justify-center items-center w-9 h-9 rounded-xl cursor-pointer bg-zinc-800 hover:bg-zinc-700 transition-all duration-150 glass-border"
          >
            <span className="text-white text-[11px] font-extrabold">{initials}</span>
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-neutral-900 border border-white/[0.07] shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.05]">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/[0.07] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-extrabold">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold truncate">{session?.fullName ?? "Usuario"}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${roleStyle.bg} ${roleStyle.text}`}>
                    {roleStyle.label}
                  </span>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.07] text-xs font-bold transition-colors cursor-pointer"
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
            className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer"
          >
            <i className="ti ti-menu-2 text-xl" />
          </button>
        </div>

      </div>
    </header>
  );
}
