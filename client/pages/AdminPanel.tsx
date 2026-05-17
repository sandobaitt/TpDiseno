import { DashboardLayout } from "@/components/common/DashboardLayout";
import { metricsMock, newsMock } from "@/data/dashboard";
import fotoAdmin from "@/assets/foto-admin.jpeg";

export default function AdminPanel() {
  return (
    <DashboardLayout headerNav="Dashboard">
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
                <div className="w-9 h-9 rounded-xl bg-lime-400/10 flex items-center justify-center">
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
            <div className="bg-[#171717] rounded-2xl p-6 flex flex-col items-center justify-center gap-6 min-h-[280px] shadow-card glass-border">
              <div className="w-16 h-16 rounded-2xl bg-lime-400/10 flex items-center justify-center">
                <i className="ti ti-clock text-2xl text-lime-400/60" />
              </div>
              <p className="text-gray-600 text-xs text-center leading-relaxed max-w-[180px]">
                Historial de actividad y movimientos recientes de la sede.
              </p>
              <button className="px-6 py-3 rounded-xl bg-lime-400 text-black text-xs font-extrabold tracking-wider hover:brightness-110 active:scale-[0.97] transition-all shadow-btn-lime cursor-pointer">
                CONSULTAR HISTORIAL
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
