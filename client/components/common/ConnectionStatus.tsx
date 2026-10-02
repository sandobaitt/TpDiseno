import * as React from "react";
import { toast } from "sonner";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Aviso discreto de conexión (regla de Wi-Fi inestable): si se corta, se
 * avisa que lo cargado no se pierde; cuando vuelve, un aviso breve.
 */
export function ConnectionStatus() {
  const online = useOnlineStatus();
  const wasOffline = React.useRef(false);

  React.useEffect(() => {
    if (!online) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      toast.success("Volvió la conexión.");
    }
  }, [online]);

  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-20 flex items-center justify-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm text-gray-100"
    >
      <i className="ti ti-wifi-off text-base text-warning" aria-hidden="true" />
      Sin conexión. Podés seguir: lo que cargues queda guardado en este equipo.
    </div>
  );
}
