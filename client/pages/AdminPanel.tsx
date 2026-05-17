import { Link } from "react-router-dom";
import { metricsMock, newsMock } from "@/data/dashboard";
import { novedadesMock, type Novedad } from "@/data/novedades";
import fotoAdmin from "@/assets/foto-admin.jpeg";

const TYPE_CONFIG = {
  incident: { label: "Incidente",      dot: "bg-red-400",    text: "text-red-400"    },
  change:   { label: "Cambio turno",   dot: "bg-amber-400",  text: "text-amber-400"  },
  normal:   { label: "Novedad",        dot: "bg-blue-400",   text: "text-blue-400"   },
};

const STATUS_CONFIG = {
  resolved:    { label: "Resuelto",    color: "text-green-400" },
  in_progress: { label: "En curso",   color: "text-amber-400" },
  closed:      { label: "Cerrado",     color: "text-gray-500"  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

const recentNovedades: Novedad[] = [...novedadesMock]
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, 4);

export default function AdminPanel() {
  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
        {/* Hero Card */}
        <div className="bg-[#171717] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-card glass-border">
          <div
            className="w-full md:w-[30%] min-h-[200px] flex items-center justify-center relative bg-cover bg-center"
            style={{ backgroundImage: `url(${fotoAdmin})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="flex-1 p-6 md:p-8 flex flex-col gap-4">
            <h1 className="text-white text-3xl md:text-4xl font-extrabold">
              SEDE CENTRAL
            </h1>
            <div className="flex items-center gap-2">
              <i className="ti ti-map-pin text-lime-400 text-sm" />
              <span className="text-gray-400 text-sm">
                Av. Principal 1234, Distrito Financiero
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.6)]" />
              <span className="text-lime-400 text-xs font-bold tracking-wider">
                OPERATIVA
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-zinc-800/50">
          {["INFORMACIÓN", "STAFF", "FINANZAS", "KIOSCO"].map((tab, i) => (
            <button
              key={tab}
              className={`pb-3 text-sm font-bold tracking-wider transition-colors cursor-pointer ${
                i === 0
                  ? "text-lime-400 border-b-2 border-lime-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsMock.map((m) => (
            <div
              key={m.id}
              className="bg-[#171717] rounded-2xl p-5 flex flex-col gap-3 shadow-card glass-border"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.warning ? "bg-red-500/10" : "bg-lime-400/10"}`}>
                  <i className={`${m.icon} text-lg ${m.iconColor}`} />
                </div>
                {m.variation && !m.warning && (
                  <span className="text-lime-400 text-[10px] font-bold">
                    {m.variation}
                  </span>
                )}
                {m.warning && (
                  <span className="text-red-400 text-[10px] font-bold">
                    Action Req
                  </span>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-semibold tracking-widest">
                  {m.label}
                </p>
                <p className="text-white text-2xl font-extrabold mt-0.5">
                  {m.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 items-start">
          {/* News */}
          <div className="flex flex-col gap-4">
            <h2 className="text-white text-sm font-extrabold tracking-wider">
              NOVEDADES
            </h2>
            <div className="flex flex-col gap-3">
              {newsMock.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-[#171717] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#1c1c1c] transition-all duration-150 relative overflow-hidden shadow-card glass-border"
                >
                  {ev.urgent && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50 rounded-l-2xl" />
                  )}
                  <div
                    className={`w-9 h-9 rounded-xl ${ev.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <i className={`${ev.icon} text-base ${ev.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold">{ev.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {ev.description}
                    </p>
                  </div>
                  <span className="text-gray-600 text-[10px] whitespace-nowrap shrink-0">
                    {ev.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="flex flex-col gap-4">
            <h2 className="text-white text-sm font-extrabold tracking-wider">
              HISTORIAL
            </h2>
            <div className="bg-[#171717] rounded-2xl shadow-card glass-border flex flex-col overflow-hidden">
              {/* Recent novedades list */}
              <div className="flex flex-col divide-y divide-white/[0.04]">
                {recentNovedades.map((nov) => {
                  const type = TYPE_CONFIG[nov.type];
                  const status = STATUS_CONFIG[nov.status];
                  return (
                    <div key={nov.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${type.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{nov.entityName}</p>
                        <p className="text-gray-600 text-[10px]">{type.label}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className={`text-[10px] font-bold ${status.color}`}>{status.label}</span>
                        <span className="text-gray-600 text-[9px]">{timeAgo(nov.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Footer button */}
              <div className="p-4 border-t border-white/[0.04]">
                <Link
                  to="/admin/novedades"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-lime-400 text-black text-xs font-extrabold tracking-wider hover:brightness-110 active:scale-[0.97] transition-all shadow-btn-lime"
                >
                  <i className="ti ti-clock-history text-sm" />
                  CONSULTAR HISTORIAL
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
