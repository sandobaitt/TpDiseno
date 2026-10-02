import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { getMockSession } from "@/data/users";
import type { NotificationTone } from "@/domain/notifications";
import { useNotifications } from "@/hooks/use-notifications";
import { useStoredState } from "@/hooks/use-stored-state";
import { formatRelativeDate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

const TONE: Record<NotificationTone, { bar: string; text: string }> = {
  danger: { bar: "bg-danger", text: "text-danger" },
  warning: { bar: "bg-warning", text: "text-warning" },
  info: { bar: "bg-info", text: "text-info" },
  success: { bar: "bg-success", text: "text-success" },
  neutral: { bar: "bg-gray-500", text: "text-gray-300" },
};

interface Preferences {
  email: boolean;
  dueReminder: boolean;
  promotions: boolean;
}

const PREFERENCES: {
  key: keyof Preferences;
  label: string;
  detail: string;
  icon: string;
}[] = [
  {
    key: "dueReminder",
    label: "Recordatorio de vencimiento",
    detail: "Un aviso cuando se acerca el día 5.",
    icon: "ti-calendar-due",
  },
  {
    key: "email",
    label: "Avisos también por email",
    detail: "Además de verlos en la app.",
    icon: "ti-mail",
  },
  {
    key: "promotions",
    label: "Promociones y novedades del gimnasio",
    detail: "Mensajes de secretaría sobre promos y cambios.",
    icon: "ti-discount",
  },
];

/**
 * Avisos del alumno (CU 10): vencimientos calculados con su estado de cuenta,
 * pagos, legajo y comunicaciones de secretaría. Las preferencias se guardan.
 */
export function MyAlerts() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const userId = getMockSession()?.id ?? "anonimo";
  const today = todayISO();
  const [prefs, setPrefs] = useStoredState<Preferences>(
    `preferencias_${userId}`,
    {
      email: true,
      dueReminder: true,
      promotions: true,
    },
  );

  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Alertas y preferencias"
        subtitle="Tus avisos se arman solos con el estado de tu cuenta. Elegí cómo querés recibirlos."
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Mis avisos"
          icon="ti-bell"
          actions={
            unreadCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={markAllRead}
                className="rounded-xl"
              >
                <i className="ti ti-checks text-sm" aria-hidden="true" />
                Marcar todo como leído
              </Button>
            )
          }
        >
          {items.length === 0 ? (
            <EmptyState
              icon="ti-bell-check"
              title="No tenés avisos"
              description="Cuando se acerque un vencimiento o recepción te mande un mensaje, lo vas a ver acá."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "relative flex items-start gap-3 overflow-hidden rounded-xl border border-white/[0.06] py-4 pl-5 pr-4",
                    n.read ? "bg-neutral-900" : "bg-neutral-800/60",
                  )}
                >
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 top-0 w-1",
                      TONE[n.tone].bar,
                    )}
                    aria-hidden="true"
                  />
                  <i
                    className={cn(
                      "ti mt-0.5 text-xl",
                      n.icon,
                      TONE[n.tone].text,
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p
                        className={cn(
                          "text-sm",
                          n.read
                            ? "font-semibold text-gray-200"
                            : "font-bold text-white",
                        )}
                      >
                        {!n.read && <span className="sr-only">Nuevo: </span>}
                        {n.title}
                      </p>
                      <span className="text-xs text-gray-400">
                        {formatRelativeDate(n.date, today)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-300">{n.detail}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {n.link && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                        >
                          <Link to={n.link} onClick={() => markRead(n.id)}>
                            {n.link === "/alumno/pagos"
                              ? "Ver mi cuenta"
                              : "Ver"}
                          </Link>
                        </Button>
                      )}
                      {!n.read && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => markRead(n.id)}
                          className="rounded-lg text-gray-300"
                        >
                          Marcar como leído
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Preferencias" icon="ti-adjustments">
          <ul className="flex flex-col divide-y divide-white/[0.05]">
            <li className="flex items-center gap-3 py-3">
              <i
                className="ti ti-device-mobile text-lg text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  Avisos en la app
                </p>
                <p className="text-xs text-gray-400">
                  Siempre activos: es donde ves tu cuenta.
                </p>
              </div>
            </li>
            {PREFERENCES.map((pref) => (
              <li key={pref.key} className="flex items-center gap-3 py-3">
                <i
                  className={cn("ti text-lg text-primary", pref.icon)}
                  aria-hidden="true"
                />
                <label
                  htmlFor={`pref-${pref.key}`}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <span className="block text-sm font-semibold text-white">
                    {pref.label}
                  </span>
                  <span className="block text-xs text-gray-400">
                    {pref.detail}
                  </span>
                </label>
                <Switch
                  id={`pref-${pref.key}`}
                  checked={prefs[pref.key]}
                  onCheckedChange={(checked) => {
                    setPrefs((p) => ({ ...p, [pref.key]: checked }));
                    toast.success("Preferencia guardada.");
                  }}
                />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
