import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearMockSession } from "@/data/users";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
        checked ? "bg-lime-400" : "bg-app-elevated"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

type Visibilidad = "Público" | "Solo miembros" | "Privado";
const VISIBILIDAD_CYCLE: Visibilidad[] = ["Público", "Solo miembros", "Privado"];
const VISIBILIDAD_ICON: Record<Visibilidad, string> = {
  "Público":        "ti ti-world",
  "Solo miembros":  "ti ti-users",
  "Privado":        "ti ti-lock",
};

export default function AlumnoAjustesPage() {
  const navigate = useNavigate();
  const [pushMobile, setPushMobile] = React.useState(true);
  const [webNotif, setWebNotif] = React.useState(true);
  const [email, setEmail] = React.useState(false);
  const [silencio, setSilencio] = React.useState(false);
  const [visibilidad, setVisibilidad] = React.useState<Visibilidad>("Público");
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  function cycleVisibilidad() {
    setVisibilidad((v) => {
      const idx = VISIBILIDAD_CYCLE.indexOf(v);
      return VISIBILIDAD_CYCLE[(idx + 1) % VISIBILIDAD_CYCLE.length];
    });
  }

  function handleDeleteConfirm() {
    clearMockSession();
    navigate("/", { replace: true });
  }

  return (
    <div className="px-7 pb-7 max-sm:px-4">

        <h1 className="text-app-text text-3xl md:text-4xl font-extrabold leading-tight">
          AJUSTES Y ALERTAS
        </h1>
        <p className="text-app-faint text-sm mt-2 max-w-xl leading-relaxed">
          Gestiona tus preferencias de comunicación y revisa las alertas
          críticas de tu cuenta en el laboratorio cinético.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 mt-8 items-start">
          {/* ── LEFT: Bandeja de Alertas ── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ti ti-bell text-lg text-lime-400" />
                <h2 className="text-app-text text-sm font-extrabold">
                  Bandeja de Alertas
                </h2>
              </div>
              <button className="text-lime-400 text-[10px] font-bold tracking-widest hover:brightness-110 transition-all cursor-pointer">
                MARCAR TODO COMO LEÍDO
              </button>
            </div>

            {/* Alert 1 — Crítica */}
            <div className="bg-app-surface rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden hover:bg-app-card transition-all duration-150 shadow-card glass-border">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/60 rounded-l-2xl" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <i className="ti ti-alert-triangle text-red-400 text-base" />
                  <h3 className="text-app-text text-sm font-bold">
                    Vencimiento de Membresía
                  </h3>
                </div>
                <span className="text-app-faint text-[10px] whitespace-nowrap">
                  Hace 2 horas
                </span>
              </div>
              <p className="text-app-subtle text-xs leading-relaxed">
                Tu plan &ldquo;Pase Libre&rdquo; expira en 3 días. Renovalo ahora
                para no perder el acceso al gimnasio.
              </p>
              <div>
                <Link
                  to="/alumno/pagos"
                  className="inline-block px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold tracking-wider hover:bg-red-500/20 hover:border-red-500/50 transition-all cursor-pointer"
                >
                  RENOVAR AHORA
                </Link>
              </div>
            </div>

            {/* Alert 2 — Promocional */}
            <div className="bg-app-surface rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden hover:bg-app-card transition-all duration-150 shadow-card glass-border">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-400/60 rounded-l-2xl" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <i className="ti ti-ticket text-lime-400 text-base" />
                  <h3 className="text-app-text text-sm font-bold">
                    Desbloqueá: Clínica de Fuerza
                  </h3>
                </div>
                <span className="text-app-faint text-[10px] whitespace-nowrap">
                  Ayer
                </span>
              </div>
              <p className="text-app-subtle text-xs leading-relaxed">
                Nueva clase magistral disponible este sábado. Plazas limitadas
                para miembros avanzados.
              </p>
              <div>
                <Link
                  to="/alumno/cronograma"
                  className="inline-block px-4 py-2 rounded-xl bg-lime-400 text-black text-[10px] font-extrabold tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-[0_0_12px_rgba(163,230,53,0.2)]"
                >
                  VER DETALLES
                </Link>
              </div>
            </div>

            {/* Alert 3 — Éxito */}
            <div className="bg-app-surface rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden hover:bg-app-card transition-all duration-150 shadow-card glass-border">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-600/40 rounded-l-2xl" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <i className="ti ti-circle-check text-app-subtle text-base" />
                  <h3 className="text-app-text text-sm font-bold">
                    Último Pago Procesado
                  </h3>
                </div>
                <span className="text-app-faint text-[10px] whitespace-nowrap">
                  12 Oct, 2023
                </span>
              </div>
              <p className="text-app-subtle text-xs leading-relaxed">
                Tu mensualidad ha sido procesada con éxito. Recibo #4928 enviado
                a tu correo.
              </p>
            </div>

            {/* Alert 4 — Información */}
            <div className="bg-app-surface rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden hover:bg-app-card transition-all duration-150 shadow-card glass-border">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-600/40 rounded-l-2xl" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <i className="ti ti-clock text-blue-400 text-base" />
                  <h3 className="text-app-text text-sm font-bold">
                    Actualización de Horarios
                  </h3>
                </div>
                <span className="text-app-faint text-[10px] whitespace-nowrap">
                  05 Oct, 2023
                </span>
              </div>
              <p className="text-app-subtle text-xs leading-relaxed">
                Los horarios de las clases de movilidad de los martes han
                cambiado a las 19:00 hrs.
              </p>
            </div>
          </div>

          {/* ── RIGHT: Configuración unificada ── */}
          <div className="bg-app-surface rounded-2xl shadow-card glass-border flex flex-col divide-y divide-zinc-800/50">

            {/* Preferencias */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <i className="ti ti-sliders text-base text-lime-400" />
                <h2 className="text-app-text text-sm font-extrabold">Preferencias</h2>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-app-faint text-[10px] tracking-wider font-semibold uppercase mb-2">
                  Canales de entrega
                </p>

                {/* Push Mobile */}
                <div className="flex items-center justify-between py-2.5 border-b border-app-border/[0.12]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-lime-400/10 flex items-center justify-center">
                      <i className="ti ti-device-mobile text-xs text-lime-400" />
                    </div>
                    <div>
                      <p className="text-app-text text-xs font-bold">Push Mobile</p>
                      <p className="text-app-faint text-[10px]">Alertas instantáneas en la app</p>
                    </div>
                  </div>
                  <Toggle checked={pushMobile} onChange={setPushMobile} />
                </div>

                {/* Web Notificaciones */}
                <div className="flex items-center justify-between py-2.5 border-b border-app-border/[0.12]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-lime-400/10 flex items-center justify-center">
                      <i className="ti ti-browser text-xs text-lime-400" />
                    </div>
                    <div>
                      <p className="text-app-text text-xs font-bold">Notificaciones Web</p>
                      <p className="text-app-faint text-[10px]">Alertas mientras navegas</p>
                    </div>
                  </div>
                  <Toggle checked={webNotif} onChange={setWebNotif} />
                </div>

                {/* Correo Electrónico */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-lime-400/10 flex items-center justify-center">
                      <i className="ti ti-mail text-xs text-lime-400" />
                    </div>
                    <div>
                      <p className="text-app-text text-xs font-bold">Correo Electrónico</p>
                      <p className="text-app-faint text-[10px]">Resúmenes y recibos</p>
                    </div>
                  </div>
                  <Toggle checked={email} onChange={setEmail} />
                </div>
              </div>
            </div>

            {/* Privacidad y Datos */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <i className="ti ti-shield text-base text-lime-400" />
                <h2 className="text-app-text text-sm font-extrabold">Privacidad y Datos</h2>
              </div>

              <div className="flex flex-col gap-2">

                {/* Modo Silencio */}
                <button
                  onClick={() => setSilencio((s) => !s)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    silencio
                      ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                      : "bg-white/[0.03] border-app-border/[0.12]/40 text-app-text hover:bg-app-hover/[0.06] hover:border-app-input-border/60"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <i className={`ti ti-moon text-sm ${silencio ? "text-amber-400" : "text-app-subtle"}`} />
                    Modo Silencio
                  </span>
                  {silencio ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      Activo
                    </span>
                  ) : (
                    <span className="text-[10px] text-app-faint">Desactivado</span>
                  )}
                </button>

                {/* Visibilidad del Perfil */}
                <button
                  onClick={cycleVisibilidad}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-app-border/[0.12]/40 text-app-text text-xs font-bold hover:bg-app-hover/[0.06] hover:border-app-input-border/60 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <i className={`${VISIBILIDAD_ICON[visibilidad]} text-app-subtle text-sm`} />
                    Visibilidad del Perfil
                  </span>
                  <span className="text-[10px] text-app-muted bg-app-hover/[0.06] px-2 py-0.5 rounded-full">
                    {visibilidad}
                  </span>
                </button>

                {/* Eliminar Cuenta */}
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-red-500/[0.04] border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/[0.08] hover:border-red-500/40 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <i className="ti ti-trash text-sm" />
                      Eliminar Cuenta
                    </span>
                    <i className="ti ti-chevron-right text-red-400/50 text-sm" />
                  </button>
                ) : (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 flex flex-col gap-3">
                    <p className="text-red-300 text-xs font-bold">¿Confirmar eliminación?</p>
                    <p className="text-app-subtle text-[10px] leading-relaxed">
                      Esta acción cerrará tu sesión y eliminará tu cuenta. No se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-2 rounded-lg bg-white/[0.05] border border-app-input-border/40 text-app-muted text-xs font-bold hover:bg-app-hover/[0.08] transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDeleteConfirm}
                        className="flex-1 py-2 rounded-lg bg-red-500/80 text-app-text text-xs font-bold hover:bg-red-500 transition-all cursor-pointer"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
  );
}
