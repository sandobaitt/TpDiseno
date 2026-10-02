import * as React from "react";
import { Link } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getMockSession, type AppUserRole } from "@/data/users";
import type { NotificationTone } from "@/domain/notifications";
import {
  useNotifications,
  type NotificationItem,
} from "@/hooks/use-notifications";
import { formatRelativeDate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<NotificationTone, string> = {
  danger: "text-danger",
  warning: "text-warning",
  info: "text-info",
  success: "text-success",
  neutral: "text-gray-300",
};

/** Dónde ver todos los avisos de cada rol. */
const ALL_LINK: Partial<Record<AppUserRole, { to: string; label: string }>> = {
  alumno: { to: "/alumno/ajustes", label: "Ver todos mis avisos" },
  secretario: { to: "/secretaria/novedades", label: "Ver novedades" },
  encargado: { to: "/encargado/novedades", label: "Ver novedades" },
  admin: { to: "/admin/novedades", label: "Ver novedades" },
  profesor: { to: "/profesor/reemplazos", label: "Ver reemplazos" },
};

const MAX_ITEMS = 6;

/**
 * Centro de avisos (para todos los roles): un contador discreto y la lista,
 * sin ventanas que interrumpan. Los avisos se calculan con los datos.
 */
export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const role = getMockSession()?.role;
  const today = todayISO();
  const allLink = role ? ALL_LINK[role] : undefined;

  function itemContent(n: NotificationItem) {
    return (
      <>
        <i
          className={cn("ti mt-0.5 text-lg", n.icon, TONE_TEXT[n.tone])}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-sm",
              n.read ? "font-medium text-gray-300" : "font-bold text-white",
            )}
          >
            {!n.read && <span className="sr-only">Nuevo: </span>}
            {n.title}
          </span>
          <span className="line-clamp-2 block text-xs text-gray-400">
            {n.detail}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {formatRelativeDate(n.date, today)}
          </span>
        </span>
        {!n.read && (
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
            aria-hidden="true"
          />
        )}
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0 ? `Avisos: ${unreadCount} sin leer` : "Avisos"
          }
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
        >
          <i className="ti ti-bell text-lg" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-neutral-950"
              aria-hidden="true"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border-white/[0.08] bg-neutral-900 p-0 text-white"
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
          <p className="text-sm font-bold">Avisos</p>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={markAllRead}
              className="h-auto px-0 text-xs"
            >
              Marcar todo como leído
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <i
              className="ti ti-bell-off text-2xl text-gray-500"
              aria-hidden="true"
            />
            <p className="text-sm text-gray-400">No tenés avisos por ahora.</p>
          </div>
        ) : (
          <ul className="flex max-h-[60vh] flex-col divide-y divide-white/[0.05] overflow-y-auto">
            {items.slice(0, MAX_ITEMS).map((n) => (
              <li key={n.id}>
                {n.link ? (
                  <Link
                    to={n.link}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04]"
                  >
                    {itemContent(n)}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    {itemContent(n)}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {allLink && (
          <div className="border-t border-white/[0.06] p-2">
            <Link
              to={allLink.to}
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-gray-300 transition-colors hover:bg-white/[0.05]"
            >
              {allLink.label}
              <i className="ti ti-arrow-right text-sm" aria-hidden="true" />
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
